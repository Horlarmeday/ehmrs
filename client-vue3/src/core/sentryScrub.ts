import type { Breadcrumb, ErrorEvent } from '@sentry/vue';

const REDACTED = '[redacted]';
const ID_SEGMENT = ':id';
const KEPT_BREADCRUMBS = new Set(['xhr', 'fetch', 'navigation']);
const KEPT_BREADCRUMB_DATA = ['method', 'status_code', 'url', 'from', 'to'];

const TEXT_RULES: Array<[RegExp, string]> = [
  [/eyJ[\w-]+\.[\w-]+\.[\w-]*/g, REDACTED],
  [/\$2[aby]\$\d{2}\$[./\w]{53}/g, REDACTED],
  [/[\w.+-]+@[\w-]+\.[\w.-]+/g, REDACTED],
  [/\+?\d[\d\s-]{5,}\d/g, REDACTED],
];

export function scrubText(text: string): string {
  return TEXT_RULES.reduce((out, [pattern, replacement]) => out.replace(pattern, replacement), text);
}

export function scrubUrl(url: string): string {
  const cut = url.search(/[?#]/);
  const bare = cut === -1 ? url : url.slice(0, cut);
  const match = /^([a-z][a-z0-9+.-]*:\/\/[^/]*)?(.*)$/i.exec(bare);
  const origin = match?.[1] ?? '';
  const path = (match?.[2] ?? '')
    .split('/')
    .map((segment) => (/\d|@/.test(segment) ? ID_SEGMENT : segment))
    .join('/');
  return origin + path;
}

export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  if (!breadcrumb.category || !KEPT_BREADCRUMBS.has(breadcrumb.category)) return null;
  const data: Record<string, unknown> = {};
  for (const key of KEPT_BREADCRUMB_DATA) {
    const value = breadcrumb.data?.[key];
    if (value === undefined) continue;
    data[key] = typeof value === 'string' ? scrubUrl(value) : value;
  }
  return { type: breadcrumb.type, category: breadcrumb.category, level: breadcrumb.level, timestamp: breadcrumb.timestamp, data };
}

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  const out: ErrorEvent = { ...event };
  delete out.user;
  delete out.extra;
  if (out.request) {
    out.request = { url: out.request.url ? scrubUrl(out.request.url) : undefined };
  }
  if (out.message) out.message = scrubText(out.message);
  if (out.exception?.values) {
    out.exception = {
      ...out.exception,
      values: out.exception.values.map((value) => ({
        ...value,
        value: value.value === undefined ? undefined : scrubText(value.value),
      })),
    };
  }
  if (out.breadcrumbs) {
    out.breadcrumbs = out.breadcrumbs
      .map(scrubBreadcrumb)
      .filter((crumb): crumb is Breadcrumb => crumb !== null);
  }
  if (out.contexts) {
    const { vue } = out.contexts;
    const rest = Object.fromEntries(
      Object.entries(out.contexts).filter(([key]) => key !== 'vue' && key !== 'state')
    );
    out.contexts = vue
      ? { ...rest, vue: { componentName: vue.componentName, lifecycleHook: vue.lifecycleHook } }
      : rest;
  }
  return out;
}
