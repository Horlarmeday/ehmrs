import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { isAbsolute, join, relative, resolve } from 'path';
import { PseudonymStore } from './pseudonym.js';
import { scrubJson, verifyNoRealValues } from './scrub.js';

export const DEFAULT_RAW_DIR = join(homedir(), '.ehmrs', 'raw-captures');

/** Walk up from cwd to find the git worktree root; null when outside a repo. */
export function findRepoRoot(start: string): string | null {
  let dir = resolve(start);
  for (;;) {
    if (existsSync(join(dir, '.git'))) return dir;
    const parent = resolve(dir, '..');
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Raw captures and the pseudonym map must never live inside the repo. */
export function assertOutsideRepo(path: string, label: string): void {
  const root = findRepoRoot(process.cwd());
  if (!root) return;
  const abs = resolve(path);
  const rel = relative(root, abs);
  if (rel !== '' && !rel.startsWith('..') && !isAbsolute(rel)) {
    throw new Error(
      `${label} path "${path}" resolves inside the repository (${root}). ` +
      'Raw captures and the pseudonym map must live outside the repo (ADR-0005).',
    );
  }
}

export interface ScrubDirOptions {
  rawDir: string;
  outDir: string;
  mapPath: string;
  keepRaw?: boolean;
  /** Known real values that must not survive (self-check mode). */
  knownRealValues?: readonly string[];
}

export interface ScrubDirResult {
  files: Array<{ input: string; output: string }>;
  pseudonyms: number;
  leaked: string[];
}

export function scrubDirectory(opts: ScrubDirOptions): ScrubDirResult {
  assertOutsideRepo(opts.rawDir, 'Raw capture');
  assertOutsideRepo(opts.mapPath, 'Pseudonym map');

  if (!existsSync(opts.rawDir)) {
    throw new Error(`Raw capture directory not found: ${opts.rawDir}`);
  }
  const store = new PseudonymStore(opts.mapPath);
  mkdirSync(opts.outDir, { recursive: true });

  const inputs = readdirSync(opts.rawDir).filter((f) => /\.(har|json)$/i.test(f));
  if (inputs.length === 0) {
    throw new Error(`No .har/.json captures found in ${opts.rawDir}`);
  }

  const files: ScrubDirResult['files'] = [];
  let leaked: string[] = [];
  for (const name of inputs) {
    const inputPath = join(opts.rawDir, name);
    const parsed = JSON.parse(readFileSync(inputPath, 'utf8')) as unknown;
    const scrubbed = scrubJson(parsed, store);
    if (opts.knownRealValues?.length) {
      leaked = leaked.concat(verifyNoRealValues(scrubbed, opts.knownRealValues));
    }
    const outputName = name.replace(/\.(har|json)$/i, '') + '.scrubbed.json';
    const outputPath = join(opts.outDir, outputName);
    writeFileSync(outputPath, JSON.stringify(scrubbed, null, 2), 'utf8');
    files.push({ input: inputPath, output: outputPath });
  }

  if (leaked.length > 0) {
    throw new Error(
      `Self-check FAILED — real PHI survived scrubbing: ${[...new Set(leaked)].join(', ')}`,
    );
  }

  store.save();

  // Raw captures are deleted only after every fixture was written and verified.
  if (!opts.keepRaw) {
    for (const { input } of files) rmSync(input);
  }

  return { files, pseudonyms: store.size, leaked };
}
