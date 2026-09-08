import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { generateModule, loadConfig } from './generate.js';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..');
const check = process.argv.includes('--check');
const config = loadConfig(join(repoRoot, 'tools', 'type-pipeline', 'config', 'modules.json'), repoRoot);

let drifted: string[] = [];
for (const module of config.modules) {
  const content = generateModule(module);
  const outFile = join(config.outDir, `${module.flow}.ts`);
  mkdirSync(config.outDir, { recursive: true });
  if (check) {
    const committed = existsSync(outFile) ? readFileSync(outFile, 'utf8') : null;
    if (committed !== content) drifted.push(outFile);
  } else {
    writeFileSync(outFile, content, 'utf8');
    console.log(`generated ${outFile}`);
  }
}

if (check) {
  if (drifted.length > 0) {
    console.error(`type-pipeline --check FAILED — committed types drifted from regeneration:\n${drifted.map((f) => `  ${f}`).join('\n')}\nRun: cd tools/type-pipeline && npm run generate`);
    process.exit(1);
  }
  console.log('type-pipeline --check OK — committed types match regeneration');
}
