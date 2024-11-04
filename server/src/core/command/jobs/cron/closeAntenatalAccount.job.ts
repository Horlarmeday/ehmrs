import { logger, taggedMessaged } from '../../../helpers/logger';
import { Antenatal } from '../../../../database/models';
import dayjs from 'dayjs';
import { AccountStatus } from '../../../../database/models/antenatal';
import { processTasksExecution } from '../../../helpers/tasksProcessor';
import { Op } from 'sequelize';

const closeAccountHandler = async (antenatal: Antenatal) => {
  const message = taggedMessaged('closeAccountHandler');
  await Antenatal.update(
    {
      account_status: AccountStatus.COMPLETED,
    },
    { where: { id: antenatal.id } }
  );
  logger.notice(
    message(
      `Closed antenatal account for patient ${antenatal.patient_id}: date ended: ${antenatal?.end_date}`
    )
  );
};

export const closeAntenatalAccount = async () => {
  const message = taggedMessaged('CloseAntenatalAccount');
  const antenatalAccounts = await Antenatal.findAll({
    where: {
      end_date: {
        [Op.lt]: dayjs().toDate(),
      },
      account_status: AccountStatus.ACTIVE,
    },
  });
  try {
    if (antenatalAccounts?.length) {
      await processTasksExecution({
        tasks: antenatalAccounts,
        concurrency: 10,
        message,
        handler: closeAccountHandler,
      });
      return;
    }
    logger.warn(message(`No antenatal accounts to close, skipping...`));
  } catch (e) {
    logger.error(message('Error occurred'), e);
  }
};
