import Constant from '../config/constants';
import sendSMS from '../helpers/sms';
import { uploadBoxImage } from '../helpers/box';

const Agenda = require('agenda');

const agenda = new Agenda({
  db: { address: process.env.DB_MONGO, collection: 'jobs' },
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
});

agenda
  .on('ready', () => console.log('Agenda started!'))
  .on('error', () => console.log('Agenda connection error!'));

agenda.define(Constant.SEND_PATIENT_SMS, async job => {
  const { message, user } = job.attrs.data;
  await sendSMS(message, user);
});

agenda.define(Constant.SEND_FORGOT_PASSWORD, async job => {
  const { message, recipient } = job.attrs.data;
  await sendSMS(message, recipient);
});

agenda.define(Constant.UPLOAD_IMAGE, async job => {
  const { fileName, filepath } = job.attrs.data;
  await uploadBoxImage(fileName, filepath);
});

agenda.start().then(r => console.log(r));

module.exports = agenda;
