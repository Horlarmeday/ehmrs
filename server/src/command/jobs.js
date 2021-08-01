import Constant from '../config/constants';
import sendSMS from '../helpers/sms';
import { uploadBoxImage } from '../helpers/box';
import { padNumberWithZero } from '../helpers/general';
import { updatePatient } from '../modules/Patient/patient.repository';

export default agenda => {
  agenda.define(Constant.SEND_PATIENT_SMS, async job => {
    const { message, user } = job.attrs.data;
    await sendSMS(message, user);
  });

  agenda.define(Constant.UPLOAD_IMAGE, async job => {
    const { fileName, filepath } = job.attrs.data;
    await uploadBoxImage(fileName, filepath);
  });

  agenda.define(Constant.ASSIGN_HOSPITAL_NUMBER, async job => {
    const { id } = job.attrs.data;
    await updatePatient({ patient_id: id, hospital_id: `SVH/${padNumberWithZero(id, 6)}` });
  });
};
