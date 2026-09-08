import { resolve } from 'path';

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  return process.argv[i + 1];
}

function args(name: string): string[] {
  const out: string[] = [];
  const argv = process.argv;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === `--${name}` && i + 1 < argv.length) out.push(argv[i + 1]!);
  }
  return out;
}

function required(name: string): string {
  const v = arg(name);
  if (!v) {
    console.error(`missing required flag --${name}`);
    process.exit(2);
  }
  return v;
}

async function main() {
  const { buildCorpus } = await import('./corpus.js');
  const session = required('session');
  const flow = required('flow');
  const outFile = resolve(required('out'));
  const rawDir = arg('raw-dir');
  const known = args('known-real');
  const keepRaw = process.argv.includes('--keep-raw');

  const result = buildCorpus({
    session,
    flow,
    outFile,
    rawDir: rawDir ?? resolve('.'),
    knownRealValues: known.length > 0 ? known : undefined,
    keepRaw,
  });
  console.log(
    `corpus "${flow}" written to ${outFile} (${result.scenarios} scenario(s)); ` +
      'raw capture deleted after successful scrub',
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
