import { DrugType } from '../../../../database/models/pharmacyStore';
import { DrugForm } from '../../../../database/models/drug';

export class PrescribedDrugBody {
  drug_id: number;
  drug_type: DrugType;
  quantity_prescribed: number;
  quantity_to_dispense: number;
  route: number;
  dosage_form_id: number;
  route_id: number;
  prescribed_strength: string;
  strength_id: string;
  frequency: string;
  duration: number;
  duration_unit: string;
  notes: string;
  total_price: number;
  examiner: number;
  patient_id: number;
  visit_id: number;
  start_date: Date;
}
