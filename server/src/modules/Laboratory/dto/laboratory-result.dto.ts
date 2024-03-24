export class Result {
  prescribed_test_id: number;
  test_prescription_id: string;
  name: string;
  patient_id: number;
  disabledReferral: boolean;
  result?: string;
  status?: string;
  test_status?: string;
  is_abnormal: boolean;
  institute_referred?: string;
  referral_reason?: string;
  comments?: string;
}
export class LaboratoryResultDto {
  results: Array<Result>;
  staff_id: number;
}

export class LaboratoryResultValidationDto {
  results: Array<Result>;
  staff_id: number;
  result_notes: string;
}

export class LaboratoryResultApprovalDto {
  results: Array<Result>;
  staff_id: number;
}
