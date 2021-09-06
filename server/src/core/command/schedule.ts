import agenda from './agenda';
import {
  ASSIGN_HOSPITAL_NUMBER,
  SEND_FORGOT_PASSWORD,
  SEND_PATIENT_SMS,
  UPLOAD_IMAGE,
} from '../constants';

export async function sendPatientSMS(message, user) {
  await agenda.schedule('in 30 seconds', SEND_PATIENT_SMS, {
    message,
    user,
  });
}

export async function sendGeneratedPassword(message, user) {
  await agenda.schedule('in 15 seconds', SEND_FORGOT_PASSWORD, {
    message,
    user,
  });
}

export async function uploadImageToBox(filepath, fileName, patient) {
  await agenda.schedule('in 25 seconds', UPLOAD_IMAGE, {
    filepath,
    fileName,
    patient,
  });
}

export async function assignHospitalNumber(id) {
  await agenda.schedule('in 5 seconds', ASSIGN_HOSPITAL_NUMBER, {
    id,
  });
}
