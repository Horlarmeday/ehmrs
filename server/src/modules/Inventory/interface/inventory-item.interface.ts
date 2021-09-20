import { DRUG_FORM } from '../../Pharmacy/interface/generic-drugs.interface';
import { DRUG_TYPE } from '../../Orders/Pharmacy/interface/prescribed-drug.interface';

export class InventoryItem {
  id?: number;
  drug_id: number;
  quantity_received: number;
  quantity?: number;
  unit_id: number;
  selling_price: number;
  price: number;
  expiration: Date;
  dosage_form_id: number;
  measurement_id: number;
  strength_input: string;
  staff_id: number;
  drug_form: DRUG_FORM;
  drug_type: DRUG_TYPE;
  date_received: Date;
  quantity_left?: number;
  quantity_consumed?: number;
  shelf?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
