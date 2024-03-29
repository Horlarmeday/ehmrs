import { logger, taggedMessaged } from '../../../helpers/logger';
import { getAntenatalNumber } from '../../helper';
import { Job } from '@hokify/agenda';
import {
  getOneAntenatalAccount,
  updateAntenatalAccount,
} from '../../../../modules/Antenatal/antenatal.repository';
import { AccountStatus } from '../../../../database/models/antenatal';

type AssignAntenatalNumberData = {
  id: number;
  patient_id: number;
};

export const assignAntenatalNumber = async (job: Job) => {
  const message = taggedMessaged('AssignAntenatalNumber');
  const { id, patient_id } = job.attrs.data as AssignAntenatalNumberData;
  let antenatalNumber: string;
  const antenatal = await getOneAntenatalAccount({
    patient_id,
    account_status: AccountStatus.COMPLETED,
  });

  if (antenatal) antenatalNumber = antenatal.antenatal_number;
  else antenatalNumber = await getAntenatalNumber(id);

  await updateAntenatalAccount({ id, antenatal_number: antenatalNumber });
  logger.info(
    message(`Antenatal number ${antenatalNumber} was assigned to patient with id: ${id}`)
  );
};
