import { createRequire } from 'module';
import { join } from 'path';
import { pathToFileURL } from 'url';

type Prettier = {
  format: (source: string, options: Record<string, unknown>) => Promise<string>;
  resolveConfig: (file: string) => Promise<Record<string, unknown> | null>;
};

/**
 * Formats generated code with the client's own prettier and the repo `.prettierrc`,
 * so `npm run format` in client-vue3 never changes a generated file and `--check` stays meaningful.
 */
export async function formatLikeRepo(source: string, outFile: string, repoRoot: string): Promise<string> {
  const requireFromClient = createRequire(join(repoRoot, 'client-vue3', 'package.json'));
  const loaded = (await import(pathToFileURL(requireFromClient.resolve('prettier')).href)) as { default?: Prettier } & Prettier;
  const prettier = loaded.default ?? loaded;
  const options = (await prettier.resolveConfig(outFile)) ?? {};
  return prettier.format(source, { ...options, filepath: outFile });
}
