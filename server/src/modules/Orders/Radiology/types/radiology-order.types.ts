import { PrescriptionType } from '../../../../database/models/prescribedTest';

type Investigations = {
  investigation_id: number;
  investigation_type: PrescriptionType;
  price: string | number;
};
export class PrescribedInvestigationBody {
  investigations: Array<Investigations>;
  staff_id: number;
  visit_id: number;
}
