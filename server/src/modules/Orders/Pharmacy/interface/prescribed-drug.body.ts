import { DrugType } from '../../../../database/models/pharmacyStore';
import { DrugForm } from '../../../../database/models/drug';

export class PrescribedAdditionalItemBody {
  drug_id: number;
  unit_id: number;
  examiner: number;
  drug_type: DrugType;
  quantity_prescribed: number;
  quantity_to_dispense: number;
  drug_form?: DrugForm;
  drug_prescription_id?: string;
  total_price: number;
  patient_id: number;
  visit_id: number;
  inventory_id: number;
  start_date: Date;
  ante_natal_id?: number;
  source: string;
}

export class PrescribedDrugBody {
  drug_id: number;
  staff_id: number;
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
  insurance_id: number;
  inventory_id: number;
  start_date: Date;
  source: string;
  drug_group?: string;
  ante_natal_id?: number;
}
