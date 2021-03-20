import axios from 'axios';
import APIError from '../util/apiError';

export default async function sendSMS(message, recipient) {
  const data = {
    username: process.env.SMSSMARTUSERNAME,
    password: process.env.SMSSMARTPASSWORD,
    sender: process.env.SMSSMARTSENDERID,
    recipient,
    message,
    routing: 4,
  };
  try{
    return await axios.post('https://api.smartsmssolutions.com/smsapi.php', data);
  } catch (error) {
    throw new APIError('ERROR', 500, error);
  }
}