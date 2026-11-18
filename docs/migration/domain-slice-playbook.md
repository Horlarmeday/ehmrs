# Domain slice playbook

How to migrate one domain (#45 onward) from the Vue 2 client to `client-vue3`. It follows the auth tracer bullet (#42, `tasks/42-auth-tracer-bullet.md`), which is the worked example for every step. The rules behind it are ADR-0002 to ADR-0010; the look is `client-vue3/DESIGN.md` (Direction A).

The order matters: ground truth first, then the frozen logic, then design, then views. A view never wires to a store that is not contract-green.

## 0. Before starting

- Branch `<issue>-<slug>` from `svsh_branch`; plan in `tasks/<issue>-<slug>.md`; owner approves the plan.
- Read the domain's legacy store modules, every view that dispatches into them, the server routes, controllers, services and Joi validations (server is read only).
- List what each store's consumers are. Views in other domains stay with their domain; this slice ports the store anyway if this domain needs it.
- Run the local stack natively: MySQL, Mongo and Redis on the machine, the API with `PORT=<free port> yarn start:dev`, the legacy client with `VUE_APP_BACKEND_URL=http://localhost:<api port> npx vue-cli-service serve --port <free port>` (add `NODE_OPTIONS=--openssl-legacy-provider` on Node 17+). No Docker. Check who owns a port before assuming it is eHMRS.

## 1. Legacy ground truth

1. **Run the legacy screens** with Playwright against the dev stack and record a behaviour table: each step, requests and payloads, status codes, toasts, URL, `localStorage`. Keep raw logs outside the repo. Expect legacy defects; record them, don't copy them blindly (owner decides; #42 found credentials going into the URL).
2. **Trace table per view** (frozen script, ADR-0002): guard → dispatch with payload → post-dispatch behaviour, each row pointing at a legacy line.
3. **Rule transcription table** (ADR-0007): every `v-validate` rule, its v4 form and message, and the timing (`data-vv-validate-on`). Check `v-validate`, not the asterisks. Custom rules port verbatim; check every legacy copy of a custom rule, as copies differ (`phone_pattern` has two versions).

Templates:

| # | Step | Legacy line | Frozen? |
| --- | --- | --- | --- |
| 1 | Guard: `validateAll()`; stop if invalid | 214 | yes |

| View | Field (message name) | Legacy v2 | v4 | Timing |
| --- | --- | --- | --- | --- |
| Sign in | `username` | `required\|min:3` | `required\|min:3` | blur |

## 2. Fixtures (ADR-0005)

- Capture through `tools/contract-harness` (`npm run capture` against the dev API), then `npm run fixtures` with `--known-real` for every real value you typed or saw.
- Create temporary rows with SQL, not through the API, when the API would queue side effects (SMS, outbox). Give them **invented words** that never occur as field values (`Zorvik Quellan`). The scrubber learns names and replaces them in every string: naming a staff member "Capture Active" turned every `status: "Active"` into a fake name. If that happens, delete those entries from `~/.ehmrs/scrubber-map.json` (back it up first) and capture again.
- Back up any row a write capture touches and compare it afterwards. Delete every temporary row.
- The proxy reads bodies as UTF-8, so file uploads cannot be captured; cover multipart with a unit test on the axios adapter.
- To observe a value the dev data never has (for example a logo filename), set it in the database for one captured GET and restore it.
- Grep the corpus for every known real value, `eyJ` and `$2a$`/`$2b$` before committing.

## 3. Stores (ADR-0003, ADR-0006)

- One store per module, same id, actions with the same names and bodies, every mutation a same-named action, calls through `core/axios`.
- Dead code (calls to endpoints the server doesn't have, with no caller) is dropped only with owner sign-off and recorded.
- Type state from generated types. Where legacy stores something odd (an update count in an `alert` field), keep the behaviour and make the type say so.
- Mapping table per store, in the plan and the PR:

| Legacy | Pinia | Note |
| --- | --- | --- |
| mutation `SET_SETTINGS` | same-named action | |
| `dispatch('settings/fetchSettings')` in `Login-1.vue` | `useSettingsStore().fetchSettings()` | |

## 4. Contract tests

- `src/contract/__tests__/<store>.contract.spec.ts` with `defineContractSuite`. Each case has a `match`; a scenario no case matches fails. Expectations come from the legacy module and legacy `axios.js`, never from the port.
- Check side effects with `src/contract/effects.ts`: stored token, `location.replace` on 401, and toasts with legacy content (201 and 204 success, any error with the server message).
- Negative controls: drifted copies (wrong URL, method, payload, query name, skipped state change) must fail, and so must the real store with one call broken. Record both.
- Non-HTTP behaviour (mutation-actions, `logoutSession`, multipart) goes in `src/stores/__tests__`.

## 5. Types (ADR-0004)

- Add the module to `tools/type-pipeline/config/modules.json`: Joi or interface request specs, and a response spec for every captured route. Use `:param` for ids; query strings are ignored. Generation fails if a captured scenario has no spec.
- `npm run generate`, then `npm run check`. Output is formatted with the client's prettier, so `npm run format` never changes it.
- Where the server has no request type, derive it from what legacy sends and say so in the plan.

## 6. Design (owner gate)

- Pick the archetype from `docs/design/information-architecture.md` and `client-vue3/src/components/archetypes/README.md`.
- Build the screens in the kit harness (`src/prototypes/<domain>/`, `kit-harness.html?view=<domain>`) with fake data, in every state, at desktop, tablet landscape and tablet portrait. On portrait, keep forms in the top half: the on-screen keyboard covers the bottom.
- Run axe and the 44px touch check on every screen; take screenshots; the owner approves before any real view is built. Images use token classes only (no hex), like `SignInIllustration.vue`.

## 7. Views

- Translate the frozen script step by step from the trace table; the template follows the approved design.
- Forms: `useEntryForm` with the transcribed rules, `validateOn: 'blur'` where legacy had it, the legacy message name (`as` when legacy set `data-vv-as`). Use `form.reset(values)` to clear fields after a save; setting them one by one revalidates dependent rules. Catch a failed save at the call site, as legacy did.
- A screen whose page may reload itself (anything a 401 can hit) must not use the unsaved-changes prompt; sign-in uses `useField` directly for that reason.
- Every deviation from legacy is either an owner decision or a quality fix (no credentials in URLs, no double submit, no crash on bad storage), and is listed in the plan and the PR.

## 8. Tests for the views

- Unit: mount the view with a memory router and replay the corpus with `createReplayServer`; check exact payloads, navigation, storage, button state and messages.
- E2E (`client-vue3/e2e/<domain>.spec.ts`): strict API replay from the corpora (unmatched request gets 599), on desktop and both tablet projects, tapping on touch; axe on every state.
- One live run against the dev API repeating the legacy behaviour table; results in the plan.

## 9. Finish

- `npm run lint`, `npm run build` (no harness or prototype code in `dist`), `npm test`, `npm run test:e2e` three times, `tools/type-pipeline` `npm run check`, `tools/token-pipeline` `npm run check` if tokens changed.
- Plan file: tasks ticked, review section written. PR into `svsh_branch` with the mapping, trace, rule and behaviour tables, deviations, screenshots and test results.
