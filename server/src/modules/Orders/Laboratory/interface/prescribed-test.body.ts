import { TestType } from '../../../../database/models/prescribedTest';

type Tests = {
  test_id: number;
  test_type: TestType;
  price: string | number;
};

export class PrescribedTestBody {
  tests: Array<Tests>;
  staff_id: number;
  visit_id: number;
}
