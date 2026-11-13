import type { KitSort } from '../../components/kit/KitTable.vue';

export interface StockItem extends Record<string, unknown> {
  id: number;
  name: string;
  productCode: string;
  quantityRemaining: number;
  quantityReceived: number;
  dosageForm: string;
  strength: string;
  costPrice: number;
  sellingPrice: number;
  expiry: string;
  dateAdded: string;
  dateReceived: string;
  drugType: string;
  drugForm: string;
  vendor: string;
  batch: string;
  brand: string;
  voucher: string;
  shelf: string;
  status: 'active' | 'inactive';
}

export interface HistoryEntry extends Record<string, unknown> {
  id: number;
  history: string;
  quantity: number;
  quantityRemaining: number;
  currentQuantity: number;
  inventory: string;
  price: number;
  status: string;
  receiver: string;
  actionBy: string;
  date: string;
}

export type DispenseStatus = 'Pending' | 'Partial' | 'Dispensed';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Permitted' | 'Cleared';

export interface PrescribedDrug {
  id: number;
  kind: 'drug' | 'item';
  drugName: string;
  dosageForm: string;
  strength: string;
  quantityPrescribed: number;
  quantityDispensed: number;
  quantityReturned: number;
  frequency: string;
  route: string;
  duration: number;
  durationUnit: string;
  drugType: string;
  prescribedBy: string;
  payment: PaymentStatus;
  unitPrice: number;
  patientShare: number;
  payerShare: number;
  dispenser: string | null;
  dateDispensed: string | null;
}

export interface Prescription extends Record<string, unknown> {
  id: number;
  patient: string;
  hospitalNumber: string;
  age: number;
  gender: string;
  phone: string;
  insurance: { name: string; hmo: string | null } | null;
  source: 'Consultation' | 'Antenatal' | 'Theater' | 'Immunization';
  prescribedAt: string;
  prescribedOn: string;
  day: 'Today' | 'Backlog';
  drugs: PrescribedDrug[];
}

export const dosageForms = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Infusion', 'Cream'];
export const drugTypes = ['Cash', 'NHIS', 'Private', 'Retainership'];
export const drugForms = ['Drug', 'Consumable'];
export const vendors = ['Emzor Pharma', 'Fidson Healthcare', 'May & Baker', 'Swipha'];
export const routes = ['Oral', 'Intravenous', 'Intramuscular', 'Topical'];
export const strengthUnits = ['mg', 'g', 'ml', 'mcg', 'IU'];
export const units = ['Pack', 'Box', 'Bottle', 'Vial', 'Sachet'];

const generics: Array<[string, string, string]> = [
  ['Amoxicillin', 'Capsule', '500mg'],
  ['Paracetamol', 'Tablet', '500mg'],
  ['Artemether/Lumefantrine', 'Tablet', '80/480mg'],
  ['Ciprofloxacin', 'Tablet', '500mg'],
  ['Metronidazole', 'Infusion', '500mg'],
  ['Ceftriaxone', 'Injection', '1g'],
  ['Ibuprofen', 'Syrup', '100mg/5ml'],
  ['Omeprazole', 'Capsule', '20mg'],
  ['Amlodipine', 'Tablet', '10mg'],
  ['Metformin', 'Tablet', '500mg'],
  ['Hydrocortisone', 'Cream', '1%'],
  ['Normal saline', 'Infusion', '0.9%'],
  ['Diclofenac', 'Injection', '75mg'],
  ['Folic acid', 'Tablet', '5mg'],
  ['Ferrous sulphate', 'Tablet', '200mg'],
];

const pad = (value: number) => String(value).padStart(2, '0');

export const stockItems: StockItem[] = Array.from({ length: 47 }, (_, index) => {
  const [generic, form, strength] = generics[index % generics.length] ?? ['Item', 'Tablet', '1mg'];
  const cost = 150 + ((index * 137) % 2400);
  const received = 50 + ((index * 53) % 450);
  return {
    id: index + 1,
    name: `${generic} ${strength}`,
    productCode: `PH-${String(1040 + index * 7)}`,
    quantityRemaining: index % 9 === 4 ? 0 : (index * 29) % received,
    quantityReceived: received,
    dosageForm: form,
    strength,
    costPrice: cost,
    sellingPrice: Math.round(cost * 1.35),
    expiry: `202${7 + (index % 3)}-${pad(1 + (index % 12))}-28`,
    dateAdded: `2026-${pad(1 + (index % 10))}-${pad(1 + ((index * 3) % 27))}`,
    dateReceived: `2026-${pad(1 + (index % 10))}-${pad(1 + ((index * 3) % 27))}`,
    drugType: drugTypes[index % drugTypes.length] ?? 'Cash',
    drugForm: index % 7 === 6 ? 'Consumable' : 'Drug',
    vendor: vendors[index % vendors.length] ?? '',
    batch: `B${String(23000 + index * 11)}`,
    brand: index % 3 === 0 ? 'Emzor' : '',
    voucher: `V-${String(880 + index)}`,
    shelf: `S${1 + (index % 6)}`,
    status: index % 13 === 12 ? 'inactive' : 'active',
  };
});

