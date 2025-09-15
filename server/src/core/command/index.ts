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
}

export const CronTimer = {
  [JobName.EMPTY_HOSPITAL_NUMBER]:
    process.env.NODE_ENV === 'development' ? '0 2 * * *' : '*/5 * * * *', // every 5 minutes
  [JobName.CLOSE_ANTENATAL_ACCOUNT]: '0 1 * * *', // every 1am
  [JobName.END_VISIT]: '0 0 * * *', // 12am
};

export const ImmediateJob = {};
