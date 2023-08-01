import { PrescriptionType } from '../../../../database/models/prescribedTest';

type Tests = {
  test_id: number;
  sample_id: number;
  test_type: PrescriptionType;
  price: string | number;
};

export class PrescribedTestBody {
  tests: Array<Tests>;
  source: string;
  staff_id: number;
  visit_id: number;
}
