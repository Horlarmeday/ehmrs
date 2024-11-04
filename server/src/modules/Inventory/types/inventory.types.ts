import { AcceptedDrugType } from '../../../database/models/inventory';

export class InventoryTypes {
  id?: number;
  name: string;
  refill_level: number;
  desc?: string;
  accepted_drug_type: AcceptedDrugType;
  staff_id?: number;
}

export type RequestReturnToStore = {
  quantity: number;
  inventory_item_id: number;
  staff_id: number;
  reason_for_return: string;
};

export type UpdateReturnRequest = {
  id: number;
  inventory_item_id: number;
  quantity: number;
  status: string;
};
