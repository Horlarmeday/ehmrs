import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fill, readSettings, render, renderFlipBlocks, validatePrefixes } from './render.mjs';

const ENV = {
  EHMRS_LISTEN: '8090',
  EHMRS_API_UPSTREAM: 'http://127.0.0.1:4050',
  EHMRS_LEGACY_ROOT: '/srv/ehmrs/legacy',
  EHMRS_V3_ROOT: '/srv/ehmrs/v3/',
  EHMRS_OUT_DIR: '/srv/ehmrs/out',
};

test('accepts path prefixes', () => {
  assert.deepEqual(validatePrefixes({ prefixes: ['/auth', '/settings/change-password'] }), [
    '/auth',
    '/settings/change-password',
  ]);
  assert.deepEqual(validatePrefixes({ prefixes: [] }), []);
});

test('rejects bad, reserved and duplicate prefixes', () => {
  for (const bad of ['auth', '/auth/', '/', '/a b', '/a/../b', '/..', 3]) {
    assert.throws(() => validatePrefixes({ prefixes: [bad] }), /invalid prefix/);
  }
  for (const reserved of ['/api', '/api/x', '/static', '/v3', '/js', '/css', '/img', '/fonts', '/flips.json', '/index.html']) {
    assert.throws(() => validatePrefixes({ prefixes: [reserved] }), /reserved/);
  }
  assert.throws(() => validatePrefixes({ prefixes: ['/auth', '/auth'] }), /duplicate/);
  assert.throws(() => validatePrefixes(['/auth']), /must be/);
});

test('one location block per prefix, matching whole segments only', () => {
  const out = renderFlipBlocks(['/auth', '/settings/change-password'], { v3Root: '/v3root', nginxDir: '/n' });
  assert.equal(out.match(/^location /gm).length, 2);
  assert.match(out, /location ~ \^\/auth\(\?:\/\|\$\) \{/);
  assert.match(out, /location ~ \^\/settings\/change\\-password\(\?:\/\|\$\) \{/);
  assert.match(out, /root \/v3root;/);
  assert.match(out, /Cache-Control "no-cache"/);
  const regex = /^\/auth(?:\/|$)/;
  assert.ok(regex.test('/auth') && regex.test('/auth/login') && !regex.test('/authority'));
});

test('no flips renders no blocks', () => {
  assert.equal(renderFlipBlocks([], { v3Root: '/x', nginxDir: '/n' }), '');
});

test('fill refuses unknown placeholders', () => {
  assert.equal(fill('a {{X}} b', { X: '1' }), 'a 1 b');
  assert.throws(() => fill('{{Y}}', {}), /no value for \{\{Y\}\}/);
});

test('settings are required, validated and normalised', () => {
  const s = readSettings(ENV);
  assert.equal(s.v3Root, '/srv/ehmrs/v3');
  assert.equal(s.bodySize, '50m');
  for (const key of ['EHMRS_LISTEN', 'EHMRS_API_UPSTREAM', 'EHMRS_LEGACY_ROOT', 'EHMRS_V3_ROOT', 'EHMRS_OUT_DIR']) {
    assert.throws(() => readSettings({ ...ENV, [key]: '' }), new RegExp(`${key} is required`));
  }
  assert.throws(() => readSettings({ ...ENV, EHMRS_V3_ROOT: 'relative/dir' }), /absolute/);
  assert.throws(() => readSettings({ ...ENV, EHMRS_API_UPSTREAM: 'http://api:4050/' }), /no path/);
  assert.throws(() => readSettings({ ...ENV, EHMRS_LISTEN: 'eighty' }), /port/);
  assert.throws(() => readSettings({ ...ENV, EHMRS_CLIENT_MAX_BODY_SIZE: 'big' }), /50m/);
});

test('render writes the server block, the flip blocks and the public list', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ehmrs-render-'));
  const flipsFile = join(dir, 'flips.json');
  writeFileSync(flipsFile, JSON.stringify({ prefixes: ['/auth'] }));
  const settings = readSettings({ ...ENV, EHMRS_OUT_DIR: join(dir, 'out'), EHMRS_MIME_TYPES: '/etc/nginx/mime.types' });
  render({ flipsFile, settings });
  const conf = readFileSync(join(dir, 'out/nginx/ehmrs.conf'), 'utf8');
  assert.doesNotMatch(conf, /\{\{/);
  assert.match(conf, /listen 8090;/);
  assert.match(conf, /proxy_pass http:\/\/127\.0\.0\.1:4050;/);
  assert.match(conf, new RegExp(`include ${join(dir, 'out/nginx')}/flips.conf;`));
  assert.deepEqual(JSON.parse(readFileSync(join(dir, 'out/flips.json'), 'utf8')), { prefixes: ['/auth'] });
  assert.match(readFileSync(join(dir, 'out/nginx/flips.conf'), 'utf8'), /\^\/auth/);
  assert.match(readFileSync(join(dir, 'out/nginx/nginx.conf'), 'utf8'), /include \/etc\/nginx\/mime\.types;/);
  assert.ok(existsSync(join(dir, 'out/tmp/proxy')));
});

test('a bad list writes nothing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ehmrs-render-'));
  const flipsFile = join(dir, 'flips.json');
  writeFileSync(flipsFile, JSON.stringify({ prefixes: ['/api'] }));
  assert.throws(() => render({ flipsFile, settings: readSettings({ ...ENV, EHMRS_OUT_DIR: join(dir, 'out') }) }), /reserved/);
  assert.equal(existsSync(join(dir, 'out')), false);
});

test('the committed flip list is valid', () => {
  const body = JSON.parse(readFileSync(new URL('./flips.json', import.meta.url), 'utf8'));
  assert.doesNotThrow(() => validatePrefixes(body));
});
