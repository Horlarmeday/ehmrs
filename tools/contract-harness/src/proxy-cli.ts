import { join } from 'path';
import { homedir } from 'os';
import { startCaptureProxy } from './proxy.js';

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  return process.argv[i + 1];
}

const target = arg('target', 'http://localhost:4050')!;
const port = Number(arg('port', '4060'));
const session = arg('session', new Date().toISOString().replace(/[:.]/g, '-'))!;
const rawDir = arg('raw-dir', join(homedir(), '.ehmrs', 'raw-captures'))!;

startCaptureProxy({ target, port, rawDir, session }).catch((err) => {
  console.error(err);
  process.exit(1);
});
