import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import {
  Investigation,
  InvestigationPrescription,
  Patient,
  PatientInsurance,
  PrescribedInvestigation,
  Visit,
} from '../../../../database/models';
import { VisitCategory, VisitStatus } from '../../../../database/models/visit';
import dayjs from 'dayjs';
import { InvestigationStatus, Source } from '../../../../database/models/investigationPrescription';
import { BillingStatus } from '../../../../database/models/prescribedDrug';
import { InvestigationStatus as PrescriptionStatus } from '../../../../database/models/prescribedInvestigation';
import { NHISApprovalStatus } from '../../../helpers/general';
import { staffs } from './staffs';
import { processTasksExecution } from '../../../helpers/tasksProcessor';

const insertIntoJSON = invalidInvestigations => {
  const jsonContent = JSON.stringify(invalidInvestigations, null, 2);
  const filePath = path.join(
    __dirname,
    '../../../../public/ehmrs_new_dumps/invalidInvestigations.json'
  );
  // Write JSON content to a file
  fs.writeFileSync(filePath, jsonContent);
  logger.info('File has been saved.');
};

function isInLast3Days(date) {
  const now = dayjs();
  const dateToCompare = dayjs(date);
  return dateToCompare.isAfter(now.subtract(1, 'day')) && dateToCompare.isBefore(now.add(1, 'day'));
}

// const pickRandomType = () => {
//   const array = ['Primary', 'Secondary'];
//   const index = Math.floor(Math.random() * array.length);
//   return array[index];
// };

