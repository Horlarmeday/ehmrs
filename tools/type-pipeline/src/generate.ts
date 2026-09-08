import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { captureJoiSchemas } from './joi-extract.js';
import { extractInterfaces } from './interface-extract.js';
import { groupByRoute, inferResponseType, type CorpusScenario } from './response-infer.js';

export type RequestSpec =
  | { kind: 'joi'; fn: string; name: string }
  | { kind: 'interface'; file: string; from: string; name: string; omit?: string[] };

export interface ResponseSpec {
  method: string;
  path: string;
  name: string;
}

export interface ModuleConfig {
  flow: string;
  serverDir: string;
  moduleDir: string;
  fixtureFile: string;
  requests: RequestSpec[];
  responses: ResponseSpec[];
}

export interface PipelineConfig {
  outDir: string;
  modules: ModuleConfig[];
}

const HEADER_LINES = [
  `! GENERATED FILE — tools/type-pipeline (issue #39, ADR-0004). Do not edit by hand.`,
  `! Requests derive from the server's Joi schemas / module interfaces (server is read-only);`,
  `! responses are inferred from the scrubbed fixture corpus. Unobserved fields are never invented:`,
  `! fields missing from some observed scenarios are optional. Regenerate: cd tools/type-pipeline && npm run generate.`,
];

function renderInterface(name: string, fields: { name: string; type: string; required: boolean }[]): string {
  if (fields.length === 0) return `export type ${name} = Record<string, unknown>;`;
  const body = fields.map((f) => `  ${f.name}${f.required ? '' : '?'}: ${f.type};`).join('\n');
  return `export interface ${name} {\n${body}\n}`;
}

export function generateModule(config: ModuleConfig): string {
  const blocks: string[] = [];

  const joiSpecs = config.requests.filter((r): r is Extract<RequestSpec, { kind: 'joi' }> => r.kind === 'joi');
  if (joiSpecs.length > 0) {
    const validationsPath = join(config.serverDir, 'src', 'modules', config.moduleDir, 'validations.ts');
    if (!existsSync(validationsPath)) throw new Error(`Server validations not found: ${validationsPath}`);
    const captured = new Map(captureJoiSchemas(config.serverDir, validationsPath).map((c) => [c.fn, c.fields]));
    for (const spec of joiSpecs) {
      const fields = captured.get(spec.fn);
      if (!fields) throw new Error(`No Joi schema captured for ${spec.fn} in ${validationsPath}`);
      blocks.push(renderInterface(spec.name, fields.map((f) => ({ name: f.name, type: f.type, required: f.required }))));
    }
  }

  const ifaceSpecs = config.requests.filter((r): r is Extract<RequestSpec, { kind: 'interface' }> => r.kind === 'interface');
  for (const spec of ifaceSpecs) {
    const file = join(config.serverDir, 'src', 'modules', config.moduleDir, spec.file);
    const found = extractInterfaces(file).find((i) => i.name === spec.from);
    if (!found) throw new Error(`Interface ${spec.from} not found in ${file}`);
    const fields = found.fields
      .filter((f) => !(spec.omit ?? []).includes(f.name))
      .map((f) => ({ name: f.name, type: f.type, required: !f.optional }));
    blocks.push(renderInterface(spec.name, fields));
  }

  if (!existsSync(config.fixtureFile)) throw new Error(`Fixture corpus not found: ${config.fixtureFile}`);
  const corpus = JSON.parse(readFileSync(config.fixtureFile, 'utf8')) as { scenarios?: CorpusScenario[] };
  const scenarios = corpus.scenarios ?? [];
  const groups = groupByRoute(scenarios);
  const seenRoutes = new Set<string>();
  for (const spec of config.responses) {
    const route = `${spec.method} ${spec.path}`;
    seenRoutes.add(route);
    const group = groups.get(route);
    if (!group) throw new Error(`No fixture scenarios captured for ${route} (uncertainty rule: refusing to guess)`);
    blocks.push(renderInterface(spec.name, inferResponseType(group).fields.map((f) => ({ name: f.name, type: f.type, required: !f.optional }))));
  }
  for (const route of groups.keys()) {
    if (!seenRoutes.has(route)) throw new Error(`Fixture scenarios exist for ${route} but no response spec maps them — add a ResponseSpec`);
  }

  return `${HEADER_LINES.map((l) => `// ${l}`).join('\n')}\n\n${blocks.join('\n\n')}\n`;
}

export function loadConfig(path: string, repoRoot: string): PipelineConfig {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as PipelineConfig;
  return {
    outDir: join(repoRoot, raw.outDir),
    modules: raw.modules.map((m) => ({ ...m, serverDir: join(repoRoot, m.serverDir), fixtureFile: join(repoRoot, m.fixtureFile) })),
  };
}
