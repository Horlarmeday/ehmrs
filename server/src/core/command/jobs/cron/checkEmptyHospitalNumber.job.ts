import { Patient } from '../../../../database/models';
import { Op } from 'sequelize';
import { processArray } from '../../../helpers/general';
import { logger, taggedMessaged } from '../../../helpers/logger';
import { getHospitalNumber } from '../../helper';

const updateHospitalNumber = async (patient: Patient) => {
  const message = taggedMessaged('updateHospitalNumber');

  const generatedHospitalNumber = await getHospitalNumber(patient.id);
  await Patient.update({ hospital_id: generatedHospitalNumber }, { where: { id: patient.id } });
  logger.notice(message(`${patient.firstname} hospital number successfully updated`));
};

export const checkEmptyHospitalNumber = async () => {
  const message = taggedMessaged('CheckEmptyHospitalNumber');
  const patients = await Patient.findAll({ where: { hospital_id: { [Op.eq]: null } } });
  try {
    if (patients?.length) {
      await processArray(patients, updateHospitalNumber);
    }
    logger.warning(message(`No patients with empty hospital number, skipping...`));
  } catch (e) {
    logger.error(message('Error occurred'), e);
  }
};
