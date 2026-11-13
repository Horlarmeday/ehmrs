import { computed, type WritableComputedRef } from 'vue';
import { useRoute, useRouter, type LocationQuery, type Router } from 'vue-router';

export interface RouteField<T> {
  fallback: T;
  parse: (raw: string) => T | undefined;
  serialize: (value: T) => string | null;
}

export function intField(options: {
  fallback: number;
  min?: number;
  max?: number;
}): RouteField<number> {
  const min = options.min ?? Number.MIN_SAFE_INTEGER;
  const max = options.max ?? Number.MAX_SAFE_INTEGER;
  return {
    fallback: options.fallback,
    parse: (raw) => {
      if (!/^-?\d{1,15}$/.test(raw)) return undefined;
      const value = Number(raw);
      return value >= min && value <= max ? value : undefined;
    },
    serialize: (value) => String(value),
  };
}

export function textField(
  options: { fallback?: string; maxLength?: number } = {}
): RouteField<string> {
  const maxLength = options.maxLength ?? 100;
  return {
    fallback: options.fallback ?? '',
    parse: (raw) => (raw.length <= maxLength ? raw : undefined),
    serialize: (value) => value || null,
  };
}

export function choiceField<T extends string>(
  choices: readonly T[],
  fallback: T | null = null
): RouteField<T | null> {
  return {
    fallback,
    parse: (raw) => choices.find((choice) => choice === raw),
    serialize: (value) => value,
  };
}

export function numberChoiceField(
  choices: readonly number[],
  fallback: number
): RouteField<number> {
  return {
    fallback,
    parse: (raw) => choices.find((choice) => String(choice) === raw),
    serialize: (value) => String(value),
  };
}

const pending = new WeakMap<Router, LocationQuery>();

function queue(router: Router, current: LocationQuery, key: string, value: string | null): void {
  const waiting = pending.get(router);
  const query: LocationQuery = { ...(waiting ?? current) };
  if (value === null) delete query[key];
  else query[key] = value;
  pending.set(router, query);
  if (waiting) return;
  queueMicrotask(() => {
    const next = pending.get(router);
    pending.delete(router);
    if (next) router.replace({ query: next });
  });
}

function single(query: LocationQuery, key: string): string | undefined {
  const raw = query[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === 'string' ? value : undefined;
}

export function useRouteParam<T>(key: string, field: RouteField<T>): WritableComputedRef<T> {
  const route = useRoute();
  const router = useRouter();
  return computed({
    get: () => {
      const raw = single(route.query, key);
      const parsed = raw === undefined ? undefined : field.parse(raw);
      return parsed === undefined ? field.fallback : parsed;
    },
    set: (value) => {
      queue(router, route.query, key, value === field.fallback ? null : field.serialize(value));
    },
  });
}