export interface StockQuery {
  page: number;
  pageSize: number;
  sort: KitSort | null;
  search: string;
  drugType: string | null;
  drugForm: string | null;
  dosageForm: string | null;
  vendor: string | null;
}

export const designControls = { failNext: false, empty: false, delay: 250 };

export async function loadStock(query: StockQuery): Promise<{ rows: StockItem[]; total: number }> {
  await new Promise((resolve) => setTimeout(resolve, designControls.delay));
  if (designControls.failNext) {
    designControls.failNext = false;
    throw new Error('The stock list could not be loaded. Check the connection and try again.');
  }
  if (designControls.empty) return { rows: [], total: 0 };
  const term = query.search.trim().toLowerCase();
  let rows = stockItems.filter(
    (item) =>
      (!term ||
        item.name.toLowerCase().includes(term) ||
        item.productCode.toLowerCase().includes(term)) &&
      (!query.drugType || item.drugType === query.drugType) &&
      (!query.drugForm || item.drugForm === query.drugForm) &&
      (!query.dosageForm || item.dosageForm === query.dosageForm) &&
      (!query.vendor || item.vendor === query.vendor)
  );
  const sort = query.sort;
  if (sort) {
    rows = [...rows].sort((a, b) => {
      const left = a[sort.id];
      const right = b[sort.id];
      const order =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right));
      return sort.desc ? -order : order;
    });
  }
  const start = (query.page - 1) * query.pageSize;
  return { rows: rows.slice(start, start + query.pageSize), total: rows.length };
}

export function historyFor(item: StockItem): HistoryEntry[] {
  return Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    history: ['Supplied', 'Dispensed', 'Returned', 'Transferred'][index % 4] ?? 'Supplied',
    quantity: 10 + index * 5,
    quantityRemaining: Math.max(item.quantityRemaining - index * 5, 0),
    currentQuantity: item.quantityRemaining,
    inventory: ['Main pharmacy', 'Ward store', 'Emergency'][index % 3] ?? '',
    price: item.sellingPrice,
    status: index % 4 === 2 ? 'Returned' : 'Completed',
    receiver: ['A. Okafor', 'B. Adeyemi', 'C. Bello'][index % 3] ?? '',
    actionBy: ['Pharm. Yusuf', 'Pharm. Eze'][index % 2] ?? '',
    date: `2026-11-${pad(12 - index)} 0${(index % 8) + 1}:15`,
  }));
}

interface DrugSeed {
  name: string;
  form: string;
  strength: string;
  prescribed: number;
  dispensed: number;
  frequency: string;
  price: number;
  payment?: PaymentStatus;
  kind?: 'drug' | 'item';
}

function drug(id: number, seed: DrugSeed, covered: boolean): PrescribedDrug {
  const total = seed.price * seed.prescribed;
  const patientShare = covered ? Math.round(total * 0.1) : total;
  return {
    id,
    kind: seed.kind ?? 'drug',
    drugName: seed.name,
    dosageForm: seed.form,
    strength: seed.strength,
    quantityPrescribed: seed.prescribed,
    quantityDispensed: seed.dispensed,
    quantityReturned: 0,
    frequency: seed.frequency,
    route: seed.form === 'Injection' || seed.form === 'Infusion' ? 'Intravenous' : 'Oral',
    duration: 5,
    durationUnit: 'days',
    drugType: covered ? 'NHIS' : 'Cash',
    prescribedBy: 'Dr. Ibrahim Musa',
    payment: seed.payment ?? 'Paid',
    unitPrice: seed.price,
    patientShare,
    payerShare: total - patientShare,
    dispenser: seed.dispensed > 0 ? 'Pharm. Amina Yusuf' : null,
    dateDispensed: seed.dispensed > 0 ? '13 Nov 2026, 9:12am' : null,
  };
}

const nhis = { name: 'NHIS', hmo: 'Hygeia HMO' };

