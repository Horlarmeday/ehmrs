import { logger, taggedMessaged } from '../../../helpers/logger';
import path from 'path';
import fs from 'fs';
import { Patient, PatientInsurance } from '../../../../database/models';
import { PatientType } from '../../../../modules/Patient/types/patient.types';

const mappedPatientData = patients => {
  return patients.map(patient => ({
    insurance_id: patient?.insurance_id,
    hmo_id: patient?.hmo_id,
    plan: patient?.plan,
    enrollee_code: patient?.enrollee_code,
    has_insurance: !!(patient.insurance_id && patient.hmo_id),
    old_patient_id: patient.dependant_id,
  }));
};

const bulkCreatePatientInsurance = async patients => {
  const message = taggedMessaged('bulkCreatePatientInsurance');
  const mappedPatients = mappedPatientData(patients);
  const mappedPatientIds = mappedPatients
    .filter(patient => patient.has_insurance)
    ?.map(({ old_patient_id }) => old_patient_id);

  try {
    const createdPatients = await Patient.findAll({
      where: { old_patient_id: mappedPatientIds },
    });

    if (createdPatients?.length) {
      const insurancePatients = createdPatients
        ?.filter(patient => patient.patient_type === PatientType.DEPENDANT)
        .map(({ id, old_patient_id }) => {
          const patient = mappedPatients?.find(
            (p: { old_patient_id: number }) => p.old_patient_id === old_patient_id
          );
          return {
            patient_id: id,
            insurance_id: patient?.insurance_id,
            hmo_id: patient?.hmo_id,
            plan: patient?.plan || null,
            enrollee_code: patient?.enrollee_code || null,
            staff_id: patient?.staff_id || 1,
            is_default: true,
          };
        });
      await PatientInsurance.bulkCreate(insurancePatients);
      logger.info(message(`Readline ==Inserted ${patients?.length} patients===`));
    }
  } catch (e) {
    console.error(e);
  }
};

export const createPatientInsuranceAccount = async () => {
  const message = taggedMessaged('createPatientInsurance');
  const filePath = path.join(__dirname, '../../../../public/ehmrs_dumps/dependants.json');

  const CHUNK_SIZE = 1000;
  try {
    const fileData = fs.readFileSync(filePath, 'utf8');
    const patients = JSON.parse(fileData);

    let batch = [];
    let count = 0;

    // Insert patients in batches of the specified size
    for (let i = 0; i < patients.length; i += CHUNK_SIZE) {
      batch = patients.slice(i, i + CHUNK_SIZE);
      await bulkCreatePatientInsurance(batch);
      count += batch.length;
      logger.notice(message(`Inserted ${count} patients into the database`));
    }
    logger.info(message('Migration ==ENDED==='));
  } catch (e) {
    throw new Error(e);
  }
};
