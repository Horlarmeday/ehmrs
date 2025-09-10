// Billing Points Configuration
// Defines where payments can be collected in the hospital

export interface BillingPoint {
  id: string;
  name: string;
  location: string;
  department: string;
  payment_methods: PaymentMethod[];
  staff_roles: string[];
  is_active: boolean;
  description?: string;
}

export type PaymentMethod =
  | 'CASH'
  | 'POS'
  | 'BANK_TRANSFER'
  | 'MOBILE_MONEY'
  | 'INSURANCE'
  | 'DEPOSIT';

export const BILLING_POINTS: BillingPoint[] = [
  {
    id: 'main-cashier',
    name: 'Main Cashier Office',
    location: 'Main Building, Ground Floor',
    department: 'Accounting',
    payment_methods: ['CASH', 'POS', 'BANK_TRANSFER', 'MOBILE_MONEY', 'INSURANCE', 'DEPOSIT'],
    staff_roles: ['CASHIER', 'ACCOUNTANT', 'ADMIN'],
    is_active: true,
    description: 'Central cashier office for all hospital payments',
  },
  {
    id: 'accounting-office',
    name: 'Accounting Office',
    location: 'Main Building, First Floor',
    department: 'Accounting',
    payment_methods: ['BANK_TRANSFER', 'INSURANCE', 'DEPOSIT'],
    staff_roles: ['ACCOUNTANT', 'ADMIN'],
    is_active: true,
    description: 'Accounting office for complex transactions and insurance claims',
  },
  {
    id: 'emergency-cashier',
    name: 'Emergency Cashier',
    location: 'Emergency Department (Accounting Staff)',
    department: 'Accounting',
    payment_methods: ['CASH', 'POS', 'MOBILE_MONEY', 'DEPOSIT'],
    staff_roles: ['CASHIER', 'ACCOUNTANT'],
    is_active: true,
    description: 'Emergency cashier for urgent care payments (staffed by accounting department)',
  },
];

export const getBillingPointById = (id: string): BillingPoint | undefined => {
  return BILLING_POINTS.find(point => point.id === id);
};

export const getBillingPointsByDepartment = (department: string): BillingPoint[] => {
  return BILLING_POINTS.filter(point => point.department === department);
};

export const getActiveBillingPoints = (): BillingPoint[] => {
  return BILLING_POINTS.filter(point => point.is_active);
};

export const getBillingPointsByPaymentMethod = (paymentMethod: PaymentMethod): BillingPoint[] => {
  return BILLING_POINTS.filter(
    point => point.is_active && point.payment_methods.includes(paymentMethod)
  );
};

export const getBillingPointsByStaffRole = (staffRole: string): BillingPoint[] => {
  return BILLING_POINTS.filter(point => point.is_active && point.staff_roles.includes(staffRole));
};
