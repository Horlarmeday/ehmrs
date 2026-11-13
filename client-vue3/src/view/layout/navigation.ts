import type { ShellIconName } from '../../components/shell/ShellIcon.vue';

export type SectionId =
  | 'home'
  | 'patients'
  | 'worklists'
  | 'inpatients'
  | 'programs'
  | 'laboratory'
  | 'radiology'
  | 'pharmacy'
  | 'stock'
  | 'insurance'
  | 'finance'
  | 'orders'
  | 'reports'
  | 'administration';

export interface Section {
  id: SectionId;
  label: string;
  icon: ShellIconName;
}

export const sections: Section[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'patients', label: 'Patients', icon: 'users' },
  { id: 'worklists', label: 'Worklists', icon: 'list' },
  { id: 'inpatients', label: 'Inpatients', icon: 'bed' },
  { id: 'programs', label: 'Programs', icon: 'calendar' },
  { id: 'laboratory', label: 'Laboratory', icon: 'flask' },
  { id: 'radiology', label: 'Radiology', icon: 'scan' },
  { id: 'pharmacy', label: 'Pharmacy', icon: 'pill' },
  { id: 'stock', label: 'Stock', icon: 'box' },
  { id: 'insurance', label: 'Insurance', icon: 'shield' },
  { id: 'finance', label: 'Finance', icon: 'wallet' },
  { id: 'orders', label: 'Orders', icon: 'clipboard' },
  { id: 'reports', label: 'Reports', icon: 'chart' },
  { id: 'administration', label: 'Administration', icon: 'settings' },
];

export const reservedDestinations = [
  '/payments/',
  '/reports/active',
  '/statistics/active',
  '/analytics/',
  '/appointment/active',
  '/pharmacy/reports',
  '/radiology/reports',
  '/radiology/appointments',
];

const sectionByPath: Array<[string, SectionId]> = [
  ['/patient/health-insurance', 'insurance'],
  ['/patient/', 'patients'],
  ['/visit/nhis-active-visits', 'insurance'],
  ['/visit/prescriptions', 'pharmacy'],
  ['/visit/inpatients', 'inpatients'],
  ['/visit/admitted-patients', 'inpatients'],
  ['/visit/maternity', 'inpatients'],
  ['/visit/ante-natal', 'programs'],
  ['/visit/immunization', 'programs'],
  ['/visit/', 'worklists'],
  ['/admission/', 'inpatients'],
  ['/surgery/', 'inpatients'],
  ['/program/', 'programs'],
  ['/laboratory/reports', 'reports'],
  ['/laboratory/', 'laboratory'],
  ['/radiology/', 'radiology'],
  ['/pharmacy/', 'pharmacy'],
  ['/store/', 'stock'],
  ['/inventory/', 'stock'],
  ['/request/', 'stock'],
  ['/insurance/', 'insurance'],
  ['/account/', 'finance'],
  ['/orders/', 'orders'],
  ['/statistics', 'reports'],
  ['/settings/', 'administration'],
  ['/employee/', 'administration'],
  ['/system/', 'administration'],
  ['/nurses/', 'administration'],
];

export function sectionOf(url: string): SectionId | null {
  if (reservedDestinations.includes(url)) return null;
  const match = sectionByPath.find(([prefix]) => url.startsWith(prefix));
  return match ? match[1] : null;
}

const doctorTiles = [
  '/visit/queue',
  '/visit/inpatients',
  '/visit/ante-natal',
  '/radiology/appointments',
  '/radiology/reports',
];
const adminTiles = [
  '/patient/find-patient',
  '/visit/all',
  '/patient/patient-operations',
  '/settings/choose-type',
  '/program/program-type',
  '/employee/choose-type',
  '/store/store-type',
  '/insurance/insurance-type',
  '/orders/orders-type',
  '/inventory/inventory-type',
  '/payments/',
  '/reports/active',
  '/statistics',
  '/analytics/',
  '/pharmacy/pharmacy-type',
  '/laboratory/laboratory-type',
  '/radiology/radiology-type',
  '/request/request-type',
  '/system/settings',
];
const wardTiles = (occupantType: string, extra: string[] = []) => [
  `/visit/admitted-patients?occupantType=${occupantType}`,
  '/admission/discharge-patients',
  ...extra,
  '/reports/active',
  '/statistics/active',
];

