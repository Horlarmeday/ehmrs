export type AdmissionBodyType = {
  patient_id: number;
  ward_id: number;
  bed_id: number;
  visit_id: number;
  admitted_by: number;
  ante_natal_id?: number;
};

export type UpdateAdmissionBody = {
  ward_id?: number;
  bed_id?: number;
  should_discharge?: boolean;
  admissionId?: number;
};
