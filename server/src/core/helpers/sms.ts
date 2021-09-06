import axios from 'axios';
import { BadException } from '../../common/util/api-error';

export default async function sendSMS(message, recipient) {
  const data = {
    username: process.env.SMSSMARTUSERNAME,
    password: process.env.SMSSMARTPASSWORD,
    sender: process.env.SMSSMARTSENDERID,
    recipient,
    message,
    routing: 4,
  };
  try {
    return await axios.post(process.env.SMS_URL, data);
  } catch (error) {
    throw new BadException('ERROR', 500, error);
  }
}
