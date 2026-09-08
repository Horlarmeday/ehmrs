import { createServer } from 'http';
import { mkdtempSync, rmSync, readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildCorpus } from '../src/corpus.js';
import { startCaptureProxy } from '../src/proxy.js';

let dir: string;
let rawDir: string;
let mapPath: string;

const realJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.4AdcjXoTF0backf4bf4zKPl6Wg80';

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'harness-'));
  rawDir = join(dir, 'raw');
  mapPath = join(dir, 'map.json');
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function writeRaw(session: string, entries: object[]) {
  mkdirSync(rawDir, { recursive: true });
  writeFileSync(
    join(rawDir, `${session}.jsonl`),
    entries.map((e) => JSON.stringify(e)).join('\n') + '\n',
  );
}

describe('capture proxy', () => {
  it('records the exchange and proxies the response through', async () => {
    const upstream = createServer((req, res) => {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', data: realJwt }));
      });
    });
    await new Promise<void>((r) => upstream.listen(0, r));
    const upstreamPort = (upstream.address() as { port: number }).port;

    const proxy = await startCaptureProxy({
      target: `http://127.0.0.1:${upstreamPort}`,
      port: 0,
      rawDir,
      session: 'proxy-test',
    });
    const proxyPort = (proxy.server.address() as { port: number }).port;

    const res = await fetch(`http://127.0.0.1:${proxyPort}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'SuperSecret1!' }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: string };
    expect(body.data).toBe(realJwt);
    expect(proxy.recorded()).toBe(1);

    // flush() writes the raw JSONL; stop() would exit the process.
    proxy.flush();
    proxy.server.closeAllConnections?.();
    proxy.server.close();
    const raw = readFileSync(join(rawDir, 'proxy-test.jsonl'), 'utf8');
    const entry = JSON.parse(raw.trim()) as {
      method: string;
      url: string;
      requestBody: { username: string };
      status: number;
    };
    expect(entry.method).toBe('POST');
    expect(entry.url).toBe('/auth/login');
    expect(entry.requestBody.username).toBe('admin');
    expect(entry.status).toBe(200);
    upstream.close();
  });
});

describe('buildCorpus', () => {
  it('scrubs credentials, shapes scenarios, deletes raw after success', () => {
    writeRaw('auth', [
      {
        ts: '2026-09-08T00:00:00.000Z',
        method: 'POST',
        url: '/auth/login',
        requestBody: { username: 'admin', password: 'SuperSecret1!' },
        status: 200,
        responseBody: { status: 'success', data: realJwt },
      },
      {
        ts: '2026-09-08T00:00:01.000Z',
        method: 'POST',
        url: '/auth/login',
        requestBody: { username: 'admin', password: 'wrongpw' },
        status: 401,
        responseBody: { message: 'Incorrect username or password' },
      },
    ]);

    const outFile = join(dir, 'auth.json');
    const { scenarios } = buildCorpus({
      rawDir,
      session: 'auth',
      flow: 'auth',
      outFile,
      mapPath,
      knownRealValues: ['SuperSecret1!', realJwt, 'admin'],
    });

    expect(scenarios).toBe(2);
    const corpus = JSON.parse(readFileSync(outFile, 'utf8'));
    expect(corpus.version).toBe(1);
    expect(corpus.flow).toBe('auth');
    expect(corpus.scenarios[0].name).toBe('POST /auth/login -> 200');
    expect(corpus.scenarios[1].name).toBe('POST /auth/login -> 401');
    // Credentials scrubbed
    expect(JSON.stringify(corpus)).not.toContain('SuperSecret1!');
    expect(JSON.stringify(corpus)).not.toContain(realJwt);
    expect(JSON.stringify(corpus)).not.toContain('"admin"');
    // Raw deleted
    expect(existsSync(join(rawDir, 'auth.jsonl'))).toBe(false);

    // Stability: same inputs on a second build → identical corpus
    writeRaw('auth', [
      {
        ts: '2026-09-08T00:00:00.000Z',
        method: 'POST',
        url: '/auth/login',
        requestBody: { username: 'admin', password: 'SuperSecret1!' },
        status: 200,
        responseBody: { status: 'success', data: realJwt },
      },
    ]);
    const outFile2 = join(dir, 'auth2.json');
    buildCorpus({ rawDir, session: 'auth', flow: 'auth', outFile: outFile2, mapPath });
    const corpus2 = JSON.parse(readFileSync(outFile2, 'utf8'));
    expect(corpus2.scenarios[0].request.body).toEqual(corpus.scenarios[0].request.body);
    expect(corpus2.scenarios[0].response.body).toEqual(corpus.scenarios[0].response.body);
  });

  it('aborts (and keeps raw) when a known real value survives scrubbing', () => {
    writeRaw('auth', [
      {
        ts: '2026-09-08T00:00:00.000Z',
        method: 'POST',
        url: '/auth/login',
        requestBody: { username: 'admin', password: 'SuperSecret1!' },
        status: 200,
        responseBody: { message: 'ok' },
      },
    ]);
    expect(() =>
      buildCorpus({
        rawDir,
        session: 'auth',
        flow: 'auth',
        outFile: join(dir, 'out.json'),
        mapPath,
        knownRealValues: ['ok'],
      }),
    ).toThrow(/Self-check FAILED/);
    expect(existsSync(join(rawDir, 'auth.jsonl'))).toBe(true);
  });
});
