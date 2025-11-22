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
  // Inventory Alert Jobs
  INVENTORY_STOCK_LEVEL_CHECK = 'Inventory stock level check',
  INVENTORY_EXPIRY_CHECK = 'Inventory expiry check',
  INVENTORY_ALERT_ESCALATION = 'Inventory alert escalation',
  INVENTORY_ALERT_AUTO_RESOLVE = 'Inventory alert auto resolve',
  // Admission Jobs
  CHARGE_DAILY_HOSPITALIZATION = 'Charge daily hospitalization',
}

export const CronTimer = {
  [JobName.EMPTY_HOSPITAL_NUMBER]:
    process.env.NODE_ENV === 'development' ? '0 2 * * *' : '*/5 * * * *', // every 5 minutes
  [JobName.END_VISIT]: '0 0 * * *', // 12am
  // Inventory Alert Jobs
  [JobName.INVENTORY_STOCK_LEVEL_CHECK]: '*/15 * * * *', // every 15 minutes
  [JobName.INVENTORY_EXPIRY_CHECK]: '0 */6 * * *', // every 6 hours
  [JobName.INVENTORY_ALERT_ESCALATION]: '*/30 * * * *', // every 30 minutes
  [JobName.INVENTORY_ALERT_AUTO_RESOLVE]: '0 1 * * *', // daily at 1 AM
  [JobName.CHARGE_DAILY_HOSPITALIZATION]: '0 0 * * *', // daily at midnight
};

export const ImmediateJob = {};
