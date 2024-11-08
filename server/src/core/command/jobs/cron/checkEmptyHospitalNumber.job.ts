import { Patient } from '../../../../database/models';
import { Op } from 'sequelize';
import { logger, taggedMessaged } from '../../../helpers/logger';
import { getHospitalNumber } from '../../helper';
import { processTasksExecution } from '../../../helpers/tasksProcessor';

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
      logger.info(message(`Fetched ${patients?.length} patients with no hospital numbers`));
      await processTasksExecution({
        tasks: patients,
        message,
        handler: updateHospitalNumber,
        concurrency: 1000,
      });
      return;
    }
    logger.warn(message(`No patients with empty hospital number, skipping...`));
  } catch (e) {
    logger.error(message('Error occurred'), e);
  }
};
