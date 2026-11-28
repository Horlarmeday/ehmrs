# #43 — Flip infrastructure: path-preserving serving, production build, Sentry, rollback drill

Status: **in progress, paused for owner answers** (2026-11-28). The plan was approved ("go ahead"); Q1–Q5 are unanswered. See Progress.

## Sources read

- Issue #43 (no comments; was blocked by #42, which closed with PR #108), PRD #33 "Serving and cutover", ADR-0005 (Phase 1b), ADR-0008, `tasks/42-auth-tracer-bullet.md` (task 18 and Limitations), `.nginx/nginx.conf`, `client/Dockerfile`, `server/Dockerfile`, all four `docker-compose*.yml`, `client/vue.config.js`, `client/src/router.js`, `client-vue3/vite.config.ts`, `client-vue3/src/router/index.ts`, `client-vue3/src/view/pages/auth/Login-1.vue`, `server/src/core/startup/{sentry,loaders,routes}.ts`, `server/package.json`, README "production" and "docker" sections.

## Is it still relevant?

**Yes. None of it exists yet, and it is the gate before any migrated screen reaches hospital users.** #42 proved the shared `user_token` session through a throwaway local proxy and explicitly handed nginx, Docker and Sentry to this issue.

Current state, verified:

| Item | State |
| --- | --- |
| nginx | `.nginx/nginx.conf` proxies **everything** to `api:4050`. No client is served by nginx; no location blocks per path. |
| Legacy client in production | Not described anywhere in the repo. `client/Dockerfile` is a Node 10 dev image that runs `npm run serve`; `docker-compose.prod.yml` has no web service, mounts `./nginx/nginx.conf` (the file is at `.nginx/`), and builds the API from the repo root, which has no Dockerfile. The prod compose cannot be what runs the hospital today. |
| Vue 3 production build | `npm run build` works (Vite, `dist/`, sourcemaps on). No Dockerfile, no server for `dist/`. |
| Sentry | Server only (`@sentry/node`, gated on `SENTRY_DSN`; org `prismaspark-dynamics`, project `node-express`). **Neither client has Sentry.** |
| Rollback | Nothing documented. |
| Cross-app navigation | **Not handled — this is the biggest gap and is not in the issue text.** See below. |

### Gap the issue does not mention: SPA navigation does not touch nginx

nginx only decides which app answers a **full page load**. Inside a running app, `router.push` and `<router-link>` never reach nginx:

- In the new app, a successful sign-in does `router.push('/dashboard')` (`Login-1.vue:71`). In production that renders the new app's **stub** `Dashboard.vue` (all 186 non-auth views in `client-vue3` are stubs), not the legacy dashboard.
- In legacy, a sign-out or the router guard does `next('/auth/login')` (`router.js:23`, `:1538`), which renders the **legacy** sign-in page even after `/auth` is flipped.

