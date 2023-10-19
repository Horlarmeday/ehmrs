import { Job } from '@hokify/agenda';
import { logger, taggedMessaged } from '../../../helpers/logger';
import { sendSMS } from '../../../helpers/sms';
import { Patient } from '../../../../database/models';

type SendPatientMessageData = {
  message: string;
  user: Patient;
};

export const sendPatientMessage = async (job: Job) => {
  const message = taggedMessaged('SendPatientMessage');
  const { message: content, user } = job.attrs.data as SendPatientMessageData;
  await sendSMS(content, user.phone);
  logger.info(message(`SMS sent to ${user.fullname} successfully`));
};
