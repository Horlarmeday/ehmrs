# Issue 38 — [Foundation 5/8] HTTP layer port — axios interceptors verbatim, contract-tested

Parent: #33 (Vue 2 → Vue 3 migration PRD) · ADR-0001 (PrimeVue chrome) · ADR-0003 (frozen logic dialect) · Branch: `38-http-layer-port` (from `svsh_branch`)

## What we build

Verbatim port of `client/src/axios.js` (the legacy global axios + interceptor layer) into `client-vue3/src/core/axios.ts`:

- `/api` baseURL, `Bearer` token from shared `user_token` localStorage key, 180000ms timeout (already present from #36 — kept)
- `onDownloadProgress` → `NProgress.set(percentage)` + `NProgress.setColor` monkey-patch, verbatim
- request interceptor: `NProgress.setColor('black')` + `NProgress.start()`
- response interceptor success: 201/204 → `notifySuccess(response)`; 401 → logout; `setTimeout(NProgress.done(true), 30000)`
- response interceptor error: `NProgress.done(true)`; 401 → logout; `notifyError(error)`; reject with `error.response.data` (or `error.message` when no response)
- Toast content/timing frozen: title `Success message`/`Error message`, text `response.data.message`/`error.response.data.message`, type `success`/`error`; chrome is PrimeVue ToastService (legacy `group: 'foo'` dropped — chrome, not content)
- 401 logout: legacy `store.dispatch('auth/logout')` → `useAuthStore().logoutSession()` (mapping deviation already documented in #36)
- Contract-tested via the #36 harness: interceptor behavior replayed against the captured auth fixtures + synthetic 201/204/401/network-error scenarios in corpus shape

## Tasks

- [x] Branch `38-http-layer-port` from `svsh_branch`
- [x] Deps in `client-vue3/`: `nprogress`, `@types/nprogress`, `primevue`
- [x] `src/common/notify.ts` — sink-based toast adapter (`notifySuccess`/`notifyError`) with frozen titles/text/type; no-op sink until the shell registers PrimeVue ToastService
- [x] `src/core/axios.ts` — full verbatim interceptor port (progress, toast triggers, 401 logout, rejection shapes)
- [x] Shell wiring: `main.ts` installs PrimeVue + ToastService; `App.vue` registers the sink via `useToast()` (summary=legacy title, detail=legacy text, severity=legacy type)
- [x] `src/contract/__tests__/interceptors.contract.spec.ts` — replays captured auth fixtures through the interceptor layer (200 ⇒ no toast + progress done; 400 ⇒ error toast with fixture `message`, rejection carries fixture body) + synthetic corpus-shape scenarios for 201/204 (success toast), 401 (logout side effect), network error (reject `error.message`)
- [x] `src/__tests__/unit/notify.spec.ts` — frozen toast content for success/error payloads, incl. missing-message tolerance
- [x] Verify: `npm run lint`, `npm run test`, `npm run build` all green in `client-vue3/`; legacy `client/src/axios.js` reference included in PR diff context
- [x] Update this file ([x] + review), commit `feat(#38): HTTP layer port — axios interceptors verbatim, contract-tested`, PR to `svsh_branch`

## Acceptance criteria (from issue)

- [x] Interceptors ported with behavior parity (token attach, 401 logout, toast triggers, progress bar)
- [x] Legacy interceptor file included in PR for line-by-line review
- [x] Contract tests against captured fixtures green
- [x] Toasts surface via PrimeVue ToastService with same trigger conditions/content as legacy

## Review

- Summary: `client-vue3/src/core/axios.ts` now carries the verbatim legacy interceptor layer (progress bar, toast triggers, 401 logout, rejection shapes) on top of the #36 defaults; toasts route through the new sink adapter `src/common/notify.ts` (frozen legacy content: titles `Success message`/`Error message`, text from `data.message`/`error.response.data.message`, type success/error) into PrimeVue ToastService wired in `main.ts` + `App.vue`.
- Technical decisions: sink-adapter instead of calling `useToast()` from the interceptor — `useToast` requires component setup context, the interceptor is module-level; the shell registers the sink at mount, tests record it, unregistered = no-op. `dispatch('auth/logout')` → `useAuthStore().logoutSession()` per the documented #36 mapping deviation. Success-path `NProgress.done(true)` asserted via a `setTimeout` spy on the frozen 30000ms schedule rather than fake timers (fake timers risk breaking MSW/undici internals). Two robustness-only type deviations, runtime-equivalent: optional-chained toast text (legacy `notifyError` would TypeError on a network error with no response — guarded), `total ?? 0` in `calculatePercentage` for axios' `ProgressEvent.total: number | undefined`.
- Impact: additive, `client-vue3/` only; no server or legacy client changes. Existing auth contract suite unaffected (it asserts rejection boolean + state, not rejection shape).
- Testing evidence: `npm run test` 29/29 (3 captured auth fixtures replayed through the interceptor layer + 4 synthetic corpus-shape scenarios: 201/204 success-toast, 401 logout side-effect, network-error message rejection + 4 notify unit tests); `npm run lint` clean; `npm run build` (vue-tsc + vite) green. The setTimeout assertion caught a real test-ordering bug during development (assert-after-restore cleared the spy calls), confirming the gate bites.
- Limitations: captured corpus only covers 200/400 auth flow — 201/204/401/network-error are synthetic scenarios in corpus shape until bulk capture (Phase 1); NProgress `onDownloadProgress` percentage path untested (no fixture exercises download progress events); toast chrome mapping (summary/detail/severity, life 3000) is PrimeVue skin, not contract-asserted.
- Future: grow the corpus with 201/204/401 real captures when bulk capture begins; revisit the 30000ms done delay (frozen as-is per verbatim rule, but it is an odd legacy value worth a deliberate decision later).
