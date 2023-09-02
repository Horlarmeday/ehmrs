import Joi from 'joi';

export enum PatientType {
  PRINCIPAL = 'Principal',
  DEPENDANT = 'Dependant',
  INDEPENDENT = 'Independent',
}

export type Dependant = {
  firstname: string;
  lastname: string;
  phone: string;
  relationship: string;
  enrollee_code: string;
  insurance_id: number;
  hmo_id: number;
  gender: string;
  address: string;
  plan: string;
  date_of_birth: Date;
  photo: string;
  principal_id?: number;
  patient_type?: PatientType;
};

export type AddPatientInsuranceBody = {
  enrollee_code: string;
  organization: string;
  hmo_id: number;
  insurance_id: number;
  patient_id: number;
  staff_id: number;
  plan: string;
  dependants: Array<Dependant>;
};

export type EmergencyPatientBody = {
  firstname: string;
  lastname: string;
  middlename?: string;
  email: string;
  address: string;
  gender: string;
  country: string;
  state: string;
  lga: string;
  date_of_birth: Date;
  marital_status: string;
  religion: string;
  phone: string;
};

export type CreatePatientBody = {
  firstname: string;
  lastname: string;
  middlename: string;
  email: string;
  occupation: string;
  address: string;
  gender: string;
  next_of_kin_name: string;
  next_of_kin_phone: string;
  next_of_kin_address: string;
  relationship: string;
  country: string;
  state: string;
  lga: string;
  photo: string;
  religion: string;
  marital_status: string;
  date_of_birth: string;
  phone: string;
  alt_phone: string;
  registration_fee: number;
  service_id: number;
};
