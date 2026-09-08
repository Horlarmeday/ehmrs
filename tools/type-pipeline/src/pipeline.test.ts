import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { joiSchemaToFields, captureJoiSchemas, type JoiDescribe } from './joi-extract.js';
import { extractInterfaces } from './interface-extract.js';
import { inferResponseType, type CorpusScenario } from './response-infer.js';
import { generateModule, loadConfig, type ModuleConfig } from './generate.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..');

function objDesc(keys: Record<string, unknown>, flags?: Record<string, unknown>): JoiDescribe {
  return { type: 'object', keys, ...(flags ? { flags } : {}) } as JoiDescribe;
}

describe('joi describe -> TS', () => {
  it('marks required and optional fields', () => {
    const fields = joiSchemaToFields(
      objDesc({
        username: { type: 'string', flags: { presence: 'required' } },
        nickname: { type: 'string' },
      }),
    );
    expect(fields).toEqual([
      { name: 'username', type: 'string', required: true },
      { name: 'nickname', type: 'string', required: false },
    ]);
  });

  it('renders nested objects and arrays', () => {
    const fields = joiSchemaToFields(
      objDesc({
        item: objDesc({ id: { type: 'number', flags: { presence: 'required' } } }, { presence: 'required' }),
        tags: { type: 'array', items: [{ type: 'string' }] },
      }),
    );
    expect(fields.find((f) => f.name === 'item')).toEqual({ name: 'item', type: '{ id: number }', required: true });
    expect(fields.find((f) => f.name === 'tags')).toEqual({ name: 'tags', type: 'string[]', required: false });
  });
});

describe('interface extraction', () => {
  it('extracts optionality, literals, arrays and nested interface references', () => {
    const dir = mkdtempSync(join(tmpdir(), 'type-pipeline-'));
    const file = join(dir, 'types.ts');
    writeFileSync(
      file,
      [
        'export interface Inner { id: number; }',
        'export interface Outer {',
        '  name: string;',
        '  label?: string;',
        "  kind: 'a' | 'b';",
        '  ids: number[];',
        '  inner: Inner;',
        '  whatever: Date;',
        '}',
      ].join('\n'),
      'utf8',
    );
    try {
      const outer = extractInterfaces(file).find((i) => i.name === 'Outer')!;
      expect(outer.fields).toEqual([
        { name: 'name', type: 'string', optional: false },
        { name: 'label', type: 'string', optional: true },
        { name: 'kind', type: '"a" | "b"', optional: false },
        { name: 'ids', type: 'number[]', optional: false },
        { name: 'inner', type: '{ id: number }', optional: false },
        { name: 'whatever', type: 'unknown', optional: false },
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('response inference (uncertainty rule)', () => {
  const scenario = (name: string, body: unknown): CorpusScenario => ({
    name,
    request: { method: 'POST', url: '/api/x', body: {} },
    response: { status: 200, body },
  });

  it('fields present in only some scenarios are optional; never-observed fields do not exist', () => {
    const inferred = inferResponseType([
      scenario('a', { status: 'success', message: 'ok', data: 'tok' }),
      scenario('b', { status: 'error', httpCode: 400, message: 'bad' }),
      scenario('c', { message: 'short' }),
    ]);
    expect(inferred.fields).toEqual([
      { name: 'data', type: 'string', optional: true },
      { name: 'httpCode', type: 'number', optional: true },
      { name: 'message', type: 'string', optional: false },
      { name: 'status', type: '"error" | "success"', optional: true },
    ]);
  });

  it('rejects mixed routes', () => {
    const mixed: CorpusScenario[] = [
      scenario('a', {}),
      { name: 'b', request: { method: 'GET', url: '/api/y' }, response: { status: 200, body: {} } },
    ];
    expect(() => inferResponseType(mixed)).toThrow(/expected/);
  });
});

describe('generation', () => {
  const config = (): ModuleConfig => {
    const dir = mkdtempSync(join(tmpdir(), 'type-pipeline-'));
    const ifaceFile = join(dir, 'src', 'modules', 'Demo', 'iface.ts');
    mkdirSync(join(dir, 'src', 'modules', 'Demo'), { recursive: true });
    writeFileSync(ifaceFile, 'export interface Payload { name: string; note?: string; }', 'utf8');
    const fixtureFile = join(dir, 'corpus.json');
    writeFileSync(
      fixtureFile,
      JSON.stringify({
        scenarios: [
          { name: 'a', request: { method: 'POST', url: '/api/x' }, response: { status: 200, body: { status: 'success', data: 'x' } } },
          { name: 'b', request: { method: 'POST', url: '/api/x' }, response: { status: 400, body: { message: 'no' } } },
        ],
      }),
      'utf8',
    );
    return {
      flow: 'demo',
      serverDir: dir,
      moduleDir: 'Demo',
      fixtureFile,
      requests: [{ kind: 'interface', file: 'iface.ts', from: 'Payload', name: 'DemoRequest' }],
      responses: [{ method: 'POST', path: '/api/x', name: 'DemoResponse' }],
    };
  };

  it('is deterministic and applies the uncertainty rule', () => {
    const cfg = config();
    const first = generateModule(cfg);
    const second = generateModule(cfg);
    expect(first).toEqual(second);
    expect(first).toContain('export interface DemoRequest {\n  name: string;\n  note?: string;\n}');
    expect(first).toContain('data?: string;');
    expect(first).toContain('message?: string;');
    rmSync(cfg.serverDir, { recursive: true, force: true });
  });

  it('refuses to emit a response type with no observed fixtures', () => {
    const cfg = config();
    const missing = { ...cfg, responses: [{ method: 'POST', path: '/api/never', name: 'Ghost' }] };
    expect(() => generateModule(missing)).toThrow(/refusing to guess/);
    rmSync(cfg.serverDir, { recursive: true, force: true });
  });
});

describe('auth module against real server + committed corpus', () => {
  it('captures Joi request schemas from the server validations (read-only)', () => {
    const captured = new Map(
      captureJoiSchemas(join(repoRoot, 'server'), join(repoRoot, 'server', 'src', 'modules', 'Auth', 'validations.ts')).map((c) => [c.fn, c.fields]),
    );
    expect(captured.get('validateLogin')).toEqual([
      { name: 'password', type: 'string', required: true },
      { name: 'username', type: 'string', required: true },
    ]);
    expect(captured.get('validateForgotPassword')).toEqual([{ name: 'phone', type: 'string', required: true }]);
  });

  it('regeneration is byte-stable and matches the committed snapshot', () => {
    const pipeline = loadConfig(join(repoRoot, 'tools', 'type-pipeline', 'config', 'modules.json'), repoRoot);
    const auth = pipeline.modules.find((m) => m.flow === 'auth')!;
    const generated = generateModule(auth);
    expect(generated).toEqual(generateModule(auth));
    const committed = readFileSync(join(pipeline.outDir, 'auth.ts'), 'utf8');
    expect(generated).toEqual(committed);
    expect(generated).toContain('message: string;');
    expect(generated).toContain('httpCode?: number;');
    expect(generated).toContain('data?: string;');
  });
});
