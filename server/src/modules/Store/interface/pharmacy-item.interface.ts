import { DRUG_FORM } from '../../Pharmacy/interface/generic-drugs.interface';
import { DRUG_TYPE } from '../../Orders/Pharmacy/interface/prescribed-drug.interface';
type STATUS = 'Active' | 'Inactive';

export class PharmacyItem {
  id?: number;
  drug_id: number;
  product_code: string;
  voucher: string;
  shelf: string;
  batch: string;
  quantity: number;
  remain_quantity: number;
  unit_id: number;
  unit_price: number | string;
  total_price: number | string;
  selling_price: number | string;
  expiration: Date;
  dosage_form_id: number;
  staff_id: number;
  date_received: Date;
  measurement_id: number;
  strength_input: string;
  route_id: number;
  drug_form: DRUG_FORM;
  status: STATUS;
  drug_type: DRUG_TYPE;
  createdAt?: Date;
  updatedAt?: Date;
}
