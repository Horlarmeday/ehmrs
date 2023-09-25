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
