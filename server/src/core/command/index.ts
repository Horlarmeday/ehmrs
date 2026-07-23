export enum JobName {
  ASSIGN_HOSPITAL_NUMBER = 'Assign hospital number',
  SEND_FORGOT_PASSWORD = 'Send generated password',
  UPLOAD_IMAGE = 'Upload to image to cloudinary',
  EMPTY_HOSPITAL_NUMBER = 'Check empty hospital number',
  ASSIGN_ANTENATAL_NUMBER = 'Assign antenatal number',
  ASSIGN_IMMUNIZATION_NUMBER = 'Assign immunization number',
  SEND_PATIENT_SMS = 'Registration SMS',
  END_VISIT = 'End visit',
  CLOSE_ANTENATAL_ACCOUNT = 'Close antenatal account',
  DRAIN_OUTBOX = 'Drain EMR-Accounting outbox',
  DRAIN_INBOX = 'Drain Accounting-EMR inbox',
}

export const CronTimer = {
  [JobName.EMPTY_HOSPITAL_NUMBER]:
    process.env.NODE_ENV === 'development' ? '0 2 * * *' : '*/5 * * * *', // every 5 minutes
  [JobName.CLOSE_ANTENATAL_ACCOUNT]: '0 1 * * *', // every 1am
  [JobName.END_VISIT]: '0 0 * * *', // 12am
  // Frequent: settlement latency matters, and a no-op pass is cheap when the flag is off or the
  // outbox is empty. Overridable via env so an integration harness can drain sub-minute; defaults
  // to every minute.
  [JobName.DRAIN_OUTBOX]: process.env.EMR_OUTBOX_DRAIN_CRON || '* * * * *',
  // Frequent for the same reason: a paid patient's gate should open promptly once the instruction
  // arrives, and a no-op pass is cheap when the inbox is empty or the flag is off.
  [JobName.DRAIN_INBOX]: process.env.EMR_INBOX_DRAIN_CRON || '* * * * *',
};

export const ImmediateJob = {};