export const dashboardTiles: Record<string, string[]> = {
  superAdmin: [
    '/patient/find-patient',
    '/visit/all',
    '/patient/patient-operations',
    '/appointment/active',
    ...adminTiles.slice(3),
  ],
  admin: adminTiles,
  laboratory: [
    '/laboratory/samples-to-collect',
    '/laboratory/samples-collected',
    '/laboratory/verified-results',
    '/laboratory/find-results',
    '/laboratory/reports',
  ],
  laboratoryHod: [
    '/laboratory/laboratory-type',
    '/laboratory/samples-to-collect',
    '/laboratory/samples-collected',
    '/laboratory/verified-results',
    '/laboratory/find-results',
    '/laboratory/reports',
  ],
  radiology: [
    '/radiology/requested-investigations',
    '/radiology/investigations-approval',
    '/radiology/investigations-results',
    '/radiology/reports',
  ],
  pharmacy: [
    '/pharmacy/prescriptions',
    '/request/inventory-requests',
    '/request/returns',
    '/inventory/inventory-type',
    '/pharmacy/reports',
  ],
  pharmacyHod: [
    '/store/pharmacy',
    '/request/list',
    '/request/returns',
    '/pharmacy/prescriptions',
    '/inventory/inventory-type',
    '/pharmacy/pharmacy-type',
    '/pharmacy/reports',
  ],
  pharmacyStore: [
    '/store/pharmacy',
    '/request/list',
    '/inventory/inventory-type',
    '/pharmacy/reports',
  ],
  generalPractitioner: [
    '/visit/queue',
    '/visit/admitted-patients',
    '/visit/dialysis',
    '/visit/ante-natal',
    '/radiology/appointments',
    '/radiology/reports',
  ],
  specialist: doctorTiles,
  medicalRecords: [
    '/patient/find-patient',
    '/patient/choose-patient-type',
    '/visit/active',
    '/appointment/active',
    '/program/program-type',
    '/reports/active',
    '/statistics/active',
  ],
  nhis: [
    '/visit/nhis-active-visits',
    '/patient/health-insurance',
    '/reports/active',
    '/statistics/active',
  ],
  customerCare: [
    '/visit/prescriptions',
    '/visit/admitted-patients',
    '/admission/discharge-patients',
    '/radiology/investigations-approval',
    '/radiology/reports',
    '/patient/find-patient',
  ],
  financeOfficer: [
    '/account/transactions',
    '/laboratory/samples-collected',
    '/laboratory/verified-results',
    '/laboratory/find-results',
    '/laboratory/reports',
  ],
  nurseOpd: ['/visit/vitals', '/visit/treatments', '/reports/active', '/statistics/active'],
  nurseFemaleWard: wardTiles('Female'),
  nurseMaleWard: wardTiles('Male'),
  nurseChildrenWard: wardTiles('Children', ['/program/ante-natal/list']),
  nurseMaternity: ['/visit/maternity', ...wardTiles('Maternity')],
  nurseAntenatal: [
    '/visit/ante-natal',
    '/visit/immunization',
    '/program/ante-natal/list',
    '/reports/active',
  ],
  nurseTheater: ['/surgery/requests', '/radiology/investigations-approval', '/radiology/reports'],
  nurseHod: [
    '/visit/vitals',
    '/visit/treatments',
    '/visit/ante-natal',
    '/program/ante-natal/list',
    '/visit/immunization',
    '/visit/admitted-patients?occupantType=Female',
    '/admission/discharge-patients',
    '/nurses/list',
    '/reports/active',
    '/statistics/active',
  ],
  nurseEmergency: wardTiles('Emergency'),
  nurseVip: wardTiles('All'),
};

const specialistRoles = [
  'Cardiologist',
  'Obstetrics and gynaecologist',
  'Pediatrician',
  'Oncologist',
  'Ophthalmologist',
  'Neurologist',
  'Nephrologist',
  'Dermatologist',
  'Psychiatrist',
  'Orthopaedist',
  'Hematologist',
  'Urologist',
  'Endocrinologist',
  'Gastroenterologist',
  'Physiotherapist',
];

const nurseDashboards: Record<string, string> = {
  'G-OPD': 'nurseOpd',
  'Female Ward': 'nurseFemaleWard',
  'Male Ward': 'nurseMaleWard',
  'Children Ward': 'nurseChildrenWard',
  Maternity: 'nurseMaternity',
  ANC: 'nurseAntenatal',
  Theater: 'nurseTheater',
  HOD: 'nurseHod',
  'Accident & Emergency': 'nurseEmergency',
  'VIP/Private': 'nurseVip',
};

const roleDashboards: Record<string, string> = {
  'Super Admin': 'superAdmin',
  Admin: 'admin',
  Radiology: 'radiology',
  'General Practitioner': 'generalPractitioner',
  'Medical Records': 'medicalRecords',
  NHIS: 'nhis',
  'Customer Care': 'customerCare',
  'Pharmacy Store': 'pharmacyStore',
  'Finance Officer': 'financeOfficer',
};

export function dashboardFor(role?: string, subRole?: string): string | null {
  if (role === 'Laboratory') return subRole === 'HOD' ? 'laboratoryHod' : 'laboratory';
  if (role === 'Pharmacy') return subRole === 'HOD' ? 'pharmacyHod' : 'pharmacy';
  if (role === 'Nurse') return (subRole && nurseDashboards[subRole]) ?? null;
  if (role && specialistRoles.includes(role)) return 'specialist';
  return (role && roleDashboards[role]) ?? 'medicalRecords';
}

export interface MenuEntry extends Section {
  to: string;
}

export function menuFor(role?: string, subRole?: string): MenuEntry[] {
  const dashboard = dashboardFor(role, subRole);
  const tiles = dashboard ? (dashboardTiles[dashboard] ?? []) : [];
  const firstTile = new Map<SectionId, string>([['home', '/dashboard']]);
  for (const tile of tiles) {
    const section = sectionOf(tile);
    if (section && !firstTile.has(section)) firstTile.set(section, tile);
  }
  return sections
    .filter((section) => firstTile.has(section.id))
    .map((section) => ({ ...section, to: firstTile.get(section.id) ?? '/dashboard' }));
}
