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
  migratePatientAccount,
  migrateStaffAccount,
  updatePatientHealthInsurance,
  closeAntenatalAccount,
  endVisits,
  migrateDependantAccount,
  migrateHMO,
  createPatientInsuranceAccount,
  migrateWards,
  migrateBeds,
  migrateAntenatalAccountsAndHistory,
  migrateVisits,
  migrateAdminUtils,
  migrateTriages,
} from '../jobs';
import { logger } from '../../helpers/logger';
import dayjs from 'dayjs';

const Jobs = {
  [JobName.EMPTY_HOSPITAL_NUMBER]: checkEmptyHospitalNumber,
  [JobName.ASSIGN_HOSPITAL_NUMBER]: assignHospitalNumber,
  [JobName.SEND_FORGOT_PASSWORD]: sendPatientMessage,
  [JobName.UPLOAD_IMAGE]: uploadPatientImage,
  [JobName.PATIENT_HEALTH_INSURANCE]: updatePatientHealthInsurance,
  [JobName.PRINCIPAL_RELATIONSHIP]: updatePrincipalRelationship,
  [JobName.ASSIGN_ANTENATAL_NUMBER]: assignAntenatalNumber,
  [JobName.ASSIGN_IMMUNIZATION_NUMBER]: assignImmunizationNumber,
  // [JobName.MIGRATE_PATIENTS_DATA]: migratePatientAccount,
  // [JobName.CLOSE_ANTENATAL_ACCOUNT]: closeAntenatalAccount,
  // [JobName.END_VISIT]: endVisits,
  // [JobName.MIGRATE_STAFFS_DATA]: migrateStaffAccount,
  // [JobName.MIGRATE_DEPENDANTS_DATA]: migrateDependantAccount,
  // [JobName.MIGRATE_HMO_DATA]: migrateHMO,
  // [JobName.CREATE_PATIENT_INSURANCE_ACCOUNT]: createPatientInsuranceAccount,
  // [JobName.MIGRATE_WARDS]: migrateWards,
  // [JobName.MIGRATE_BEDS]: migrateBeds,
  // [JobName.MIGRATE_ANTENATAL_ACCOUNTS]: migrateAntenatalAccountsAndHistory,
  // [JobName.MIGRATE_VISITS]: migrateVisits,
  // [JobName.MIGRATE_ADMIN_UTILS]: migrateAdminUtils,
  // [JobName.MIGRATE_TRIAGES]: migrateTriages,
};

const setFailureBehavior = (agenda: Agenda, jobName: string) => {
  const RETRY_ATTEMPTS = 1;
  const RETRY_TIME_MINUTES = 3;

  agenda.on(`fail:${jobName}`, (_err: Error, job: Job) => {
    const failCount = job.attrs.failCount || 1;
    if (failCount <= RETRY_ATTEMPTS) {
      job.attrs.nextRunAt = dayjs()
        .add(RETRY_TIME_MINUTES * failCount, 'minutes')
        .toDate();
      logger.info(
        `[${jobName}] Failcount: ${failCount}. Enqueuing to retry in ${RETRY_TIME_MINUTES *
          failCount} minutes`
      );
      job.save().catch(e => logger.error(`[saveRetry-${jobName}-error]: ${JSON.stringify(e)}`));
    }
  });
};

export default (agenda: Agenda) => {
  agenda.on('ready', () => {
    Object.keys(Jobs).forEach((name: JobName) => {
      logger.info(`Defining ${name} job in agenda`);
      setFailureBehavior(agenda, name);
      agenda.define(name, async (job: Job) => {
        await Jobs[name](job);
      });
    });
  });
};
