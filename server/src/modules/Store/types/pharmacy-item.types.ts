import { DRUG_FORM } from '../../Pharmacy/interface/generic-drugs.interface';
import { DRUG_TYPE } from '../../Orders/Pharmacy/interface/prescribed-drug.interface';
import { PharmacyStore } from '../../../database/models';
import { ItemsToDispensedBody } from '../../Inventory/types/inventory-item.types';
import { HistoryType } from '../../../database/models/inventoryItemHistory';
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

export type ItemsToReorder = {
  quantity_received: number;
  id: number;
  selling_price: number;
  unit_price: number;
  voucher: string;
  batch: string;
  expiration: Date;
  date_received: Date;
};

export type MapDispenseStoreItemHistoryType = {
  item: ItemsToDispensedBody;
  storeItem: PharmacyStore;
  staff_id: number;
};

export type MapSupplyStoreItemHistoryType = {
  item: ItemsToReorder;
  storeItem: PharmacyStore;
  staff_id: number;
};

export enum ExportDataType {
  CSV = 'CSV',
  EXCEL = 'Excel',
  PDF = 'PDF',
}
