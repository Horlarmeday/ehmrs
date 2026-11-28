const REDACTED = '[redacted]';
const ID_SEGMENT = ':id';
const KEPT_BREADCRUMBS = ['xhr', 'fetch', 'navigation'];
const KEPT_BREADCRUMB_DATA = ['method', 'status_code', 'url', 'from', 'to'];

const TEXT_RULES = [
  [/eyJ[\w-]+\.[\w-]+\.[\w-]*/g, REDACTED],
  [/\$2[aby]\$\d{2}\$[./\w]{53}/g, REDACTED],
  [/[\w.+-]+@[\w-]+\.[\w.-]+/g, REDACTED],
  [/\+?\d[\d\s-]{5,}\d/g, REDACTED],
];

export function scrubText(text) {
  return TEXT_RULES.reduce(
    (out, [pattern, replacement]) => out.replace(pattern, replacement),
    text
  );
}

export function scrubUrl(url) {
  const cut = url.search(/[?#]/);
  const bare = cut === -1 ? url : url.slice(0, cut);
  const match = /^([a-z][a-z0-9+.-]*:\/\/[^/]*)?(.*)$/i.exec(bare);
  const origin = (match && match[1]) || '';
  const path = ((match && match[2]) || '')
    .split('/')
    .map((segment) => (/\d|@/.test(segment) ? ID_SEGMENT : segment))
    .join('/');
  return origin + path;
}

export function scrubBreadcrumb(breadcrumb) {
  if (!breadcrumb.category || KEPT_BREADCRUMBS.indexOf(breadcrumb.category) === -1) return null;
  const data = {};
  KEPT_BREADCRUMB_DATA.forEach((key) => {
    const value = breadcrumb.data && breadcrumb.data[key];
    if (value === undefined) return;
    data[key] = typeof value === 'string' ? scrubUrl(value) : value;
  });
  return {
    type: breadcrumb.type,
    category: breadcrumb.category,
    level: breadcrumb.level,
    timestamp: breadcrumb.timestamp,
    data,
  };
}

export function scrubEvent(event) {
  const out = Object.assign({}, event);
  delete out.user;
  delete out.extra;
  if (out.request) {
    out.request = { url: out.request.url ? scrubUrl(out.request.url) : undefined };
  }
  if (out.message) out.message = scrubText(out.message);
  if (out.exception && out.exception.values) {
    out.exception = Object.assign({}, out.exception, {
      values: out.exception.values.map((value) =>
        Object.assign({}, value, {
          value: value.value === undefined ? undefined : scrubText(value.value),
        })
      ),
    });
  }
  if (out.breadcrumbs) {
    out.breadcrumbs = out.breadcrumbs.map(scrubBreadcrumb).filter((crumb) => crumb !== null);
  }
  if (out.contexts) {
    const contexts = Object.assign({}, out.contexts);
    const vue = contexts.vue;
    delete contexts.vue;
    delete contexts.state;
    if (vue) {
      contexts.vue = { componentName: vue.componentName, lifecycleHook: vue.lifecycleHook };
    }
    out.contexts = contexts;
  }
  return out;
}
