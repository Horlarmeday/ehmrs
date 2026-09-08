export interface CorpusScenario {
  name: string;
  request: { method: string; url: string; body?: unknown };
  response: { status: number; body?: unknown };
}

export interface InferredField {
  name: string;
  type: string;
  optional: boolean;
}

export interface InferredResponseType {
  /** Grouping key: `METHOD path` from the corpus scenario names/requests. */
  route: string;
  fields: InferredField[];
}

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

/**
 * Uncertainty rule (ADR-0004): only fields actually observed in the fixture
 * corpus exist. A field present in every observed response is required; a
 * field present in only some is optional. Nothing unobserved is invented.
 */
const LITERAL_UNION_KEYS = new Set(['status']);

function valueToType(value: Json, key: string): string {
  if (value === null) return 'null';
  if (typeof value === 'string') {
    if (LITERAL_UNION_KEYS.has(key) && value.length <= 16) return JSON.stringify(value);
    return 'string';
  }
  if (typeof value === 'number' || typeof value === 'boolean') return typeof value;
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    const elemTypes = [...new Set(value.map((v) => valueToType(v, key)))];
    const elem = elemTypes.length === 1 ? elemTypes[0] : `(${elemTypes.join(' | ')})`;
    return `${elem}[]`;
  }
  const nested = inferFields([value]);
  const rendered = nested.map((f) => `${f.name}${f.optional ? '?' : ''}: ${f.type}`);
  return rendered.length > 0 ? `{ ${rendered.join('; ')} }` : 'Record<string, unknown>';
}

function inferFields(bodies: { [k: string]: Json }[]): InferredField[] {
  const types = new Map<string, Set<string>>();
  const presence = new Map<string, number>();
  for (const body of bodies) {
    for (const [name, value] of Object.entries(body)) {
      if (!presence.has(name)) types.set(name, new Set());
      presence.set(name, (presence.get(name) ?? 0) + 1);
      types.get(name)!.add(valueToType(value, name));
    }
  }
  return [...presence.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => {
      const union = [...types.get(name)!].sort().join(' | ');
      return { name, type: union, optional: count < bodies.length };
    });
}

export function inferResponseType(scenarios: CorpusScenario[]): InferredResponseType {
  if (scenarios.length === 0) throw new Error('Cannot infer a response type from zero scenarios');
  const first = scenarios[0];
  const route = `${first.request.method} ${first.request.url}`;
  for (const s of scenarios) {
    if (`${s.request.method} ${s.request.url}` !== route) {
      throw new Error(`Scenario "${s.name}" belongs to ${s.request.method} ${s.request.url}, expected ${route}`);
    }
  }
  const bodies = scenarios
    .map((s) => s.response.body)
    .filter((b): b is { [k: string]: Json } => b !== null && typeof b === 'object' && !Array.isArray(b));
  if (bodies.length === 0) return { route, fields: [] };
  return { route, fields: inferFields(bodies) };
}

export function groupByRoute(scenarios: CorpusScenario[]): Map<string, CorpusScenario[]> {
  const groups = new Map<string, CorpusScenario[]>();
  for (const s of scenarios) {
    const key = `${s.request.method} ${s.request.url}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }
  return groups;
}
