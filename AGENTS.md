# AGENTS.md

Full-stack hospital management system (EHMRS). Two active packages plus root-level husky config; no workspace tooling — each package installs separately.

## Layout

- `client/` — Vue 2 + vue-cli (webpack), Bootstrap-Vue, Vuex. Entry: `src/main.js`, routes in `src/router.js`.
- `server/` — Express + TypeScript, sequelize-typescript. Entry: `src/app.ts` → `src/core/startup/`.
- `client-vue3/` — abandoned experiment, no sources (only `dist/` artifacts). Ignore it; all frontend work goes in `client/`.
- `tasks/` — long-form design/plan documents. Write implementation plans here.
- `.cursor/rules/*.mdc` — detailed repo conventions (controller pattern, naming, structure). Read `backend-api-patterns.mdc` and `project-structure.mdc` before large backend changes.

## Package managers (mixed — easy to get wrong)

- `server/` uses **yarn** (`yarn.lock`; `build` invokes `yarn` internally).
- `client/` uses **npm** (`package-lock.json`).
- Root uses yarn (husky only).

## Commands

### server/ (run from `server/`)
- Dev: `yarn start:dev` (nodemon → `ts-node src/app.ts`, watches `src/`). Port from `PORT` env (4050 in dev).
- Migrations: `yarn migration` — script is `migration`, **singular**. README's `npm run migrations` is stale; so is `npm run dev`.
- Tests: `yarn test` (jest). Single suite: `yarn test triage`.
- Typecheck: `npx tsc --noEmit` (no dedicated script).
- Lint fix: `yarn __eslint_fix` (no plain `lint` script).
- Build: `yarn build` = `tsc` **plus Sentry sourcemap upload** — requires auth token in `server/.sentryclirc` (untracked). Use `npx tsc --noEmit` for verification instead of full builds.

### client/ (run from `client/`)
- Dev: `npm run serve` — port 8080, proxies `/api` and `/static` to `VUE_APP_BACKEND_URL` (`client/.env`, default `http://localhost:4050`).
- Lint: `npm run lint`. Lint fix: `npm run __eslint_fix`.
- RTL styles bundle: `npm run rtl` (separate webpack config).

## Testing (integration, not unit)

Server tests are supertest integration tests against the real express app and a real MySQL database:
- They use `TEST_DB_*` env vars (`server/.env`) via `src/database/config/db-config.ts` and **truncate tables** in `afterAll`. Never point `TEST_DB_*` at a database you care about.
- Prerequisites: MySQL running, test DB created, migrations applied.
- No frontend tests.

## Environment

- `server/.env` is required (untracked). Keys: see root `.env.example` plus `DB_PORT`, `PORT`, `TEST_DB_*`, `EMR_*`. Loaded via dotenv in `src/core/config/env`, imported first in `app.ts` — keep that import order.
- Runtime DB config comes from env vars, but the **sequelize CLI** (migrations) reads `src/database/config/config.json` (untracked, local-only).

## Backend conventions

- Feature modules live in `src/modules/<Name>/` with `<name>.controller.ts`, `<name>.service.ts`, `<name>.routes.ts`, `validations.ts` (joi), `messages/`, and `<name>.test.ts` (some also have a repository layer).
- New module routes must be registered manually in `src/core/startup/routes.ts` as `/api/<resource>`.
- Controllers: validate with joi, delegate to service, return `successResponse`/`errorResponse` from `src/common/responses/`, pass errors to `next(e)` (centralized handler). `StatusCodes` comes from `src/core/helpers/helper`, not the npm package.
- Models: sequelize-typescript in `src/database/models` (index.ts excluded by `modelMatch` in `db-connection.ts`). Migrations are plain JS in `src/database/migrations`.
- Logging: winston → `server/logs/`.

## Git / hooks

- Pre-commit hook (root husky) runs `yarn lint-staged` inside both `server/` and `client/` — deps must be installed in both or the hook fails/skips lint.
- Commit style: `feat:` / `fix:` / `chore:` prefixes (see `git log`).

## Docker

- Full dev stack: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d` (api :4050, web :8082, nginx :80, MySQL exposed on host port **5000**→3306, Mongo :27017).
- Integration-test stack uses `docker-compose.integration.yml` + `.env.integration` (untracked).
