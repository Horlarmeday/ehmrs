import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { parseDesign, flatten, resolveColor, ParseError } from './parse.js';
import { contrastRatio, requiredMinimum } from './contrast.js';
import { buildOutputs, buildOutputsFromMd } from './generate.js';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..');
const designMd = readFileSync(join(repoRoot, 'client-vue3', 'DESIGN.md'), 'utf8');

const VALID_MD = `
### tokens:palette.blue

| token | value | note |
| --- | --- | --- |
| blue.600 | #2563eb | action |

### tokens:palette.gray

| token | value | note |
| --- | --- | --- |
| gray.900 | #111827 | text |

### tokens:semantic

| token | value | note |
| --- | --- | --- |
| text.primary | {gray.900} | |
| surface.0 | #ffffff | |

### tokens:contrast.pairs

| fg | bg | class | min |
| --- | --- | --- | --- |
| text.primary | surface.0 | data-text | 4.5 |
`;

const MINIMAL_DENSITY_MD = (fontSm: string) => `
### tokens:palette.blue

| token | value | note |
| --- | --- | --- |
| blue.600 | #2563eb | |

### tokens:palette.gray

| token | value | note |
| --- | --- | --- |
| gray.50 | #f9fafb | |
| gray.900 | #111827 | |

### tokens:semantic

| token | value | note |
| --- | --- | --- |
| surface.0 | #ffffff | |
| text.primary | {gray.900} | |

### tokens:semantic

| token | value | note |
| --- | --- | --- |
| control.height.xs | 24px | |
| control.height.sm | 28px | |
| control.height.md | 32px | |
| control.height.lg | 40px | |
| control.font.xs | 11px | |
| control.font.sm | ${fontSm} | |
| control.font.md | 13px | |
| control.font.lg | 14px | |
| control.font.xl | 16px | |
| control.padding.x | 8px | |
| control.padding.y.sm | 5px | |
| control.padding.y.xs | 4px | |
| control.padding.y.lg | 8px | |
| control.padding.x.xs | 6px | |
| table.cell.padding | 4px 8px | |
| table.cell.padding.dense | 3px 5px | |
| table.header.cell.padding | 5px 8px | |

### tokens:semantic

| token | value | note |
| --- | --- | --- |
| font.sans | Inter, sans-serif | |
| font.mono | JetBrains Mono, monospace | |
| font.weight.regular | 400 | |
| line.height | 1.4 | |

### tokens:semantic

| token | value | note |
| --- | --- | --- |
| radius.none | 0px | |
| radius.sm | 3px | |
| radius.md | 4px | |
| radius.lg | 6px | |
| radius.pill | 9999px | |

### tokens:semantic

| token | value | note |
| --- | --- | --- |
| shadow.sm | 0 1px 2px rgba(16,24,40,0.06) | |

### tokens:semantic

| token | value | note |
| --- | --- | --- |
| focus.ring.color | {blue.600} | |
| focus.ring.width | 2px | |
| focus.ring.style | solid | |
| focus.ring.offset | 1px | |

### tokens:contrast.pairs

| fg | bg | class | min |
| --- | --- | --- | --- |
| text.primary | surface.0 | data-text | 4.5 |
`;

describe('parse', () => {
  it('parses the real DESIGN.md', () => {
    const manifest = parseDesign(designMd);
    expect(Object.keys(manifest.palettes)).toContain('blue');
    expect(manifest.semantic['primary.color']).toBe('{blue.600}');
    expect(manifest.contrastPairs.length).toBeGreaterThan(10);
  });

  it('rejects wrong table headers', () => {
    const bad = VALID_MD.replace('token | value | note', 'name | value');
    expect(() => parseDesign(bad)).toThrow(ParseError);
  });

  it('rejects malformed contrast rows and classes', () => {
    expect(() => parseDesign(VALID_MD.replace('| text.primary | surface.0 | data-text | 4.5 |', '| text.primary | surface.0 | shiny | 4.5 |'))).toThrow(ParseError);
  });

  it('rejects non-hex palette values', () => {
    expect(() => parseDesign(VALID_MD.replace('#2563eb', 'blue'))).toThrow(ParseError);
  });

  it('rejects unknown refs and reports circularity', () => {
    expect(() => resolveColor(flatten(parseDesign(VALID_MD.replace('{gray.900}', '{gray.42}'))), 'text.primary')).toThrow(/unknown token ref/);
  });
});

describe('contrast', () => {
  it('computes WCAG ratios (white on #2563eb > 5, white on #16a34a < 4.5)', () => {
    expect(contrastRatio('#ffffff', '#2563eb')).toBeGreaterThan(5);
    expect(contrastRatio('#ffffff', '#16a34a')).toBeLessThan(4.5);
  });

  it('data-text minimum can never be declared below 4.5', () => {
    expect(requiredMinimum('data-text', 3)).toBe(4.5);
    expect(() => parseDesign(VALID_MD.replace('| 4.5 |', '| 4.0 |'))).toThrow(/non-negotiable/);
  });

  it('generation refuses a non-AA data-text pair', () => {
    const nonAa = MINIMAL_DENSITY_MD('12px').replace('gray.900 | #111827', 'gray.900 | #9ca3af');
    expect(() => buildOutputsFromMd(nonAa)).toThrow(/contrast contract/);
  });
});

describe('emission', () => {
  it('is deterministic (two runs byte-identical)', () => {
    const a = buildOutputs();
    const b = buildOutputs();
    expect(a.preset).toBe(b.preset);
    expect(a.tailwind).toBe(b.tailwind);
  });

  it('preset maps density to rem and carries the manifest', () => {
    const { preset } = buildOutputs();
    expect(preset).toContain("fontSize: '0.75rem'");
    expect(preset).toContain("paddingY: '0.3125rem'");
    expect(preset).toContain("padding: '0.25rem 0.5rem'");
    expect(preset).toContain('EHMRS_TOKENS');
    expect(preset).toContain('definePreset(Aura');
  });

  it('tailwind output exposes the ERP-default density and AA-capable colors', () => {
    const { tailwind } = buildOutputs();
    expect(tailwind).toContain("sm: '28px'");
    expect(tailwind).toContain("DEFAULT: '#2563eb'");
    expect(tailwind).toContain("DEFAULT: '#111827'");
  });

  it('reflects DESIGN.md density edits in generated output', () => {
    const a = buildOutputsFromMd(designMd).preset;
    const b = buildOutputsFromMd(designMd.replace('| control.font.sm | 12px |', '| control.font.sm | 13px |')).preset;
    expect(a).not.toBe(b);
    expect(b).toContain("fontSize: '0.8125rem'");
  });
});
