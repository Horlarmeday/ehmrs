import sendSMS from '../helpers/sms';
import { padNumberWithZero } from '../helpers/general';
import { updatePatient } from '../../modules/Patient/patient.repository';
import { ASSIGN_HOSPITAL_NUMBER, SEND_PATIENT_SMS, UPLOAD_IMAGE } from '../constants';
import { uploadImageUpdatePatient } from '../helpers/cloudinary';

export default agenda => {
  agenda.define(SEND_PATIENT_SMS, async job => {
    const { message, user } = job.attrs.data;
    await sendSMS(message, user);
  });

  agenda.define(UPLOAD_IMAGE, async job => {
    const { image, patient } = job.attrs.data;
    await uploadImageUpdatePatient(image, patient);
  });

  agenda.define(ASSIGN_HOSPITAL_NUMBER, async job => {
    const { id } = job.attrs.data;
    await updatePatient({ patient_id: id, hospital_id: `SVH/${padNumberWithZero(id, 6)}` });
  });
};
