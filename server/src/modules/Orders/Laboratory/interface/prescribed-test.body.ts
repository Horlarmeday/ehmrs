import { PrescriptionType, Source } from '../../../../database/enums';

export type TestBody = {
  test_id: number;
  sample_id: number;
  test_type: PrescriptionType;
  price: string | number;
  source: Source;
  ante_natal_id?: number;
};

export class PrescribedTestBody {
  tests: Array<TestBody>;
  staff_id: number;
  visit_id: number;
}
