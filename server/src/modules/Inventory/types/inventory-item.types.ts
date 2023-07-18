import { DRUG_FORM } from '../../Pharmacy/interface/generic-drugs.interface';
import { DRUG_TYPE } from '../../Orders/Pharmacy/interface/prescribed-drug.interface';
import { DrugType } from '../../../database/models/pharmacyStore';

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

export type GetInventoryItemsBody = {
  currentPage: number;
  pageLimit?: number;
  search?: string;
  inventory: number;
  filter: any;
};

export type ItemsToDispensedBody = {
  id: number;
  drug_type: DrugType;
  quantity_to_dispense: number;
  dispensary: number;
  unit_id: number;
  drug_name: string;
  receiver: number;
};
