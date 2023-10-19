import agenda from '../agenda';
import { Patient } from '../../../database/models';
import { JobName } from '../index';

const agendaSchedule = async (when: string, jobName: string, data: { [p: string]: any }) =>
  await agenda.schedule(when, jobName, data);

export const JobSchedule = {
  sendGeneratedPassword: (message: string, phone: string) =>
    agendaSchedule('in 15 seconds', JobName.SEND_FORGOT_PASSWORD, { message, phone }),

  assignHospitalNumber: (id: number) =>
    agendaSchedule('in 5 seconds', JobName.ASSIGN_HOSPITAL_NUMBER, { id }),

  assignAntenatalNumber: (id: number, patient_id: number) =>
    agendaSchedule('in 5 seconds', JobName.ASSIGN_ANTENATAL_NUMBER, { id, patient_id }),

  sendPatientSMS: (message: string, user: Patient) =>
    agendaSchedule('in 30 seconds', JobName.SEND_PATIENT_SMS, { message, user }),

  uploadImage: (image: string, patientId: string) =>
    agendaSchedule('in 25 seconds', JobName.UPLOAD_IMAGE, { image, patientId }),
};
