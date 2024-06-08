import fs from 'fs';
import { logger, taggedMessaged } from '../../../helpers/logger';
import { Patient } from '../../../../database/models';
import path from 'path';

const mappedPatientData = patients => {
  return patients.map(patient => ({
    firstname: patient.firstname?.replace(/ +(?= )/g, '')?.trim(),
    lastname: patient.lastname?.replace(/ +(?= )/g, '')?.trim(),
    middlename: patient.middlename?.replace(/ +(?= )/g, '')?.trim(),
    email: patient?.email,
    phone: patient.phone,
    next_of_kin_phone: patient.next_of_kin_phone,
    next_of_kin_address: patient.next_of_kin_address,
    occupation: patient.occupation,
    next_of_kin_name: patient.next_of_kin_name,
    marital_status: patient.marital_status,
    address: patient.address,
    gender: patient.gender,
    date_of_birth: patient.date_of_birth,
    country: patient.country,
    state: patient.state,
    lga: patient.lga,
    religion: patient.religion,
    photo: patient?.photo,
    next_of_kin_relationship: patient?.relationship,
    alt_phone: patient?.alt_phone,
    staff_id: patient?.staff_id || 1,
    old_patient_id: patient.patient_id,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
    has_insurance: !!(patient.insurance_id && patient.hmo_id),
  }));
};
const bulkInsertPatients = async patients => {
  const message = taggedMessaged('bulkInsertPatients');
  const mappedPatients = mappedPatientData(patients);
  try {
    await Patient.bulkCreate(mappedPatients);
  } catch (e) {
    console.error(e);
  }
};

export const migratePatientAccount = async () => {
  const message = taggedMessaged('migratePatientAccount');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_new_dumps/patients.json');

  const CHUNK_SIZE = 1000;
  try {
    const fileData = fs.readFileSync(filePath, 'utf8');
    const patients = JSON.parse(fileData);

    let batch = [];
    let count = 0;

    // Insert patients in batches of the specified size
    for (let i = 0; i < patients.length; i += CHUNK_SIZE) {
      batch = patients.slice(i, i + CHUNK_SIZE);
      await bulkInsertPatients(batch);
      count += batch.length;
      logger.notice(message(`Inserted ${count} patients into the database`));
    }
    logger.info(message('Migration ==ENDED==='));
  } catch (e) {
    throw new Error(e);
  }
};
