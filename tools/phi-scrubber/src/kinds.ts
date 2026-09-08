import { createHash } from 'crypto';

export type PseudonymKind =
  | 'personName'
  | 'phone'
  | 'nationalId'
  | 'email'
  | 'mrn'
  | 'address'
  | 'dob'
  | 'token'
  | 'password'
  | 'username';

export function hashHex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

function pick<T>(pool: readonly T[], seed: string): T {
  const h = parseInt(hashHex(seed).slice(0, 8), 16);
  return pool[h % pool.length] as T;
}

const FIRST_NAMES = [
  'Ada', 'Bisi', 'Chidi', 'Dara', 'Emeka', 'Fola', 'Garba', 'Halima',
  'Ifeoma', 'Jide', 'Kemi', 'Lanre', 'Musa', 'Ngozi', 'Obi', 'Peju',
  'Quincy', 'Rukayat', 'Sani', 'Tola', 'Uche', 'Victor', 'Wale', 'Yemi',
  'Zainab', 'Amara', 'Bukola', 'Chinwe', 'Danladi', 'Efe',
] as const;

const LAST_NAMES = [
  'Adeyemi', 'Bello', 'Chukwu', 'Danjuma', 'Eze', 'Fashola', 'Garuba',
  'Hassan', 'Ibrahim', 'Johnson', 'Kalu', 'Lawal', 'Mohammed', 'Nwosu',
  'Okonkwo', 'Oyelaran', 'Peters', 'Quadri', 'Rabiu', 'Suleiman',
  'Tijani', 'Uzoma', 'Volkano', 'Wabara', 'Yakubu', 'Zabadi',
] as const;

const STREETS = [
  'Close', 'Avenue', 'Road', 'Street', 'Way', 'Lane', 'Crescent',
] as const;

const CITIES = [
  'Testville', 'Springfield', 'Riverton', 'Lakeview', 'Hillcrest',
  'Fairview', 'Milton', 'Greenville', 'Ashford', 'Brookside',
] as const;

function hexSuffix(seed: string, len: number): string {
  return hashHex(seed).slice(0, len).toUpperCase();
}

function numSuffix(seed: string, len: number): string {
  const h = parseInt(hashHex(seed).slice(0, 12), 16);
  return String(h % 10 ** len).padStart(len, '0');
}

/** Fake value generators. Deterministic per (kind, real) pair. */
export const generators: Record<PseudonymKind, (real: string, seed: string) => string> = {
  personName: (_real, seed) =>
    `${pick(FIRST_NAMES, seed + ':first')} ${pick(LAST_NAMES, seed + ':last')}`,
  phone: (_real, seed) => `+1 555-01${numSuffix(seed, 4)}`,
  nationalId: (_real, seed) => `FAKE${numSuffix(seed, 8)}`,
  email: (real, seed) => {
    const local = real
      .split('@')[0]!
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') || 'user';
    return `${local.slice(0, 4)}.${hexSuffix(seed, 6).toLowerCase()}@example.org`;
  },
  mrn: (_real, seed) => `MRN${numSuffix(seed, 8)}`,
  address: (_real, seed) =>
    `${numSuffix(seed, 3)} ${pick(FIRST_NAMES, seed + ':st')} ${pick(STREETS, seed + ':st2')}, ${pick(CITIES, seed + ':city')}`,
  dob: (real, seed) => shiftDate(real, seed),
  // Opaque credential-safe fakes: shape deliberately unlike the real thing so
  // generated fakes never re-match the embedded patterns (idempotence).
  token: (_real, seed) => `FAKETOKEN.${hexSuffix(seed, 40)}`,
  password: (_real, seed) => `FakePass_${numSuffix(seed, 8)}`,
  username: (_real, seed) => `staff.${hexSuffix(seed, 8).toLowerCase()}`,
};

/** Shift a date by a stable per-value offset (1..3650 days). */
export function shiftDate(real: string, seed: string): string {
  const parsed = new Date(real);
  if (Number.isNaN(parsed.getTime())) return `1970-01-0${(parseInt(hashHex(seed).slice(0, 2), 16) % 9) + 1}`;
  const h = parseInt(hashHex(seed).slice(0, 8), 16);
  const span = 3650; // ~10 years
  const offset = (h % span) + 1;
  const shifted = new Date(parsed.getTime() - offset * 86_400_000);
  const iso = shifted.toISOString().slice(0, 10);
  // Preserve original granularity: date-only stays date-only.
  if (/^\d{4}-\d{2}-\d{2}$/.test(real.trim())) return iso;
  return `${iso}T00:00:00.000Z`;
}

/** Field-name → kind mapping (case/underscore-insensitive). */
const FIELD_RULES: ReadonlyArray<{ re: RegExp; kind: PseudonymKind }> = [
  { re: /(first|last|middle|maiden|other|given|sur|family)[_.]?name|^name$|full[_.]?name|patient[_.]?name|display[_.]?name/i, kind: 'personName' },
  { re: /phone|mobile|msisdn|tel(ephone)?$/i, kind: 'phone' },
  { re: /\bnin\b|national[_.]?(id|number)|\bbvn\b|\bssn\b/i, kind: 'nationalId' },
  { re: /e-?mail/i, kind: 'email' },
  { re: /(^|[^a-z])(mrn|hospital[_.]?number|medical[_.]?record|patient[_.]?(id|no|number)|visit[_.]?(id|no)|encounter[_.]?(id|no))/i, kind: 'mrn' },
  { re: /address|street|lga/i, kind: 'address' },
  { re: /dob|date[_.]?of[_.]?birth|birth[_.]?date|birthday/i, kind: 'dob' },
  { re: /password|passphrase|\bsecret\b|\bpin\b/i, kind: 'password' },
  { re: /token|authorization|\bjwt\b|bearer|api[_.]?key/i, kind: 'token' },
  { re: /user[_.]?name|^login$|^staff_id$|staff[_.]?username/i, kind: 'username' },
];

export function kindForField(field: string): PseudonymKind | undefined {
  return FIELD_RULES.find((r) => r.re.test(field))?.kind;
}

/** Embedded PHI patterns found inside free-text strings. */
export const EMBEDDED_PATTERNS: ReadonlyArray<{ re: RegExp; kind: PseudonymKind; name: string }> = [
  // JWTs first: they can contain '.'-separated segments that overlap other patterns.
  { re: /\beyJ[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]*\b/g, kind: 'token', name: 'jwt' },
  { re: /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, kind: 'email', name: 'email' },
  { re: /(?:\+234|0)\d{10}\b/g, kind: 'phone', name: 'ng-phone' },
];