So path-preserving flips need both routers to know which paths belong to which app and do a full page load (`window.location.assign`) when crossing. That touches the legacy router (a Vue 2 change under ADR-0008's feature freeze) and the new router. Both are frozen surfaces: the change must add a hand-off only, without altering guards or redirects. Proposed design in Phase 2; needs owner approval (Q3).

### Other technical facts that shape the design

- **Asset clash.** Both apps serve `/index.html`, `/favicon.ico` and `/media/...` from the site root. Vite emits `/assets/*`; vue-cli emits `/js`, `/css`, `/img`, `/fonts`. `media/logos/ms.png` exists in both and is byte-identical. The new app's assets need their own prefix so nginx can route them without a per-file list. Changing Vite's `base` would also change the router base (`createWebHistory(import.meta.env.BASE_URL)`), so the plan uses `build.assetsDir` plus moving the new app's `public/` files under the same prefix, and leaves `base: '/'`.
- **Both apps call `/api` and `/static` on the same origin**, proxied to the API. nginx must keep doing that for both.
- **History-mode fallback.** Legacy uses `mode: 'history'`; the new app uses `createWebHistory`. Every non-flipped path must fall back to the legacy `index.html`; every flipped prefix to the new `index.html`.
- **Cache headers.** Hashed assets can be cached for a year; both `index.html` files must be `no-cache`, or a rollback will keep serving the old app from browser caches.
- **nginx is not installed on this machine** (`which nginx` empty). Proving the config locally without Docker needs `brew install nginx` (Q2).

## Goal

A reviewed, rehearsed way to put one path prefix on the new client and take it back in minutes, with both clients reporting errors to Sentry without leaking patient data, proven with `/auth/*` (and `/settings/change-password`, which #42 also migrated).

## Proposed design (to confirm)

1. **One flip list, two readers.** A single committed file, e.g. `deploy/flips.json`: `["/auth", "/settings/change-password"]`.
   - A small script renders it into an nginx include (`deploy/nginx/flips.conf`), one `location` block per prefix, pointing at the new app's `index.html`. Rollback = remove the prefix, re-render, `nginx -t && nginx -s reload`. In a pinch, deleting that one `location` block by hand does the same.
   - nginx also serves the same list at `/flips.json` (`no-cache`). Both routers load it once at start-up and, in a `beforeEach` placed **before** the existing guards, hand a navigation to the other app with a full page load when the target path belongs to it. The existing guards and redirects are untouched; this only changes *which app* renders the result.
   - If `/flips.json` fails to load, legacy treats it as "nothing flipped" (today's behaviour) and the new app stays in-app for the page it was served. Exact fallback confirmed and tested in Phase 2.
2. **Assets** at `/v3/` for the new app (`build.assetsDir: 'v3/assets'`, `public/v3/...`). nginx routes `^~ /v3/` to the new `dist`, everything else static to the legacy `dist`.
3. **Production artefacts** per Q1: either a multi-stage `client-vue3/Dockerfile` (Node build → nginx static) as the issue says, or a build script that produces both `dist/` folders and the nginx config for a host nginx.
4. **Sentry** on both clients, PHI-safe by default (Phase 4).

## Plan

Effort: S < 1h, M 1–3h, L > 3h. Branch `43-flip-infra` from `svsh_branch`.

### Phase 0 — Ground truth (no code)

- [ ] **0.1 Production topology (S, Q1).** Record how production actually runs today: host, how the legacy `dist` is served, where TLS ends, how the API runs, how deploys happen, whether `SENTRY_DSN` is set on the API. Acceptance: a short "as is" section in this file, confirmed by the owner.
- [x] **0.2 Route inventory (S).** From `client/src/router.js` and `client-vue3/src/router/index.ts`, list which paths `/auth` and `/settings/change-password` cover in each app, and every legacy place that navigates into them (guard, logout, interceptor 401 `location.replace`, menu links). Acceptance: table in this file; nothing in `/auth/*` is legacy-only.

### Phase 1 — Asset namespace in the new app

- [x] **1.1 Vite assets under `/v3/` (S).** `build.assetsDir`, move `public/media` and `vite.svg` under `public/v3/`, update references. `base` stays `/`. Acceptance: `npm run build` emits nothing at the root of `dist/` except `index.html`; every URL in `dist/index.html` starts with `/v3/`.
- [x] **1.2 Regression (S).** `npm test`, `npm run test:e2e` (desktop + both tablets), sign-in logo and fallback `ms.png` still load. Acceptance: green, numbers recorded.

### Phase 2 — Cross-app hand-off *(depends on Q3)*

- [x] **2.1 Flip list and loader (M).** `deploy/flips.json` schema (array of path prefixes, validated: leading `/`, no trailing `/`, no duplicates, no `/api`, `/static`, `/v3`). A tiny shared matcher (prefix match on segment boundaries: `/auth` matches `/auth/login`, not `/authority`). Unit-tested in both apps.
- [x] **2.2 New app hand-off (M).** In `client-vue3/src/router`, a first `beforeEach` that does `window.location.assign(to.fullPath)` when the target is not flipped and is a legacy route, and returns `false`. Guards that already exist are not edited. Tests: memory router — sign-in then `/dashboard` hands off; flipped target stays in-app; query and hash preserved; no loop when the list is unavailable.
- [x] **2.3 Legacy hand-off (M, Vue 2 change, ADR-0008).** Same in `client/src/router.js`, added before the existing `beforeEach`, Vue 2 syntax, behaviour identical when the list is empty. The legacy client has no tests; verified by the Phase 5 e2e run. Acceptance: with an empty list, legacy behaviour is byte-for-byte unchanged on the recorded #42 legacy behaviour table.

### Phase 3 — nginx and production build *(shape depends on Q1, Q2)*

- [x] **3.1 nginx config (M).** New production config (kept separate from the existing api-only `.nginx/nginx.conf` until Q1 settles its fate): `/api` and `/static` → API; `^~ /v3/` → new `dist` with 1-year immutable cache; `include flips.conf`; legacy static dirs → legacy `dist` with long cache; `location /` → `try_files $uri /index.html` on legacy; both `index.html` `Cache-Control: no-cache`; `/flips.json` `no-cache`; existing security headers kept; gzip for js/css/svg. `nginx -t` passes.
- [x] **3.2 Render script (S).** `deploy/render-flips` (Node, no deps): `flips.json` → `flips.conf`; validation from 2.1; `--check` mode fails if the committed `flips.conf` is out of date. Unit tests for the output and each rejection.
- [ ] **3.3 Production build artefact (M, Q1).** Either (a) multi-stage `client-vue3/Dockerfile`: `node:<LTS>-alpine` → `npm ci && npm run build` → `nginx:<stable>-alpine` with `dist` and config; plus the legacy build stage (Node version the legacy build needs, `--openssl-legacy-provider`), so one image serves both on one origin; or (b) `deploy/build.sh` producing `deploy/out/{legacy,v3}` and the rendered config for a host nginx. Acceptance: the artefact builds from a clean checkout; the result serves both apps on one origin (Phase 5).
- [ ] **3.4 Environment (S).** List and set the build-time variables per app: new app `VITE_API_BASE_URL` (check whether it must stay `/api`), `VITE_APP_TITLE`, `VITE_APP_VERSION`, Sentry DSN/environment/release; legacy `VUE_APP_BACKEND_URL` (dev only) and its Sentry variables. Nothing hard-coded; a `.env.example` for each client.

### Phase 4 — Sentry on both clients *(depends on Q4)*

- [x] **4.1 SDK choice (S).** Confirm the `@sentry/vue` major that still supports Vue 2.6 for legacy and the current one for the new app (verify on npm/docs at implementation time; do not assume). Acceptance: versions and reasons recorded.
- [x] **4.2 PHI-safe defaults (M).** Shared rules for both: `sendDefaultPii: false`; no Session Replay; no request/response bodies; breadcrumbs for console off; XHR breadcrumbs keep method, path template and status only; `beforeSend` / `beforeBreadcrumb` strip query strings, numeric and id path segments (`/patient/123` → `/patient/:id`), `Authorization`, `localStorage` content and form values; `tracesSampleRate` per Q4. Unit tests feed a sample event with a fake patient name, phone, NIN, token and URL id and assert none survive.
- [ ] **4.3 Init (S).** Init only when the DSN variable is set (same pattern as the server), with `environment` and `release` (git sha) and a tag `app: legacy | v3` (or separate projects, Q4). Vue error handler hooked so component errors are captured.
- [ ] **4.4 Sourcemaps (S).** Upload only when `SENTRY_AUTH_TOKEN` is present; a plain `npm run build` must keep working locally without Sentry auth (unlike the server's `yarn build`). Maps not served publicly from nginx. Acceptance: local build green without the token; with the token, a stack trace in Sentry resolves to source.
- [ ] **4.5 Verification (S).** Trigger a test error from each app in a non-production environment; see both events in Sentry with the right tags and no PHI fields. Screenshot/links in this file.

### Phase 5 — Proof on one origin *(where depends on Q2)*

- [ ] **5.1 Stand-up (M).** Serve the production config locally (native nginx, no Docker) or on staging, both builds, API on its dev port with the dev DB.
- [ ] **5.2 Cross-app e2e (L).** Playwright, Chromium, desktop and both tablet projects, against the one origin:
  - Bookmarked `/auth/login` serves the new app; `/dashboard` and a deep legacy URL (e.g. a patient page) serve legacy; reloading any of them serves the same app.
  - Sign in on the new app → lands on the legacy dashboard (full load), still signed in.
  - Legacy sign-out → new sign-in page; legacy 401 → new sign-in page; `user_token` removed.
  - Legacy menu → change password (new app), signed in; change password cancel → back to legacy.
  - Session across tabs, one tab per app (repeats #42's 12 checks on the real config).
  - Assets: no 404s, no request for a `/v3/` asset served by legacy or vice versa; `index.html` headers `no-cache`.
  - Unknown path → legacy 404 page, as today.
  Acceptance: all green 3 runs in a row.
- [ ] **5.3 Rollback drill (M).** With the e2e suite running: remove `/auth` from `flips.json`, render, `nginx -t`, reload. Time it. Assert `/auth/login` now serves legacy on a fresh load and on a cached client (the `no-cache` header and `/flips.json` reload make the open legacy tab hand off correctly), sessions survive, no errors. Re-flip and assert again. Acceptance: both directions green; timing recorded.
- [ ] **5.4 Smoke for both apps (S).** PRD testing decision: "post-flip smoke on both apps". A short Playwright smoke tagged `@smoke` that runs against any base URL; used after each future flip.

### Phase 6 — Runbook and docs

- [ ] **6.1 Runbook (M).** `docs/migration/flip-runbook.md`: how to flip a prefix, how to roll back (the one-block path and the scripted path), how to check (`nginx -t`, smoke, Sentry), timing advice (low-traffic hours per PRD; owner's call), and the rule that a domain flips only after its issue is merged and owner-approved. Linked from the playbook §9 and AGENTS.md.
- [ ] **6.2 Repo hygiene (S, Q1).** Fix or retire the stale `docker-compose.prod.yml` and `client/Dockerfile` (Node 10), and the README "docker (recommended)" section, according to Q1. Nothing that contradicts the native local stack rule.
- [ ] **6.3 Review section (S).** Summary, decisions, impact, test evidence, limitations, follow-ups. PR into `svsh_branch` with `Closes #43` and the e2e, drill and Sentry evidence.

## Explicitly not in this issue

- Flipping `/auth` **in production**. This issue makes it possible and rehearses it; whether and when the hospital gets it is Q5.
- Any server change (the API keeps serving `/api` and `/static` as today).
- CI. There is none; the gates are the local commands.

## Risks

- The legacy hand-off is a Vue 2 router change during the feature freeze; a bug there affects every legacy screen. Mitigation: no-op with an empty list, added before existing guards, covered by the e2e run.
- A stale `index.html` in a browser cache after rollback. Mitigation: `no-cache` headers, tested in 5.3.
- Sentry is a third-party service; patient data in an error event is a privacy incident. Mitigation: 4.2 defaults and tests; owner decision Q4.

## Progress (2026-11-28)

### Done and verified

- **Route inventory (0.2).** Every legacy way into `/auth/*` and `/settings/change-password` goes through the router: guard `next('/auth/login')` (`router.js:23`, `:1538`), logout `router.push('/auth/login')` (`QuickUser.vue:277`, `LogoutTimeout.vue:57`), `router-link to="/settings/change-password"` (`QuickUser.vue:113`). The 401 path does `location.replace('/')` (`moduleAuthActions.js:78`), a full load that nginx gives to legacy, whose root redirect then hands off. So one router guard per app covers them all.
- **Assets under `/v3/` (1.1–1.2).** `build.assetsDir: 'v3/assets'`; `public/` moved to `public/v3/`; the Vite placeholder icon replaced by the legacy `favicon.ico`; logo paths updated. `dist/` holds only `index.html` and `v3/`. `base` stays `/`.
- **Hand-off (2.1–2.3).** `deploy/flips.json` lists the flipped prefixes. Both apps fetch `/flips.json` (no cache, 3 s timeout) before mounting. A first `beforeEach`, placed before the existing guards (which are unchanged), does a full load into the other app. The first navigation to the exact path the server served is never handed off, so a config mismatch cannot loop. Legacy treats a missing or invalid list as "nothing flipped" (today's behaviour); the new app treats it as "stay here".
  - New app: `src/core/flips.ts`, guard in `src/router/index.ts` (`createAppRouter` takes the hand-off function for tests), loader in `src/main.ts`.
  - Legacy: `client/src/core/services/flips.js`, one `router.beforeEach(handOffToVue3)` line in `router.js`, deferred mount in `main.js`. Legacy has no test runner; it gets covered by the one-origin e2e run (Phase 5, blocked).
- **nginx (3.1–3.2).** `deploy/nginx/ehmrs.conf.template`, `deploy/nginx/security-headers.conf`, `deploy/nginx/local.conf.template`, and `deploy/render.mjs`, which validates `flips.json` and renders `ehmrs.conf`, `flips.conf` (one regex `location` per prefix, whole-segment match) and the public `flips.json`. Settings come only from `EHMRS_*` variables. `/api/` and `/static/` go to the API; `/v3/assets/` and legacy `js|css|img|fonts` are cached for a year; both `index.html` responses and `/flips.json` are not cached; `.map` files return 404; security headers are repeated wherever a location adds its own headers (nginx drops inherited ones otherwise). `client_max_body_size` defaults to 50m, matching the API's body limit.
- **Sentry, new app (4.1–4.2).** `@sentry/vue` 11.20 (supports Vue 2 and 3). `src/core/sentry.ts`: nothing loads or sends unless `VITE_SENTRY_DSN` is set at build time, and the SDK is a lazy chunk (entry 294 kB, versus 416 kB with a static import). Sentry 11 replaced `sendDefaultPii` with `dataCollection`, whose defaults collect user info, cookies, headers, bodies and query strings; all are turned off. `attachProps: false`, tracing off, no replay, no console or DOM breadcrumbs, tag `app: v3`. `src/core/sentryScrub.ts` strips users, extras, request details, query strings, id segments, tokens, bcrypt hashes, emails and phone-like numbers.
- **Sentry, legacy scrubber.** `client/src/core/services/sentryScrub.js` (with a `.d.ts`), tested by the same suite as the new app's copy. **Legacy init is not wired** (see blockers).

### Test evidence

- `client-vue3`: `npm run lint` 0, `npm run build` 0, `npm test` 193 passed (was 167), `npm run test:e2e` 594 passed, 51 skipped by design (unchanged).
- New unit tests: `src/core/__tests__/flips.spec.ts` (14: list validation, segment matching, failed/HTML/timeout loads, sign-in hands `/dashboard` to legacy, query and hash kept, hand-off before the auth guard, no loop on the served page, redirect during the first navigation handed off); `sentryScrub.spec.ts` (10, run against both copies); `sentry.spec.ts` (2: no DSN means no client and no requests; with a DSN, the real envelope is tagged `v3` and contains no name, phone, token or id).
- Negative controls: legacy scrubber without `delete out.user` → 1 failure; with console breadcrumbs kept → 2 failures; Sentry init without `beforeSend` → failure. All restored.
- `deploy`: `node --test` 9 passed. It caught a real bug: placeholders with digits (`{{V3_ROOT}}`) were left unfilled.
- Legacy: `eslint` on the changed files, 0 errors.

### Blocked, needs the owner

1. **The legacy production build cannot run from `svsh_branch` as it stands (existing defect, not from this branch).**
   - `vue.config.js` sets webpack `watch: true`, so `vue-cli-service build` writes `dist/` and then never exits.
   - The build-time lint makes `no-console` an error in production, and about 22 legacy files contain `console` calls. `npm run build` fails; a cache hid all but two.
   - The build succeeds with `--skip-plugins @vue/cli-plugin-eslint` (then killed after `DONE`). How is production built today?
2. **Sentry in legacy needs a dependency decision.** `npm install @sentry/vue` fails on an existing peer conflict (`vue-apexcharts@1.7.0` wants `apexcharts >=4`; 3.54.1 is installed). Installing needs `--legacy-peer-deps`, which re-resolves the live app's lockfile. The wiring is written and was backed out.
3. **nginx is not installed** here, and installing it was blocked by the permission system. Phases 5.1–5.3 (one-origin e2e, rollback drill) need it.
4. **Production shape (Q1)** decides 3.3 (Dockerfile or build script) and 6.2 (stale compose files).

## Open questions

See the chat message: Q1–Q5.

## Review

_To be written after implementation._
