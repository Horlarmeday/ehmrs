import axios from 'axios';
import winston from 'winston';

const emailClientUrl = 'https://emailclienturl.com/send';

export async function sendMail({ email, user }) {
  try {
    return await axios.post(emailClientUrl, { email, user });
  } catch (e) {
    winston.error(e.message, e);
    return new Error('Message failed to send');
  }
}
