export class Result {
  prescribed_test_id: number;
  test_prescription_id: string;
  form_template_id: number;
  name: string;
  patient_id: number;
  disabledReferral: boolean;
  result?: string;
  status?: string;
  test_status?: string;
  is_abnormal?: boolean;
  valid_range?: string;
  institute_referred?: string;
  referral_reason?: string;
  comments?: string;
  testStatus?: string;
}
export class LaboratoryResultDto {
  results: Array<Result>;
  staff_id: number;
  tester_id?: number;
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
