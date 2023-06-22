import { Complaint, Diagnosis } from '../../../database/models';

export class Observation {
  id?: number;
  complaint_note?: string;
  history_note?: string;
  examination_note?: string;
  staff_id?: number;
  visit_id: number;
  patient_id: number;
  complaints: Array<Complaint>;
  diagnosis: Array<Diagnosis>;
}

export class Complaints {
  complaint: string;
  frequency: string;
  staff_id?: number;
  visit_id: number;
  patient_id: number;
  frequency_number: number;
  notes?: string;
}
