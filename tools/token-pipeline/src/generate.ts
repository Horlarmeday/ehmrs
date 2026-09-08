import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { parseDesign, flatten, resolveColor, ParseError } from './parse.js';
import { contrastRatio, requiredMinimum } from './contrast.js';
import { emitPreset } from './emit-preset.js';
import { emitTailwind } from './emit-tailwind.js';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..');
const designMd = join(repoRoot, 'client-vue3', 'DESIGN.md');

export function buildOutputsFromMd(md: string): { preset: string; tailwind: string } {
  const manifest = parseDesign(md);
  const flat = flatten(manifest);
  const failures: string[] = [];
  for (const pair of manifest.contrastPairs) {
    const fg = resolveColor(flat, pair.fg);
    const bg = resolveColor(flat, pair.bg);
    const actual = contrastRatio(fg, bg);
    const min = requiredMinimum(pair.cls, pair.min);
    if (actual < min) {
      failures.push(`${pair.fg} (${fg}) on ${pair.bg} (${bg}): ${actual.toFixed(2)}:1 < ${min}:1 [${pair.cls}]`);
    }
  }
  if (failures.length > 0) {
    throw new ParseError(`DESIGN.md violates its own contrast contract:\n${failures.map((f) => `  ${f}`).join('\n')}`);
  }
  return { preset: emitPreset(manifest), tailwind: emitTailwind(manifest) };
}

export function buildOutputs(): { preset: string; tailwind: string } {
  return buildOutputsFromMd(readFileSync(designMd, 'utf8'));
}
