# #44 — AGENTS.md migration governance

Status: **implemented.** The owner said "go ahead" on 2026-11-28 without answering Q1–Q5; the recommended options were used (Decisions, below).

## Sources read

- Issue #44 (no comments), PRD #33, ADR-0002 to ADR-0010, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `docs/migration/domain-slice-playbook.md`, `client-vue3/README.md`, `client-vue3/eslint.config.js` (`local/no-comments`), `.husky/pre-commit`, `tasks/42-auth-tracer-bullet.md`.

## Is it still relevant?

**Yes, partly done, partly stale.**

What already exists:

- `docs/migration/domain-slice-playbook.md` (written in #42) has the trace table template, a rule transcription template, the store mapping table template, PHI fixture steps, and the finish-line commands. It is a *workflow*; it does not state the *rules* with ADR references.

What is missing (the actual #44 acceptance criteria):

| AC | State today |
| --- | --- |
| AGENTS.md carries all governance rules with ADR refs | **Missing.** AGENTS.md has onboarding and commands only; it links `docs/adr/` once. |
| Three table templates | Present in the playbook, **not in AGENTS.md**. |
| Transcription table has a *message* column; legacy messages copied exactly | **Missing.** The playbook's template has "Field (message name)" (the `data-vv-as` name), not the message text. |
| Twin-patch stated as merge-blocking | **Missing** everywhere except ADR-0008. |
| Stop-and-ask rule | **Missing** (only in ADR-0004's last line). |
| Kit rules with ADR-0010 | **Missing.** |
| Local test commands (no CI) | Server and legacy only; **no `client-vue3` or `tools/*` commands.** |

What is now wrong in AGENTS.md (found while checking):

- It says `client-vue3/` is "only a built `dist/` of an abandoned Vue 3 attempt. Not active source". False since #34–#42: it is the live migration target with 186 routed views, stores, kit, archetypes and e2e.
- Its "Docker" section tells agents to run the stack with docker-compose. The owner rule is native stack, no Docker (the playbook already says so).
- `CLAUDE.md` contains only the code-review-graph block, so Claude Code never reads AGENTS.md; `GEMINI.md` is identical. The governance would be invisible to Claude unless CLAUDE.md imports it.
- The husky pre-commit lints `server` and `client` only, not `client-vue3`.
- ADR-0002's 2026-11-01 amendment (script may be reorganised across components; the freeze line still holds; behaviour tests replace the per-view line diff) is not reflected in the issue text. AGENTS.md must state the amended rule, not the original.

## Goal

One place an agent reads before touching the migration that tells it, with ADR references: what is frozen, what is free, how to translate, what to record, when to stop and ask, and how to prove it locally. The playbook stays the step-by-step workflow and links back to AGENTS.md for the rules.

## Plan

Effort: S < 1h, M 1–3h, L > 3h.

### Phase 1 — Correct what is stale

- [x] **1. Layout section (S).** Replace the `client-vue3/` line with what it is now: Vue 3 + Vite + Pinia + TypeScript + vee-validate 4 + reka-ui/Tailwind kit, npm, `src/stores`, `src/view`, `src/components/kit`, `src/components/archetypes`, `src/contract`, `DESIGN.md`. Add `tools/contract-harness`, `tools/type-pipeline`, `tools/token-pipeline`, `tools/phi-scrubber` (verify exact names before writing). Acceptance: every path named exists (`ls` check).
- [x] **2. Environment section (S).** Replace the Docker section with the native stack from the playbook §0 (MySQL/Mongo/Redis native, `PORT=` for the API, check port owners, `VUE_APP_BACKEND_URL`, `VITE_BACKEND_URL`). Fate of the compose files depends on Q4. Acceptance: no instruction tells an agent to run Docker locally.
- [x] **3. Branch rule check (S).** Keep "branch from `svsh_branch`, PR into `svsh_branch`" (matches PRs #106, #108, #110). Acceptance: unchanged unless Q-owner says otherwise.

### Phase 2 — Governance section (new `## Vue 3 migration rules`)

Each rule is 1–3 lines with its ADR link; no restating the ADRs at length.

- [x] **4. Frozen/free boundary (S)** — ADR-0002 + amendment: guards → dispatches with payloads → post-dispatch behaviour (toast, redirect, state change) is frozen; visual containers are free; removing a confirm step, auto-firing a dispatch, or reordering guards needs sign-off; scripts may be reorganised across components, and then behaviour tests are mandatory. ExportButton exception.
- [x] **5. What "frozen" means in practice (S)** — owner rule of 2026-09-08 (Q2): business behaviour stays; security/quality fixes (no `Bearer null`, no credentials in URLs, no double submit, no crash on bad storage, dead code removal with sign-off) are allowed as *documented deviations* listed in the plan and PR.
- [x] **6. Pinia dialect (S)** — ADR-0003: one store per module, same id, same action names/bodies/payloads, axios calls byte-identical through `core/axios`, every mutation a same-named action, cross-module dispatch → imported store call recorded in the mapping table, no idiomatic cleanup until post-cutover (#69).
- [x] **7. Module classification (S)** — ADR-0006: frozen iff it calls the API or encodes domain rules; `breadcrumbs`, `config`, `htmlclass` die and dispatches into them are dropped; new UI-only stores are free surface.
- [x] **8. Validation transcription (S)** — ADR-0007: rules move into the script; `@vee-validate/rules`; custom rules verbatim (check every legacy copy); timing (`data-vv-validate-on`) preserved; **messages copied exactly from legacy, because `@vee-validate/rules` ships no message text**; no zod.
- [x] **9. Types (S)** — ADR-0004: generated by `tools/type-pipeline`; never hand-written API types; unobserved fields optional/`unknown`; ambiguity → stop and ask.
- [x] **10. PHI (S)** — ADR-0005: capture from the local dev stack only, never production; scrubbed fixtures only; raw captures and `~/.ehmrs/scrubber-map.json` never in git; pre-commit grep for known real values, `eyJ`, `$2a$`/`$2b$`; invented words for temporary rows.
- [x] **11. Twin-patch, severity gate, feature freeze (S)** — ADR-0008, stated as **merge-blocking**: a Vue 2 fix to a store module, `api.service.js`/axios layer, or router guard does not merge without its Pinia twin and updated contract fixtures in the same PR or a blocking-linked PR. Clinical-blocking/data-integrity: always. Cosmetic Vue 2: won't-fix unless trivial. New Vue 2 features: refused without owner sign-off. How it is enforced depends on Q3.
- [x] **12. Component kit (S)** — ADR-0010 + ADR-0009: views use kit components and archetypes only; no one-off components in views; a missing component is added to `src/components/kit` with Chromium keyboard and axe tests; colours, spacing and type come only from `DESIGN.md` tokens (no hex, no arbitrary Tailwind values); 44px targets on coarse pointers; portrait layouts; no information only in hover/`title`.
- [x] **13. Comments (S)** — owner rule (Q2): comments banned in `client-vue3` by `local/no-comments`; exceptions are eslint directives, ALL-CAPS section markers, triple-slash and `! ` notes; deviations go in `tasks/<issue>-*.md`, not code.
- [x] **14. Stop and ask (S)** — explicit list of triggers: an endpoint, payload, rule, message or guard the legacy code does not settle; two legacy copies that differ; a legacy defect (record it, do not copy or fix silently); dead code to drop; any server change (the server is read-only for the migration); any deviation not already covered by rule 5. "Ask" means the owner, before writing the code.

### Phase 3 — Templates

- [x] **15. Three templates in AGENTS.md (S)** — placement per Q1. Columns:
  - Store mapping: `Legacy (module/action/mutation/dispatch site) | Pinia | Note`.
  - View trace: `# | Step (guard / dispatch + payload / post-dispatch) | Legacy file:line | New file:line | Frozen? | Deviation (owner decision / quality fix / none)`.
  - Rule transcription: `View | Field | Display name (data-vv-as) | Legacy v2 rule | v4 rule | Message (exact legacy text) | Timing | Legacy file:line`.
  Acceptance: each template has one filled example row taken from #42's real tables (sign-in `username`, `required|min:3`, its actual legacy message).
- [x] **16. Playbook alignment (S)** — playbook §1 and §3 point to the AGENTS.md templates instead of carrying their own copies (or the reverse, per Q1); add the message column to its transcription step. Acceptance: exactly one copy of each template in the repo.

### Phase 4 — Local verification commands

- [x] **17. Commands section (M)** — verify each by running it, then list: `client-vue3` `npm run lint`, `npm run build`, `npm test`, `npm run test:e2e` (and the 3-run rule before a PR), `tools/type-pipeline` `npm run generate`/`npm run check`, `tools/token-pipeline` `npm run check`, `tools/contract-harness` capture/fixtures, server `yarn test` with test DB setup, legacy `npm run lint`. State "there is no CI; these are the merge gate". Acceptance: every command listed ran green on this branch, output noted in the review section.
- [x] **18. Pre-commit gap (S, depends on Q3)** — add `client-vue3` to `.husky/pre-commit` lint so the comment rule and lint are enforced on commit like the other two apps. Acceptance: a staged `client-vue3` file with a banned comment is rejected by `git commit`.

### Phase 5 — Make agents actually read it

- [x] **19. Loader files (S, per Q5)** — make `CLAUDE.md` import AGENTS.md (`@AGENTS.md`) and keep the graph block once; same treatment for `GEMINI.md`. Acceptance: a fresh Claude Code session in the repo shows the governance rules in loaded context.
- [x] **20. Review (S)** — re-read AGENTS.md against every #44 AC and each ADR; size check (target: governance section under ~150 lines so agents read it whole). Review section written below. PR into `svsh_branch` with `Closes #44`.

## Out of scope

- Changing any ADR. If writing a rule exposes a contradiction between ADRs, it is raised as a question, not resolved in AGENTS.md.
- `.cursor/rules` and `.trae/rules` (gitignored, local only).

## Decisions (owner's open questions, recommended options used)

| Q | Decision |
| --- | --- |
| Q1 Templates | Moved into AGENTS.md ("Templates"); the playbook links to them. One copy of each in the repo. |
| Q2 Owner rules | "Frozen means the behaviour, not the bugs" and the comment rule are in AGENTS.md. |
| Q3 Twin-patch enforcement | All three: the written rule, a PR template checklist, and a pre-commit check (`.husky/twin-patch-check.sh`) with a `TWIN_PATCH_LINKED=#<pr>` override; `client-vue3` added to pre-commit lint. |
| Q4 Docker files | Left in place, marked in AGENTS.md as not the local workflow; their fate moves to #43 task 6.2. |
| Q5 Loader files | `CLAUDE.md` and `GEMINI.md` are now just `@AGENTS.md`; the graph block lives once, in AGENTS.md. |

## Review

### Changes

- `AGENTS.md`: layout and environment corrected (`client-vue3` is the live migration target; `tools/`; native stack, no Docker); commands for all three apps and the four tools, stated as the merge gate since there is no CI; new "Vue 3 migration rules" section (frozen/free with the ADR-0002 amendment, owner's frozen-logic rule, ExportButton exception, classification, dialect, contract gate, validation with exact messages, types, PHI, twin-patch merge-blocking with severity gate and freeze, kit and design, comments, stop and ask); three templates with example rows checked against the code.
- `docs/migration/domain-slice-playbook.md`: its template copies replaced by links to AGENTS.md; message column called out.
- `.husky/twin-patch-check.sh` (new) and `.husky/pre-commit`: twin-patch check first, then `client-vue3` eslint on staged files (check only, no auto-fix).
- `.github/pull_request_template.md` (new): migration checklist and local checks.
- `CLAUDE.md`, `GEMINI.md`: import AGENTS.md.

### Technical decisions

- The hook blocks only when a twin exists: legacy `store/<module>/` counts only if `client-vue3/src/stores/<module>.ts` exists, so fixes in unported domains are not blocked. `client/src/axios.js`, the interceptor in `client/src/App.vue` and `client/src/router.js` always count. Any staged file under `client-vue3/src/{stores,core,router,contract}` satisfies it; the hook can't tell whether it is the right twin, so review still checks that.
- The `client-vue3` lint step calls eslint directly instead of lint-staged, so no dependency was added. It does not auto-fix, so nothing changes in the working tree behind the committer's back.
- Legacy lint is documented as `npx vue-cli-service lint --no-fix`: `npm run lint` rewrites files.

### Testing evidence (2026-11-28)

- `client-vue3`: `npm run lint` exit 0; `npm run build` exit 0; `npm test` 25 files, 167 passed; `npm run test:e2e` 594 passed, 51 skipped by design.
- `tools`: `npm test` exit 0 in all four; `type-pipeline --check OK`; `token-pipeline --check OK`.
- Legacy: `npx vue-cli-service lint --no-fix` exit 0 (1681 existing warnings).
- Twin-patch check, run against staged files: legacy auth store alone → blocked; with `client-vue3/src/stores/auth.ts` staged → passes; `TWIN_PATCH_LINKED=#12` → passes; `TWIN_PATCH_LINKED=abc` → blocked; legacy pharmacy store (no twin yet) → passes; `client/src/router.js` alone → blocked. All scratch edits reverted.
- Real `git commit` with a narrative comment added to `client-vue3/src/common/jwt.ts` → rejected by `local/no-comments`; reverted.
- A fresh `claude -p` session in the repo quoted the "Stop and ask" sentence from AGENTS.md, so the import loads.
- Every example row in the templates checked against the code (`Login-1.vue` legacy lines 47, 214, 225, 256; new lines 62, 68; `auth_success` in both stores).

### Limitations

- `--no-verify` skips the hooks; with no CI, the PR checklist and review are the backstop.
- The server test commands were not re-run here (no server change); they are unchanged from the previous AGENTS.md.
- Gemini's `@` import was not tested.

### Future considerations

- When CI exists, move the twin-patch check and the merge-gate commands into it.
