import { DesignManifest } from './parse.js';

function pxToRemValue(value: string): string {
  const match = value.match(/^(\d+(?:\.\d+)?)px$/);
  if (!match) throw new Error(`density value must be Npx, got "${value}"`);
  const n = Number(match[1]);
  const rem = n / 16;
  const out = Number.isInteger(rem) ? String(rem) : String(Number(rem.toFixed(5)));
  return `${out}rem`;
}

export function pxToRem(value: string): string {
  return value
    .split(' ')
    .map((part) => pxToRemValue(part))
    .join(' ');
}

function fontFamilyArray(value: string): string {
  const items = value.split(',').map((s) => s.trim()).filter(Boolean);
  return `[${items.map((i) => (i.includes(' ') ? `'${i}'` : i)).join(', ')}]`;
}

function rampRefs(palette: string, steps: string[]): string {
  return steps.map((s) => `${s}: '{${palette}.${s}}'`).join(', ');
}

function jsString(value: string): string {
  return JSON.stringify(value);
}

const RAMP_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

export function emitPreset(manifest: DesignManifest): string {
  const s = manifest.semantic;
  const get = (token: string): string => {
    if (!(token in s)) throw new Error(`semantic token "${token}" missing from DESIGN.md`);
    return s[token];
  };
  const rem = (token: string) => pxToRem(get(token));

  const lines: string[] = [];
  lines.push("// ! GENERATED FILE — tools/token-pipeline (issue #40, ADR-0001/0009). Do not edit by hand.");
  lines.push('// ! Single source: client-vue3/DESIGN.md. Regenerate: cd tools/token-pipeline && npm run generate.');
  lines.push("import { definePreset } from '@primeuix/themes';");
  lines.push("import Aura from '@primeuix/themes/aura';");
  lines.push('');
  lines.push(`export const EHMRS_TOKENS = ${JSON.stringify(manifest, null, 2)} as const;`);
  lines.push('');
  lines.push('export const EhmrsPreset = definePreset(Aura, {');
  lines.push('  primitive: {');
  for (const palette of Object.keys(manifest.palettes).sort()) {
    lines.push(`    ${palette}: { ${manifest.palettes[palette] ? '' : ''}${RAMP_STEPS.filter((step) => step in manifest.palettes[palette]).map((step) => `${step}: ${jsString(manifest.palettes[palette][step])}`).join(', ')} },`);
  }
  lines.push(`    borderRadius: { none: '0px', sm: '${pxToRem(get('radius.sm'))}', md: '${pxToRem(get('radius.md'))}', lg: '${pxToRem(get('radius.lg'))}' },`);
  lines.push('  },');
  lines.push('  semantic: {');
  lines.push(`    typography: { fontFamily: ${jsString(get('font.sans'))}, fontWeight: '${get('font.weight.regular')}', fontSize: '${pxToRem(get('control.font.sm'))}', lineHeight: '${get('line.height')}' },`);
  lines.push(`    focusRing: { width: '${pxToRem(get('focus.ring.width'))}', style: '${get('focus.ring.style')}', color: '{blue.600}', offset: '${pxToRem(get('focus.ring.offset'))}', shadow: 'none' },`);
  lines.push(`    primary: { ${rampRefs('blue', RAMP_STEPS)} },`);
  lines.push(`    text: { color: '{gray.900}', hoverColor: '{gray.800}', mutedColor: '{gray.600}', hoverMutedColor: '{gray.700}' },`);
  lines.push(`    surface: { 0: '#ffffff', ${['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'].map((step) => (step in manifest.palettes.gray ? `${step}: '{gray.${step}}'` : null)).filter(Boolean).join(', ')} },`);
  lines.push(`    content: { background: '{surface.0}', hoverBackground: '{surface.100}', borderColor: '{surface.200}', color: '{text.color}', hoverColor: '{text.hover.color}', borderRadius: '{border.radius.md}' },`);
  lines.push(`    highlight: { background: '{primary.50}', focusBackground: '{primary.100}', color: '{primary.700}', focusColor: '{primary.800}' },`);
  lines.push(`    formField: {`);
  lines.push(`      fontSize: '${pxToRem(get('control.font.sm'))}',`);
  lines.push(`      fontWeight: '{typography.font.weight}',`);
  lines.push(`      paddingX: '${pxToRem(get('control.padding.x'))}',`);
  lines.push(`      paddingY: '${pxToRem(get('control.padding.y.sm'))}',`);
  lines.push(`      borderRadius: '{border.radius.sm}',`);
  lines.push(`      sm: { fontSize: '${pxToRem(get('control.font.xs'))}', paddingX: '${pxToRem(get('control.padding.x.xs'))}', paddingY: '${pxToRem(get('control.padding.y.xs'))}' },`);
  lines.push(`      lg: { fontSize: '${pxToRem(get('control.font.lg'))}', paddingX: '${pxToRem(get('control.padding.x'))}', paddingY: '${pxToRem(get('control.padding.y.lg'))}' },`);
  lines.push(`      focusRing: { width: '{focus.ring.width}', style: '{focus.ring.style}', color: '{focus.ring.color}', offset: '{focus.ring.offset}', shadow: 'none' },`);
  lines.push('    },');
  lines.push('  },');
  lines.push('  components: {');
  lines.push(`    button: { root: { gap: '0.375rem', roundedBorderRadius: '9999px', sm: { iconOnlyWidth: '1.5rem' } } },`);
  lines.push(`    datatable: {`);
  lines.push(`      bodyCell: { padding: '${pxToRem(get('table.cell.padding'))}', fontSize: '{typography.font.size}', fontWeight: '{typography.font.weight}', sm: { padding: '${pxToRem(get('table.cell.padding.dense'))}' } },`);
  lines.push(`      headerCell: { padding: '${pxToRem(get('table.header.cell.padding'))}', sm: { padding: '${pxToRem(get('table.cell.padding.dense'))}' } },`);
  lines.push('    },');
  lines.push('  },');
  lines.push('});');
  lines.push('');
  lines.push('export default EhmrsPreset;');
  lines.push('');
  return lines.join('\n');
}
