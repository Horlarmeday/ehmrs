import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PseudonymStore } from '../src/pseudonym.js';
import { scrubJson } from '../src/scrub.js';
import { scrubDirectory } from '../src/cli-support.js';

let dir: string;
let store: PseudonymStore;

const patient = {
  patientId: 900123,
  firstName: 'Adaeze',
  lastName: 'Nnamdi',
  phone: '08031234567',
  nin: '12345678901',
  email: 'adaeze@example.com.ng',
  dateOfBirth: '1984-07-14',
  address: '12 Herbert Macaulay Way',
  notes: 'Call guardian on 08037654321 before discharge',
  visits: [
    {
      visitId: 55,
      diagnosis: { code: 'J06.9', text: 'Acute upper respiratory infection' },
      labs: [{ resultId: 771, comment: 'Patient Adaeze Nnamdi notified by email adaeze@example.com.ng' }],
      prescriptions: [{ drug: 'Amoxicillin', dose: '500mg' }],
    },
  ],
};

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'phi-scrub-'));
  store = new PseudonymStore(join(dir, 'map.json'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('structural scrubbing', () => {
  it('removes known real values from nested clinical JSON', () => {
    const out = scrubJson(patient, store) as typeof patient;
    const serialized = JSON.stringify(out);
    for (const real of [
      'Adaeze', 'Nnamdi', '08031234567', '12345678901',
      'adaeze@example.com.ng', '1984-07-14', 'Herbert Macaulay',
    ]) {
      expect(serialized).not.toContain(real);
    }
    // Non-PHI clinical content survives.
    expect(out.visits?.[0]?.diagnosis?.code).toBe('J06.9');
    expect(out.visits?.[0]?.prescriptions?.[0]?.drug).toBe('Amoxicillin');
  });

  it('preserves relational integrity across documents', () => {
    const visit = { patientId: 900123, patientName: 'Adaeze Nnamdi' };
    const outA = scrubJson(patient, store) as typeof patient;
    const outB = scrubJson(visit, store) as typeof visit;
    expect(outB.patientId).toBe(outA.patientId);
    // Name mapping is consistent: full name and parts come from the same kind.
    const nameOut = scrubJson({ fullName: 'Adaeze Nnamdi' }, store) as { fullName: string };
    expect(store.isPseudonym(nameOut.fullName)).toBe(true);
  });

  it('scrubs embedded PHI inside free-text strings', () => {
    const out = scrubJson(patient, store) as typeof patient;
    expect(out.notes).not.toContain('08037654321');
    const lab = out.visits?.[0]?.labs?.[0]?.comment ?? '';
    expect(lab).not.toContain('adaeze@example.com.ng');
  });

  it('is idempotent — scrubbing scrubbed output changes nothing', () => {
    const once = JSON.parse(JSON.stringify(scrubJson(patient, store)));
    const twice = JSON.parse(JSON.stringify(scrubJson(once, store)));
    expect(twice).toEqual(once);
  });

  it('handles HAR entries including embedded JSON bodies', () => {
    const har = {
      log: {
        entries: [
          {
            request: {
              url: 'http://localhost:4050/api/patients/900123',
              postData: { text: JSON.stringify({ firstName: 'Adaeze', phone: '08031234567' }) },
            },
            response: {
              content: { text: JSON.stringify({ data: { patientName: 'Adaeze Nnamdi', dateOfBirth: '1984-07-14' } }) },
            },
          },
        ],
      },
    };
    const out = JSON.stringify(scrubJson(har, store));
    expect(out).not.toContain('Adaeze');
    expect(out).not.toContain('08031234567');
    expect(out).not.toContain('1984-07-14');
  });
});

describe('scrubDirectory (fixture pipeline)', () => {
  it('writes scrubbed fixtures and deletes raw captures after success', () => {
    const rawDir = join(dir, 'raw');
    rmSync(rawDir, { recursive: true, force: true });
    mkdirSync(rawDir);
    writeFileSync(join(rawDir, 'capture.har'), JSON.stringify(patient));

    const outDir = join(dir, 'fixtures');
    const result = scrubDirectory({
      rawDir, outDir, mapPath: join(dir, 'map.json'),
    });
    expect(result.files).toHaveLength(1);
    const fixture = readFileSync(result.files[0]!.output, 'utf8');
    expect(fixture).not.toContain('Adaeze');
    expect(existsSync(join(rawDir, 'capture.har'))).toBe(false);
  });

  it('keeps raw files and fails loudly when a known real value survives', () => {
    const rawDir = join(dir, 'raw2');
    mkdirSync(rawDir);
    // "diagnosis.text" is legitimate clinical text — using it as a fake leak:
    // embed an unrecognized PHI-looking value in a non-PHI field pattern to
    // prove self-check catches leaks.
    writeFileSync(
      join(rawDir, 'c.json'),
      JSON.stringify({ allergies: 'Penicillin — emergency contact Adaeze Nnamdi' }),
    );
    expect(() =>
      scrubDirectory({
        rawDir,
        outDir: join(dir, 'fixtures2'),
        mapPath: join(dir, 'map.json'),
        knownRealValues: ['Penicillin'],
      }),
    ).toThrow(/Self-check FAILED/);
  });
});
