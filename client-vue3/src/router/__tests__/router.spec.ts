/**
 * Issue #37 — router parity + guard behavior tests.
 *
 * Parity strategy: mechanically parse the legacy Vue 2 router
 * (client/src/router.js) and compare every (path, name, requiresAuth)
 * tuple with the vue-router 4 port's flattened route table. Every legacy
 * route must appear verbatim, except the explicitly dropped Metronic demo
 * routes (quill; builder was already commented out in legacy) and the two
 * documented mechanical adaptations (catch-all spelling, statistics child).
 */
import { beforeEach, describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory } from 'vue-router';
import router, { createAppRouter } from '../index';
import { useAuthStore } from '../../stores/auth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEGACY_ROUTER = path.resolve(__dirname, '../../../../client/src/router.js');

interface LegacyRoute {
  path: string;
  name?: string;
  requiresAuth: boolean;
}

interface RawObj {
  open: number;
  close: number;
  path?: string;
  name?: string;
  requiresAuth?: boolean;
}

/** Innermost object span containing a source offset. */
function innermostSpan(spans: RawObj[], at: number): RawObj | undefined {
  let best: RawObj | undefined;
  for (const s of spans) {
    if (s.open < at && at < s.close && (!best || s.open > best.open)) best = s;
  }
  return best;
}

