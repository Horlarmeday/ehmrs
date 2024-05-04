export type DispenseDrugType = {
  prescription_id?: number;
  quantity_to_dispense: number;
  staff_id: number;
  drug_prescription_id: number;
  additional_item_id?: number;
};

export type ReturnDrugType = {
  prescription_id?: number;
  quantity_to_return: number;
  staff_id: number;
  additional_item_id?: number;
  drug_prescription_id: number;
  reason_for_return: string;
};
