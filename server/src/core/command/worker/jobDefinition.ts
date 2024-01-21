import { JobName } from '../index';
import { Agenda, Job } from '@hokify/agenda';
import {
  assignHospitalNumber,
  checkEmptyHospitalNumber,
  sendPatientMessage,
  updatePrincipalRelationship,
  uploadPatientImage,
  assignAntenatalNumber,
  assignImmunizationNumber,
} from '../jobs';
import { logger } from '../../helpers/logger';
import { updatePatientHealthInsurance } from '../jobs/now/updatePatientHealthInsurance.job';

const Jobs = {
  [JobName.EMPTY_HOSPITAL_NUMBER]: checkEmptyHospitalNumber,
  [JobName.ASSIGN_HOSPITAL_NUMBER]: assignHospitalNumber,
  [JobName.SEND_FORGOT_PASSWORD]: sendPatientMessage,
  [JobName.UPLOAD_IMAGE]: uploadPatientImage,
  [JobName.PATIENT_HEALTH_INSURANCE]: updatePatientHealthInsurance,
  [JobName.PRINCIPAL_RELATIONSHIP]: updatePrincipalRelationship,
  [JobName.ASSIGN_ANTENATAL_NUMBER]: assignAntenatalNumber,
  [JobName.ASSIGN_IMMUNIZATION_NUMBER]: assignImmunizationNumber,
};

export default (agenda: Agenda) => {
  Object.keys(Jobs).forEach((name: JobName) => {
    logger.info(`Defining ${name} job in agenda`);
    agenda.define(name, async (job: Job) => {
      await Jobs[name](job);
    });
  });
};
