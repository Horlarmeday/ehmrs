import { PrescriptionType } from '../../../../database/models/prescribedTest';
import { Source } from '../../../../database/models/testPrescription';

export type Test = {
  test_id: number;
  sample_id: number;
  test_type: PrescriptionType;
  price: string | number;
  source: Source;
  ante_natal_id?: number;
};

export class PrescribedTestBody {
  tests: Array<Test>;
  staff_id: number;
  visit_id: number;
}
