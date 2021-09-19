import { DRUG_TYPE } from './prescribed-drug.interface';

export class PrescribedDrugBody {
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
  total_price: number;
  examiner: number;
  patient_id: number;
  visit_id: number;
  start_date: Date;
  capitated_price?: number;
}
