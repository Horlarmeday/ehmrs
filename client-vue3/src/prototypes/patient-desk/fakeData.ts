export interface FakePatient extends Record<string, unknown> {
  id: number;
  hospitalNumber: string;
  name: string;
  firstname: string;
  lastname: string;
  phone: string;
  gender: string;
  age: string;
  account: string;
  insurance: string;
  registered: string;
  registeredIso: string;
  status: 'active' | 'inactive';
  registeredBy: string;
}

const FIRST = ['Testa', 'Demo', 'Sample', 'Mock', 'Placeholder', 'Example'];
const LAST = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf'];
const INSURANCE = ['Cash', 'Cash', 'NHIS', 'HMO'];

export const patients: FakePatient[] = Array.from({ length: 34 }, (_, index) => {
  const firstname = FIRST[index % FIRST.length] ?? 'Testa';
  const lastname = LAST[index % LAST.length] ?? 'Alpha';
  const day = String((index % 28) + 1).padStart(2, '0');
  return {
    id: index + 1,
    hospitalNumber: `DEMO/${String(1000 + index)}`,
    name: `${firstname} ${lastname}`,
    firstname,
    lastname,
    phone: `0803000${String(1000 + index)}`,
    gender: index % 2 ? 'Female' : 'Male',
    age: `${18 + ((index * 3) % 60)} yrs`,
    account: index % 5 === 4 ? 'Dependant' : 'Patient',
    insurance: INSURANCE[index % INSURANCE.length] ?? 'Cash',
    registered: `${day} Oct 2026`,
    registeredIso: `2026-10-${day}`,
    status: index % 11 === 10 ? 'inactive' : 'active',
    registeredBy: 'Demo Records Officer',
  };
});

export interface PatientQuery {
  page: number;
  pageSize: number;
  term: string;
  from: string | null;
  to: string | null;
}

export async function searchPatients({ page, pageSize, term, from, to }: PatientQuery) {
  const needle = term.trim().toLowerCase();
  const matches = patients.filter((patient) => {
    const inTerm =
      !needle ||
      patient.name.toLowerCase().includes(needle) ||
      patient.phone.includes(needle) ||
      patient.hospitalNumber.toLowerCase().endsWith(needle);
    const inRange =
      (!from || patient.registeredIso >= from) && (!to || patient.registeredIso <= to);
    return inTerm && inRange;
  });
  const start = (page - 1) * pageSize;
  await new Promise((resolve) => setTimeout(resolve, 120));
  return { rows: matches.slice(start, start + pageSize), total: matches.length };
}

export const findByPhone = (phone: string): FakePatient | undefined =>
  patients.find((patient) => patient.phone === phone);

export function addPatient(data: {
  firstname: string;
  lastname: string;
  phone: string;
  gender: string;
  walkIn: boolean;
}): FakePatient {
  const patient: FakePatient = {
    id: patients.length + 1,
    hospitalNumber: `DEMO/${String(1000 + patients.length)}`,
    name: `${data.firstname} ${data.lastname}`,
    firstname: data.firstname,
    lastname: data.lastname,
    phone: data.phone,
    gender: data.gender,
    age: 'New',
    account: data.walkIn ? 'Walk-in' : 'Patient',
    insurance: 'Cash',
    registered: 'Today',
    registeredIso: '2026-11-01',
    status: 'active',
    registeredBy: 'Demo Records Officer',
  };
  patients.unshift(patient);
  return patient;
}

export const registrationFees = [
  { value: 'adult', label: 'Adult registration' },
  { value: 'child', label: 'Child registration' },
];

export const statesAndLgas: Record<string, string[]> = {
  Lagos: ['Ikeja', 'Surulere', 'Eti-Osa'],
  Oyo: ['Ibadan North', 'Ibadan South-West', 'Ogbomosho North'],
  Kwara: ['Ilorin East', 'Ilorin West', 'Offa'],
};

export const options = (values: string[]) => values.map((value) => ({ value, label: value }));
export const localSearch =
  (values: string[]) =>
  async (term: string): Promise<{ value: string; label: string }[]> =>
    options(values.filter((value) => value.toLowerCase().includes(term.toLowerCase())));
