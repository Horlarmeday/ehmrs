# Issue 34 — [Foundation 1/8] Salvage Vue 3 tooling scaffold onto svsh_branch

Parent: #33 (Vue 2 → Vue 3 migration PRD) · Branch: `34-vue3-tooling-scaffold` (from `svsh_branch`)

## What we build

Restore `client-vue3/` from the `client-vue-3` branch, stripped to **logic-free tooling only**: Vite config, tsconfigs, vitest scaffolding, eslint + CI setup, and a minimal booting app. Discard all UI (reka-ui kit, components, layouts, pages, error pages) and all drifted logic (services, stores, validation schemas, invented API types). Delete stray `client-vue3/dist` and `client-vue3/node_modules`.

## Tasks

- [x] Create branch `34-vue3-tooling-scaffold` from `svsh_branch` (effort: trivial)
- [x] Delete stray `client-vue3/dist` + `client-vue3/node_modules` from working tree (239M + 3.8M) (trivial)
- [x] `git checkout client-vue-3 -- client-vue3/` then strip to tooling only (medium):
  - Kept: `package.json` (pruned), `index.html`, `public/vite.svg`, `vite.config.ts`, `vitest.config.ts`, tsconfigs (solution-style), `tailwind.config.js` (content-glob only), `.gitignore`, minimal `src/`: `main.ts`, `App.vue` (placeholder), `vite-env.d.ts`, `style.css` (tailwind directives)
  - Dropped: `components.json`, `postcss.config.js.bak`, old README, all `src/components|pages|layouts|services|stores|validation|types|utils|lib|router|__tests__|assets`, `package-lock.json` (regenerated), stale compiled `*.config.js|.d.ts` artifacts
- [x] Prune `package.json` deps to tooling-only: vue + dev deps (vite, vue-tsc, vitest, @vue/test-utils, jsdom, tailwind, eslint, prettier). No router/pinia (owner decision), no reka-ui — PrimeVue 4 lands in later issues per ADR-0001
- [x] Add ESLint setup: flat `eslint.config.js` (eslint-plugin-vue flat/recommended + @vue/eslint-config-typescript)
- [x] Add smoke test `src/__tests__/unit/app.spec.ts`; `main.ts` mounts bare App (no router/pinia)
- [x] Reconcile tsconfigs: solution-style `tsconfig.json` (refs) + `tsconfig.app.json` + `tsconfig.node.json`, build = `vue-tsc -b && vite build`
- [x] Install (`npm i`) and verify locally:
  - `npm run dev` boots (HTTP 200 on :3000)
  - `npm run test` — 1 passed
  - `npm run build` (vue-tsc + vite) — green
  - `npm run lint` — 0 errors
- [x] CI: owner decision — local verification only; no workflow file added
- [x] Vue 2 client unaffected: verified its 6 lint errors are pre-existing (stash test). NOTE: `client/ npm run lint` = vue-cli lint with autofix — do not run casually; any accidental fixes were reverted.
- [x] Commit as `feat(#34): salvage Vue 3 tooling scaffold onto svsh_branch`

## Acceptance criteria (from issue)

- [x] `client-vue3/` restored on `svsh_branch` with both clients coexisting
- [x] Salvage stripped to tooling only; no reka-ui, no pages, no services/stores/schemas
- [x] Stray dist/node_modules deleted
- [x] Empty app boots in dev; lint/test/build green (local CI gate)
- [x] Both clients buildable from same checkout

## Review

- Summary: `client-vue3/` rebuilt from `client-vue-3` branch as a tooling-only Vite + Vue 3 + TS + vitest + eslint (flat) + Tailwind scaffold with a placeholder App, smoke test, solution-style tsconfigs, and pruned deps (vue only runtime dep).
- Technical decisions: dropped vue-router/pinia until needed (owner); kept Tailwind 3 + tailwindcss-animate as ADR-sanctioned styling base; replaced shadcn/reka CSS-variable theme with minimal tailwind config; dropped vitest coverage thresholds until real tests exist; no GH Actions workflow (owner).
- Impact: additive only; Vue 2 client untouched.
- Testing evidence: `npm run lint` 0 errors; `npm run test` 1/1 passed; `npm run build` green; `npm run dev` served HTTP 200.
- Limitations: coverage thresholds removed; single smoke test.
- Future: PrimeVue 4 kit + router/pinia land with first migration issues (ADR-0001).
