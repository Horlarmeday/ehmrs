import Agenda from 'agenda';
import sendSMS from '../../helpers/sms';
import { logger, taggedMessaged } from '../../helpers/logger';

export const sendPatientMessage = async (job: Agenda) => {
  const message = taggedMessaged('SendPatientMessage');
  const { message: content, user } = job.attrs.data;
  await sendSMS(content, user);
  logger.info(message(`SMS sent to ${user.fullname} successfully`));
};
