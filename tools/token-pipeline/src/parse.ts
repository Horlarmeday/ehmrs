export interface TokenRow {
  token: string;
  value: string;
  note: string;
}

export interface ContrastPair {
  fg: string;
  bg: string;
  cls: 'data-text' | 'ui' | 'decorative';
  min: number;
}

export interface DesignManifest {
  palettes: Record<string, Record<string, string>>;
  semantic: Record<string, string>;
  contrastPairs: ContrastPair[];
}

const TOKEN_TABLE_RE = /^###\s+tokens:([a-z0-9.]+)\s*$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function parseTableRow(line: string): string[] {
  return line
    .replace(/^\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every((c) => /^:?-{3,}:?$/.test(c));
}

export class ParseError extends Error {}

export function parseDesign(md: string): DesignManifest {
  const palettes: Record<string, Record<string, string>> = {};
  const semantic: Record<string, string> = {};
  const contrastPairs: ContrastPair[] = [];
  let current: { section: string; header: string[] } | null = null;

  for (const rawLine of md.split(/\r?\n/)) {
    const heading = rawLine.match(TOKEN_TABLE_RE);
    if (heading) {
      current = { section: heading[1], header: [] };
      continue;
    }
    if (current && rawLine.startsWith('|')) {
      const cells = parseTableRow(rawLine);
      if (isSeparatorRow(cells)) continue;
      if (current.header.length === 0) {
        current.header = cells;
        continue;
      }
      if (current.section === 'contrast.pairs') {
        if (current.header.join('|') !== 'fg|bg|class|min') {
          throw new ParseError(`contrast.pairs header must be fg|bg|class|min, got "${current.header.join('|')}"`);
        }
        const [fg, bg, cls, min] = cells;
        if (cells.length !== 4) throw new ParseError(`contrast pair row must have 4 cells: "${rawLine}"`);
        if (cls !== 'data-text' && cls !== 'ui' && cls !== 'decorative') {
          throw new ParseError(`contrast pair class must be data-text|ui|decorative, got "${cls}"`);
        }
        if (cls === 'data-text' && Number(min) < 4.5) {
          throw new ParseError(`data-text pair ${fg}/${bg} declares min ${min} — non-negotiable #2 forbids < 4.5`);
        }
        contrastPairs.push({ fg, bg, cls, min: Number(min) });
      } else {
        if (current.header.join('|') !== 'token|value|note') {
          throw new ParseError(`tokens:${current.section} header must be token|value|note, got "${current.header.join('|')}"`);
        }
        if (cells.length !== 3) throw new ParseError(`token row must have 3 cells: "${rawLine}"`);
        const [token, value] = cells;
        if (!value) throw new ParseError(`token ${token} in ${current.section} has empty value`);
        if (current.section.startsWith('palette.')) {
          const palette = current.section.slice('palette.'.length);
          if (!token.startsWith(`${palette}.`)) {
            throw new ParseError(`token "${token}" in palette.${palette} must be prefixed "${palette}."`);
          }
          const step = token.slice(palette.length + 1);
          palettes[palette] = palettes[palette] || {};
          palettes[palette][step] = value;
        } else if (current.section === 'semantic') {
          semantic[token] = value;
        } else {
          throw new ParseError(`unknown tokens section "${current.section}"`);
        }
      }
      continue;
    }
    if (current && rawLine.trim() === '' && current.header.length > 0) {
      current = null;
    }
  }

  if (Object.keys(palettes).length === 0) throw new ParseError('no palette tables found');
  if (Object.keys(semantic).length === 0) throw new ParseError('no semantic tables found');
  if (contrastPairs.length === 0) throw new ParseError('no contrast pairs found');
  for (const [name, ramp] of Object.entries(palettes)) {
    for (const [step, value] of Object.entries(ramp)) {
      if (!HEX_RE.test(value)) throw new ParseError(`palette ${name}.${step} must be a #rrggbb literal, got "${value}"`);
    }
  }
  return { palettes, semantic, contrastPairs };
}

export function flatten(manifest: DesignManifest): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [name, ramp] of Object.entries(manifest.palettes)) {
    for (const [step, value] of Object.entries(ramp)) flat[`${name}.${step}`] = value;
  }
  for (const [token, value] of Object.entries(manifest.semantic)) flat[token] = value;
  return flat;
}

export function resolve(flat: Record<string, string>, value: string): string {
  let current = value;
  const seen = new Set<string>();
  while (/^\{[a-z0-9.]+\}$/.test(current)) {
    if (seen.has(current)) throw new ParseError(`circular token ref ${current}`);
    seen.add(current);
    const ref = current.slice(1, -1);
    if (!(ref in flat)) throw new ParseError(`unknown token ref "${current}"`);
    current = flat[ref];
  }
  return current;
}

export function resolveColor(flat: Record<string, string>, token: string): string {
  const literal = resolve(flat, `{${token}}`);
  if (!HEX_RE.test(literal)) throw new ParseError(`token ${token} does not resolve to a #rrggbb literal, got "${literal}"`);
  return literal.toLowerCase();
}
