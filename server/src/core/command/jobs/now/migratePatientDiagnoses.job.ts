import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import { Diagnosis, Patient, PatientInsurance, Staff, Visit } from '../../../../database/models';
import { VisitCategory, VisitStatus } from '../../../../database/models/visit';
import dayjs from 'dayjs';
import { Certainty, DiagnosisType } from '../../../../database/models/diagnosis';

const insertIntoJSON = invalidDiagnosis => {
  const jsonContent = JSON.stringify(invalidDiagnosis, null, 2);
  const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/invalidDiagnosis.json');
  // Write JSON content to a file
  fs.writeFileSync(filePath, jsonContent);
  logger.info('File has been saved.');
};

const isInLast3Days = date => {
  const now = dayjs();
  const dateToCompare = dayjs(date);
  return dateToCompare.isAfter(now.subtract(1, 'day')) && dateToCompare.isBefore(now.add(1, 'day'));
};

const invalidDiagnosis = [];

const insertDiagnosis = async diagnosis => {
  try {
    const patientId = diagnosis?.patient_id || diagnosis?.dependant_id;
    const patientType = diagnosis?.patient_id ? 'Patient' : 'Dependant';

    const patient = await Patient.findOne({
      where: { old_patient_id: patientId, patient_type: patientType },
    });
    // if not - write the prescribedTest into a file
    if (!patient) {
      invalidDiagnosis.push({ ...diagnosis, reason: 'Patient does not exist' });
      return;
    }

    if (!diagnosis?.icd10_disease_id && !diagnosis?.icpc2_disease_id) {
      invalidDiagnosis.push({ ...diagnosis, reason: 'Neither exists' });
      return;
    }

    const columnId = diagnosis?.consultation_id || diagnosis?.ante_natal_id;
    const column = diagnosis?.consultation_id ? 'consultation_id' : 'ante_natal_id';

    let visit = await Visit.findOne({ where: { [column]: columnId } });
    if (!visit) {
      visit = await Visit.create({
        patient_id: patient.id,
        category: column === 'consultation_id' ? VisitCategory.OPD : VisitCategory.ANC,
        date_visit_start: diagnosis?.createdAt,
        date_visit_ended: dayjs(diagnosis?.updatedAt)
          .add(6, 'hours')
          .toDate(),
        department: column === 'consultation_id' ? 'Medical Practitioner' : 'Nursing',
        professional: column === 'consultation_id' ? 'General Practitioner' : 'Nurse',
        type: 'New Visit',
        has_done_vitals: false,
        is_taken: false,
        status: isInLast3Days(diagnosis?.createdAt) ? VisitStatus.ONGOING : VisitStatus.ENDED,
        staff_id: diagnosis?.staff_id || 1,
        createdAt: diagnosis.createdAt,
        updatedAt: diagnosis.updatedAt,
        ante_natal_id: column === 'ante_natal_id' ? columnId : null,
        consultation_id: column === 'consultation_id' ? columnId : null,
      });
    }

    let patientInsurance;
    if (patient?.has_insurance) {
      patientInsurance = await PatientInsurance.findOne({ where: { patient_id: patient.id } });
    }

    const staff = await Staff.findOne({ where: { id: diagnosis?.staff_id } });

    await Diagnosis.create({
      diagnosis_id: diagnosis?.icd10_disease_id || diagnosis?.icpc2_disease_id,
      type: diagnosis?.icd10_disease_id ? DiagnosisType.ICD10 : DiagnosisType.ICPC2,
      certainty: Certainty.CONFIRMED,
      notes: diagnosis?.comment,
      visit_id: visit?.id,
      patient_id: patient.id,
      staff_id: staff?.id || 1,
      patient_insurance_id: patientInsurance?.id,
      createdAt: diagnosis?.createdAt,
      updatedAt: diagnosis?.updatedAt,
    });
  } catch (e) {
    invalidDiagnosis.push({ ...diagnosis, reason: `Error, ${e?.message}` });
    logger.error(e);
  }
};

export const migratePatientDiagnoses = async () => {
  const message = taggedMessaged('migratePatientDiagnoses');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_today/patientDiagnoses.json');

  try {
    const fileData = fs.readFileSync(filePath, 'utf8');
    const diagnoses = JSON.parse(fileData);

    for (const diagnosis of diagnoses) {
      await insertDiagnosis(diagnosis);
    }
    logger.info(message('Successfully migrated all migratePatientDiagnoses data'));
    insertIntoJSON(invalidDiagnosis);

    logger.info(message('Migration ==ENDED==='));
  } catch (e) {
    throw new Error(e);
  }
};
