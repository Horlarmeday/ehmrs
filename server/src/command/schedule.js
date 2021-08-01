import Constant from '../config/constants';

const agenda = require('./agenda');

export async function sendPatientSMS(message, user) {
  await agenda.schedule('in 30 seconds', Constant.SEND_PATIENT_SMS, {
    message,
    user,
  });
}

export async function sendGeneratedPassword(message, user) {
  await agenda.schedule('in 15 seconds', Constant.SEND_FORGOT_PASSWORD, {
    message,
    user,
  });
}

export async function uploadImageToBox(filepath, fileName) {
  await agenda.schedule('in 25 seconds', Constant.UPLOAD_IMAGE, {
    filepath,
    fileName,
  });
}

export async function assignHospitalNumber(id) {
  await agenda.schedule('in 5 seconds', Constant.ASSIGN_HOSPITAL_NUMBER, {
    id,
  });
}
