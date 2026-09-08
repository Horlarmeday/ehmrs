import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { generators, hashHex, type PseudonymKind } from './kinds.js';

interface MapFile {
  version: 1;
  /** `${kind}\u0000${real}` → fake */
  entries: Record<string, string>;
}

/**
 * Stable pseudonym store. The map file is itself PHI: it must live outside
 * the repository (default `~/.ehmrs/scrubber-map.json`).
 */
export class PseudonymStore {
  private readonly mapPath: string;
  private readonly entries: Record<string, string> = {};
  private readonly fakeToKey = new Map<string, string>();
  private readonly realToFake = new Map<string, string>();
  private sortedReals: string[] | null = null;
  private dirty = false;

  constructor(mapPath: string) {
    this.mapPath = mapPath;
    if (existsSync(mapPath)) {
      const raw = JSON.parse(readFileSync(mapPath, 'utf8')) as Partial<MapFile>;
      if (raw.version === 1 && raw.entries && typeof raw.entries === 'object') {
        for (const [k, v] of Object.entries(raw.entries)) {
          if (typeof v === 'string') {
            this.entries[k] = v;
            this.fakeToKey.set(v, k);
            const real = k.split('\u0000')[1];
            if (real !== undefined) this.realToFake.set(real, v);
          }
        }
      }
    }
  }

  /** Returns true when the value is already a generated pseudonym. */
  isPseudonym(value: string): boolean {
    return this.fakeToKey.has(value);
  }

  /** Same real value + kind → same fake value, every run. */
  pseudonym(kind: PseudonymKind, real: string): string {
    const key = `${kind}\u0000${real}`;
    const existing = this.entries[key];
    if (existing !== undefined) return existing;
    const seed = hashHex(key);
    let fake = generators[kind](real, seed);
    // Guard against a fake colliding with a different key's fake.
    while (this.fakeToKey.has(fake) && this.fakeToKey.get(fake) !== key) {
      fake = generators[kind](real, seed + fake);
    }
    this.entries[key] = fake;
    this.fakeToKey.set(fake, key);
    this.realToFake.set(real, fake);
    this.sortedReals = null;
    this.dirty = true;
    return fake;
  }

  /**
   * Replace occurrences of any already-mapped real value inside free text
   * with its stable pseudonym (longest first to avoid partial overlaps).
   */
  substituteKnown(text: string): string {
    if (this.realToFake.size === 0) return text;
    if (this.sortedReals === null) {
      this.sortedReals = [...this.realToFake.keys()].sort((a, b) => b.length - a.length);
    }
    let out = text;
    for (const real of this.sortedReals) {
      if (real.length === 0) continue;
      if (out.includes(real)) {
        out = out.split(real).join(this.realToFake.get(real)!);
      }
    }
    return out;
  }

  /** Persist the map so future runs produce identical pseudonyms. */
  save(): void {
    if (!this.dirty) return;
    mkdirSync(dirname(this.mapPath), { recursive: true });
    const file: MapFile = { version: 1, entries: this.entries };
    writeFileSync(this.mapPath, JSON.stringify(file, null, 2), 'utf8');
    this.dirty = false;
  }

  get mapFilePath(): string {
    return this.mapPath;
  }

  get size(): number {
    return Object.keys(this.entries).length;
  }
}

export function defaultMapPath(): string {
  return join(process.env.HOME ?? '.', '.ehmrs', 'scrubber-map.json');
}
