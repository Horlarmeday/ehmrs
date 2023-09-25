import { JobName } from '../index';
import {
  assignHospitalNumber,
  checkEmptyHospitalNumber,
  sendPatientMessage,
  updatePrincipalRelationship,
  uploadPatientImage,
  assignAntenatalNumber,
} from '../jobs';
import { logger } from '../../helpers/logger';
import { updatePatientHealthInsurance } from '../jobs/updatePatientHealthInsurance.job';

const Jobs = {
  [JobName.EMPTY_HOSPITAL_NUMBER]: checkEmptyHospitalNumber,
  [JobName.ASSIGN_HOSPITAL_NUMBER]: assignHospitalNumber,
  [JobName.SEND_FORGOT_PASSWORD]: sendPatientMessage,
  [JobName.UPLOAD_IMAGE]: uploadPatientImage,
  [JobName.PATIENT_HEALTH_INSURANCE]: updatePatientHealthInsurance,
  [JobName.PRINCIPAL_RELATIONSHIP]: updatePrincipalRelationship,
  [JobName.ASSIGN_ANTENATAL_NUMBER]: assignAntenatalNumber,
};

export default agenda => {
  Object.keys(Jobs).forEach(name => {
    logger.info(`Defining ${name} job in agenda`);
    agenda.define(name, async (job: any) => {
      await Jobs[name](job);
    });
  });
};
