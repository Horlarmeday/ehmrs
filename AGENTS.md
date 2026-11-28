# AGENTS.md

Full-stack healthcare management system, live in a hospital. Three apps in one repo, no monorepo tooling: each has its own lockfile and runs from its own directory. Root `package.json` only bootstraps husky.

## ⚠️ BEFORE STARTING ANY NON-TRIVIAL TASK

Create a feature branch from `svsh_branch` and do NOT commit to `svsh_branch`, `svsh_branch` serves as the head:

```bash
git checkout -b <issue-number>-<short-name>
```

**Always open a PR (base `svsh_branch`) via `gh pr create` after completing a task/issue — this is mandatory, not optional.**

## Layout

- `client/` — legacy Vue 2 + Vuex + BootstrapVue, vue-cli. Serves the hospital today. Pages in `src/view/`, Vuex modules in `src/core/services/store/`, axios layer `src/axios.js`, router `src/router.js`. Uses **npm**. Feature-frozen (see the migration rules).
- `client-vue3/` — the Vue 3 migration target (PRD #33): Vite, Pinia, TypeScript, vee-validate 4, reka-ui + Tailwind. Stores `src/stores/`, views `src/view/`, axios layer `src/core/axios.ts`, router `src/router/`, component kit `src/components/kit/`, page archetypes `src/components/archetypes/`, contract tests `src/contract/`, generated API types `src/types/api/`, design tokens `DESIGN.md`. Uses **npm**.
- `server/` — Express + TypeScript (ts-node via nodemon in dev), sequelize-typescript on MySQL, plus MongoDB and Redis. Feature modules in `src/modules/<Name>/` with the pattern `name.controller.ts` / `name.service.ts` / `name.repository.ts` / `name.routes.ts` / `validations.ts`. Uses **yarn 1**.
- `tools/` — migration tooling, each its own npm package: `phi-scrubber`, `contract-harness`, `type-pipeline`, `token-pipeline`.
- `tasks/` — numbered per-feature plan files (`<issue>-<slug>.md`). Commit subjects reference them: `feat(#32): ...`, `fix(#301): ...`.
- `docs/adr/` — binding architecture decisions. `docs/migration/domain-slice-playbook.md` — the step-by-step workflow for migrating one domain.

## Commands

There is no CI. These commands are the merge gate: run the ones for every app you touched, and say in the PR that they passed.

Server (`cd server`, yarn):

- `yarn start:dev` — dev server (script is `start:dev`, not `dev`).
- `yarn migration` — `sequelize db:migrate` (not `migrations`). Sequelize paths come from `server/.sequelizerc`.
- `yarn test` — jest (ts-jest, `maxWorkers: 1`, `--forceExit`). Single file: `yarn test src/modules/Outbox/money.test.ts`.
- `yarn build` — `tsc` **then Sentry sourcemap upload**; fails locally without sentry-cli auth. For a plain typecheck use `npx tsc --noEmit`.
- `yarn __eslint_fix` — eslint autofix over the whole server.

Legacy client (`cd client`, npm): `npm run serve` / `npm run build` / `npx vue-cli-service lint --no-fix`. Plain `npm run lint` **rewrites files** (vue-cli lints with `--fix` by default).

Vue 3 client (`cd client-vue3`, npm):

- `npm run dev` — Vite on port 3000, proxies `/api` and `/static` to `VITE_BACKEND_URL` (default `http://localhost:4050`).
- `npm run lint`, `npm run build` (`vue-tsc -b` + Vite), `npm test` (vitest).
- `npm run test:e2e` — Playwright, Chromium only, projects `desktop`, `tablet-portrait`, `tablet-landscape`, strict API replay from the committed corpora. Run it **three times** before a PR; a flaky test is a failure.

Tools (`cd tools/<name>`, npm): `npm test` in each. `type-pipeline`: `npm run generate`, then `npm run check` (committed types match regeneration). `token-pipeline`: `npm run check` when `DESIGN.md` changes. `contract-harness`: `npm run build`, then `npm run capture` against the dev API and `npm run fixtures` (playbook §2).

README and `.cursor/rules` reference scripts that no longer exist (`dev`, `migrations`, `accounting:init`) — trust `package.json`.

## Testing (server)

- Integration tests run against a MySQL test DB provisioned from the committed snapshot `server/src/database/test-schema/schema.sql`, **not** from migrations (migrations reproduce only ~36 of ~94 live tables, so a migrated DB cannot run the tests):
  1. Set `TEST_DB_USER` / `TEST_DB_PASS` / `TEST_DB_NAME` / `TEST_DB_HOST` in `server/.env` — the DB name must contain "test" or setup refuses.
  2. `yarn test:db:setup` — drops and recreates the test DB, structure only, no data.
  3. `yarn test`.
- After the live schema changes, refresh the snapshot with the `mysqldump` command in `README.md`.
- Tests are colocated with source as `*.test.ts`.

## Environment

- Run the stack **natively; do not use Docker** for local work (owner rule). MySQL, MongoDB and Redis run on the machine. The `docker-compose*.yml` files and `client/Dockerfile` are not the local workflow; production serving is being defined in #43.
- The dev database is a copy of production: real patient data. Treat it as PHI (rules below).
- Check who owns a port before assuming it is eHMRS; run the API on a free one with `PORT=<port> yarn start:dev`. Legacy client against it: `VUE_APP_BACKEND_URL=http://localhost:<port> npx vue-cli-service serve --port <free port>` (add `NODE_OPTIONS=--openssl-legacy-provider` on Node 17+). Vue 3 client: `VITE_BACKEND_URL=http://localhost:<port> npm run dev`.
- `server/.env` is gitignored (`JWT_SECRET`, `DB_*`, `DB_MONGO`, `PORT`, ...). Dev API port 4050.
- `xlsx` is installed from the vendored tarball `server/vendor/xlsx-0.20.0.tgz` — do not swap it for the registry version.

## Workflow

- Pre-commit (husky): the twin-patch check, then lint-staged (eslint --fix) for `server` and `client`, then eslint on staged `client-vue3` files.
- Deeper coding patterns for server and legacy client: `.cursor/rules/*.mdc` and `.trae/rules/project_rules.md` (gitignored, present locally).

## Vue 3 migration rules

These bind every change to `client-vue3`, to the legacy logic it mirrors, and to the migration tools. They apply to humans and agents alike. The ADRs are the authority; when this section and an ADR disagree, the ADR wins and the disagreement is a question for the owner.

### Frozen and free

- **The freeze line** ([ADR-0002](docs/adr/0002-frozen-view-scripts.md)): the sequence guards → dispatches with their payloads → post-dispatch behaviour (toast, redirect, state change) is frozen. The visual container is free: a confirm modal may become a drawer, columns may regroup. Removing a confirm step, firing a dispatch on input, or reordering guards is a logic change and needs the owner's sign-off.
- **Screens may be reorganised** (ADR-0002 amendment, 2026-11-01): a new screen may combine or split legacy views, so script code can move between components. The freeze line still holds, and every such screen needs behaviour tests, since a line-by-line diff no longer proves it.
- **Frozen means the behaviour, not the bugs** (owner rule, 2026-09-08): keep the business behaviour; fix security and quality defects on the way (no `Bearer null`, no credentials in URLs, no double submit, no crash on bad storage, input escaping, stuck UI states). Each fix is a deliberate deviation, listed in the plan file and the PR.
- **One exception view**: `store/pharmacy/reports/components/ExportButton.vue` calls axios directly; it is logic and ports verbatim. No other view may call the API.

### Stores

- **Classification** ([ADR-0006](docs/adr/0006-module-classification-frozen-vs-presentation.md)): a module is frozen if it calls the API or encodes domain rules. `breadcrumbs`, `config` and `htmlclass` are Metronic presentation and die; dispatches into them are dropped. New UI-only state is free surface and may be new code.
- **Pinia dialect** ([ADR-0003](docs/adr/0003-pinia-with-translation-dialect.md)): one store per Vuex module, store id = module name; every action keeps its name, body and payload; axios calls identical, through `src/core/axios.ts`; every mutation becomes a same-named action with the same body; a cross-module `dispatch('x/y')` becomes `useXStore().y()` and goes in the mapping table. No idiomatic cleanup until after cutover (#69).
- **Contract tests gate views**: a store has contract tests in `src/contract/__tests__/<store>.contract.spec.ts`, with expectations taken from the legacy module, never from the port. No view wires to a store that is not contract-green.

### Validation

- [ADR-0007](docs/adr/0007-validation-vee-validate-4-rule-transcription.md): every legacy rule (`v-validate`, `data-vv-*`, `$validator` calls) moves into the script as a vee-validate 4 rule from `@vee-validate/rules`, rule for rule, with the same timing (`data-vv-validate-on`) and the same field name (`data-vv-as`). A template may not add, drop or change a rule.
- **Messages are copied exactly.** `@vee-validate/rules` ships no message text. Standard rules use the legacy vee-validate 2 wording already transcribed in `src/validation/setup.ts`; a custom rule or custom message (`Validator.extend`, `getMessage`, a local dictionary) is copied word for word from the legacy view. Check every legacy copy of a custom rule: copies differ (`phone_pattern` has two).
- Custom rules port verbatim, legacy defects included unless the owner decides otherwise. No zod.

### Types

- [ADR-0004](docs/adr/0004-typescript-ascertained-types.md): API types come from `tools/type-pipeline` (requests from the server's Joi schemas and module types, responses inferred from captured fixtures). Never hand-write an API type. A field never observed is optional or `unknown`, never guessed.

### Patient data

- [ADR-0005](docs/adr/0005-phi-safe-fixture-pipeline.md): capture fixtures from the local dev stack only; production is never instrumented. Only scrubbed fixtures enter git. Raw captures and the pseudonym map (`~/.ehmrs/scrubber-map.json`) never do.
- Before committing fixtures, grep them for every real value you typed or saw, `eyJ` (tokens) and `$2a$`/`$2b$` (password hashes).
- Temporary rows for a capture are created with SQL, named with invented words that never occur as field values, backed up and deleted afterwards (playbook §2).

### Twin-patch and the Vue 2 freeze

- [ADR-0008](docs/adr/0008-twin-patch-rule.md), **merge-blocking**: a change to legacy store logic, the legacy axios layer (`client/src/axios.js`, the interceptor in `client/src/App.vue`) or legacy router guards (`client/src/router.js`) that already has a Vue 3 twin does not merge without the twin patched, and its contract fixtures updated, in the same PR or in a PR that blocks it. The pre-commit hook enforces the same-commit case; for a linked PR, commit with `TWIN_PATCH_LINKED=#<pr>` and link it in the PR body.
- **Severity gate**: clinical-blocking and data-integrity bugs are always fixed, with their twin. Cosmetic Vue 2 bugs are won't-fix unless trivial. New Vue 2 features are refused without the owner's explicit sign-off.

### Component kit and design

- [ADR-0010](docs/adr/0010-reka-ui-kit-replaces-primevue.md), [ADR-0009](docs/adr/0009-archetype-driven-design.md): views are built from the kit (`src/components/kit`) and the archetypes (`src/components/archetypes`). No one-off components inside views. A missing component is added to the kit with Chromium tests for keyboard use and axe.
- Colours, spacing, type and radii come only from `DESIGN.md` tokens through Tailwind: no hex values, no arbitrary values. Images use token classes too.
- Hospital devices: desktop Chrome and touch-only Android tablets in both orientations. Targets grow to 44px on coarse pointers; every screen works in portrait; nothing needed is only in a hover tooltip or `title`.
- A screen's design is approved by the owner in the kit harness before the real view is built (playbook §6).

### Comments

- `client-vue3` bans comments by lint (`local/no-comments`). Allowed: eslint directives, ALL-CAPS section markers, triple-slash and shebang lines, and notes starting with `! ` when genuinely necessary. Explanations of ports and deviations go in `tasks/<issue>-*.md` and the PR, not in code.

### Stop and ask

Stop and ask the owner, before writing the code, when:

- the legacy code does not settle an endpoint, payload, rule, message, guard or redirect;
- two legacy copies of the same logic differ;
- you find a legacy defect (record it; neither copy it silently nor fix it silently unless it falls under "frozen means the behaviour");
- you would drop code as dead;
- the change would need the server to change (the server is read-only for the migration);
- a deviation from legacy is not covered by the rules above.

Never guess. A guessed endpoint, type or rule is how the first Vue 3 attempt failed.

### Templates

Every store port carries a mapping table, and every view port a trace table and a rule transcription table, in the plan file and the PR.

Store mapping (one row per action, mutation, getter and dispatch site):

| Legacy | Pinia | Note |
| --- | --- | --- |
| `auth` mutation `auth_success` | `useAuthStore().auth_success()` (same-named action) | |
| `dispatch('settings/fetchSettings')` in `Login-1.vue:256` | `useSettingsStore().fetchSettings()` | view dispatch |

View trace (frozen script, one row per guard, dispatch and post-dispatch step):

| # | Step | Legacy file:line | New file:line | Frozen? | Deviation |
| --- | --- | --- | --- | --- | --- |
| 1 | Guard: `validateAll()`; stop if invalid | `Login-1.vue:214` | `Login-1.vue:62` (`handleSubmit`) | yes | none |
| 2 | Dispatch `auth/login` with `{ username, password }` | `Login-1.vue:225` | `Login-1.vue:68` | yes | second submit ignored (quality fix) |

Rule transcription (one row per field and rule set):

| View | Field | Name shown (`data-vv-as`) | Legacy v2 | v4 | Message (exact legacy text) | Timing | Legacy file:line |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Sign in | `username` | `username` | `required\|min:3` | `required\|min:3` | The username field is required / The username field must be at least 3 characters | blur | `Login-1.vue:47` |

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
| --- | --- |
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
