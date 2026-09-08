import { EMBEDDED_PATTERNS, kindForField } from './kinds.js';
import { PseudonymStore } from './pseudonym.js';

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

const HAR_BODY_TEXT_FIELDS = new Set(['text', 'comment', 'postData']);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function scrubString(value: string, field: string, store: PseudonymStore): string {
  // Already a pseudonym from a previous run — idempotence.
  if (store.isPseudonym(value)) return value;

  // Empty/whitespace values carry no identity — never map them (an empty
  // real in the reverse index would corrupt free text via substituteKnown).
  const trimmed = value.trim();
  if (!trimmed) return value;

  const kind = kindForField(field);
  if (kind) return store.pseudonym(kind, trimmed);

  // Free text: replace embedded identifier patterns with stable pseudonyms.
  let out = value;
  for (const p of EMBEDDED_PATTERNS) {
    out = out.replace(p.re, (match) =>
      store.isPseudonym(match) ? match : store.pseudonym(p.kind, match),
    );
  }
  // Names/other structured values already in the map are also scrubbed from
  // free text (e.g. "Patient Adaeze Nnamdi notified" inside a lab comment).
  return store.substituteKnown(out);
}

function scrubNode(node: Json, field: string, store: PseudonymStore): Json {
  if (typeof node === 'string') {
    // Embedded JSON string (e.g. HAR postData.text, response.content.text):
    // parse, scrub structurally, re-stringify so nested clinical objects are
    // handled by field names rather than treated as opaque text.
    if (HAR_BODY_TEXT_FIELDS.has(field)) {
      const trimmed = node.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
          (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed) as Json;
          const scrubbed = scrubNode(parsed, field, store);
          return JSON.stringify(scrubbed);
        } catch {
          /* fall through to plain string scrubbing */
        }
      }
    }
    return scrubString(node, field, store);
  }
  if (Array.isArray(node)) return node.map((item) => scrubNode(item, field, store));
  if (isPlainObject(node)) {
    const out: Record<string, Json> = {};
    for (const [k, v] of Object.entries(node)) out[k] = scrubNode(v as Json, k, store);
    return out;
  }
  return node;
}

/** Scrub any parsed JSON document (HAR files included — they are plain JSON). */
export function scrubJson<T>(doc: T, store: PseudonymStore): T {
  return scrubNode(doc as Json, '', store) as T;
}

/** True when none of the given real PHI values appear in the scrubbed output. */
export function verifyNoRealValues(scrubbed: unknown, realValues: readonly string[]): string[] {
  const serialized = JSON.stringify(scrubbed);
  return realValues.filter((real) => serialized.includes(real));
}
