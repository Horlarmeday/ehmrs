import { DesignManifest } from './parse.js';

function fontFamilyArray(value: string): string {
  const items = value.split(',').map((s) => s.trim()).filter(Boolean);
  return `[${items.map((i) => `'${i.replace(/'/g, "\\'")}'`).join(', ')}]`;
}

function paletteBlock(name: string, ramp: Record<string, string>, indent: string): string[] {
  const steps = Object.keys(ramp).sort((a, b) => Number(a) - Number(b));
  return [`${indent}${name}: {`, ...steps.map((step) => `${indent}  ${step}: '${ramp[step]}',`), `${indent}},`];
}

export function emitTailwind(manifest: DesignManifest): string {
  const s = manifest.semantic;
  const get = (token: string): string => {
    if (!(token in s)) throw new Error(`semantic token "${token}" missing from DESIGN.md`);
    return s[token];
  };
  const flat: Record<string, string> = {};
  for (const [name, ramp] of Object.entries(manifest.palettes)) {
    for (const [step, value] of Object.entries(ramp)) flat[`${name}.${step}`] = value;
  }
  Object.assign(flat, s);
  const resolved = (token: string): string => {
    let current = get(token);
    const seen = new Set<string>();
    while (/^\{[a-z0-9.]+\}$/.test(current)) {
      if (seen.has(current)) throw new Error(`circular ref ${current}`);
      seen.add(current);
      const ref = current.slice(1, -1);
      if (!(ref in flat)) throw new Error(`unknown ref ${current}`);
      current = flat[ref];
    }
    return current;
  };
  const color = (token: string) => `'${resolved(token)}'`;

  const lines: string[] = [];
  lines.push('// ! GENERATED FILE — tools/token-pipeline (issue #40, ADR-0001/0009). Do not edit by hand.');
  lines.push('// ! Single source: client-vue3/DESIGN.md. Regenerate: cd tools/token-pipeline && npm run generate.');
  lines.push('');
  lines.push('export const tokens = {');
  lines.push('  colors: {');
  for (const name of Object.keys(manifest.palettes).sort()) {
    lines.push(...paletteBlock(name, manifest.palettes[name], '    '));
  }
  lines.push(`    primary: { DEFAULT: ${color('primary.color')}, hover: ${color('primary.hover')}, active: ${color('primary.active')}, subtle: ${color('primary.subtle.bg')}, 'subtle-text': ${color('primary.subtle.text')} },`);
  lines.push(`    surface: { DEFAULT: ${color('surface.0')}, page: ${color('surface.50')}, alt: ${color('surface.100')} },`);
  lines.push(`    line: { DEFAULT: ${color('border.default')}, subtle: ${color('border.subtle')} },`);
  lines.push(`    ink: { DEFAULT: ${color('text.primary')}, secondary: ${color('text.secondary')}, muted: ${color('text.muted')}, disabled: ${color('text.disabled')} },`);
  lines.push(`    danger: { DEFAULT: ${color('danger.default')}, hover: ${color('danger.hover')}, subtle: ${color('danger.subtle.bg')}, 'subtle-text': ${color('danger.subtle.text')} },`);
  lines.push(`    success: { DEFAULT: ${color('success.default')}, hover: ${color('success.hover')}, subtle: ${color('success.subtle.bg')}, 'subtle-text': ${color('success.subtle.text')} },`);
  lines.push(`    warning: { DEFAULT: ${color('warning.default')}, hover: ${color('warning.hover')}, subtle: ${color('warning.subtle.bg')}, 'subtle-text': ${color('warning.subtle.text')} },`);
  lines.push('  },');
  lines.push(`  fontFamily: { sans: ${fontFamilyArray(get('font.sans'))}, mono: ${fontFamilyArray(get('font.mono'))} },`);
  lines.push(`  fontSize: { xs: '${get('control.font.xs')}', sm: '${get('control.font.sm')}', md: '${get('control.font.md')}', lg: '${get('control.font.lg')}', xl: '${get('control.font.xl')}' },`);
  lines.push(`  minHeight: { xs: '${get('control.height.xs')}', sm: '${get('control.height.sm')}', md: '${get('control.height.md')}', lg: '${get('control.height.lg')}' },`);
  lines.push(`  borderRadius: { none: '${get('radius.none')}', sm: '${get('radius.sm')}', DEFAULT: '${get('radius.md')}', lg: '${get('radius.lg')}', full: '9999px' },`);
  lines.push(`  boxShadow: { sm: '${get('shadow.sm')}', md: '${get('shadow.md')}', lg: '${get('shadow.lg')}' },`);
  lines.push('}');
  lines.push('');
  lines.push('export default tokens;');
  lines.push('');
  return lines.join('\n');
}
