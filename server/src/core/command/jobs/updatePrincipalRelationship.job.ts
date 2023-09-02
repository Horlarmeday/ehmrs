import { Patient } from '../../../database/models';
import { Op } from 'sequelize';
import { logger, taggedMessaged } from '../../helpers/logger';
import { processArray } from '../../helpers/general';

const updateRelationship = async (patient: Patient) => {
  const message = taggedMessaged('UpdateRelationship');
  const relationship = patient.next_of_kin_relationship;
  await patient.update({ relationship_to_principal: relationship });
  logger.info(message(`Updated ${patient.fullname} principal relationship`));
};

export const updatePrincipalRelationship = async () => {
  const message = taggedMessaged('UpdatePrincipalRelationship');
  const patients = await Patient.findAll({ where: { principal_id: { [Op.ne]: null } } });
  try {
    if (patients?.length) {
      await processArray(patients, updateRelationship);
    }
    logger.warning(message('No dependants with empty relationship to principal, skipping...'));
  } catch (e) {
    logger.error(message('Error'), e);
  }
};