const invalidInvestigations = [];
const insertInvestigations = async investigation => {
  const patientId = investigation?.patient_id || investigation?.dependant_id;
  const patientType = investigation?.patient_id ? 'Patient' : 'Dependant';

  try {
    // check if the patient exists
    const patient = await Patient.findOne({
      where: { old_patient_id: patientId, patient_type: patientType },
    });
    // if not - write the prescribedInvestigation into a file
    if (!patient) {
      invalidInvestigations.push({ ...investigation, reason: 'Patient does not exist' });
      return;
    }
    // neither ids exists
    if (!investigation?.investigation_id && !investigation?.ninvestigation_id) {
      invalidInvestigations.push({ ...investigation, reason: 'Neither exists' });
      return;
    }
    // if yes - check if investigation_id exists else check ninvestigation_id
    const investigationId = investigation?.investigation_id || investigation?.ninvestigation_id;
    const investigationColumn = investigation?.investigation_id ? 'old_id' : 'nhis_old_id';

    const alreadyExists = await PrescribedInvestigation.findOne({
      where: { patient_id: patient.id, old_id: investigation?.pi_id },
    });
    if (alreadyExists) return;

    // if investigation_id exists, check it in the db investigations with old_id
    // else check ninvestigation_id with nhis_old_id
    const foundInvestigation = await Investigation.findOne({
      where: { [investigationColumn]: investigationId },
    });
    // if none exists -  write the prescribedInvestigation into a file
    if (!foundInvestigation) {
      invalidInvestigations.push({ ...investigation, reason: 'Investigation does not exist' });
      return;
    }
    // check consultation_id exists in the visit - if yes pick the id, if no, create a new one and pick id
    const columnId = investigation?.consultation_id || investigation?.ante_natal_id;
    const column = investigation?.consultation_id ? 'consultation_id' : 'ante_natal_id';

    let visit = await Visit.findOne({ where: { [column]: columnId } });
    if (!visit) {
      visit = await Visit.create({
        patient_id: patient.id,
        category: column === 'consultation_id' ? VisitCategory.OPD : VisitCategory.ANC,
        date_visit_start: investigation?.createdAt,
        date_visit_ended: dayjs(investigation?.updatedAt)
          .add(6, 'hours')
          .toDate(),
        department: column === 'consultation_id' ? 'Medical Practitioner' : 'Nursing',
        professional: column === 'consultation_id' ? 'General Practitioner' : 'Nurse',
        type: 'New Visit',
        has_done_vitals: false,
        is_taken: false,
        status: isInLast3Days(investigation?.createdAt) ? VisitStatus.ONGOING : VisitStatus.ENDED,
        staff_id: investigation?.staff_id || 1,
        createdAt: investigation.createdAt,
        updatedAt: investigation.updatedAt,
        ante_natal_id: column === 'ante_natal_id' ? columnId : null,
        consultation_id: column === 'consultation_id' ? columnId : null,
      });
    }
    // if hmo_id exists, check patient insurances and pick id
    let patientInsurance;
    if (patient?.has_insurance) {
      patientInsurance = await PatientInsurance.findOne({ where: { patient_id: patient.id } });
    }

    // check visit_id exists in investigation_prescriptions - if yes pick id, if no create a new one and pick id
    let investigationPrescription = await InvestigationPrescription.findOne({
      where: { visit_id: visit.id },
    });
    const staff = staffs?.find(({ fullname }) => investigation?.examiner === fullname)?.id || 1;

    if (!investigationPrescription) {
      investigationPrescription = await InvestigationPrescription.create({
        patient_id: patient.id,
        source: column === 'consultation_id' ? Source.CONSULTATION : Source.ANC,
        requester: staff,
        visit_id: visit.id,
        date_requested: investigation?.createdAt,
        is_billed:
          investigation?.payment_status === 'Paid' || investigation?.payment_status === 'Cleared',
        has_paid:
          investigation?.payment_status === 'Paid' || investigation?.payment_status === 'Cleared',
        status: investigation?.is_imaging_result_finished
          ? InvestigationStatus.COMPLETED
          : InvestigationStatus.PENDING,
        result_notes: investigation?.comments,
        ante_natal_id: column === 'ante_natal_id' ? columnId : null,
      });
    }

    await PrescribedInvestigation.create({
      investigation_id: foundInvestigation.id,
      patient_id: patient.id,
      imaging_id: foundInvestigation.imaging_id,
      investigation_type: investigation?.investigation_id ? 'Cash' : 'NHIS',
      price: investigation?.price,
      requester: staff,
      visit_id: visit.id,
      investigation_prescription_id: investigationPrescription.id,
      date_requested: investigation?.createdAt,
      payment_status: investigation?.payment_status,
      billing_status:
        investigation?.payment_status === 'Paid' || investigation?.payment_status === 'Cleared'
          ? BillingStatus.BILLED
          : BillingStatus.UNBILLED,
      status: investigation?.is_imaging_result_finished
        ? PrescriptionStatus.APPROVED
        : PrescriptionStatus.PENDING,
      nhis_status: investigation?.is_nhis_investigation_approved
        ? NHISApprovalStatus.APPROVED
        : NHISApprovalStatus.PENDING,
      ante_natal_id: column === 'ante_natal_id' ? columnId : null,
      source: column === 'consultation_id' ? Source.CONSULTATION : Source.ANC,
      patient_insurance_id: patientInsurance?.id,
      old_id: investigation?.pi_id,
      createdAt: investigation?.createdAt,
      updatedAt: investigation?.updatedAt,
    });
  } catch (e) {
    invalidInvestigations.push({ ...investigation, reason: `Error, ${e?.message}` });
    logger.error(e);
  }
};

export const migratePrescribedInvestigations = async () => {
  const message = taggedMessaged('migratePrescribedInvestigations');
  const filePath = path.join(
    __dirname,
    '../../../../public/ehmrs_today/prescribedInvestigations.json'
  );

  try {
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    if (readFile) {
      const prescribedInvestigations = JSON.parse(readFile);

      // for (const investigation of prescribedInvestigations) {
      //   await insertInvestigations(investigation);
      // }

      await processTasksExecution({
        tasks: prescribedInvestigations,
        message,
        concurrency: 10,
        handler: insertInvestigations,
      });
      logger.info(message('Successfully migrated all prescribedInvestigations data'));
    }
    insertIntoJSON(invalidInvestigations);
    logger.notice(message('Successfully migrated all prescribedInvestigations data'));
  } catch (e) {
    throw new Error(e);
  }
};
