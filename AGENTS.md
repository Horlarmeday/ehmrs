# AGENTS.md

Full-stack healthcare management system. Two independent apps in one repo, no monorepo tooling — each app has its own lockfile and must be run from its own directory. Root `package.json` only bootstraps husky.

## ⚠️ BEFORE STARTING ANY NON-TRIVIAL TASK

Create a feature branch from `svsh_branch` and do NOT commit to `svsh_branch`, `svsh_branch` serves as the head:

```bash
git checkout -b <issue-number>-<short-name>
```

## Layout

- `client/` — Vue 2 + Vuex + BootstrapVue, vue-cli. Pages in `src/view/`, Vuex modules in `src/core/services/store/`. Uses **npm** (`package-lock.json`).
- `server/` — Express + TypeScript (ts-node via nodemon in dev), sequelize-typescript on MySQL, plus MongoDB and Redis. Feature modules in `src/modules/<Name>/` with the pattern `name.controller.ts` / `name.service.ts` / `name.repository.ts` / `name.routes.ts` / `validations.ts`. Uses **yarn 1** (`yarn.lock`).
- `client-vue3/` — only a built `dist/` of an abandoned Vue 3 attempt. Not active source; the sanctioned rewrite (PrimeVue 4 + Tailwind) is specified in `docs/adr/`.
- `tasks/` — numbered per-feature plan files (`<issue>-<slug>.md`). Commit subjects reference them: `feat(#32): ...`, `fix(#301): ...`.
- `docs/adr/` — binding architecture decisions; read the relevant ADR before Vue 3 migration, validation, or fixture work.

## Commands

Server (`cd server`, yarn):

- `yarn start:dev` — dev server (script is `start:dev`, not `dev`).
- `yarn migration` — `sequelize db:migrate` (not `migrations`). Sequelize paths come from `server/.sequelizerc`.
- `yarn test` — jest (ts-jest, `maxWorkers: 1`, `--forceExit`). Single file: `yarn test src/modules/Outbox/money.test.ts`.
- `yarn build` — `tsc` **then Sentry sourcemap upload**; fails locally without sentry-cli auth. For a plain typecheck use `npx tsc --noEmit`.
- `yarn __eslint_fix` — eslint autofix over the whole server.

Client (`cd client`, npm): `npm run serve` / `npm run build` / `npm run lint` / `npm run __eslint_fix`.

README and `.cursor/rules` reference scripts that no longer exist (`dev`, `migrations`, `accounting:init`) — trust `package.json`.

## Testing

- Integration tests run against a MySQL test DB provisioned from the committed snapshot `server/src/database/test-schema/schema.sql`, **not** from migrations (migrations reproduce only ~36 of ~94 live tables, so a migrated DB cannot run the tests):
  1. Set `TEST_DB_USER` / `TEST_DB_PASS` / `TEST_DB_NAME` / `TEST_DB_HOST` in `server/.env` — the DB name must contain "test" or setup refuses.
  2. `yarn test:db:setup` — drops and recreates the test DB, structure only, no data.
  3. `yarn test`.
- After the live schema changes, refresh the snapshot with the `mysqldump` command in `README.md`.
- Tests are colocated with source as `*.test.ts`.
- Fixtures must follow `docs/adr/0005-phi-safe-fixture-pipeline.md` (no PHI).

## Environment

- `server/.env` is gitignored; keys listed in `.env.example` (`JWT_SECRET`, `DB_*`, `DB_MONGO`, `PORT`, ...). Dev API port 4050; docker maps web on 8082.
- `xlsx` is installed from the vendored tarball `server/vendor/xlsx-0.20.0.tgz` — do not swap it for the registry version.

## Workflow

- Pre-commit: husky runs `lint-staged` (eslint --fix) against both server and client.
- Existing instruction sources with deeper coding patterns: `.cursor/rules/*.mdc` (controller/service/repository conventions, API param-name mapping, Vue component patterns) and `.trae/rules/project_rules.md`. Both directories are gitignored but present locally.

## Docker

Dev stack (adds MySQL, MongoDB, nginx): `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d`.

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
|------|----------|
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
