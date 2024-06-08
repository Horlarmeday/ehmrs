import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import {
  History,
  Patient,
  PatientInsurance,
  PrescribedService,
  Service,
  Staff,
  Visit,
} from '../../../../database/models';
import { VisitCategory, VisitStatus } from '../../../../database/models/visit';
import dayjs from 'dayjs';
import { staffs } from './staffs';

function isInLast3Days(date) {
  const now = dayjs();
  const dateToCompare = dayjs(date);
  return dateToCompare.isAfter(now.subtract(1, 'day')) && dateToCompare.isBefore(now.add(1, 'day'));
}

const createVisit = async (history, patient: Patient) => {
  return await Visit.create({
    patient_id: patient.id,
    category: VisitCategory.OPD,
    date_visit_start: history?.createdAt,
    date_visit_ended: dayjs(history?.updatedAt)
      .add(6, 'hours')
      .toDate(),
    department: 'Medical Practitioner',
    professional: 'General Practitioner',
    type: 'New Visit',
    has_done_vitals: false,
    is_taken: false,
    status: isInLast3Days(history?.createdAt) ? VisitStatus.ONGOING : VisitStatus.ENDED,
    staff_id: history?.staff_id || 1,
    createdAt: history.createdAt,
    updatedAt: history.updatedAt,
    consultation_id: history?.consultation_id,
  });
};

const insertIntoJSON = invalidHistory => {
  const jsonContent = JSON.stringify(invalidHistory, null, 2);
  const filePath = path.join(
    __dirname,
    '../../../../public/ehmrs_dumps/invalidPatientHistory.json'
  );
  // Write JSON content to a file
  fs.writeFileSync(filePath, jsonContent);
  logger.info('File has been saved.');
};

const invalidHistory = [];

const insertHistory = async history => {
  const patientId = history?.patient_id || history?.dependant_id;
  const patientType = history?.patient_id ? 'Patient' : 'Dependant';

  try {
    // check if the patient exists
    const patient = await Patient.findOne({
      where: { old_patient_id: patientId, patient_type: patientType },
    });
    // if not - write the prescribedService into a file
    if (!patient) {
      invalidHistory.push({ ...history, reason: 'Patient does not exist' });
      return;
    }

    let visit;
    visit = await Visit.findOne({ where: { consultation_id: history?.consultation_id } });
    if (!visit) {
      visit = await createVisit(history, patient);
    }

    // if hmo_id exists, check patient insurances and pick id
    let patientInsurance;
    if (patient?.has_insurance) {
      patientInsurance = await PatientInsurance.findOne({ where: { patient_id: patient.id } });
    }

    const staff = await Staff.findOne({ where: { id: history?.staff_id } });

    await History.create({
      complaint_note: history?.reason_for_visit || 'Default reason',
      patient_id: patient.id,
      history_note: history?.clinical_findings,
      examination_note: history?.observation,
      staff_id: staff?.id || 1,
      visit_id: visit?.id,
      chest: history?.chest,
      cvs: history?.cvs,
      mss: history?.mss,
      abdomen: history?.abdomen,
      other_examination: history?.other,
      createdAt: history?.createdAt,
      updatedAt: history?.updatedAt,
      patient_insurance_id: patientInsurance?.id,
      old_id: history?.ph_id,
    });
  } catch (e) {
    invalidHistory.push({ ...history, reason: `Error, ${e?.message}` });
    logger.error(e);
  }
};

export const migratePatientHistories = async () => {
  const message = taggedMessaged('migratePatientHistories');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_today/patientHistories.json');

  try {
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    if (readFile) {
      const histories = JSON.parse(readFile);

      for (const history of histories) {
        await insertHistory(history);
      }

      logger.info(message('Successfully migrated all history data'));
    }
    insertIntoJSON(invalidHistory);
    logger.notice(message('Successfully migrated all history data'));
  } catch (e) {
    throw new Error(e);
  }
};
