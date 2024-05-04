import fs from 'fs';
import { logger, taggedMessaged } from '../../../helpers/logger';
import {
  Antenatal,
  AntenatalObservation,
  AntenatalTriage,
  ClinicalNote,
  Patient,
  PreviousPregnancy,
  Visit,
} from '../../../../database/models';
import path from 'path';
import dayjs from 'dayjs';
import { AccountStatus } from '../../../../database/models/antenatal';
import { VisitCategory, VisitStatus } from '../../../../database/models/visit';
import { processTasksExecution } from '../../../helpers/tasksProcessor';

const mapAntenatalData = async antenatal => {
  try {
    const patientId = antenatal?.patient_id || antenatal?.dependant_id;
    const patientType = antenatal?.patient_id ? 'Patient' : 'Dependant';

    const patient = await Patient.findOne({
      where: { old_patient_id: patientId, patient_type: patientType },
    });

    return {
      id: antenatal.ante_natal_id,
      patient_id: patient?.id,
      antenatal_number: antenatal?.ancId,
      parity: antenatal?.parity,
      gravida: antenatal?.gravida,
      last_menses_period: antenatal?.lmp,
      estimated_delivery_date: antenatal?.edd,
      estimated_concept_time: antenatal?.ecc,
      fetal_age: antenatal?.fetal_age,
      medical_history: antenatal?.medical_history,
      family_history: JSON.parse(antenatal?.family_history),
      blood_transfusion_history: antenatal.blood_transfusion,
      surgical_history: antenatal?.surgical_history,
      staff_id: antenatal?.staff_id || 1,
      start_date: antenatal?.createdAt,
      end_date: dayjs(antenatal?.createdAt)
        .add(9, 'months')
        .add(6, 'weeks')
        .toDate(),
      account_status: AccountStatus.ACTIVE,
      for_whom: antenatal?.for_whom,
      createdAt: antenatal.createdAt,
      updatedAt: antenatal.updatedAt,
    };
  } catch (e) {
    throw new Error(e);
  }
};
const mapAntenatalTriages = async triage => {
  let visit;
  try {
    const antenatal = await Antenatal.findOne({ where: { id: triage.ante_natal_id } });
    if (!antenatal) return;

    visit = await Visit.findOne({ where: { ante_natal_id: triage.ante_natal_id } });
    if (!visit) {
      visit = await Visit.create({
        patient_id: antenatal.patient_id,
        category: VisitCategory.ANC,
        date_visit_start: triage?.createdAt,
        date_visit_ended: dayjs(triage?.createdAt)
          .add(6, 'hours')
          .toDate(),
        department: 'Nursing',
        professional: 'Nurse',
        type: 'New Visit',
        has_done_vitals: false,
        is_taken: false,
        status: VisitStatus.ENDED,
        staff_id: triage?.staff_id || 1,
        createdAt: triage.createdAt,
        updatedAt: triage.updatedAt,
        ante_natal_id: antenatal.id,
      });
    }

    return {
      id: triage.pp_id,
      patient_id: antenatal.patient_id,
      ante_natal_id: antenatal.id,
      height: triage?.height,
      weight: triage?.weight,
      body_mass_index: triage?.bmi,
      urinalysis_protein: triage?.urinalysisProtein1,
      urinalysis_glucose: triage?.urinalysisProtein2,
      pallor: triage?.pallor,
      maturity: triage?.maturity,
      blood_pressure: triage?.bp,
      oedema: triage?.oedema,
      presentation: triage?.presentation,
      foetal_heart_rate: triage.fetalheartrate,
      fundal_height: triage?.fundalheight,
      rvst: triage?.rvs,
      comments: triage?.comments,
      staff_id: triage?.staff_id || 1,
      visit_id: visit.id,
      createdAt: triage.createdAt,
      updatedAt: triage.updatedAt,
    };
  } catch (e) {
    console.error(e);
  }
};
const mapAntenatalObservations = async observation => {
  const antenatal = await Antenatal.findOne({ where: { id: observation.ante_natal_id } });
  if (!antenatal) return;

  const visit = await Visit.create({
    patient_id: antenatal.patient_id,
    category: VisitCategory.ANC,
    date_visit_start: observation?.createdAt,
    date_visit_ended: dayjs(observation?.createdAt)
      .add(6, 'hours')
      .toDate(),
    department: 'Nursing',
    professional: 'Nurse',
    type: 'New Visit',
    has_done_vitals: false,
    is_taken: false,
    status: VisitStatus.ENDED,
    staff_id: observation?.staff_id || 1,
    createdAt: observation.createdAt,
    updatedAt: observation.updatedAt,
    ante_natal_id: antenatal.id,
  });

  return {
    patient_id: antenatal.patient_id,
    ante_natal_id: antenatal.id,
    mother_condition: observation?.mother_condition || 'abc',
    foetal_condition: observation?.baby_condition || 'abc',
    continuation_sheet: observation?.continuation_sheet || 'abc',
    doctor_comments: observation?.doctor_comment || 'abc',
    staff_id: observation?.staff_id || 1,
    visit_id: visit.id,
    createdAt: observation.createdAt,
    updatedAt: observation.updatedAt,
  };
};
const mapAntenatalClinicalNotes = async note => {
  let visit;
  try {
    const antenatal = await Antenatal.findOne({ where: { id: note.ante_natal_id } });
    if (!antenatal) return;

    visit = await Visit.findOne({ where: { ante_natal_id: note.ante_natal_id } });
    if (!visit) {
      visit = await Visit.create({
        patient_id: antenatal.patient_id,
        category: VisitCategory.ANC,
        date_visit_start: note?.createdAt,
        date_visit_ended: dayjs(note?.createdAt)
          .add(6, 'hours')
          .toDate(),
        department: 'Nursing',
        professional: 'Nurse',
        type: 'New Visit',
        has_done_vitals: false,
        is_taken: false,
        status: VisitStatus.ENDED,
        staff_id: note?.staff_id || 1,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        ante_natal_id: antenatal.id,
      });
    }

    return {
      patient_id: antenatal.patient_id,
      ante_natal_id: antenatal.id,
      notes: note?.clinicalnotes,
      staff_id: Math.random() < 0.5 ? 56 : 178,
      visit_id: visit.id,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  } catch (e) {
    console.error(e);
  }
};
const mapAntenatalPrevPregnancy = async pregnancy => {
  try {
    const antenatal = await Antenatal.findOne({ where: { id: pregnancy.ante_natal_id } });
    if (!antenatal) return;

    return {
      patient_id: antenatal.patient_id,
      ante_natal_id: antenatal.id,
      year: pregnancy?.year,
      delivery_place: pregnancy?.delivery_place,
      maturity: pregnancy?.maturity,
      delivery_type: pregnancy?.delivery,
      duration: pregnancy?.duration,
      weight: pregnancy?.weight,
      sex: pregnancy?.sex,
      fate: pregnancy?.fate,
      baby_type: pregnancy?.baby_type,
      puerperium: pregnancy?.puerperium,
      staff_id: pregnancy?.staff_id || 1,
      createdAt: pregnancy.createdAt,
      updatedAt: pregnancy.updatedAt,
    };
  } catch (e) {
    console.error(e);
  }
};

const bulkInsertAntenatal = async antenatal => {
  const mappedAntenatalData = await mapAntenatalData(antenatal);
  try {
    await Antenatal.create(mappedAntenatalData);
  } catch (e) {
    console.error(e);
  }
};
const bulkInsertAntenatalTriage = async vital => {
  try {
    const mappedVital = await mapAntenatalTriages(vital);
    await AntenatalTriage.create(mappedVital);
  } catch (e) {
    console.error(e);
  }
};
const bulkInsertAntenatalObservations = async observation => {
  const mappedObservationsData = await mapAntenatalObservations(observation);
  try {
    await AntenatalObservation.create(mappedObservationsData);
  } catch (e) {
    console.error(e);
  }
};
const bulkInsertAntenatalClinicalNotes = async note => {
  try {
    const mappedNote = await mapAntenatalClinicalNotes(note);
    await ClinicalNote.create(mappedNote);
  } catch (e) {
    console.error(e);
  }
};
const bulkInsertAntenatalPrevPregnancy = async pregnancy => {
  try {
    const mappedPregnancy = await mapAntenatalPrevPregnancy(pregnancy);
    if (mappedPregnancy) {
      await PreviousPregnancy.create(mappedPregnancy);
    }
  } catch (e) {
    console.error(e);
  }
};

export const migrateAntenatalAccountsAndHistory = async () => {
  const message = taggedMessaged('migrateAntenatalAccountsAndHistory');
  // const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/antenatals.json');
  // const ANCHistoryFilePath = path.join(
  //   __dirname,
  //   '../../../../public/ehmrs_dumps/antenatal_histories.json'
  // );
  // const vitalsFilePath = path.join(
  //   __dirname,
  //   '../../../../public/ehmrs_dumps/antenatalVitals.json'
  // );
  // const clinicalNotesFilePath = path.join(
  //   __dirname,
  //   '../../../../public/ehmrs_dumps/clinicalnotes.json'
  // );

  const prevPregFilePath = path.join(
    __dirname,
    '../../../../public/ehmrs_dumps/previousPregnancy.json'
  );

  try {
    // const fileData = fs.readFileSync(filePath, 'utf8');
    // const antenatals = JSON.parse(fileData);
    // Insert antenatals in batches of the specified size
    // await processTasksExecution({
    //   tasks: antenatals,
    //   message,
    //   concurrency: 5,
    //   handler: bulkInsertAntenatal,
    // });
    // logger.info(message('Antenatal Migration ==ENDED==='));
    // /**
    //  * Start inserting antenatal observations
    //  */
    // const ANCHistoryFileData = fs.readFileSync(ANCHistoryFilePath, 'utf8');
    // const history = JSON.parse(ANCHistoryFileData);
    //
    // await processTasksExecution({
    //   tasks: history,
    //   message,
    //   concurrency: 5,
    //   handler: bulkInsertAntenatalObservations,
    // });
    // logger.info(message('Antenatal Observations ==ENDED==='));
    /**
     * Start inserting antenatal vitals
     */
    // const ANCVitalsFileData = fs.readFileSync(vitalsFilePath, 'utf8');
    // const vitals = JSON.parse(ANCVitalsFileData);
    //
    // await processTasksExecution({
    //   tasks: vitals,
    //   message,
    //   concurrency: 5,
    //   handler: bulkInsertAntenatalTriage,
    // });
    // logger.info(message('Antenatal Triage ==ENDED==='));

    // /**
    //  * Start inserting antenatal clinical notes
    //  */
    // const clinicalNotesFileData = fs.readFileSync(clinicalNotesFilePath, 'utf8');
    // const notes = JSON.parse(clinicalNotesFileData);
    //
    // await processTasksExecution({
    //   tasks: notes,
    //   message,
    //   concurrency: 5,
    //   handler: bulkInsertAntenatalClinicalNotes,
    // });
    // logger.info(message('Antenatal Clinical Notes ==ENDED==='));

    /**
     * Start inserting antenatal clinical notes
     */
    const prevPregFileData = fs.readFileSync(prevPregFilePath, 'utf8');
    const notes = JSON.parse(prevPregFileData);

    await processTasksExecution({
      tasks: notes,
      message,
      concurrency: 5,
      handler: bulkInsertAntenatalPrevPregnancy,
    });
    logger.info(message('Antenatal Previous Pregnancy ==ENDED==='));
  } catch (e) {
    throw new Error(e);
  }
};
