export type TEST_TYPE = 'CASH' | 'NHIS';
export type PAYMENT_STATUS = 'Paid' | 'Cleared' | 'Pending';

export class PrescribedTest {
  id?: number;
  test_id?: number;
  nhis_test_id?: number;
  test_type: TEST_TYPE;
  requester: number;
  price: string | number;
  patient_id: number;
  visit_id: number;
  date_requested?: Date;
  payment_status?: Record<PAYMENT_STATUS, string>;
  is_test_verified?: boolean;
  test_verified_date?: Date;
  is_test_approved?: boolean;
  test_approved_date?: Date;
  test_verified_by?: number;
  test_approved_by?: number;
  is_nhis_test_approved?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
