# Issue 42 — Tracer bullet: auth domain end-to-end

Issue: #42 · Parent: #33 · ADR-0002 (amended), ADR-0003, ADR-0004, ADR-0005, ADR-0006, ADR-0007, ADR-0009 (amended), ADR-0010 · Branch: `42-auth-tracer-bullet` from `svsh_branch`
Status: **done (2026-11-18); PR open into `svsh_branch`**

Blocked by #37, #38, #39, #41: all closed (PRs #74, #75, #76, #106).

## Sources read

- Issue #42 (no comments), PRD #33 and its comment, the issue list (#43, #44, #45–#69, #103–#105).
- ADRs 0001–0010, `client-vue3/DESIGN.md`, `docs/design/information-architecture.md`, `tasks/ui-ux-redesign.md`.
- Task records `36-contract-harness.md`, `38-http-layer-port.md`, `39-type-pipeline.md`, `41-archetype-kit.md`.
- Legacy client: `axios.js`, `main.js`, `App.vue`, `router.js` (root guard, auth routes, `beforeEach`), stores `auth/*`, `settings/*`, `alert/*`, views `auth/Login-1.vue`, `auth/Login.vue`, `auth/Register.vue`, `components/util/LogoutTimeout.vue`, `layout/extras/offcanvas/QuickUser.vue`, and every consumer of the three stores.
- Server (read only): `Auth` routes, controller, service, Joi validations and messages; `AdminSettings` and `Alert` routes; `verify` middleware; `Staff.generateAuthToken`.
- Vue 3 client: `stores/auth.ts`, `core/axios.ts`, `common/notify.ts`, `common/jwt.ts`, `common/AppToaster.vue`, `main.ts`, `App.vue`, `router/index.ts`, `view/layout/Layout.vue`, auth stub views, contract harness, `types/api/auth.ts`, archetype README, Playwright config, `e2e/shell.spec.ts`.

## What already exists (not rebuilt here)

