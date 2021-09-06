import sendSMS from '../helpers/sms';
import { uploadBoxImage } from '../helpers/box';
import { padNumberWithZero } from '../helpers/general';
import { updatePatient } from '../../modules/Patient/patient.repository';
import { ASSIGN_HOSPITAL_NUMBER, SEND_PATIENT_SMS, UPLOAD_IMAGE } from '../constants';

export default agenda => {
  agenda.define(SEND_PATIENT_SMS, async job => {
    const { message, user } = job.attrs.data;
    await sendSMS(message, user);
  });

  agenda.define(UPLOAD_IMAGE, async job => {
    const { fileName, filepath, patient } = job.attrs.data;
    await uploadBoxImage(fileName, filepath, patient);
  });

  agenda.define(ASSIGN_HOSPITAL_NUMBER, async job => {
    const { id } = job.attrs.data;
    await updatePatient({ patient_id: id, hospital_id: `SVH/${padNumberWithZero(id, 6)}` });
  });
};