export const prescriptions: Prescription[] = [
  {
    id: 101,
    patient: 'Adaeze Nwosu',
    hospitalNumber: 'HN-004812',
    age: 34,
    gender: 'Female',
    phone: '0803 412 7781',
    insurance: nhis,
    source: 'Consultation',
    prescribedAt: '08:42',
    prescribedOn: '13 Nov 2026',
    day: 'Today',
    drugs: [
      drug(
        1,
        {
          name: 'Amoxicillin',
          form: 'Capsule',
          strength: '500mg',
          prescribed: 15,
          dispensed: 0,
          frequency: 'Three times daily',
          price: 45,
        },
        true
      ),
      drug(
        2,
        {
          name: 'Paracetamol',
          form: 'Tablet',
          strength: '500mg',
          prescribed: 18,
          dispensed: 0,
          frequency: 'Three times daily',
          price: 12,
        },
        true
      ),
      drug(
        3,
        {
          name: 'Sterile gauze',
          form: 'Pack',
          strength: '10cm',
          prescribed: 2,
          dispensed: 0,
          frequency: 'As needed',
          price: 350,
          kind: 'item',
        },
        true
      ),
    ],
  },
  {
    id: 102,
    patient: 'Tunde Bakare',
    hospitalNumber: 'HN-002291',
    age: 58,
    gender: 'Male',
    phone: '0812 900 3341',
    insurance: null,
    source: 'Consultation',
    prescribedAt: '09:05',
    prescribedOn: '13 Nov 2026',
    day: 'Today',
    drugs: [
      drug(
        4,
        {
          name: 'Artemether/Lumefantrine',
          form: 'Tablet',
          strength: '80/480mg',
          prescribed: 6,
          dispensed: 3,
          frequency: 'Twice daily',
          price: 210,
        },
        false
      ),
      drug(
        5,
        {
          name: 'Folic acid',
          form: 'Tablet',
          strength: '5mg',
          prescribed: 30,
          dispensed: 0,
          frequency: 'Once daily',
          price: 8,
          payment: 'Pending',
        },
        false
      ),
    ],
  },
  {
    id: 103,
    patient: 'Halima Garba',
    hospitalNumber: 'HN-007730',
    age: 27,
    gender: 'Female',
    phone: '0706 218 4402',
    insurance: nhis,
    source: 'Antenatal',
    prescribedAt: '09:31',
    prescribedOn: '13 Nov 2026',
    day: 'Today',
    drugs: [
      drug(
        6,
        {
          name: 'Ferrous sulphate',
          form: 'Tablet',
          strength: '200mg',
          prescribed: 30,
          dispensed: 30,
          frequency: 'Once daily',
          price: 6,
        },
        true
      ),
    ],
  },
  {
    id: 104,
    patient: 'Chinedu Obi',
    hospitalNumber: 'HN-001156',
    age: 61,
    gender: 'Male',
    phone: '0809 555 0193',
    insurance: null,
    source: 'Theater',
    prescribedAt: '10:12',
    prescribedOn: '13 Nov 2026',
    day: 'Today',
    drugs: [
      drug(
        7,
        {
          name: 'Ceftriaxone',
          form: 'Injection',
          strength: '1g',
          prescribed: 5,
          dispensed: 0,
          frequency: 'Once daily',
          price: 1200,
          payment: 'Pending',
        },
        false
      ),
      drug(
        8,
        {
          name: 'Normal saline',
          form: 'Infusion',
          strength: '0.9%',
          prescribed: 4,
          dispensed: 0,
          frequency: 'Twice daily',
          price: 900,
          payment: 'Pending',
        },
        false
      ),
    ],
  },
  {
    id: 95,
    patient: 'Grace Etim',
    hospitalNumber: 'HN-003318',
    age: 45,
    gender: 'Female',
    phone: '0703 664 2210',
    insurance: { name: 'Leadway Health', hmo: null },
    source: 'Immunization',
    prescribedAt: '11 Nov, 16:20',
    prescribedOn: '11 Nov 2026',
    day: 'Backlog',
    drugs: [
      drug(
        9,
        {
          name: 'Omeprazole',
          form: 'Capsule',
          strength: '20mg',
          prescribed: 14,
          dispensed: 7,
          frequency: 'Once daily',
          price: 60,
        },
        true
      ),
    ],
  },
];

