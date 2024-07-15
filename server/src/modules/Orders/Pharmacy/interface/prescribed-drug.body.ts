import { DrugType } from '../../../../database/models/pharmacyStore';
import { DrugForm } from '../../../../database/models/drug';
import { Patient, PatientInsurance, PrescribedInvestigation } from '../../../../database/models';
import { Transaction } from 'sequelize';

export class PrescribedAdditionalItemBody {
  drug_id: number;
  unit_id: number;
  examiner: number;
  name?: string;
  drug_type: DrugType;
  quantity_prescribed: number;
  quantity_to_dispense: number;
  drug_form?: DrugForm;
  drug_prescription_id?: number;
  prescribed_drug_id?: number;
  price?: number;
  total_price?: number;
  patient_id: number;
  visit_id: number;
  inventory_id: number;
  start_date: Date;
  ante_natal_id?: number;
  surgery_id?: number;
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
  dosage_form_name: string;
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
  unit_id: number;
  insurance_id: number;
  inventory_id: number;
  start_date: Date;
  source: string;
  drug_group?: string;
  ante_natal_id?: number;
  immunization_id?: number;
  surgery_id?: number;
}

export class PatientTreatmentBody {
  drug_id: number;
  staff_id: number;
  patient_id: number;
  visit_id: number;
  dosage_administered: string;
  remarks: string;
  date_entered: Date;
  admission_id?: number;
  source?: 'Admission' | 'Consultation';
}

export type OrderBulkInvestigationType = {
  data: any;
  includesHSG: boolean;
  patient: Patient;
  insurance: PatientInsurance;
  visit_id: number;
};

export type InsertHSGAdditionalItemsType = {
  investigations: PrescribedInvestigation[];
  patient: Patient;
  insurance: PatientInsurance;
  visit_id: number;
  items: any;
  t: Transaction;
};
