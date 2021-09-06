export interface PatientInterface {
  id: number;
  firstname: string;
  lastname: string;
  middlename?: string;
  gender: string;
  phone: string;
  alt_phone?: string;
  address: string;
  country: string;
  state: string;
  lga: string;
  hospital_id?: number;
  next_of_kin_name?: string;
  next_of_kin_address?: string;
  next_of_kin_phone?: string;
  occupation: string;
  relationship?: string;
  photo: string;
  photo_url: string;
  date_of_birth: Date;
  insurance_id?: number;
  hmo_id: number;
  marital_status: string;
  enrollee_code: string;
  religion: string;
  email?: string;
  staff_id?: number;
  organization?: string;
  plan?: string;
  has_insurance: boolean;
  principal_id?: number;
  patient_type: string;
  fullname?: string;
}
