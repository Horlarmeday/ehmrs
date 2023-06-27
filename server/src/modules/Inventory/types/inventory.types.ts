import { Inventory } from '../../../database/models';
import { AcceptedDrugType } from '../../../database/models/inventory';

export class InventoryTypes {
  id?: number;
  name: string;
  refill_level: number;
  desc?: string;
  accepted_drug_type: AcceptedDrugType;
  staff_id?: number;
}