const firstNames = [
  'Bisi',
  'Emeka',
  'Fatima',
  'Yemi',
  'Ngozi',
  'Sani',
  'Kemi',
  'Obinna',
  'Zainab',
  'Femi',
  'Aisha',
  'Uche',
];
const lastNames = [
  'Adeyemi',
  'Okeke',
  'Bello',
  'Lawal',
  'Eze',
  'Danjuma',
  'Ojo',
  'Nnamdi',
  'Abubakar',
  'Afolabi',
];
const sources: Prescription['source'][] = [
  'Consultation',
  'Consultation',
  'Antenatal',
  'Theater',
  'Immunization',
];
const drugSeeds: DrugSeed[] = [
  {
    name: 'Amoxicillin',
    form: 'Capsule',
    strength: '500mg',
    prescribed: 15,
    dispensed: 0,
    frequency: 'Three times daily',
    price: 45,
  },
  {
    name: 'Paracetamol',
    form: 'Tablet',
    strength: '500mg',
    prescribed: 18,
    dispensed: 0,
    frequency: 'Three times daily',
    price: 12,
  },
  {
    name: 'Metformin',
    form: 'Tablet',
    strength: '500mg',
    prescribed: 60,
    dispensed: 0,
    frequency: 'Twice daily',
    price: 15,
  },
  {
    name: 'Ceftriaxone',
    form: 'Injection',
    strength: '1g',
    prescribed: 5,
    dispensed: 0,
    frequency: 'Once daily',
    price: 1200,
  },
];

for (let index = 0; index < 58; index += 1) {
  const covered = index % 3 !== 1;
  const progress = index % 4;
  const lines = [0, 1, 2].slice(0, 1 + (index % 3)).map((offset) => {
    const base = drugSeeds[(index + offset) % drugSeeds.length] ?? drugSeeds[0]!;
    const dispensed =
      progress === 3
        ? base.prescribed
        : progress === 2 && offset === 0
          ? Math.floor(base.prescribed / 2)
          : 0;
    return drug(
      200 + index * 3 + offset,
      { ...base, dispensed, payment: index % 7 === 3 ? 'Pending' : 'Paid' },
      covered
    );
  });
  const hour = 8 + Math.floor(index / 6);
  prescriptions.push({
    id: 200 + index,
    patient: `${firstNames[index % firstNames.length]} ${lastNames[(index * 7) % lastNames.length]}`,
    hospitalNumber: `HN-${String(10000 + index * 37).padStart(6, '0')}`,
    age: 18 + ((index * 13) % 60),
    gender: index % 2 ? 'Male' : 'Female',
    phone: `080${String(30000000 + index * 104729).slice(0, 8)}`,
    insurance: covered ? nhis : null,
    source: sources[index % sources.length] ?? 'Consultation',
    prescribedAt: `${String(hour).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}`,
    prescribedOn: '13 Nov 2026',
    day: 'Today',
    drugs: lines,
  });
}

export interface PrescriptionQuery {
  page: number;
  pageSize: number;
  day: string;
  search: string;
  status: string | null;
  source: string | null;
}

export function filterPrescriptions(
  query: Omit<PrescriptionQuery, 'page' | 'pageSize'>
): Prescription[] {
  const term = query.search.trim().toLowerCase();
  return prescriptions.filter(
    (item) =>
      item.day === query.day &&
      (!term ||
        item.patient.toLowerCase().includes(term) ||
        item.hospitalNumber.toLowerCase().includes(term)) &&
      (!query.status || statusOf(item) === query.status) &&
      (!query.source || item.source === query.source)
  );
}

export async function loadPrescriptions(
  query: PrescriptionQuery
): Promise<{ rows: Prescription[]; total: number }> {
  await new Promise((resolve) => setTimeout(resolve, designControls.delay));
  const rows = filterPrescriptions(query);
  const start = (query.page - 1) * query.pageSize;
  return { rows: rows.slice(start, start + query.pageSize), total: rows.length };
}

export type PrescriptionStatus = 'Pending' | 'Partial' | 'Complete';

export function statusOf(prescription: Prescription): PrescriptionStatus {
  const dispensed = prescription.drugs.reduce((sum, item) => sum + item.quantityDispensed, 0);
  const prescribed = prescription.drugs.reduce((sum, item) => sum + item.quantityPrescribed, 0);
  if (dispensed === 0) return 'Pending';
  return dispensed >= prescribed ? 'Complete' : 'Partial';
}

export const money = (value: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value);

export const navigation = [
  { label: 'Home', icon: 'home' },
  { label: 'Pharmacy', icon: 'pill' },
  { label: 'Stock', icon: 'box' },
  { label: 'Reports', icon: 'chart' },
] as const;
