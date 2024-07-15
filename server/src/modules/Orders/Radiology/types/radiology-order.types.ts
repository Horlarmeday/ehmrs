import { PrescriptionType } from '../../../../database/models/prescribedTest';

export type Investigation = {
  investigation_id: number;
  investigation_type: PrescriptionType;
  price: string | number;
  source: string;
  name: string;
  ante_natal_id?: number;
};
export class PrescribedInvestigationBody {
  investigations: Array<Investigation>;
  staff_id: number;
  visit_id: number;
}
