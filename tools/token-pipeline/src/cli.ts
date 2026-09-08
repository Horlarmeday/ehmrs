import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { buildOutputs } from './generate.js';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..');
const presetOut = join(repoRoot, 'client-vue3', 'src', 'design', 'ehmrs.preset.ts');
const tailwindOut = join(repoRoot, 'client-vue3', 'tailwind.tokens.ts');

const check = process.argv.includes('--check');
const outputs = buildOutputs();
const targets: Array<[string, string]> = [
  [presetOut, outputs.preset],
  [tailwindOut, outputs.tailwind],
];

if (check) {
  const drifted = targets.filter(([out, content]) => (existsSync(out) ? readFileSync(out, 'utf8') : null) !== content).map(([out]) => out);
  if (drifted.length > 0) {
    console.error(`token-pipeline --check FAILED — committed tokens drifted from DESIGN.md:\n${drifted.map((f) => `  ${f}`).join('\n')}\nRun: cd tools/token-pipeline && npm run generate`);
    process.exit(1);
  }
  console.log('token-pipeline --check OK — committed tokens match DESIGN.md');
} else {
  for (const [out, content] of targets) {
    mkdirSync(join(out, '..'), { recursive: true });
    writeFileSync(out, content, 'utf8');
    console.log(`generated ${out}`);
  }
}
