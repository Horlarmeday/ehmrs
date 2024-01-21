import { Job } from '@hokify/agenda';
import { logger, taggedMessaged } from '../../../helpers/logger';
import { getImmunizationNumber } from '../../helper';
import { updateImmunizationAccount } from '../../../../modules/Immunization/immunization.repository';

type AssignImmunizationNumberData = {
  id: number;
};

export const assignImmunizationNumber = async (job: Job) => {
  const message = taggedMessaged('AssignImmunizationNumber');
  const { id } = job.attrs.data as AssignImmunizationNumberData;
  const immunizationNumber = await getImmunizationNumber(id);

  await updateImmunizationAccount(id, { immunization_number: immunizationNumber });
  logger.info(
    message(`Immunization number ${immunizationNumber} was assigned to patient with id: ${id}`)
  );
};
