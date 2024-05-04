import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import { Patient, Triage, Visit } from '../../../../database/models';
import { VisitCategory, VisitStatus } from '../../../../database/models/visit';
import dayjs from 'dayjs';
import { Op } from 'sequelize';
import { processTasksExecution } from '../../../helpers/tasksProcessor';

const mapTriageData = async triage => {
  let visit;
  try {
    const patientId = triage?.patient_id || triage?.dependant_id;
    const patientType = triage?.patient_id ? 'Patient' : 'Dependant';

    const patient = await Patient.findOne({
      where: { old_patient_id: patientId, patient_type: patientType },
    });

    if (!patient) return;

    visit = await Visit.findOne({
      where: { patient_id: patient.id, ante_natal_id: { [Op.eq]: null } },
    });

    if (!visit) {
      visit = await Visit.create({
        patient_id: patient?.id,
        category: VisitCategory.OPD,
        date_visit_start: triage?.createdAt,
        date_visit_ended: dayjs(triage?.createdAt)
          .add(2, 'day')
          .toDate(),
        department: 'General Practitioner',
        professional: 'Medical Practitioner',
        type: 'New Visit',
        status: VisitStatus.ENDED,
        has_done_vitals: true,
        is_taken: true,
        staff_id: triage?.staff_id || 1,
        createdAt: triage.createdAt,
        updatedAt: triage.updatedAt,
      });
    }

    return {
      patient_id: patient.id,
      rvs: triage.rvs,
      weight: parseFloat(triage?.weight) || null,
      height: parseFloat(triage?.height) || null,
      bmi: parseFloat(triage?.bmi) || null,
      pulse: parseFloat(triage?.pulse) || null,
      respiration: triage?.respiration,
      temperature: parseFloat(triage?.temperature) || 0.0,
      systolic: triage?.systolic,
      diastolic: triage?.diastolic,
      heart_rate: triage?.heartrate,
      muac: triage?.muac,
      spo2: triage?.spo2,
      staff_id: triage?.staff_id || 1,
      visit_id: visit.id,
      createdAt: triage.createdAt,
      updatedAt: triage.updatedAt,
    };
  } catch (e) {
    console.error(e);
  }
};

const insertTriageData = async triage => {
  const mappedTriage = await mapTriageData(triage);
  try {
    if (mappedTriage) {
      await Triage.create(mappedTriage);
    }
  } catch (e) {
    console.error(e);
  }
};

export const migrateTriages = async () => {
  const message = taggedMessaged('migrateTriages');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/triages.json');

  try {
    const readFile = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    const data = JSON.parse(readFile);

    await processTasksExecution({
      tasks: data,
      message,
      concurrency: 5,
      handler: insertTriageData,
    });
    logger.info(message('Migrated all triages ==ENDED==='));
  } catch (e) {
    throw new Error(e);
  }
};
