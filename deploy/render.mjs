import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SEGMENTS = /^\/[A-Za-z0-9._~-]+(\/[A-Za-z0-9._~-]+)*$/;
const RESERVED = /^\/(api|static|v3|js|css|img|fonts|flips\.json|index\.html)(\/|$)/;
const DOT_SEGMENT = /(^|\/)\.{1,2}(\/|$)/;

export function validatePrefixes(body) {
  const list = body && typeof body === 'object' ? body.prefixes : undefined;
  if (!Array.isArray(list)) throw new Error('flips.json must be { "prefixes": [ ... ] }');
  const seen = new Set();
  for (const prefix of list) {
    if (typeof prefix !== 'string' || !SEGMENTS.test(prefix) || DOT_SEGMENT.test(prefix)) {
      throw new Error(`invalid prefix ${JSON.stringify(prefix)}: use /segment[/segment...] with no trailing slash`);
    }
    if (RESERVED.test(prefix)) throw new Error(`prefix ${prefix} is reserved`);
    if (seen.has(prefix)) throw new Error(`duplicate prefix ${prefix}`);
    seen.add(prefix);
  }
  return list;
}

function escapeRegex(text) {
  return text.replace(/[.~-]/g, (c) => `\\${c}`);
}

export function renderFlipBlocks(prefixes, { v3Root, nginxDir }) {
  return prefixes
    .map(
      (prefix) => `location ~ ^${escapeRegex(prefix)}(?:/|$) {
    root ${v3Root};
    try_files /index.html =404;
    include ${nginxDir}/security-headers.conf;
    add_header Cache-Control "no-cache" always;
}
`
    )
    .join('\n');
}

export function fill(template, values) {
  const out = template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, key) => {
    if (!(key in values)) throw new Error(`no value for ${match}`);
    return values[key];
  });
  return out;
}

export function readSettings(env) {
  const required = (name) => {
    const value = env[name];
    if (!value) throw new Error(`${name} is required`);
    return value;
  };
  const absolute = (name) => {
    const value = required(name).replace(/\/+$/, '');
    if (!isAbsolute(value)) throw new Error(`${name} must be an absolute path`);
    return value;
  };
  const listen = required('EHMRS_LISTEN');
  if (!/^(\d{1,3}(\.\d{1,3}){3}:)?\d{1,5}$/.test(listen)) throw new Error('EHMRS_LISTEN must be a port or ip:port');
  const upstream = required('EHMRS_API_UPSTREAM');
  if (!/^https?:\/\/[^/\s]+$/.test(upstream)) {
    throw new Error('EHMRS_API_UPSTREAM must be scheme://host[:port] with no path');
  }
  const bodySize = env.EHMRS_CLIENT_MAX_BODY_SIZE || '50m';
  if (!/^\d+[km]?$/.test(bodySize)) throw new Error('EHMRS_CLIENT_MAX_BODY_SIZE must look like 50m');
  return {
    listen,
    upstream,
    bodySize,
    legacyRoot: absolute('EHMRS_LEGACY_ROOT'),
    v3Root: absolute('EHMRS_V3_ROOT'),
    outDir: absolute('EHMRS_OUT_DIR'),
    mimeTypes: env.EHMRS_MIME_TYPES || '',
  };
}

export function render({ flipsFile, settings }) {
  const prefixes = validatePrefixes(JSON.parse(readFileSync(flipsFile, 'utf8')));
  const nginxDir = join(settings.outDir, 'nginx');
  mkdirSync(nginxDir, { recursive: true });
  const values = {
    LISTEN: settings.listen,
    API_UPSTREAM: settings.upstream,
    CLIENT_MAX_BODY_SIZE: settings.bodySize,
    LEGACY_ROOT: settings.legacyRoot,
    V3_ROOT: settings.v3Root,
    OUT_DIR: settings.outDir,
    NGINX_DIR: nginxDir,
    MIME_TYPES: settings.mimeTypes,
  };
  copyFileSync(join(HERE, 'nginx/security-headers.conf'), join(nginxDir, 'security-headers.conf'));
  writeFileSync(join(nginxDir, 'flips.conf'), renderFlipBlocks(prefixes, { v3Root: settings.v3Root, nginxDir }));
  writeFileSync(join(nginxDir, 'ehmrs.conf'), fill(readFileSync(join(HERE, 'nginx/ehmrs.conf.template'), 'utf8'), values));
  writeFileSync(join(settings.outDir, 'flips.json'), `${JSON.stringify({ prefixes }, null, 2)}\n`);
  if (settings.mimeTypes) {
    for (const dir of ['body', 'proxy', 'fastcgi', 'uwsgi', 'scgi']) mkdirSync(join(settings.outDir, 'tmp', dir), { recursive: true });
    writeFileSync(join(nginxDir, 'nginx.conf'), fill(readFileSync(join(HERE, 'nginx/local.conf.template'), 'utf8'), values));
  }
  return prefixes;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const flipsFile = process.argv[2] || join(HERE, 'flips.json');
    const prefixes = render({ flipsFile, settings: readSettings(process.env) });
    process.stdout.write(`rendered ${prefixes.length} flipped prefix(es): ${prefixes.join(', ') || 'none'}\n`);
  } catch (error) {
    process.stderr.write(`render failed: ${error.message}\n`);
    process.exit(1);
  }
}
