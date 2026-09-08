import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { assertOutsideRepo } from '@ehmrs/phi-scrubber';

export interface RecordedExchange {
  ts: string;
  method: string;
  /** Path + query, exactly as the client sent it (e.g. /api/auth/login). */
  url: string;
  requestBody: unknown;
  status: number;
  responseBody: unknown;
}

export interface CaptureProxyOptions {
  /** Upstream API origin, e.g. http://localhost:4050 */
  target: string;
  port: number;
  /** Directory (outside the repo) where <session>.jsonl is flushed on stop. */
  rawDir: string;
  session: string;
}

/**
 * Recording reverse proxy for the local dev stack ONLY (ADR-0005 — production
 * is never instrumented). Buffers recorded exchanges in memory and flushes
 * them as one JSONL file when the process is stopped (SIGINT/SIGTERM).
 *
 * Only request method/url/body and response status/body are recorded — no
 * headers — because the replay contract needs exactly those. Everything
 * recorded still goes through the PHI scrubber before it may touch the repo.
 */
export interface CaptureProxyHandle {
  server: ReturnType<typeof createServer>;
  /** Flush recorded exchanges to <rawDir>/<session>.jsonl (without exiting). */
  flush: () => void;
  /** Flush recorded exchanges to <rawDir>/<session>.jsonl and stop. */
  stop: () => void;
  /** Number of exchanges recorded so far. */
  recorded: () => number;
}

export function startCaptureProxy(opts: CaptureProxyOptions): Promise<CaptureProxyHandle> {
  assertOutsideRepo(opts.rawDir, 'Raw capture');

  const exchanges: RecordedExchange[] = [];
  const upstream = new URL(opts.target);

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      const rawBody = Buffer.concat(chunks).toString('utf8');

      const upstreamRes = await fetch(new URL(req.url ?? '/', upstream), {
        method: req.method,
        headers: {
          'content-type': req.headers['content-type'] ?? 'application/json',
          ...(req.headers.authorization
            ? { authorization: req.headers.authorization }
            : {}),
        },
        body: ['GET', 'HEAD'].includes(req.method ?? '') ? undefined : rawBody,
      });

      const resText = await upstreamRes.text();
      let responseBody: unknown = resText;
      try {
        responseBody = JSON.parse(resText);
      } catch {
        /* keep as text */
      }

      let requestBody: unknown = rawBody;
      try {
        requestBody = JSON.parse(rawBody);
      } catch {
        /* keep as text */
      }

      exchanges.push({
        ts: new Date().toISOString(),
        method: req.method ?? 'GET',
        url: req.url ?? '/',
        requestBody,
        status: upstreamRes.status,
        responseBody,
      });

      res.writeHead(upstreamRes.status, {
        'content-type': upstreamRes.headers.get('content-type') ?? 'application/json',
      });
      res.end(resText);
    } catch (err) {
      res.writeHead(502, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'capture-proxy upstream failure', detail: String(err) }));
    }
  });

  const flush = (signal: string) => {
    if (exchanges.length === 0) {
      console.log(`capture-proxy: ${signal} — nothing recorded, nothing written`);
      return;
    }
    mkdirSync(opts.rawDir, { recursive: true });
    const file = join(opts.rawDir, `${opts.session}.jsonl`);
    const lines = exchanges.map((e) => JSON.stringify(e)).join('\n') + '\n';
    writeFileSync(file, lines, 'utf8');
    console.log(`capture-proxy: ${signal} — wrote ${exchanges.length} exchange(s) to ${file}`);
  };

  const handle: CaptureProxyHandle = {
    server,
    flush: () => flush('flush'),
    stop: () => {
      flush('stop');
      server.close(() => process.exit(0));
      // Exit even if a keep-alive connection lingers.
      setTimeout(() => process.exit(0), 500).unref();
    },
    recorded: () => exchanges.length,
  };  process.on('SIGINT', () => handle.stop());
  process.on('SIGTERM', () => handle.stop());

  return new Promise<CaptureProxyHandle>((resolve) => {
    server.listen(opts.port, () => {
      console.log(
        `capture-proxy listening on :${(server.address() as { port: number }).port} → ${opts.target} (session "${opts.session}")`,
      );
      console.log(`raw output on stop: ${join(opts.rawDir, `${opts.session}.jsonl`)}`);
      console.log('stop with Ctrl-C to flush the capture file');
      resolve(handle);
    });
  });
}
