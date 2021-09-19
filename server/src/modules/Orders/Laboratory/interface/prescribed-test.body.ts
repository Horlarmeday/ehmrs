import { TEST_TYPE } from './prescribed-test.interface';

type Tests = {
  test_id: number;
  test_type: TEST_TYPE;
  price: string | number;
};

export class PrescribedTestBody {
  tests: Array<Tests>;
  staff_id: number;
  visit_id: number;
}
