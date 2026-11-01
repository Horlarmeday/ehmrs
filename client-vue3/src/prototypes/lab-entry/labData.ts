import { differentialRows, rows, type FbcRow } from '../../components/kit/__harness__/fbcRows';

export type TestStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Approved';
export type ResultForm = 'fbc' | 'widal' | 'text';

export interface LabTest {
  id: number;
  labNumber: string;
  name: string;
  sample: string;
  form: ResultForm;
  payment: 'Paid' | 'Cleared' | 'Pending';
  urgent: boolean;
  status: TestStatus;
  values: Record<string, string>;
  referred: boolean;
  referralReason: string;
  institute: string;
  abnormal: boolean;
  comments: string;
}

export const patient = {
  name: 'Testa Alpha',
  hospitalNumber: 'DEMO/1000',
  gender: 'Female',
  age: '54 yrs',
  insurance: 'NHIS',
};

export const fbcFields: FbcRow[] = [...rows, ...differentialRows];

export const widalFields = [
  { label: 'Salmonella Typhi', o: 'typhi_o', h: 'typhi_h' },
  { label: 'S. Paratyphi A.', o: 'a_o', h: 'a_h' },
  { label: 'S. Paratyphi B.', o: 'b_o', h: 'b_h' },
  { label: 'S. Paratyphi C.', o: 'c_o', h: 'c_h' },
];

const base = {
  referred: false,
  referralReason: '',
  institute: '',
  abnormal: false,
  comments: '',
};

export const initialTests = (): LabTest[] => [
  {
    ...base,
    id: 1,
    labNumber: 'LAB-2041-1',
    name: 'Full blood count',
    sample: 'Whole blood',
    form: 'fbc',
    payment: 'Paid',
    urgent: true,
    status: 'Pending',
    values: {},
  },
  {
    ...base,
    id: 2,
    labNumber: 'LAB-2041-2',
    name: 'Widal reaction',
    sample: 'Serum',
    form: 'widal',
    payment: 'Cleared',
    urgent: false,
    status: 'Pending',
    values: {},
  },
  {
    ...base,
    id: 3,
    labNumber: 'LAB-2041-3',
    name: 'Malaria parasite',
    sample: 'Whole blood',
    form: 'text',
    payment: 'Paid',
    urgent: false,
    status: 'Rejected',
    values: { result: 'Scanty' },
    comments: 'Repeat the film',
  },
  {
    ...base,
    id: 4,
    labNumber: 'LAB-2041-4',
    name: 'Stool microscopy',
    sample: 'Stool',
    form: 'text',
    payment: 'Pending',
    urgent: false,
    status: 'Pending',
    values: {},
  },
  {
    ...base,
    id: 5,
    labNumber: 'LAB-2041-5',
    name: 'Pregnancy test',
    sample: 'Urine',
    form: 'text',
    payment: 'Paid',
    urgent: false,
    status: 'Approved',
    values: { result: 'Negative' },
  },
];

export const testers = [
  { value: 'lab-1', label: 'Demo Lab Scientist' },
  { value: 'lab-2', label: 'Sample Lab Technician' },
];

export function rangeFlag(value: string, range: string | undefined): 'High' | 'Low' | null {
  const number = Number(value);
  const bounds = range?.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (!value || Number.isNaN(number) || !bounds) return null;
  if (number < Number(bounds[1])) return 'Low';
  return number > Number(bounds[2]) ? 'High' : null;
}

export const hasResult = (test: LabTest): boolean => Object.values(test.values).some(Boolean);
export const isLocked = (test: LabTest): boolean =>
  test.payment === 'Pending' || test.status === 'Approved';
