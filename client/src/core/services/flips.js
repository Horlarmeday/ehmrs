import Router from 'vue-router';

export const FLIPS_URL = '/flips.json';
export const FLIPS_TIMEOUT_MS = 3000;

const SEGMENTS = /^\/[A-Za-z0-9._~-]+(\/[A-Za-z0-9._~-]+)*$/;
const RESERVED = /^\/(api|static|v3)(\/|$)/;
const DOT_SEGMENT = /(^|\/)\.{1,2}(\/|$)/;

let prefixes = null;
let servedPath = null;

function isValidPrefix(value) {
  return (
    typeof value === 'string' &&
    SEGMENTS.test(value) &&
    !RESERVED.test(value) &&
    !DOT_SEGMENT.test(value)
  );
}

function parseFlips(body) {
  const list = body && typeof body === 'object' ? body.prefixes : undefined;
  if (!Array.isArray(list) || !list.every(isValidPrefix)) return null;
  return Array.from(new Set(list));
}

function isFlipped(path) {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function loadFlips() {
  servedPath = window.location.pathname;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FLIPS_TIMEOUT_MS);
  return fetch(FLIPS_URL, { cache: 'no-store', signal: controller.signal })
    .then((response) => (response.ok ? response.json() : null))
    .then((body) => {
      prefixes = parseFlips(body);
    })
    .catch(() => {
      prefixes = null;
    })
    .finally(() => clearTimeout(timer));
}

export function handOffToVue3(to, from, next) {
  if (prefixes === null || !isFlipped(to.path)) {
    next();
    return;
  }
  if (from === Router.START_LOCATION && to.path === servedPath) {
    next();
    return;
  }
  window.location.assign(to.fullPath);
  next(false);
}
