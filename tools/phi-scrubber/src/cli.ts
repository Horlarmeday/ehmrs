#!/usr/bin/env node
import { parseArgs } from 'util';
import { DEFAULT_RAW_DIR, scrubDirectory } from './cli-support.js';
import { defaultMapPath } from './pseudonym.js';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string', short: 'o', default: './scrubbed-fixtures' },
    map: { type: 'string', short: 'm' },
    'keep-raw': { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (values.help) {
  console.log(`Usage: phi-scrub [rawDir] --out <fixturesDir> [--map <mapFile>] [--keep-raw]

rawDir   directory of .har/.json captures (default: ~/.ehmrs/raw-captures,
         must be OUTSIDE the repo; deleted after successful scrubbing unless --keep-raw)
--out    output directory for scrubbed fixtures (default: ./scrubbed-fixtures)
--map    pseudonym map path (default: ~/.ehmrs/scrubber-map.json, outside repo;
         the map is itself PHI and must never be committed)
--keep-raw  keep raw captures after scrubbing (dev only)`);
  process.exit(0);
}

try {
  const result = scrubDirectory({
    rawDir: positionals[0] ?? DEFAULT_RAW_DIR,
    outDir: values.out!,
    mapPath: values.map ?? defaultMapPath(),
    keepRaw: values['keep-raw'],
  });
  for (const f of result.files) {
    console.log(`${f.input} -> ${f.output}`);
  }
  console.log(`Done. ${result.files.length} fixture(s), ${result.pseudonyms} stable pseudonym(s).`);
} catch (err) {
  console.error(`phi-scrub: ${(err as Error).message}`);
  process.exit(1);
}
