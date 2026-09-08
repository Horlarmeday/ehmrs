import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { PseudonymStore, defaultMapPath, scrubJson, verifyNoRealValues, assertOutsideRepo } from '@ehmrs/phi-scrubber';
import type { RecordedExchange } from './proxy.js';

export interface Scenario {
  name: string;
  request: { method: string; url: string; body?: unknown };
  response: { status: number; body?: unknown };
}

export interface ReplayCorpus {
  version: 1;
  flow: string;
  capturedAt: string;
  scenarios: Scenario[];
}

export interface BuildCorpusOptions {
  /** Directory (outside the repo) holding <session>.jsonl raw captures. */
  rawDir: string;
  session: string;
  /** Flow name for the produced corpus, e.g. "auth". */
  flow: string;
  /** In-repo output file, e.g. client-vue3/src/contract/fixtures/auth.json */
  outFile: string;
  mapPath?: string;
  /** Known real values that must not survive scrubbing (self-check). */
  knownRealValues?: readonly string[];
  keepRaw?: boolean;
}

/**
 * Raw capture → scrubbed replay corpus. The scrubber (ADR-0005) runs on every
 * value before anything is written into the repo; raw files are deleted only
 * after the corpus is written and the self-check passed.
 */
export function buildCorpus(opts: BuildCorpusOptions): { corpus: ReplayCorpus; scenarios: number } {
  assertOutsideRepo(opts.rawDir, 'Raw capture');
  const mapPath = opts.mapPath ?? defaultMapPath();
  assertOutsideRepo(mapPath, 'Pseudonym map');

  const rawFile = join(opts.rawDir, `${opts.session}.jsonl`);
  if (!existsSync(rawFile)) {
    throw new Error(`Raw capture not found: ${rawFile} (run capture-proxy first)`);
  }

  const store = new PseudonymStore(mapPath);
  const lines = readFileSync(rawFile, 'utf8')
    .split('\n')
    .filter((l) => l.trim().length > 0);
  const exchanges = lines.map((l) => JSON.parse(l) as RecordedExchange);
  if (exchanges.length === 0) throw new Error(`Raw capture is empty: ${rawFile}`);

  const counters = new Map<string, number>();
  const scenarios: Scenario[] = exchanges.map((e) => {
    const scrubbed = scrubJson(
      {
        request: { method: e.method, url: e.url, body: e.requestBody },
        response: { status: e.status, body: e.responseBody },
      },
      store,
    ) as { request: Scenario['request']; response: Scenario['response'] };
    const base = `${e.method} ${e.url} -> ${e.status}`;
    const n = (counters.get(base) ?? 0) + 1;
    counters.set(base, n);
    return {
      name: n === 1 ? base : `${base} #${n}`,
      request: scrubbed.request,
      response: scrubbed.response,
    };
  });

  const corpus: ReplayCorpus = {
    version: 1,
    flow: opts.flow,
    capturedAt: new Date().toISOString(),
    scenarios,
  };

  if (opts.knownRealValues?.length) {
    const leaked = verifyNoRealValues(corpus, opts.knownRealValues);
    if (leaked.length > 0) {
      throw new Error(`Self-check FAILED — real values survived scrubbing: ${[...new Set(leaked)].join(', ')}`);
    }
  }

  store.save();
  mkdirSync(join(opts.outFile, '..'), { recursive: true });
  writeFileSync(opts.outFile, JSON.stringify(corpus, null, 2) + '\n', 'utf8');

  if (!opts.keepRaw) {
    rmSync(rawFile);
    const remaining = readdirSync(opts.rawDir).filter((f) => f.length > 0);
    if (remaining.length === 0) rmSync(opts.rawDir, { recursive: true, force: true });
  }

  return { corpus, scenarios: scenarios.length };
}
