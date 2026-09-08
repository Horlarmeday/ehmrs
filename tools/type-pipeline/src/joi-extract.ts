import { createRequire } from 'module';

export interface JoiField {
  name: string;
  type: string;
  required: boolean;
}

export interface CapturedJoiSchema {
  /** Name of the exported validation function that built the schema. */
  fn: string;
  fields: JoiField[];
}

export interface JoiDescribe {
  type: string;
  flags?: { presence?: string; only?: boolean };
  keys?: Record<string, JoiDescribe>;
  items?: JoiDescribe[];
}

function describeToType(desc: JoiDescribe): { type: string; required: boolean } {
  const required = desc.flags?.presence === 'required';
  const inner = (): string => {
    switch (desc.type) {
      case 'object': {
        const keys = desc.keys ?? {};
        const rendered = Object.entries(keys).map(([name, child]) => {
          const t = describeToType(child);
          return `${name}${t.required ? '' : '?'}: ${t.type}`;
        });
        if (rendered.length === 0) return 'Record<string, unknown>';
        return `{ ${rendered.join('; ')} }`;
      }
      case 'array': {
        const first = desc.items?.[0];
        return first ? `${describeToType(first).type}[]` : 'unknown[]';
      }
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'date':
        return 'string';
      case 'string':
      default:
        return 'string';
    }
  };
  return { type: inner(), required };
}

export function joiSchemaToFields(describe: JoiDescribe): JoiField[] {
  if (describe.type !== 'object' || !describe.keys) return [];
  return Object.entries(describe.keys).map(([name, child]) => {
    const t = describeToType(child);
    return { name, type: t.type, required: t.required };
  });
}

/**
 * Load the server's validations.ts (read-only) under ts-node transpile-only,
 * capture the Joi.object(...) schemas it builds by intercepting Joi.object on
 * the server's own joi instance, and return each validation function's schema.
 */
export function captureJoiSchemas(serverDir: string, validationsPath: string): CapturedJoiSchema[] {
  const require_ = createRequire(`${serverDir}/package.json`);
  const joiPath = require_.resolve('joi');
  const joi = require_(joiPath) as { object: (...args: unknown[]) => unknown };
  const tsNode = require_('ts-node') as { register: (opts: unknown) => void };

  const captured: { schema: { describe: () => JoiDescribe } }[] = [];
  const originalObject = joi.object.bind(joi);
  (joi as Record<string, unknown>).object = (...args: unknown[]) => {
    const schema = originalObject(...args) as { describe: () => JoiDescribe };
    captured.push({ schema });
    return schema;
  };

  tsNode.register({
    transpileOnly: true,
    project: `${serverDir}/tsconfig.json`,
    compilerOptions: { module: 'commonjs' },
  });

  let validations: Record<string, unknown>;
  try {
    const mod = require_(validationsPath) as Record<string, unknown>;
    validations = mod.default && typeof mod.default === 'object' ? { ...mod.default as Record<string, unknown>, ...mod } : mod;
    const result: CapturedJoiSchema[] = [];
    for (const [fn, value] of Object.entries(validations)) {
      if (typeof value !== 'function' || fn === 'default' || fn.startsWith('__')) continue;
      const before = captured.length;
      try {
        (value as (input: unknown) => unknown)({});
      } catch {
        // validation may throw on the empty probe; the schema was still built
      }
      const built = captured.slice(before);
      const schema = built.length > 0 ? built[built.length - 1].schema : undefined;
      if (schema) result.push({ fn, fields: joiSchemaToFields(schema.describe()) });
    }
    return result;
  } finally {
    (joi as Record<string, unknown>).object = originalObject;
  }
}
