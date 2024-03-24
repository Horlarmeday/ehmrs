export enum JobName {
  ASSIGN_HOSPITAL_NUMBER = 'Assign hospital number',
  SEND_FORGOT_PASSWORD = 'Send generated password',
  UPLOAD_IMAGE = 'Upload to image to cloudinary',
  EMPTY_HOSPITAL_NUMBER = 'Check empty hospital number',
  PATIENT_HEALTH_INSURANCE = 'Create patient health insurance',
  PRINCIPAL_RELATIONSHIP = 'Update dependant relationship to principal',
  ASSIGN_ANTENATAL_NUMBER = 'Assign antenatal number',
  ASSIGN_IMMUNIZATION_NUMBER = 'Assign immunization number',
  SEND_PATIENT_SMS = 'Registration SMS',
  END_VISIT = 'End visit',
  CLOSE_ANTENATAL_ACCOUNT = 'Close antenatal account',
}

export const CronTimer = {
  [JobName.EMPTY_HOSPITAL_NUMBER]: '2am',
};

export const ImmediateJob = {
  [JobName.EMPTY_HOSPITAL_NUMBER]: JobName.EMPTY_HOSPITAL_NUMBER,
  [JobName.PATIENT_HEALTH_INSURANCE]: JobName.PATIENT_HEALTH_INSURANCE,
  [JobName.PRINCIPAL_RELATIONSHIP]: JobName.PRINCIPAL_RELATIONSHIP,
};
