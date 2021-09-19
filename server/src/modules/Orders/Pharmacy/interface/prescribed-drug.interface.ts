import { PAYMENT_STATUS } from '../../Laboratory/interface/prescribed-test.interface';

export type DRUG_TYPE = 'Cash' | 'NHIS';
type DRUG_DISPENSE_STATUS = 'Pending' | 'Returned' | 'Dispensed';

export class PrescribedDrug {
  id: number;
  drug_id: number;
  drug_type: DRUG_TYPE;
  quantity: number;
  quantity_to_dispense: number;
  route: number;
  dosage_form: number;
  prescribed_strength: string;
  strength: string;
  frequency: string;
  duration: number;
  duration_unit: string;
  notes: string;
  capitated_price?: number | string;
  total_price: number | string;
  examiner: number;
  patient_id: number;
  visit_id: number;
  start_date: Date;
  date_prescribed: Date;
  is_dispensed: DRUG_DISPENSE_STATUS;
  payment_status: PAYMENT_STATUS;
  is_nhis_drug_approved: boolean;
}
