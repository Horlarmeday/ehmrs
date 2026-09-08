import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PseudonymStore } from '../src/pseudonym.js';
import { shiftDate } from '../src/kinds.js';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'phi-scrubber-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('PseudonymStore', () => {
  it('maps the same real value to the same fake value', () => {
    const store = new PseudonymStore(join(dir, 'map.json'));
    const a = store.pseudonym('personName', 'Real Patient');
    const b = store.pseudonym('personName', 'Real Patient');
    expect(a).toBe(b);
    expect(a).not.toContain('Real');
  });

  it('is stable across runs via the persisted map', () => {
    const path = join(dir, 'map.json');
    const first = new PseudonymStore(path);
    const fake = first.pseudonym('phone', '08031234567');
    first.save();

    const second = new PseudonymStore(path);
    expect(second.pseudonym('phone', '08031234567')).toBe(fake);
  });

  it('distinguishes kinds for the same real value', () => {
    const store = new PseudonymStore(join(dir, 'map.json'));
    const name = store.pseudonym('personName', 'X');
    const mrn = store.pseudonym('mrn', 'X');
    expect(name).not.toBe(mrn);
  });

  it('recognises its own pseudonyms (idempotence support)', () => {
    const store = new PseudonymStore(join(dir, 'map.json'));
    const fake = store.pseudonym('nationalId', '12345678901');
    expect(store.isPseudonym(fake)).toBe(true);
    expect(store.isPseudonym('12345678901')).toBe(false);
  });
});

describe('shiftDate', () => {
  it('shifts a date-only DOB deterministically', () => {
    const a = shiftDate('1984-07-14', 'seed-a');
    const b = shiftDate('1984-07-14', 'seed-a');
    const c = shiftDate('1984-07-14', 'seed-b');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(a).not.toBe('1984-07-14');
  });
});
