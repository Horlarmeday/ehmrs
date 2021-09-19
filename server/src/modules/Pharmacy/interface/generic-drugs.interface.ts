export type DRUG_FORM = 'Drug' | 'Consumable';

export class Drug {
  id?: number;
  type: DRUG_FORM;
  name: string;
  code: string;
  staff_id: number;
  createdAt?: Date;
  updatedAt?: Date;
}
