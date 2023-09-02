export enum JobName {
  ASSIGN_HOSPITAL_NUMBER = 'Assign hospital number',
  SEND_FORGOT_PASSWORD = 'Send generated password',
  UPLOAD_IMAGE = 'Upload to image to box',
  EMPTY_HOSPITAL_NUMBER = 'Check empty hospital number',
  PATIENT_HEALTH_INSURANCE = 'Create patient health insurance',
  PRINCIPAL_RELATIONSHIP = 'Update dependant relationship to principal',
}

export const CronTimer = {
  [JobName.EMPTY_HOSPITAL_NUMBER]: '2am',
};

export const ImmediateJob = {
  [JobName.EMPTY_HOSPITAL_NUMBER]: JobName.EMPTY_HOSPITAL_NUMBER,
  [JobName.PATIENT_HEALTH_INSURANCE]: JobName.PATIENT_HEALTH_INSURANCE,
  [JobName.PRINCIPAL_RELATIONSHIP]: JobName.PRINCIPAL_RELATIONSHIP,
};
