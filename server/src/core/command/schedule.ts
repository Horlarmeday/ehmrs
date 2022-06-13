import agenda from './agenda';
import {
  ASSIGN_HOSPITAL_NUMBER,
  SEND_FORGOT_PASSWORD,
  SEND_PATIENT_SMS,
  UPLOAD_IMAGE,
} from '../constants';
import { Patient } from '../../modules/Patient/interface/patient.interface';
import { Staff } from '../../modules/Staff/interface/staff.interface';

export async function sendPatientSMS(message: string, user: Patient) {
  await agenda.schedule('in 30 seconds', SEND_PATIENT_SMS, {
    message,
    user,
  });
}

export async function sendGeneratedPassword(message: string, user: Staff) {
  await agenda.schedule('in 15 seconds', SEND_FORGOT_PASSWORD, {
    message,
    user,
  });
}

export async function uploadImageToBox(filepath: string, fileName: string, patient: Patient) {
  await agenda.schedule('in 25 seconds', UPLOAD_IMAGE, {
    filepath,
    fileName,
    patient,
  });
}

export async function assignHospitalNumber(id: number) {
  await agenda.schedule('in 5 seconds', ASSIGN_HOSPITAL_NUMBER, {
    id,
  });
}
