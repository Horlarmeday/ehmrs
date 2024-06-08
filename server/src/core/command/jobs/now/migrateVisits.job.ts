import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import { Patient, Visit } from '../../../../database/models';
import { VisitCategory, VisitStatus } from '../../../../database/models/visit';
import { processTasksExecution } from '../../../helpers/tasksProcessor';
import dayjs from 'dayjs';

// TODO: Drop triages, copy all antenatal visits, drop visits table
// TODO: Re-insert all antenatal visits, migrate visits and migrate triages table

const mapVisitData = async visit => {
  const patientId = visit?.patient_id || visit?.dependant_id;
  const patientType = visit?.patient_id ? 'Patient' : 'Dependant';

  const patient = await Patient.findOne({
    where: { old_patient_id: patientId, patient_type: patientType },
  });

  if (!patient) {
    logger.info('Cannot find patient with id ' + patientId);
    return;
  }

  return {
    patient_id: patient?.id,
    category: VisitCategory.OPD,
    date_visit_start: visit?.createdAt,
    date_visit_ended: dayjs(visit?.updatedAt)
      .add(3, 'day')
      .toDate(),
    department: 'General Practitioner',
    professional: 'Medical Practitioner',
    type: 'New Visit',
    status: VisitStatus.ENDED,
    has_done_vitals: visit?.has_done_triage,
    is_taken: visit?.is_taken,
    staff_id: visit?.staff_id || 1,
    createdAt: visit.createdAt,
    updatedAt: visit.updatedAt,
    consultation_id: visit?.consultation_id,
  };
};

const insertVisits = async visit => {
  try {
    const mappedVisit = await mapVisitData(visit);
    if (mappedVisit) {
      await Visit.create(mappedVisit);
    }
  } catch (e) {
    console.error(e);
  }
};

export const migrateVisits = async () => {
  const message = taggedMessaged('migrateVisits');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/visits.json');

  try {
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    if (readFile) {
      const visits = JSON.parse(readFile);
      const validVisits = visits.filter(visit => visit?.consultation_id);

      await processTasksExecution({
        tasks: validVisits,
        message,
        concurrency: 5,
        handler: insertVisits,
      });
      logger.info(message('Successfully migrated all visits data'));
    }
  } catch (e) {
    throw new Error(e);
  }
};