/** Parse the prettier-formatted legacy router into flat resolved routes. */
function parseLegacyRoutes(src: string): LegacyRoute[] {
  const cleaned = src
    .split('\n')
    .filter(line => !line.trim().startsWith('//'))
    .join('\n');

  // object spans
  const spans: RawObj[] = [];
  const openStack: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      i++;
      while (i < cleaned.length && cleaned[i] !== quote) i++;
      continue;
    }
    if (ch === '{') {
      spans.push({ open: i, close: -1 });
      openStack.push(spans.length - 1);
    } else if (ch === '}') {
      const idx = openStack.pop();
      if (idx !== undefined) spans[idx]!.close = i;
    }
  }

  for (const m of cleaned.matchAll(/(?:path|name)\s*:\s*(['"])(.*?)\1/g)) {
    const at = m.index ?? -1;
    const obj = innermostSpan(spans, at);
    if (obj && m[0].startsWith('path')) obj.path = m[2];
    else if (obj) obj.name = m[2];
  }
  for (const m of cleaned.matchAll(/requiresAuth\s*:\s*true/g)) {
    const obj = innermostSpan(spans, m.index ?? -1);
    if (obj) obj.requiresAuth = true;
  }

  // requiresAuth sits on the meta object; propagate to nearest ancestor
  // route object (the one carrying the path)
  const routeObjsAll = spans.filter(s => s.path !== undefined);
  for (const s of spans) {
    if (s.requiresAuth && s.path === undefined) {
      const owner = routeObjsAll
        .filter(p => p.open < s.open && p.close > s.close)
        .sort((a, b) => b.open - a.open)[0];
      if (owner) owner.requiresAuth = true;
    }
  }

  // resolve nesting: attach each route object to its nearest ancestor route
  const routeObjs = spans.filter(s => s.path !== undefined);
  const full = new Map<RawObj, string>();
  const resolve = (obj: RawObj): string => {
    if (full.has(obj)) return full.get(obj) as string;
    const parent = [...routeObjs]
      .filter(p => p.open < obj.open && p.close > obj.close)
      .sort((a, b) => b.open - a.open)[0];
    let result: string;
    const raw = obj.path as string;
    if (raw === '*' || raw.startsWith('/')) {
      result = raw;
    } else if (!parent) {
      result = raw;
    } else {
      const parentPath = resolve(parent);
      result = raw === '' ? parentPath : `${parentPath}/${raw}`;
    }
    full.set(obj, result);
    return result;
  };

  return routeObjs.map(obj => ({
    path: resolve(obj) === '*' ? '/:pathMatch(.*)*' : resolve(obj),
    name: obj.name,
    requiresAuth: obj.requiresAuth === true,
  }));
}

/** Legacy -> ported adaptations (documented in tasks/37-router-port.md). */
const DROPPED = new Set(['/quill']);
const DROP_NAME = new Set(['/laboratory/results-update']); // duplicate-name v4 semantics
const ADAPTED: Record<string, string> = {
  '*': '/:pathMatch(.*)*',
};
const ADAPTED_BY_NAME: Record<string, string> = {
  // v4 treats leading-slash children as root paths; default-child is the
  // mechanical v4 equivalent of legacy's odd child path '/'
  'statistics-home': '/statistics',
};

function expectedLegacyRoutes(): LegacyRoute[] {
  const raw = parseLegacyRoutes(fs.readFileSync(LEGACY_ROUTER, 'utf8'));
  const mapped = raw
    .filter(r => !DROPPED.has(r.path))
    .map(r => ({
      path:
        (r.name !== undefined ? ADAPTED_BY_NAME[r.name] : undefined) ??
        ADAPTED[r.path] ??
        r.path,
      name: DROP_NAME.has(r.path) ? undefined : r.name,
      requiresAuth: r.requiresAuth,
    }));
  // legacy has two unnamed '/' records (root redirect record + login
  // parent). vue-router 4 keeps only one '/' in getRoutes(); the root
  // record is shadowed by the '' layout record in v4 matching and its
  // redirect behavior is replicated on that record's beforeEnter.
  const firstUnnamedRoot = mapped.findIndex(r => r.path === '/' && r.name === undefined);
  mapped.splice(firstUnnamedRoot, 1);
  return mapped;
}

function portedRoutes() {
  return router
    .getRoutes()
    .map(r => ({
      path: r.path,
      name: r.name === undefined ? undefined : String(r.name),
      requiresAuth: r.meta.requiresAuth === true,
    }))
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

describe('route parity with legacy client/src/router.js', () => {
  test('every legacy route is ported 1:1 (path, name, requiresAuth)', () => {
    const expected = expectedLegacyRoutes()
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    expect(portedRoutes()).toEqual(expected);
  });

  test('all 153 legacy requiresAuth meta entries preserved', () => {
    // 154 textual occurrences in legacy router.js minus the beforeEach guard
    expect(router.getRoutes().filter(r => r.meta.requiresAuth).length).toBe(153);
  });

  test('Metronic demo routes are dropped', () => {
    expect(router.hasRoute('quill')).toBe(false);
    expect(router.hasRoute('builder')).toBe(false);
    expect(router.getRoutes().map(r => r.path)).not.toContain('/quill');
  });
});

describe('guard behavior (ported 1:1)', () => {
  function testRouter() {
    return createAppRouter(createMemoryHistory());
  }

  async function navigateTo(target: string) {
    const r = testRouter();
    await r.push('/__start'); // memory history starts at '/', prime a distinct origin
    await r.push(target);
    return r.currentRoute.value.path;
  }

  beforeEach(() => {
    localStorage.removeItem('user_token');
    setActivePinia(createPinia());
  });

  test('unauthenticated navigation to a requiresAuth route redirects to /auth/login', async () => {
    expect(await navigateTo('/dashboard')).toBe('/auth/login');
  });

  test('authenticated navigation to a requiresAuth route passes', async () => {
    localStorage.setItem('user_token', 't');
    expect(await navigateTo('/dashboard')).toBe('/dashboard');
    expect(useAuthStore().token).toBe('t');
  });

  test('root / redirects to /dashboard when authenticated', async () => {
    localStorage.setItem('user_token', 't');
    expect(await navigateTo('/')).toBe('/dashboard');
  });

  test('root / redirects to /auth/login when unauthenticated', async () => {
    expect(await navigateTo('/')).toBe('/auth/login');
  });

  test('unmatched paths fall through to /404', async () => {
    localStorage.setItem('user_token', 't');
    expect(await navigateTo('/no/such/route')).toBe('/404');
  });
});
