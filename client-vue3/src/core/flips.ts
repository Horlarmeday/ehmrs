import { START_LOCATION } from 'vue-router';
import type { RouteLocationNormalized } from 'vue-router';

export const FLIPS_URL = '/flips.json';
export const FLIPS_TIMEOUT_MS = 3000;

let prefixes: string[] | null = null;
let servedPath: string | null = null;

export function isValidPrefix(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\/[A-Za-z0-9._~-]+(\/[A-Za-z0-9._~-]+)*$/.test(value) &&
    !/^\/(api|static|v3)(\/|$)/.test(value) &&
    !/(^|\/)\.{1,2}(\/|$)/.test(value)
  );
}

export function parseFlips(body: unknown): string[] | null {
  if (!body || typeof body !== 'object' || !('prefixes' in body)) return null;
  const list = body.prefixes;
  if (!Array.isArray(list) || !list.every(isValidPrefix)) return null;
  return [...new Set(list)];
}

export function isFlipped(path: string, list: readonly string[]): boolean {
  return list.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export async function loadFlips(
  fetcher: typeof fetch = fetch,
  timeoutMs = FLIPS_TIMEOUT_MS
): Promise<void> {
  servedPath = window.location.pathname;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(FLIPS_URL, { cache: 'no-store', signal: controller.signal });
    prefixes = response.ok ? parseFlips(await response.json()) : null;
  } catch {
    prefixes = null;
  } finally {
    clearTimeout(timer);
  }
}

export function setFlips(list: string[] | null, path: string | null = null): void {
  prefixes = list;
  servedPath = path;
}

export function legacyTarget(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
): string | null {
  if (prefixes === null) return null;
  if (isFlipped(to.path, prefixes)) return null;
  if (from === START_LOCATION && to.path === servedPath) return null;
  return to.fullPath;
}
