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

export type ObservationBodyType = {
  temperature: string;
  systolic: string;
  diastolic: string;
  spo2: string;
  respiration: string;
  pulse: string;
  height: number;
  weight: number;
  bmi: number;
  rvs: string;
  muac: string;
  heart_rate: string;
  bmiCategory: string;
};

export type CarePlanBodyType = {
  evaluation: string;
  scientific_principle: string;
  nursing_objective: string;
  nursing_action: string;
  nursing_diagnosis: string;
};

export type IOChartBodyType = {
  input_item: string;
  input_quantity: number;
  output_item: string;
  output_quantity: number;
  input_total: number;
  output_total: number;
};
