import { Diagnosis } from '../../../database/models';

export class CreateAntenatal {
  patient_id: number;
  staff_id: number;
  service_id: number;
}

export class PreviousPregnancyBody {
  year: string;
  delivery_place: string;
  maturity: string;
  duration: string;
  delivery_type: string;
  weight: number;
  sex: string;
  fate: string;
  baby_type: string;
  puerperium: string;
}

export class UpdateAntenatalAccount {
  gravida: string;
  parity: string;
  last_menses_period: Date;
  fetal_age: string;
  estimated_concept_time: Date;
  estimated_delivery_date: Date;
  obstetric_history: string;
  surgical_history: string;
  medical_history: string;
  family_history: string;
  for_whom: string;
  blood_transfusion: string;
  pregnancies?: PreviousPregnancyBody[];
}

export class CreateAntenatalTriage {
  height: number;
  weight: number;
  visit_id: number;
  body_mass_index: string;
  urinalysis_glucose: string;
  urinalysis_protein: string;
  pallor: string;
  blood_pressure: string;
  maturity: string;
  oedema: string;
  presentation: string;
  comments?: string;
  next_appointment_date?: string;
  foetal_heart_rate: string;
  fundal_height: string;
  rvst: string;
}

export class CreateClinicalNote {
  notes: string;
  clinical_note_id?: number;
}

export class CreateObservation {
  mother_condition: string;
  foetal_condition: string;
  doctor_comments: string;
  continuation_sheet: string;
  visit_id: number;
  staff_id: number;
  ante_natal_id: number;
  diagnosis: Array<Diagnosis>;
  observation_id?: number;
}

export type CreateDeliveryInfo = {
  mode_of_delivery: string;
  date_of_delivery: Date;
  blood_loss_quantity: string;
  duration: string;
  condition_of_mother: string;
  condition_of_baby: string;
  apgar_one_min: string;
  apgar_five_min: string;
  apgar_ten_min: string;
  baby_immunization_date: Date;
  bcg: string;
  opvo: string;
  hbv: string;
  comments: string;
  nature_of_liquor: string;
  nevirapine: string;
  vitaminA_IU: string;
  birth_weight: string;
  sex: string;
  time_surgery_ended: Date;
};

export type CreatePostNatal = {
  temperature: string;
  weight: number;
  height: number;
  pulse: string;
  respiration: string;
  lochia: string;
  feeding: string;
  baby_condition: string;
  general_condition: string;
  blood_pressure: string;
  involution_of_uterus: string;
  episotomy: string;
  pap_smear_date: Date;
  result: string;
  pcv: string;
  comments: string;
  reflexes: string;
  pelvic_examination: string;
  umbilical_cord: string;
  patient_id?: number;
  ante_natal_id?: number;
  staff_id?: number;
  visit_id?: number;
};
