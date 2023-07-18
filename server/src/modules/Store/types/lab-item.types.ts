export class LabItem {
  id?: number;
  name: string;
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
  staff_id: number;
  date_received: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