| Piece | Where | State |
| --- | --- | --- |
| Auth store under the dialect | `src/stores/auth.ts` (#36) | Ported. Contract covers only `login` (3 captured scenarios). `register`, `forgot`, `logoutSession` and the four mutation-actions have no contract cases. No mapping table in a PR. |
| HTTP layer | `src/core/axios.ts` (#38) | Ported with documented deviations (token read per request, no `Bearer null`, immediate progress done). 401 calls `logoutSession`. |
| Router and guards | `src/router/index.ts` (#37) | `/auth/login`, `/auth/register` routed to stubs. Root and `requiresAuth` guards read `useAuthStore().token`. |
| Auth types | `src/types/api/auth.ts` (#39) | Login, forgot, change-password requests; login response. |
| App shell sign-out | `src/view/layout/Layout.vue` (#41) | Calls `logoutSession()` then `router.push('/auth/login')`, as legacy `QuickUser.vue`. Shell tests fake a token in `localStorage`. |
| Validation | `src/validation/setup.ts` (#41) | v4 rules with the legacy v2 messages. |
| Toasts | `src/common/AppToaster.vue` | reka-ui Toast, legacy content. |

## Findings that shape the work

1. **`settings` and `alert` are not ported.** Both need stores, contract fixtures, mapping tables and generated types.
2. **Legacy sign-in is `Login-1.vue`.** `Login.vue` and `Register.vue` are Metronic demos: `Login.vue` imports a module that doesn't exist and isn't routed; `Register.vue` dispatches nothing.
3. **Login behaviour to keep** (frozen script):
   - On create: `settings/fetchSettings` (`GET /settings/system-settings/get`, no auth needed on the server), result cached in `localStorage.settings`; the page shows `name_of_organization` from the cache, else from the store. A failed fetch is swallowed.
   - Fields: `username` with `required|min:3`, `password` with `required|min:6`, both validated on blur. Messages use the field `name` (`username`, `password`).
   - Submit: `validateAll`; if valid, disable the button, dispatch `auth/login` with `{ username, password }`; on success reset the form, `push('/dashboard')`, re-enable; on failure re-enable. The error text is the interceptor's toast (`Error message` + server `message`, e.g. "Invalid username or password").
   - Enter in the form submits.
4. **Possible legacy defect, to verify on the running legacy client before transcribing:** the Sign In `<button>` has no `type` inside a `<form>` with no `@submit.prevent`, and the form also has `@keypress.enter`. A click may run `onSubmitLogin` and also a native GET submit (credentials in the URL), and Enter may run it twice. I will record what actually happens, not guess.
5. **Forgot password is broken in legacy.** `onSubmitForgot` calls `this.fv1`, which belongs to the deleted formvalidation plugin; the Submit button has no handler. Staff cannot reach `POST /auth/forgot-password` today. The endpoint works on the server: no login needed, it resets the password of whoever owns that phone number, SMSes the new one and returns the staff record. Making it work in Vue 3 would switch on a flow that is dead today.
6. **`register` calls `/users/register`, which the server doesn't have.** It is dead store code with no caller.
7. **Logout reloads the page.** `logoutSession` clears state and `user_token`, then `window.location.replace('/')`; the root guard then goes to `/auth/login`. The same runs on any 401.
8. **A deactivated account gets 401 at login.** The 401 handler then logs out and reloads, so the "account has been deactivated" toast probably vanishes with the reload. To verify on legacy.
9. **Dead code in legacy, not ported:** `LogoutTimeout.vue` (15-minute idle logout, not mounted anywhere), the extra interceptor in `App.vue` (it checks `err.status` on an already-unwrapped error and uses an unbound `this`, so it never fires), `RESET_LAYOUT_CONFIG` in `beforeEach` (Metronic, ADR-0006).
10. **`user_token` is shared only on the same origin.** Legacy and the new client run on different ports in development, so they can't share a session until nginx serves both on one origin (#43). The session contract can still be tested inside the new client: set on login, removed on logout and 401, sent as `Bearer`, read by the guards.
11. **Token lifetime is 24 hours** (`expiresIn: '24h'`). Neither client checks expiry; the first API call after expiry gets 401 and logs out.
12. **Store consumers outside auth:** `settings` is used by `SystemSettings.vue` and `ChangePassword.vue` (settings domain, #65; change password is also on the shell's account menu); `alert` by `AlertAccordion.vue`, `AlertsTable.vue`, `AlertsModal.vue`, `CreateAlert.vue` (consultation and antenatal domains). Their views are not in this issue.
13. **Capturing fixtures writes to the dev database** for `updateSettings` (multipart with logo and stamp), `changePassword`, `addAlert` and `updateAlert`. The dev database is a copy of production (ADR-0005).
14. **There is no sign-in design yet.** The IA calls it "System", outside the four archetypes. The issue's design note says each screen is designed and shown to the owner before it is built.

## Plan

Complexity: S under 30 min, M under 2 h, L more than one session. Tasks marked **(Q)** depend on an open question.

### Phase 0: legacy ground truth

- [x] **1. Run legacy sign-in and record behaviour (M).** Start the dev stack and the legacy client; with a temporary staff account, record: click and Enter submit (finding 4), wrong password, short fields, deactivated account (finding 8), logout from the user panel, a 401 mid-session, and what `localStorage` holds at each step. Delete the temporary account afterwards.
  - AC: a "Legacy behaviour" table in this file with each step, the requests sent, toasts, URL and storage; network logs stay outside the repo (ADR-0005).
  - Done 2026-11-18 against the native dev stack (no Docker, owner rule): API on port 4051 and legacy client on 8090, because 4050 and 8080 belong to another project. Temporary staff `capture42_active` (313) and `capture42_inactive` (314); both are deleted after the task 4 captures. Recorded with Playwright; scripts and raw output stay in the session scratchpad, outside the repo.

#### Legacy behaviour

| # | Step | Requests | Result |
| --- | --- | --- | --- |
| 1 | Open `/auth/login` | `GET /settings/system-settings/get` 200 | Heading shows `name_of_organization`; logo is the fixed `/media/logos/ms.png` (the `organization_logo` method is never used); `localStorage.settings` holds the settings object; no `user_token` |
| 2 | Short username and password, then blur | none | "The username field must be at least 3 characters", "The password field must be at least 6 characters" |
| 3 | Sign In clicked with empty fields | settings fetched again after reload | **Native GET submit:** page reloads as `/auth/login?username=&password=`; no messages shown |
| 4 | Sign In clicked or Enter with invalid typed values (`ab`, `12345`) | none | **Native GET submit puts the typed username and password in the URL** (`?username=ab&password=12345`), then into history and server logs; no messages shown |
| 5 | Wrong password, click | `POST /auth/login {username,password}` 400 | Toast "Error message / Invalid username or password"; button enabled again; stays on `/auth/login`; no native submit |
| 6 | Wrong password, Enter | one `POST /auth/login` 400 | Same as 5. **Enter does not submit twice** |
| 7 | Deactivated account | `POST /auth/login` 401 | Logout runs, page goes to `/` then `/auth/login`. **No toast is visible**: the "account has been deactivated" message is lost in the reload |
| 8 | Valid sign-in, click or Enter | `POST /auth/login` 200 | `user_token` set, `push('/dashboard')`; no toast (200) |
| 9 | Sign Out from the user panel | none | `user_token` removed; `/` then `/auth/login` (full reload); `settings` stays in storage |
| 10 | Invalid token, open `/patient/find-patient` | `GET /patients/get` 401 | Logout and reload to `/auth/login`; no toast visible |
| 11 | `/` without and with a token | none | `/auth/login` and `/dashboard` |
| 12 | `/auth/register` | settings | **Renders the sign-in page** (the parent route's `Login-1`), so a redirect to sign in keeps what users see today |

Deviations this sets up (decision 3):

- **Native submit fixed:** the form prevents the browser submit, so credentials never reach the URL, and validation messages show on a failed submit.
- **Deactivated account message:** the sign-in page shows the server's 401 message instead of losing it in the reload. How: decided in task 12 with the owner reviewing the design state; the 401 logout itself is unchanged.
- **Mid-session 401 shows no message today.** Kept as is unless the owner asks.

- [x] **2. Trace tables (S).** For `Login-1.vue` sign-in and forgot, and for every logout entry point (shell sign-out, 401), write the guard → dispatch with payload → post-dispatch table.
  - AC: tables in this file and in the PR; every row points to a legacy line.
  - Written from code (below). Rows marked *runtime* are confirmed or corrected in task 1.
- [ ] **3. Rule transcription table (S).** Sign in: `username` `required|min:3` blur, `password` `required|min:6` blur. Forgot: `phone` `required|min:11|max:11|phone_pattern` (owner decision 13; legacy had none). Change password (`ChangePassword.vue`): `current_password` `required`, `new_password` `required|confirmed:confirmPassword` → `confirmed:@confirm_password` (check the legacy `ref` target), `confirm_password` `required`, all blur.
  - AC: each rule maps to its v4 equivalent and legacy v2 message, checked by unit test; `phone_pattern` ported verbatim from its legacy definition.
  - Table written (below). Unit tests land with each view (tasks 12, 13, 15).

#### Trace: sign in (`client/src/view/pages/auth/Login-1.vue`)

| # | Step | Legacy line | Frozen? |
| --- | --- | --- | --- |
| 1 | On create: dispatch `settings/fetchSettings` (no payload) | 180, 253–256 | yes |
| 2 | Success: `localStorage.settings = JSON.stringify(response.data.data)` | 258 | yes |
| 3 | Failure: swallowed (legacy `console.error`) | 263 | yes, minus the console call |
| 4 | Organization name: `localStorage.settings` parsed, else `settings.settings`, then `name_of_organization` | computed `settings` | yes |
| 5 | Submit triggers: Enter key on the form, Sign In click | 37, 88 | trigger set yes; double fire or native submit *runtime* |
| 6 | Guard: `validateAll()`; stop if invalid | 214 | yes |
| 7 | Disable button | 221 | yes |
| 8 | Dispatch `auth/login` with `{ username, password }` | 225 | yes |
| 9 | Success: reset form (`form = {}`), `push('/dashboard')`, re-enable | 227–229 | yes |
| 10 | Failure: re-enable; message is the interceptor's error toast | 231 | yes |
| 11 | 401 (deactivated account): interceptor runs logout and reload | `core/axios.ts:68` | *runtime*; fix if the toast is lost (decision 3) |

#### Trace: forgot password (kept for the follow-up after #107)

| # | Step | Legacy line | Frozen? |
| --- | --- | --- | --- |
| 1 | "Forgot Password ?" link shows the forgot form | 82 | yes |
| 2 | Guard: legacy `this.fv1.validate()` (dead plugin). New: v4 rules from decision 13 | 237 | new behaviour |
| 3 | Disable button | 243 (spinner) | yes |
| 4 | Dispatch `auth/forgot` with `{ phone }` | 247 | yes |
| 5 | Success or failure: re-enable; message is the interceptor toast. 200 gives no toast in legacy (only 201/204 do), so success shows nothing | 248–249 | yes; success feedback for the owner to decide in design |
| 6 | Cancel shows the sign-in form | 140 | yes |

#### Trace: change password (`client/src/view/pages/settings/page/ChangePassword.vue`)

| # | Step | Legacy line | Frozen? |
| --- | --- | --- | --- |
| 1 | Guard: `validateAll()`; stop if invalid | 89 | yes |
| 2 | Disable button | 79, 98 | yes |
| 3 | Dispatch `settings/changePassword` with `{ oldPassword, newPassword, confirmPassword }` | 91–101 | yes |
| 4 | Success: re-enable, clear all three fields; 201 success toast "Password changed!" from the interceptor | 102, 108–117 | yes |
| 5 | Failure: re-enable, fields kept; error toast | 103 | yes |

#### Trace: logout

| Entry point | Legacy | New | Sequence |
| --- | --- | --- | --- |
| User panel sign-out | `QuickUser.vue` `onLogout` | `Layout.vue:35` | `logout` (status and token cleared) → remove `user_token` → delete default header → `location.replace('/')` → then `push('/auth/login')` |
| Any 401 response | `axios.js:65` | `core/axios.ts:68` | same, then error toast and rejection |
| `/` with no token | `router.js:18–24` | `router/index.ts:10–18` | to `/auth/login` |
| Idle timeout | `LogoutTimeout.vue`, never mounted | none (decision 12) | — |
| `App.vue` interceptor | never fires (unwrapped error, unbound `this`) | none | — |

#### Rule transcription

| View | Field (message name) | Legacy v2 | v4 | Timing |
| --- | --- | --- | --- | --- |
| Sign in | `username` | `required\|min:3` | `required\|min:3` | blur |
| Sign in | `password` | `required\|min:6` | `required\|min:6` | blur |
| Forgot | `phone` | none (dead plugin) | `required\|min:11\|max:11\|phone_pattern` (decision 13) | blur, as other legacy phone fields |
| Change password | `current_password` | `required` | `required` | blur |
| Change password | `new_password` | `required\|confirmed:confirmPassword` | `required\|confirmed:@confirm_password` (v2 target is the `ref="confirmPassword"` on `confirm_password`) | blur |
| Change password | `confirm_password` | `required` | `required` | blur |

`phone_pattern` exists in two legacy versions. `AddEmployee.vue`, `CreateVendor.vue`, `CreatePatientAccount.vue` and `CreateEmergencyAccount.vue` use `/((^090)([1-9]))|((^091)([0-9]))|((^070)([1-9]))|((^080)([2-9]))|((^081)([0-9]))(\d{7})/`; `EditPatient.vue` narrows 090 to `[123589]`. Staff phones are entered through `AddEmployee.vue`, so the forgot form uses that version, with its message "The {field} field should match the Nigerian phone pattern e.g 07098765321". The known defect (`\d{7}` applies only to the last branch) is kept; `min:11|max:11` does the length check. Note: the confirmed rule's v2 message reads "The new_password confirmation does not match".

### Phase 1: stores (frozen surface)

- [x] **4. Capture fixtures (M).** Through the #36 proxy and the #35 scrubber: `GET /settings/system-settings/get`; `POST /settings/system-settings/update` (JSON and multipart, original settings saved first and restored after); `POST /auth/change-password` (201, wrong old password, mismatch, 401 without token); `POST /auth/forgot-password` 400 cases only (validation, unknown phone), for the store contract; `POST /alerts/create`, `GET /alerts/get`, `PUT /alerts/update/:id` on a temporary visit; login 401 for a deactivated temporary account. All temporary rows deleted after capture.
  - AC: `settings.json` and `alert.json` corpora and more `auth.json` scenarios, scrubbed with `--known-real`; grep for known real values finds nothing.
  - Done 2026-11-18. Corpora: `auth.json` (6: login 200, 400 wrong password, 400 Joi, 401 deactivated; forgot 400 Joi, 400 unknown phone), `settings.json` (8: get 200; update 201, 400 empty body, 401; change-password 201, 400 wrong old, 400 mismatch, 401), `alert.json` (7: create 201, 400; get pages 1 and 2; update 200; get after update; 401). `--known-real` covered the temporary password, token, usernames and names, and the organization's real address, email and phone; a final grep for all of them, JWTs and bcrypt hashes finds nothing.
  - Temporary staff 313 and 314, patient 41223, visit 27693 and alerts 6 to 8 deleted; `System_Settings` compared with a backup before and after: identical (the update sent the same values).
  - **Deviation, multipart update:** the capture proxy reads bodies as UTF-8 text, so a logo or stamp upload would be corrupted in transit. The JSON update is captured; the multipart form gets a synthetic scenario in corpus shape in task 6.
  - **Found, scrubber:** I first named the temporary staff "Capture Active" and "Capture Inactive". The scrubber learned "Active" as a person name and replaced the word in every string, including `status: "Active"`. I discarded those corpora, removed my three entries from the pseudonym map (backup kept outside the repo), renamed the rows to invented names and captured again. Lesson for the playbook: temporary rows must use invented words that never occur as field values.
  - **Found, server (for #107's follow-up list):** `POST /auth/change-password` returns the whole staff record, including the bcrypt password hash, to the browser. Scrubbed in the fixture.
  - Alert update answers 200, so legacy shows no success toast for it; create answers 201 and does.
- [x] **5. Auth store completion (M).** Contract cases for `forgot`, `logoutSession` (state cleared, `user_token` removed, `window.location.replace('/')`) and the four mutation-actions. Drop `register` (owner decision 4).
  - AC: contract-green; mapping table (legacy name → Pinia name, dispatch sites → imported calls, the `logout` → `logoutSession` deviation, `register` dropped).
- [x] **6. Settings store (M).** `src/stores/settings.ts`, id `settings`: `updateSettings`, `fetchSettings`, `changePassword`, and the `SET_SETTINGS` and `CHANGE_PASSWORD` mutation-actions, byte-identical calls through `core/axios`.
  - AC: contract-green against `settings.json`; mapping table.
- [x] **7. Alert store (M).** `src/stores/alert.ts`, id `alert`: `addAlert`, `fetchAlerts` (`currentPage`, `pageLimit` from `itemsPerPage`, `visit_id` from `id`), `updateAlert`, and the four mutation-actions.
  - AC: contract-green against `alert.json`; mapping table.
- [x] **8. Self-test of the gate (S).** For each new store, a drifted copy (URL, method, payload, state) must fail its contract suite.
  - AC: negative controls recorded here.

#### Phase 1 results (2026-11-18)

- Contract suites: `auth` (6 scenarios), `settings` (9), `alert` (7), each checking request out, state in, `user_token`, `location.replace` and toasts against the legacy module and legacy `axios.js`. Store unit tests (`src/stores/__tests__/stores.spec.ts`, 9) cover what has no HTTP call: mutation-actions, `logoutSession`, the multipart settings update (by axios adapter, see the task 4 deviation) and `fetchAlerts` with only an id.
- Negative controls: `stores.negative-control.spec.ts` (wrong URL, skipped state mutation, dropped payload field, renamed query parameter, wrong method) all caught. Breaking the real stores (settings fetch URL, alert update method) turned exactly those 3 scenarios red; restored, all green.
- **Harness fixes found on the way** (tooling, not frozen logic):
  - `defineContractSuite` ran every case against every scenario. Cases now take an optional `match`; a scenario no case matches fails the suite.
  - Replay compared a recorded empty GET body (`""`) with no body. An empty recorded body now means none.
  - `describeMismatch` compared arrays by reference, so `[]` never equalled `[]`. Arrays now compare item by item, with self-tests. No earlier store kept arrays in state, so this never showed.
  - Side-effect helpers moved to `src/contract/effects.ts` (redirects, stored token, toasts with legacy content) and are shared by the three suites.
- **Type pipeline** (`tools/type-pipeline`): response specs accept `:param` segments and ignore query strings; every captured scenario must map to a spec or generation fails (it caught the new forgot-password scenarios). Output is now formatted with the client's prettier and `.prettierrc`; before this, `npm run format` in #41 had rewritten `auth.ts`, so `--check` against the committed file could not pass. Generated `auth.ts` (adds `ForgotPasswordResponse`), `settings.ts`, `alert.ts`. Pipeline tests 14/14; `--check` OK.
  - No server type exists for the system settings update body or the alert update body (the server passes `body` straight to Sequelize). The settings update payload is typed as the observed settings object or `FormData` (legacy sends what it fetched, or a form with files); the alert update payload as `{ id, ...fields }` from its two legacy call sites.
  - `organization_logo` and `stamp_image` were only ever `null` in dev data, so the type would have forbidden a logo. I set placeholder filenames in the database for one captured GET, then restored the row (compared with the backup: identical). The type is now `string | null` from observation.
- **Legacy quirks kept (frozen):** `updateAlert` stores the server reply `[1]` in `alert`, typed truthfully as `StoredAlert`; `forgot` passes the returned staff record to `auth_success`, which would put an object in `token` and make the guards treat the browser as signed in. Unreachable today; must be fixed with #107 before forgot password returns.

#### Mapping tables

`auth` (legacy `client/src/core/services/store/auth/*` → `client-vue3/src/stores/auth.ts`, id `auth`)

| Legacy | Pinia | Note |
| --- | --- | --- |
| state `status, token, user, isLoggedInUser, search` | same | `token` reads `user_token` at creation |
| mutation `auth_request`, `auth_success`, `auth_error`, `logout` | same-named actions | |
| action `login(staff)` | `login(staff: LoginRequest)` | byte-identical call |
| action `forgot(phone)` | `forgot(phone: ForgotPasswordRequest)` | byte-identical; no view uses it until #107 |
| action `register(user)` | **dropped** | calls `/users/register`, which the server doesn't have; no caller (decision 4) |
| action `logout` | `logoutSession` | name clash with the mutation-action (from #36) |
| `dispatch('auth/logout')` in `axios.js`, `QuickUser.vue`, `LogoutTimeout.vue` | `useAuthStore().logoutSession()` in `core/axios.ts`, `Layout.vue`; `LogoutTimeout` not ported (decision 12) | |
| `dispatch('auth/login')` in `Login-1.vue` | `useAuthStore().login()` in the sign-in view (task 12) | |

`settings` (legacy `store/settings/*` → `stores/settings.ts`, id `settings`)

| Legacy | Pinia | Note |
| --- | --- | --- |
| state `settings: null` | same | typed from the observed GET |
| mutation `SET_SETTINGS`, `CHANGE_PASSWORD` | same-named actions | `CHANGE_PASSWORD` stays empty, as legacy |
| action `updateSettings`, `fetchSettings`, `changePassword` | same names and bodies | through `core/axios`, same instance legacy `@/axios` configured |
| `dispatch('settings/fetchSettings')` in `Login-1.vue`, `SystemSettings.vue` | `useSettingsStore().fetchSettings()` in the sign-in view; `SystemSettings` in #65 | |
| `dispatch('settings/changePassword')` in `ChangePassword.vue` | `useSettingsStore().changePassword()` in the change password view (task 15) | |
| `dispatch('settings/updateSettings')` in `SystemSettings.vue` | #65 | |

`alert` (legacy `store/alert/*` → `stores/alert.ts`, id `alert`)

| Legacy | Pinia | Note |
| --- | --- | --- |
| state `alert, alerts, total, pages` | same | |
| mutation `ADD_ALERT`, `SET_ALERTS`, `SET_ALERTS_TOTAL`, `SET_ALERTS_PAGES` | same-named actions | |
| action `addAlert`, `fetchAlerts`, `updateAlert` | same names and bodies | `fetchAlerts` maps `itemsPerPage` → `pageLimit`, `id` → `visit_id` as legacy |
| `$store.state.alert.*` and `dispatch('alert/…')` in `AlertAccordion.vue`, `AlertsTable.vue`, `AlertsModal.vue`, `CreateAlert.vue` | consultation and antenatal domain issues | |

### Phase 2: types

- [x] **9. Type pipeline for settings and alert (M).** Add config entries: Alert Joi (`validateAlert`) and any AdminSettings schema or interface for system settings; responses inferred from the new corpora; regenerate `auth.ts` with the new auth scenarios.
  - AC: generated files committed; `npm run check` passes; no hand edits; fields seen only sometimes are optional.

### Phase 3: sign-in design (owner gate)

- [x] **10. Sign-in screen designs (M).** Two or three Direction A variants in the kit harness, at desktop and both tablet sizes: organization name, organization logo (fallback `ms.png`), hospital image (behaviour on narrow tablets settled in design), username, password, Sign in, no forgot-password link (#107). States: validation errors, signing in, server error toast, deactivated account, settings fetch failed, logo failed to load. Change password designed as an entry form in the shell. Kit parts and tokens only; no shell on sign-in.
  - AC: owner picks a variant from screenshots; `DESIGN.md` review gates 1–5 pass; axe clean; 44px targets on touch; the on-screen keyboard doesn't hide the focused field or the button.

  - **Built, waiting for owner review (2026-11-18).** Harness: `kit-harness.html?view=auth&variant=split|card|band&state=default|errors|signing|server-error|deactivated|no-settings|no-logo`, and `&screen=change-password` (`state=errors|server-error`). Code in `src/prototypes/auth/` (fake data, outside the build). Screenshots: `~/Desktop/ehmrs-auth-review/` (30).
  - Sign-in uses vee-validate's `useField` directly, not `useEntryForm`: the archetype's unsaved-changes `beforeunload` prompt would block the reload that the 401 logout does.
  - Legacy logo copied to `client-vue3/public/media/logos/ms.png` at the legacy path, so both apps serve the same URL on one origin. The legacy illustration was used only for the design review; after decision 17 it was removed and the card and band variants were trimmed from the prototype, which now shows the approved split design (`kit-harness.html?view=auth&state=…`).
  - Axe: no serious or critical issues on 14 screens at 3 sizes. Touch sizes: every sign-in and change-password control is at least 44px on tablets; the only flags are the shell's skip link and search box, both handled in #41.

### Phase 4: views (frozen script, new template)

- [x] **11. Auth layout (S).** A signed-out layout for `/auth/*` replacing the `Login-1.vue` parent stub, with `main` landmark, page title and focus on the heading.
- [x] **12. Sign-in view (L).** `src/view/pages/auth/Login-1.vue` (file name kept for route parity) on `useEntryForm` with the transcribed rules; the script follows the trace table: settings fetch and cache on create, submit guard, `login` dispatch, reset and `push('/dashboard')`, button disabled during the request. Defects confirmed in task 1 are fixed as documented deviations (owner decision 3). The organization logo uses the legacy `imageUrl` path (`/static/images/<organization_logo>`) with `ms.png` on error.
  - AC: unit tests for the frozen sequence (request out, storage, navigation, button state); no new API calls.
- [ ] ~~**13. Forgot password (M).**~~ Moved out by decision 1 (revised); follow-up after #107. New working flow on the sign-in page: phone with the decision-13 rule, dispatch `forgot({ phone })`, button disabled while sending, server message as the toast, Cancel back to sign in. Recorded as new behaviour in the PR.
  - AC: unit and e2e tests: invalid phone blocks the request; valid phone sends exactly `{ phone }`; 400 shows the server message; success returns to sign in.
- [x] **14. `/auth/register` (S).** Route kept; redirects to `/auth/login`. Route-parity test updated.
- [x] **15. Change password (M).** `/settings/change-password` view on `EntryForm` inside the shell, script translated from `ChangePassword.vue` (payload, post-save behaviour), rules from task 3, dispatching `settings.changePassword`.
  - AC: trace and rule tables; unit tests for payload and rules; e2e from the account menu; success toast from the interceptor (201).
- [x] **16a. Logout paths (S).** Shell sign-out and the 401 path use `logoutSession` in legacy order (clear state, remove `user_token`, replace to `/`, guard to `/auth/login`). No idle timeout (owner decision 12).

### Phase 5: session and smoke tests

- [x] **16. Session contract tests (M).** Playwright on all three projects: login stores `user_token` and the next request sends `Bearer <token>`; logout and a 401 remove it and land on `/auth/login`; a token set by another tab is used on the next request; protected routes redirect when signed out; `/` goes to `/dashboard` or `/auth/login`.
- [x] **17. Smoke against legacy behaviour and data (L).** Same steps as task 1 against the new sign-in and change password, comparing requests, payloads, toasts, URL and storage with the legacy table, not layout. Runs on recorded responses in every e2e pass; one live run against the dev stack with a temporary account, results in the PR.
- [x] **18. Cross-app session check (M).** Serve the legacy build and the new build behind one local origin (a local proxy config, not committed as production infra; #43 owns nginx) and check that signing in on one is honoured by the other and signing out on either ends both.

#### Phases 4 and 5 results (2026-11-18)

- **Views.** `view/pages/auth/AuthLayout.vue` (signed-out parent route), `view/pages/auth/Login-1.vue` (sign-in; file name kept), `view/pages/auth/components/SignInIllustration.vue` (approved SVG, token colours only), `view/pages/auth/signInNotice.ts`, `view/pages/settings/page/ChangePassword.vue`. `/auth/register` keeps its name and path and redirects to `/auth/login`; `Register.vue` stub deleted. Route parity test unchanged and green.
- **Deviations from legacy, all by owner decision or the quality rule:**
  - The form prevents the browser's own submit, so credentials never reach the URL and the legacy messages show (decision 3).
  - A second submit while signing in is ignored (legacy disabled the button only; Enter could still fire).
  - The deactivated message survives the 401 reload: the view's `catch` saves the server message in `sessionStorage` before the reload (the reload is queued, the `catch` runs first), and the sign-in page shows it once (decision 18). The interceptor is unchanged.
  - The logo is the settings `organization_logo` from `/static/images/`, falling back to `ms.png` (decision 9); legacy always showed `ms.png`.
  - A corrupt `localStorage.settings` no longer breaks the page (legacy `JSON.parse` would throw); a failed settings fetch is still swallowed, without the console call.
  - Autofocus on the username only with a mouse or keyboard; on touch it would open the on-screen keyboard at once.
  - Change password has a Cancel (route back, asks first if typed); legacy had only Submit.
- **Found and fixed on the way:**
  - **Lost submit click (kit, #41).** With blur validation, pressing the mouse on a submit button blurred the field, its error and the error summary disappeared, the button moved up, and the click never happened. Taps on tablets lose it too. Submit buttons now keep focus where it is on mouse down (`KitButton`, `type="submit"`); keyboard use is unchanged. The change password e2e test reproduces it (fails without the fix); the sign-in variant moves too little to reproduce it, so it only checks the submit works.
  - **Progress bar invisible since #38.** Legacy imports `nprogress/nprogress.css`; the port didn't, so the frozen "progress bar on requests" never showed. Imported in `main.ts`. NProgress's own markup uses invalid ARIA roles (`role="bar"`, `role="spinner"`, axe serious); the template drops them and the selectors point at classes. A unit test runs the real NProgress (the interceptor tests mock it); it fails without the selector fix.
  - **Stale Vite config.** `vue-tsc -b` emitted `vite.config.js` and `vitest.config.js` next to the `.ts` files, and Vite loads the `.js` first, so dev had been running a 1 November config. `tsconfig.node.json` now emits into `node_modules/.tmp`; the stale files are deleted. The dev proxy reads `VITE_BACKEND_URL` (default `http://localhost:4050`) and also proxies `/static`, as legacy does.
  - `useEntryForm`: after a successful save the form takes the values left in the fields as its new baseline (it used to restore the submitted values, which undid a handler clearing them), and exposes `reset(values)` for a silent reset; change password's `initValues` uses it, because clearing fields one by one revalidated `new_password` through `confirmed`.
  - `useMediaQuery` returns "no match" where `matchMedia` doesn't exist instead of throwing.
- **Unit tests:** sign-in view 7 (settings fetch and cache, legacy messages, exact payload, success, one request on double submit, deactivated notice across the reload and only once, failed settings with a corrupt cache), change password 5, `useEntryForm` +1, progress 1. `npm test` 167 passing.
- **E2E (`e2e/auth.spec.ts`, desktop and both tablet sizes):** a strict API replay from the recorded corpora (a request that matches no scenario gets 599). Sign in: organization and cache, axe; short values refused in place with no request and nothing in the URL; wrong password one exact request and the legacy toast; a click right after fixing a field still submits; success stores `user_token` and opens `/dashboard`; deactivated notice after the reload, once; `/auth/register`; `/` with and without a token. Session: sign out; 401 mid-session; signing out in one tab means the other tab's next request carries no token. Change password: legacy messages, exact payloads with `Bearer` token, wrong old password keeps the fields, success clears them with no errors, mismatch sends nothing. 39 passing. Full suite 594 passed, 51 skipped by design.
- **Live run against the dev API** (task 17), temporary accounts deleted after: every row of the legacy table repeated on the new client. Same requests and payloads, same toasts, same storage, plus the deviations above.

| # | Step | Legacy | New client |
| --- | --- | --- | --- |
| 1 | Open sign-in | settings fetched and cached, organization shown | same; username focused (mouse) |
| 2 | Short fields, blur | legacy messages | same |
| 3 | Empty submit | native GET submit, reload, no messages | messages in place, no request, URL unchanged |
| 4 | Invalid typed values, click or Enter | **credentials in the URL** | messages in place, no request, URL unchanged |
| 5–6 | Wrong password, click or Enter | one request, legacy toast | same |
| 7 | Deactivated account | logout and reload, **no message** | logout and reload, message shown once |
| 8 | Valid sign-in | `user_token` set, `/dashboard` | same |
| 9 | Sign out | token removed, `/` then `/auth/login` | same |
| 10 | 401 mid-session | logout and reload, no toast | same |
| 11 | `/` without and with token | `/auth/login`, `/dashboard` | same |
| 12 | `/auth/register` | shows sign-in | redirects to sign-in |
| 13 | Change password | legacy messages, toasts, fields cleared on success | same |

- **Shared session across both apps** (task 18): the new production build and the legacy dev client behind one local origin (throwaway proxy in the session scratchpad: `/auth/*` and `/settings/change-password` to the new app, everything else to legacy, `/api` and `/static` to the API). 12 of 12 checks pass: a session started on the new sign-in is accepted by legacy and the reverse; signing out in legacy ends it for the new app; a 401 in either app signs out both.
- **Left as is:** the change password page title reads "eHMRS", because the shell titles pages by their menu section and account pages have none (#41 shell behaviour).

### Phase 6: reference pattern and records

- [x] **19. Domain slice playbook (M).** `docs/migration/domain-slice-playbook.md`, linked from the archetypes README. The steps this issue followed, as a reusable checklist: capture, scrub, store port, mapping table, contract and negative control, types, trace table, rule table, design gate, view, smoke. With templates for each table.
  - AC: a domain issue (#45) can follow it without reading this file.
- [x] **20. Verify (S).** `npm run lint`, `npm run build` (no harness in `dist`), `npm test`, `npm run test:e2e` three times on all projects, type pipeline `--check`, token pipeline `--check`.
- [ ] **21. PR (S).** Into `svsh_branch` with mapping, trace and rule tables, the legacy behaviour table, deviations, screenshots and test results; review section below filled in.

## Owner decisions (2026-11-18)

| # | Question | Decision |
| --- | --- | --- |
| 1 | Forgot password | First: build it working. **Revised the same day: left out of #42.** The server's SMS job never sends the new password (67 of 67 runs failed), so a reset locks staff out. Tracked in #107; forgot password is added once that is fixed. |
| 2 | `/auth/register` | Keep the route; redirect to `/auth/login` |
| 3 | Confirmed legacy sign-in defects | Fix as documented deviations; frozen sequence otherwise unchanged |
| 4 | Store `register` action | Drop as dead code, recorded in the mapping table |
| 5 | Write captures on the dev DB | Yes, with temporary staff and visit rows deleted afterwards; system settings restored to their original values |
| 6 | Forgot-password success capture | Not captured (decision 1 revised) |
| 7 | Smoke test | Both: recorded responses in every run, plus one live dev-stack run recorded in the PR |
| 8 | Shared session check | Now, with both builds behind one local origin |
| 9 | Sign-in page content | Organization name, organization logo (settings `organization_logo`, fallback `ms.png`), hospital image. Forgot-password link waits for #107 |
| 10 | Design options | Two or three Direction A variants as harness screens with screenshots at three sizes |
| 11 | Change password | Screen built in this issue |
| 12 | Idle logout | Not added |
| 13 | Forgot phone rule | `required\|min:11\|max:11\|phone_pattern`, kept for when forgot password returns after #107 |
| 14 | Playbook location | `docs/migration/domain-slice-playbook.md`, linked from the archetypes README |
| 15 | Landing after sign-in | `/dashboard` stub inside the shell is acceptable |
| 16 | Sign-in layout | **Split**: teal brand panel (logo, organization name, illustration) beside the form; panel on top in portrait |
| 17 | Illustration | Replace the legacy blue `health.png` with an image that fits Direction A and earns its place; shown to the owner before use |
| 18 | Deactivated account | Carry the server's 401 message across the logout reload and show it as a notice above the form (new behaviour; logout and reload unchanged) |
| 19 | Change password messages | Legacy wording kept, field names included (decision 6) |
| 20 | Illustration and designs | New teal SVG illustration approved; split sign-in (all states) and change password approved for build (2026-11-18) |

## Out of scope

- Server changes. The forgot-password SMS bug and security concerns are in #107.
- Forgot password in the new sign-in (after #107).
- System settings screen (settings domain, #65) and alert screens (consultation and antenatal domains); only their stores are ported here.
- Idle logout.
- nginx, Docker and Sentry (#43); `AGENTS.md` governance (#44).
- The report `ExportButton` (its domain issue).

## Review

### Summary

- **Stores:** `auth` completed (contract for login and forgot, `register` dropped), `settings` and `alert` ported under the dialect. All three are contract-green against corpora captured from the dev stack and scrubbed. Mapping tables are above.
- **Types:** generated for `auth`, `settings` and `alert` by the type pipeline, which now handles path parameters and query strings and formats its output like the repo.
- **Views:** sign-in (split design with the new illustration), the `/auth/register` redirect and change password, on the archetype kit. Logout paths unchanged. Forgot password is out until #107.
- **`user_token`:** honoured identically. It is set on login and removed on logout and on any 401, in both apps on one origin, across tabs (12 of 12 cross-app checks).
- **Reference pattern:** `docs/migration/domain-slice-playbook.md`, linked from the archetypes README.

### Technical decisions

- **Deactivated notice:** carried across the 401 reload through `sessionStorage` from the view's `catch`, not the interceptor, so the frozen HTTP layer is untouched.
- **Sign-in form:** uses `useField`, not `useEntryForm`, because the unsaved-changes prompt would block a 401 reload.
- **Submit buttons:** they keep focus on mouse down, fixing lost clicks in every form, rather than patching each screen.
- **Request-blind areas:** the multipart settings update is tested at the axios adapter, because the capture proxy can't carry binary bodies.
- **Illustration:** an original SVG in token colours, with no licence question and no hex values.

### Impact

- Kit and archetypes (shared with every later domain): `KitButton` submit focus, `useEntryForm` baseline after save and `reset()`, `useMediaQuery` without `matchMedia`. The full e2e suite is unchanged apart from the new tests.
- HTTP layer: the progress bar is now visible (CSS import), and its markup is free of invalid ARIA roles. Frozen behaviour is unchanged.
- Tooling:
  - The contract harness gains case matching, empty-body handling and array comparison.
  - The type pipeline gains route patterns and repo formatting.
  - The Vite and Vitest configs now actually load (stale `.js` copies removed).
  - E2E runs can no longer reach a real API.
- Dev database: temporary rows only, all deleted. `System_Settings` was compared before and after: identical.

### Testing evidence

- `npm run lint` clean, prettier clean, `npm run build` passes with no harness or prototype code in `dist`.
- `npm test` 167/167. Type pipeline 14/14 and `--check` OK; token pipeline `--check` OK.
- `npm run test:e2e` three times on desktop and both tablet sizes: 1782 passed, 0 failed, 153 skipped by design.
- Live run against the dev API, and the shared-origin run with legacy: tables above.

### Limitations

- Forgot password waits for #107. The server returns the staff record (and from change password, the password hash) to the browser; noted for #107's follow-up.
- The scrubber treats any 13-digit run as a phone number (seen in upload filenames). Fixtures stay safe, but values look odd; the playbook warns about it.
- The change password page title is "eHMRS" (shell titles by menu section).
- The legacy `phone_pattern` length defect is kept for when forgot password returns.
- The shared-origin check used a throwaway local proxy, not the production nginx (#43).

### Future considerations

- #107, then forgot password on the sign-in page with the decision 13 rule.
- #43 can reuse the shared-origin routing proven here (`/auth/*` and `/settings/change-password` to the new app).
- The first domain issue (#45) follows the playbook.
