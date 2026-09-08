# Issue 39 — [Foundation 6/8] Type pipeline v1 — requests from server Joi, responses inferred from fixtures

Parent: #33 (Vue 2 → Vue 3 migration PRD) · ADR-0004 · Branch: `39-type-pipeline` (from `svsh_branch`; #36 harness already merged)

## What we build

The ADR-0004 type pipeline proven on the auth module (patient as stretch, dropped this round — auth alone exercises every pipeline feature; patient reuses the same config shape when its corpus lands):

1. **Request types** — generated from the server's own ground truth. Joi schemas in `server/src/modules/<M>/validations.ts` are loaded (server read-only) and converted via `schema.describe()`; module TS interfaces (`interface/*.ts`, `types/*.ts`) are extracted via the TypeScript AST. The server is never modified.
2. **Response types** — inferred from the #36 scrubbed fixture corpus (`client-vue3/src/contract/fixtures/*.json`). The envelope (`status`/`message`/`data` vs error `status`/`httpCode`/`message`) comes from the server's response helpers; payload `data` types are inferred only from observed values.
3. **Uncertainty rule** — a field observed in *some* scenarios of a response group is emitted optional; a field never observed is never invented. Demonstrated explicitly by a committed snapshot (e.g. `LoginError` has no `data`, the bare Joi-400 variant has only `message`, so every field is optional).
4. Generated types are **committed, reviewed code** in `client-vue3/src/types/api/`, regenerable via one command; `--check` mode exits non-zero when regeneration would change committed files (stable-diff gate for PRs).

## Tasks

- [x] Branch `39-type-pipeline` from `svsh_branch`
- [x] `tools/type-pipeline/` package (npm, TS, vitest):
  - [x] `src/joi-extract.ts` — load server `validations.ts` with `ts-node` transpile-only + capture `Joi.object(...)` schemas via a monkeypatched `Joi.object` (same joi instance from `server/node_modules`), convert `describe()` → TS types (required vs optional, string/number/boolean, min/max → literal-free primitives, unknown keys stripped)
  - [x] `src/interface-extract.ts` — TypeScript AST extraction of exported interfaces from module `interface/*.ts` / `types/*.ts` (property optionality, primitive/string-literal/array/nested-interface reference)
  - [x] `src/response-infer.ts` — group corpus scenarios by `method + path`; merge observed response bodies; envelope-aware (`status: 'success' | 'error'` observed literals); uncertainty rule: present-in-all → required, present-in-some → optional, never-present → absent
  - [x] `src/generate.ts` + `src/cli.ts` — config-driven emission of `client-vue3/src/types/api/<flow>.ts` (stable ordering, `! generated` header comments permitted by `local/no-comments`); `--check` snapshot-diff mode for CI/PRs
  - [x] Unit tests: Joi conversion (required/optional/nested), interface extraction, response inference incl. uncertainty demonstration (some-scenarios-only field ⇒ optional), generator determinism (two runs byte-identical), `--check` fails on drift and passes when committed
- [x] Generate + commit `client-vue3/src/types/api/auth.ts` (requests: `LoginRequest` from `validateLogin` Joi, `ForgotPasswordRequest` from `validateForgotPassword` Joi, `ChangePasswordRequest` from `ChangePasswordParam` minus server-injected `user_id`; responses inferred from the 3 captured login scenarios)
- [x] Client-side gate: `client-vue3/src/types/api/__tests__/auth.types.spec.ts` — asserts committed file satisfies the uncertainty rule (optional `httpCode?`/`data?`, literal `status`) and envelope shapes; runs with the rest of the suite
- [x] `tools/type-pipeline/README.md` — reuse doc for every later domain (config, run, check, add-a-module)
- [x] Verify: tool tests green + typecheck/build; client-vue3 lint 0 errors, vue-tsc build green, full vitest suite green
- [x] Commit `feat(#39): type pipeline v1 — requests from server Joi, responses inferred from fixtures`; PR to `svsh_branch`

## Acceptance criteria (from issue)

- [x] Request-type generation runnable from server Joi/types for auth
- [x] Response-type inference from scrubbed fixtures implemented
- [x] Unobserved fields surface as optional/unknown (demonstrated in snapshot + tests)
- [x] Snapshot test committed; regeneration produces stable diffs (`--check` + determinism tests + client spec)
- [x] Pipeline documented for reuse by every later domain (tool README)

## Review

- Summary: new `tools/type-pipeline/` package reads the server (never modifies it) and the #36 fixture corpus and emits `client-vue3/src/types/api/auth.ts` — request types from the auth module's Joi schemas (`validateLogin`, `validateForgotPassword`) and `ChangePasswordParam` interface (minus the server-injected `user_id`), response types merged from the 3 captured login scenarios with the uncertainty rule enforced (fields missing in some scenarios are optional; e.g. the bare Joi-400 response makes `status`/`httpCode` optional on the login error type).
- Technical decisions: (a) Joi capture via monkeypatched `Joi.object` while requiring `validations.ts` under `ts-node` transpile-only with the *server's own* joi — `schema.describe()` is data, so no codegen fork of joi-to-typescript is needed and exact server semantics (`.required()`, optionality flags) are honored; (b) interface extraction walks the TS AST rather than regex, so nested references and optionality stay faithful; (c) response grouping by `METHOD /path` with per-field presence counting: `presentInAll → required`, `presentInSome → optional` — the uncertainty rule falls out structurally instead of being a hand-enforced convention; (d) `--check` mode makes regeneration a PR-diffable gate (regenerate → diff → review), matching the "committed, reviewed code" ADR consequence; (e) envelope knowledge is limited to what the server helpers actually send (`successResponse` / `errorResponse` / the controller's bare `{message}` 400) — no guessed fields.
- Impact: additive. New tool package + one generated client file + one client test. No server, legacy-client, or harness changes.
- Testing evidence: tool 8/8 vitest green, `tsc` typecheck/build green; client-vue3 `eslint .` 0 errors, `vue-tsc -b && vite build` green, vitest suite (11 files, incl. new types spec) green; determinism test proves byte-identical regeneration; `--check` negative control (tampered committed file ⇒ exit 1).
- Limitations: inference is structural (JSON value shapes + observed literal unions), so semantic types (e.g. ISO-date strings) surface as `string` until a domain adds narrowing; only the auth corpus exists, so only auth response types are emitted; `ChangePasswordRequest` derives from the service interface because the route has no Joi schema (matches server ground truth — nothing is invented).
- Future: per-domain config entries as modules port (patient is next once its corpus is captured); consider a CI job running `npm run check` to force type-regen diffs to be explicit in PRs.
