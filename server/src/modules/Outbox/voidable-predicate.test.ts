import {
  DispenseStatus,
  InvestigationStatus,
  PaymentStatus,
  PrescribedTestStatus,
} from '../../database/enums';
import { VOIDABLE_PREDICATE_BY_TYPE } from './prescribed-line-types';

describe('VOIDABLE_PREDICATE_BY_TYPE', () => {
  it('covers all five prescribed-line types', () => {
    expect(Object.keys(VOIDABLE_PREDICATE_BY_TYPE).sort()).toEqual(
      ['additional_item', 'drug', 'investigation', 'service', 'test'].sort()
    );
  });

  describe.each([
    [
      'drug',
      {
        payment_status: PaymentStatus.PENDING,
        dispense_status: DispenseStatus.PENDING,
        quantity_dispensed: 0,
        quantity_returned: 0,
      },
    ],
    [
      'additional_item',
      {
        payment_status: PaymentStatus.PENDING,
        dispense_status: DispenseStatus.PENDING,
        quantity_dispensed: 0,
        quantity_returned: 0,
      },
    ],
    ['test', { payment_status: PaymentStatus.PENDING, status: PrescribedTestStatus.PENDING }],
    [
      'investigation',
      { payment_status: PaymentStatus.PENDING, status: InvestigationStatus.PENDING },
    ],
    ['service', { payment_status: PaymentStatus.PENDING }],
  ] as const)('%s qualifying row', (type, row) => {
    it('qualifies', () => {
      expect(VOIDABLE_PREDICATE_BY_TYPE[type].qualifies(row)).toBe(true);
    });
  });

  describe.each([
    [
      'drug',
      {
        payment_status: PaymentStatus.PAID,
        dispense_status: DispenseStatus.PENDING,
        quantity_dispensed: 0,
        quantity_returned: 0,
      },
    ],
    [
      'drug',
      {
        payment_status: PaymentStatus.CLEARED,
        dispense_status: DispenseStatus.PENDING,
        quantity_dispensed: 0,
        quantity_returned: 0,
      },
    ],
    [
      'drug',
      {
        payment_status: PaymentStatus.PERMITTED,
        dispense_status: DispenseStatus.PENDING,
        quantity_dispensed: 0,
        quantity_returned: 0,
      },
    ],
    [
      'drug',
      {
        payment_status: PaymentStatus.PENDING,
        dispense_status: DispenseStatus.PARTIAL_DISPENSED,
        quantity_dispensed: 1,
        quantity_returned: 0,
      },
    ],
    [
      'drug',
      {
        payment_status: PaymentStatus.PENDING,
        dispense_status: DispenseStatus.PARTIAL_RETURNED,
        quantity_dispensed: 0,
        quantity_returned: 1,
      },
    ],
    [
      'drug',
      {
        payment_status: PaymentStatus.PENDING,
        dispense_status: DispenseStatus.RETURNED,
        quantity_dispensed: 0,
        quantity_returned: 0,
      },
    ],
    ['test', { payment_status: PaymentStatus.PENDING, status: PrescribedTestStatus.REFERRED }],
    [
      'investigation',
      { payment_status: PaymentStatus.PENDING, status: InvestigationStatus.REFERRED },
    ],
    ['service', { payment_status: PaymentStatus.PAID }],
  ] as const)('%s disqualifying row', (type, row) => {
    it('does not qualify', () => {
      expect(VOIDABLE_PREDICATE_BY_TYPE[type].qualifies(row)).toBe(false);
    });
  });
});
