# Issue 36 — [Foundation 3/8] Contract harness — fixture capture from dev stack + MSW replay runner

Parent: #33 (Vue 2 → Vue 3 migration PRD) · ADR-0003 · ADR-0005 · Branch: `36-contract-harness` (from `svsh_branch`, merged `35-phi-scrubber` in first — #36 is blocked by #35 and its commit had not reached `svsh_branch`)

## What we build

The migration's primary drift gate:

1. **Capture** — a recording HTTP proxy run against the local dev stack (api on :4050). It records method/URL/body → status/body pairs into a raw dir **outside the repo**, then pipes them through the #35 PHI scrubber before fixtures are written into the repo as the replay corpus. Raw files deleted after scrub; production never instrumented.
2. **Replay** — an MSW-based runner for Vitest in `client-vue3/` that proves ported Pinia stores behavior-identical: same store call in ⇒ same HTTP request out (method, URL, payload); same response in ⇒ same state transition. Includes a self-test that proves the harness **fails a deliberately drifted store**, plus the first exemplar port (auth store) so the contract-test template is real, not hypothetical.

## Tasks

- [x] Create branch `36-contract-harness` from `svsh_branch` (merged `35-phi-scrubber` for the dependency)
- [x] Extend phi-scrubber with credential-safe kinds: `token` (embedded JWT `eyJ…` pattern + `token`/`authorization`/`jwt`/`api_key` fields), `password`, `username` → stable fakes; empty-string values never mapped (bug found live: an empty username's pseudonym corrupted a validation message via free-text substitution — fixed + regression test) (15/15 tests)
- [x] `tools/contract-harness/` package (npm):
  - `src/proxy.ts` + `npm run capture` — recording proxy `:4060 → :4050`, flushes `<session>.jsonl` to `~/.ehmrs/raw-captures/` on stop (outside repo, enforced); records only method/url/body + status/body (no headers)
  - `src/corpus.ts` + `npm run fixtures` — raw JSONL → scrub (phi-scrubber programmatic API) → replay-corpus JSON (`{version, flow, scenarios:[{name, request, response}]}`) into `client-vue3/src/contract/fixtures/`, `--known-real` self-check aborts + keeps raw on leak, raw deleted after success
  - 3 unit tests (proxy round-trip recording, corpus scrub/shape/stability, self-check abort) — green
  - README documenting the capture workflow against the dev stack
- [x] `client-vue3/`: added `pinia`, `msw`, `axios`
- [x] Port auth store under ADR-0003 dialect: `src/stores/auth.ts` (id `auth`; `login/register/forgot` actions with byte-identical axios calls; mutations → same-named actions; same state shape + localStorage semantics; mapping deviation documented: legacy dispatch `logout` → `logoutSession`, name clash with the ported mutation-action)
- [x] Replay runner `src/contract/replay.ts` (queue-based catch-all MSW handler; request drift ⇒ 599 + recorded failure; leftover queue ⇒ under-call failure; `/api` baseURL prefix tolerance) + `src/contract/contractTest.ts` (`runContractCase` + `defineContractSuite` template: request-out, state-in snapshot, rejection expectation, side-effect assertions)
- [x] `src/contract/__tests__/auth.contract.spec.ts` — 3 captured scenarios green (expectations authored from legacy Vuex module semantics, not the port)
- [x] `src/contract/__tests__/harness.self-test.spec.ts` — faithful port passes; wrong-URL / wrong-method / wrong-payload / no-HTTP-call / wrong-state-transition stores all FAIL the runner
- [x] Capture session (auth flow) against local dev API: temp staff row (`contract_capture`, deleted after capture; staff id 312), proxy on :4060, exercised `POST /api/auth/login` success (200) + bad password (400) + validation error (400); corpus generated with 3 `--known-real` values; final grep of fixture for `Capture|contract_capture|eyJ` = 0 hits
- [x] Verify: phi-scrubber 15/15 + build; contract-harness 3/3 + build; client-vue3 lint 0 errors / build (vue-tsc + vite) green / 10/10 tests; negative control — deliberately breaking the ported store's URL fails all 3 contract tests, reverting restores green
- [x] Commit as `feat(#36): contract harness — dev-stack capture + MSW replay runner`; PR to `svsh_branch`

## Acceptance criteria (from issue)

- [x] Capture workflow documented and runnable against local dev stack (`tools/contract-harness/README.md`; executed live this session)
- [x] Auth-flow fixtures captured and scrubbed; usable as replay corpus (`client-vue3/src/contract/fixtures/auth.json`, 3 scenarios)
- [x] Replay runner integrated with Vitest; harness self-test proves it catches a deliberately drifted store (5 drift modes caught)
- [x] Contract test template established for store ports (`defineContractSuite` / `runContractCase`: request-out + state-in assertions)
- [x] No raw PHI in repo; scrubber in the pipeline (scrubber runs before anything enters the repo; raw dir/map outside repo enforced; self-check + manual grep clean)

## Review

- Summary: `tools/contract-harness/` (capture proxy + corpus builder over the #35 scrubber) and `client-vue3/src/contract/` (MSW queue-replay server + contract-test template) with the auth store as the first exemplar port and a self-test proving the gate fails drifted stores. phi-scrubber extended with token/password/username kinds.
- Technical decisions: queue-based single catch-all MSW handler instead of per-route handlers — the handler itself verifies method/URL/payload against the queue head and answers drift with 599, so a permissive mock can never let a wrong request pass; scenario-name-derived expectations are authored from the LEGACY Vuex module so the test is a gate, not a tautology; corpus URLs captured through the `/api` mount prefix exactly as the legacy client sends them (runner also tolerates the bare path); only method/URL/body/status recorded (never headers) because that is exactly the contract surface.
- Impact: additive; no server or legacy-client changes. Dev DB touched only by a temporary staff row, deleted after capture.
- Testing evidence: phi-scrubber 15/15; contract-harness 3/3; client-vue3 10/10, lint clean, vue-tsc+vite build green; negative control (broken URL in the port) fails all contract tests; fixture grep for known reals = 0.
- Limitations: corpus captures are sequential replays (no parallel/interleaved sessions yet); only the auth flow is in the corpus; JWT fakes are opaque strings so token-claim-dependent behavior can't be replayed (none in the auth store).
- Future: per-store corpus growth as modules port; fold corpus regeneration into a capture checklist doc when bulk capture begins (Phase 1); consider capturing through the legacy client itself (HAR) for view-driven flows.
