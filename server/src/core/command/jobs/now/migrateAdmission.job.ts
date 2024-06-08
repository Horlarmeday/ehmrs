import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import { Admission, Patient, PatientInsurance, Staff, Visit } from '../../../../database/models';
import { VisitCategory, VisitStatus } from '../../../../database/models/visit';
import dayjs from 'dayjs';
import { DischargeStatus } from '../../../../database/models/admission';

const isInLast3Days = date => {
  const now = dayjs();
  const dateToCompare = dayjs(date);
  return dateToCompare.isAfter(now.subtract(1, 'day')) && dateToCompare.isBefore(now.add(1, 'day'));
};

const createVisit = async (admission, patient: Patient) => {
  return Visit.create({
    patient_id: patient?.id,
    category: VisitCategory.IPD,
    date_visit_start: admission?.createdAt,
    date_visit_ended: dayjs(admission?.updatedAt)
      .add(3, 'day')
      .toDate(),
    department: 'General Practitioner',
    professional: 'Medical Practitioner',
    type: 'New Visit',
    status: !admission?.is_discharged ? VisitStatus.ONGOING : VisitStatus.ENDED,
    has_done_vitals: true,
    is_taken: true,
    staff_id: admission?.staff_id || 1,
    createdAt: admission.createdAt,
    updatedAt: admission.updatedAt,
    consultation_id: admission?.consultation_id,
    ante_natal_id: admission?.ante_natal_id,
  });
};

const mapAdmissionData = async admission => {
  const patientId = admission?.patient_id || admission?.dependant_id;
  const patientType = admission?.patient_id ? 'Patient' : 'Dependant';
  let patientInsurance;

  const patient = await Patient.findOne({
    where: { old_patient_id: patientId, patient_type: patientType },
  });

  if (!patient) return;

  const isExists = await Admission.findOne({
    where: { patient_id: patient.id, ward_id: admission?.ward_id, bed_id: admission?.bed_id },
  });
  if (isExists) return;

  if (patient?.has_insurance) {
    patientInsurance = await PatientInsurance.findOne({ where: { patient_id: patient.id } });
  }

  const columnId = admission?.consultation_id || admission?.ante_natal_id;
  const column = admission?.consultation_id ? 'consultation_id' : 'ante_natal_id';

  let visit = await Visit.findOne({ where: { [column]: columnId } });
  if (!visit) {
    visit = await createVisit(admission, patient);
  }

  const staff = await Staff.findOne({ where: { id: admission?.staff_id } });

  return {
    patient_id: patient?.id,
    ward_id: admission?.ward_id,
    bed_id: admission?.bed_id,
    visit_id: visit?.id,
    admitted_by: staff?.id || 1,
    discharge_status: admission?.is_discharged
      ? DischargeStatus.DISCHARGED
      : DischargeStatus.ON_ADMISSION,
    previous_ward: null,
    comment: null,
    should_discharge: true,
    ante_natal_id: visit?.ante_natal_id,
    date_admitted: admission?.createdAt,
    patient_insurance_id: patientInsurance?.id,
    createdAt: admission.createdAt,
    updatedAt: admission.updatedAt,
  };
};

const insertAdmission = async admission => {
  try {
    const mappedAdmission = await mapAdmissionData(admission);
    if (mappedAdmission) {
      const createdAdmission = await Admission.create(mappedAdmission);

      await Visit.update(
        { admission_id: createdAdmission.id },
        { where: { id: createdAdmission?.visit_id } }
      );
    }
  } catch (e) {
    console.error(e);
  }
};
export const migrateAdmissions = async () => {
  const message = taggedMessaged('migrateAdmissions');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_today/admissions.json');

  try {
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    if (readFile) {
      const admissions = JSON.parse(readFile);

      for (const admission of admissions) {
        await insertAdmission(admission);
      }

      // await processTasksExecution({
      //   tasks: admissions,
      //   message,
      //   concurrency: 10,
      //   handler: insertAdmission,
      // });
      logger.info(message('Successfully migrated all visits data'));
    }
  } catch (e) {
    throw new Error(e);
  }
};
