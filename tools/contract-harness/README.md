# @ehmrs/contract-harness

Dev-stack fixture capture + replay-corpus builder for the Vue 3 migration's
drift gate (issue #36, ADR-0003 / ADR-0005).

Two commands:

## 1. Capture — `npm run capture`

A recording reverse proxy for the **local dev stack only** (never production):

```bash
cd tools/contract-harness
npm run build
npm run capture -- --target http://localhost:4050 --port 4060 --session auth --raw-dir ~/.ehmrs/raw-captures
```

Point whatever you are exercising (curl, the legacy client with
`VUE_APP_BACKEND_URL=http://localhost:4060`, etc.) at the proxy. It records
method / URL / request body / response status + body of every exchange. Stop it
with Ctrl-C: it flushes `<session>.jsonl` into the raw dir. The raw dir **must
live outside the repo** (enforced; default `~/.ehmrs/raw-captures`).

Only method/URL/body/status/body are recorded — never headers — because that is
exactly what the replay contract asserts. Credentials still end up in the raw
file, which is why nothing enters the repo except through step 2.

## 2. Fixtures — `npm run fixtures`

Raw capture → scrubbed replay corpus inside the repo:

```bash
npm run fixtures -- --session auth --flow auth \
  --raw-dir ~/.ehmrs/raw-captures \
  --out ../../client-vue3/src/contract/fixtures/auth.json \
  --known-real '<a real value you just exercised, e.g. the password>'
```

Every value passes the #35 PHI scrubber (stable pseudonyms, JWT/username/
password kinds) before the corpus is written. `--known-real` is the spot-check:
if the value survives, the build aborts and the raw file is kept. On success the
raw file is deleted (ADR-0005).

Corpus format (consumed by `client-vue3/src/contract/replay.ts`):

```json
{
  "version": 1,
  "flow": "auth",
  "capturedAt": "...",
  "scenarios": [
    {
      "name": "POST /auth/login -> 200",
      "request":  { "method": "POST", "url": "/auth/login", "body": { "username": "staff.ab12cd34", "password": "FakePass_00012345" } },
      "response": { "status": 200, "body": { "status": "success", "data": "FAKETOKEN.A1B2..." } }
    }
  ]
}
```

## Rules

- Raw captures and the pseudonym map live outside the repo — enforced, not convention.
- Production is never instrumented (ADR-0005).
- Never hand-edit a corpus to "fix" a test — recapture instead.
