import agenda from '../agenda';
import { Patient } from '../../../database/models';
import { JobName } from '../index';

export async function sendPatientSMS(message: string, user: Patient) {
  await agenda.schedule('in 30 seconds', JobName.SEND_PATIENT_SMS, {
    message,
    user,
  });
}

export async function sendGeneratedPassword(message: string, phone: string) {
  await agenda.schedule('in 15 seconds', JobName.SEND_FORGOT_PASSWORD, {
    message,
    phone,
  });
}

export async function uploadImage(image: string, patientId: string) {
  await agenda.schedule('in 25 seconds', JobName.UPLOAD_IMAGE, {
    image,
    patientId,
  });
}
export async function assignHospitalNumber(id: number) {
  await agenda.schedule('in 5 seconds', JobName.ASSIGN_HOSPITAL_NUMBER, {
    id,
  });
}

export const assignAntenatalNumber = async (id: number, patient_id: number) => {
  await agenda.schedule('in 5 seconds', JobName.ASSIGN_ANTENATAL_NUMBER, {
    id,
    patient_id,
  });
};
