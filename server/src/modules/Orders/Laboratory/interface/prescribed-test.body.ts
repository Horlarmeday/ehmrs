import { PrescriptionType } from '../../../../database/models/prescribedTest';

type Tests = {
  test_id: number;
  test_type: PrescriptionType;
  price: string | number;
};

export class PrescribedTestBody {
  tests: Array<Tests>;
  staff_id: number;
  visit_id: number;
}
