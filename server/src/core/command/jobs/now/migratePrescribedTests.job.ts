import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import {
  Patient,
  PatientInsurance,
  PrescribedInvestigation,
  PrescribedTest,
  Staff,
  Test,
  TestPrescription,
  Visit,
} from '../../../../database/models';
import { VisitCategory, VisitStatus } from '../../../../database/models/visit';
import dayjs from 'dayjs';
import { Source, TestStatus } from '../../../../database/models/testPrescription';
import { BillingStatus } from '../../../../database/models/prescribedDrug';
import { TestStatus as Status } from '../../../../database/models/prescribedTest';
import { NHISApprovalStatus } from '../../../helpers/general';
import { staffs } from './staffs';
import { generateLabAccessionNumber } from '../../../helpers/helper';
import { ResultStatus } from '../../../../database/models/testResult';

const insertIntoJSON = invalidTests => {
  const jsonContent = JSON.stringify(invalidTests, null, 2);
  const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/invalidTests.json');
  // Write JSON content to a file
  fs.writeFileSync(filePath, jsonContent);
  logger.info('File has been saved.');
};

const isInLast3Days = date => {
  const now = dayjs();
  const dateToCompare = dayjs(date);
  return dateToCompare.isAfter(now.subtract(1, 'day')) && dateToCompare.isBefore(now.add(1, 'day'));
};

// const pickRandomType = () => {
//   const array = ['Primary', 'Secondary'];
//   const index = Math.floor(Math.random() * array.length);
//   return array[index];
// };

const invalidTests = [];
const insertTests = async test => {
  const patientId = test?.patient_id || test?.dependant_id;
  const patientType = test?.patient_id ? 'Patient' : 'Dependant';

  try {
    // check if the patient exists
    const patient = await Patient.findOne({
      where: { old_patient_id: patientId, patient_type: patientType },
    });
    // if not - write the prescribedTest into a file
    if (!patient) {
      invalidTests.push({ ...test, reason: 'Patient does not exist' });
      return;
    }
    const alreadyExists = await PrescribedTest.findOne({
      where: { patient_id: patient.id, old_id: test?.pt_id },
    });
    if (alreadyExists) return;

    // neither ids exists
    if (!test?.test_id && !test?.ntest_id) {
      invalidTests.push({ ...test, reason: 'Neither exists' });
      return;
    }
    // if yes - check if test_id exists else check ntest_id
    const testId = test?.test_id || test?.ntest_id;
    const testColumn = test?.test_id ? 'old_id' : 'nhis_old_id';

    // if test_id exists, check it in the db tests with old_id
    // else check ntest_id with nhis_old_id
    const foundTest = await Test.findOne({
      where: { [testColumn]: testId },
    });
    // if none exists -  write the prescribedTest into a file
    if (!foundTest) {
      invalidTests.push({ ...test, reason: 'Test does not exist' });
      return;
    }
    // check consultation_id exists in the visit - if yes pick the id, if no, create a new one and pick id
    const columnId = test?.consultation_id || test?.ante_natal_id;
    const column = test?.consultation_id ? 'consultation_id' : 'ante_natal_id';

    let visit = await Visit.findOne({ where: { [column]: columnId } });
    if (!visit) {
      visit = await Visit.create({
        patient_id: patient.id,
        category: column === 'consultation_id' ? VisitCategory.OPD : VisitCategory.ANC,
        date_visit_start: test?.createdAt,
        date_visit_ended: dayjs(test?.updatedAt)
          .add(6, 'hours')
          .toDate(),
        department: column === 'consultation_id' ? 'Medical Practitioner' : 'Nursing',
        professional: column === 'consultation_id' ? 'General Practitioner' : 'Nurse',
        type: 'New Visit',
        has_done_vitals: false,
        is_taken: false,
        status: isInLast3Days(test?.createdAt) ? VisitStatus.ONGOING : VisitStatus.ENDED,
        staff_id: test?.staff_id || 1,
        createdAt: test.createdAt,
        updatedAt: test.updatedAt,
        ante_natal_id: column === 'ante_natal_id' ? columnId : null,
        consultation_id: column === 'consultation_id' ? columnId : null,
      });
    }
    // if hmo_id exists, check patient insurances and pick id
    let patientInsurance;
    if (patient?.has_insurance) {
      patientInsurance = await PatientInsurance.findOne({ where: { patient_id: patient.id } });
    }

    // check visit_id exists in test_prescriptions - if yes pick id, if no create a new one and pick id
    let testPrescription = await TestPrescription.findOne({
      where: { visit_id: visit.id },
    });

    const staff = staffs?.find(({ fullname }) => test?.examiner === fullname);
    const foundStaff = await Staff.findOne({ where: { id: staff?.id || 1 } });

    if (!testPrescription) {
      const accessionNumber = await generateLabAccessionNumber();
      testPrescription = await TestPrescription.create({
        patient_id: patient.id,
        source: column === 'consultation_id' ? Source.CONSULTATION : Source.ANC,
        requester: foundStaff?.id || 1,
        visit_id: visit.id,
        date_requested: test?.createdAt,
        accession_number: accessionNumber,
        is_billed: test?.payment_status === 'Paid' || test?.payment_status === 'Cleared',
        has_paid: test?.payment_status === 'Paid' || test?.payment_status === 'Cleared',
        status: test?.is_test_result_finished ? TestStatus.COMPLETED : TestStatus.PENDING,
        result_notes: test?.comments,
        ante_natal_id: column === 'ante_natal_id' ? columnId : null,
      });
    }

    await PrescribedTest.create({
      test_id: foundTest.id,
      patient_id: patient.id,
      sample_id: foundTest.sample_id,
      test_type: test?.test_id ? 'Cash' : 'NHIS',
      price: test?.price,
      requester: foundStaff?.id || 1,
      visit_id: visit.id,
      test_prescription_id: testPrescription.id,
      date_requested: test?.createdAt,
      payment_status: test?.payment_status,
      billing_status:
        test?.payment_status === 'Paid' || test?.payment_status === 'Cleared'
          ? BillingStatus.BILLED
          : BillingStatus.UNBILLED,
      status: test?.is_test_result_finished ? Status.APPROVED : Status.PENDING,
      nhis_status: test?.is_nhis_test_approved
        ? NHISApprovalStatus.APPROVED
        : NHISApprovalStatus.PENDING,
      result_status: test?.is_test_result_finished ? ResultStatus.ACCEPTED : ResultStatus.PENDING,
      ante_natal_id: column === 'ante_natal_id' ? columnId : null,
      source: column === 'consultation_id' ? Source.CONSULTATION : Source.ANC,
      patient_insurance_id: patientInsurance?.id,
      old_id: test?.pt_id,
      createdAt: test?.createdAt,
      updatedAt: test?.updatedAt,
    });
  } catch (e) {
    invalidTests.push({ ...test, reason: `Error, ${e?.message}` });
    logger.error(e);
  }
};

export const migratePrescribedTests = async () => {
  const message = taggedMessaged('migratePrescribedTests');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_today/prescribedTests.json');

  try {
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    if (readFile) {
      const prescribedTests = JSON.parse(readFile);

      for (const test of prescribedTests) {
        await insertTests(test);
      }
      logger.info(message('Successfully migrated all migratePrescribedTests data'));
      insertIntoJSON(invalidTests);
    }
    logger.notice(message('Successfully migrated all migratePrescribedTests data'));
  } catch (e) {
    throw new Error(e);
  }
};
