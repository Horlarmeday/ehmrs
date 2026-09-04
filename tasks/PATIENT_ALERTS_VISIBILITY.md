# Patient Alerts — Doctor Authoring & Global Visibility

## Project Overview
Two changes to the existing patient alert feature:

1. **Authoring** — Doctors (all `Medical Practitioners` specialties, plus `Administrator`) can create alerts. Today only `Nurse`/`Super Admin` can, via a role-gated tab.
2. **Visibility** — Alerts become conspicuous across the app via a pulsing header badge plus a dismissible banner, instead of being buried behind a pulse icon on two pages.

Alerts remain **patient-scoped** (not system-wide broadcasts). "Seen on all pages" means: visible on every page where the patient context is loaded.

## Current State Analysis

### Data model
- `Alert` (`server/src/database/models/alert.ts`): `patient_id` (required), `alert` (TEXT), `status` (Active/Inactive, default Active), `staff_id` (nullable), `timestamps: true`.
- No migration file exists for the alerts table — it originated from `sync` or a manual/SQL path. **The new migration is the first one for this table.**
- Legacy imported rows exist (`server/src/public/ehmrs_12062024/alerts.json`), authored by `staff_id: 54`, dating to Jan 2024. Content is genuinely clinical: `KNOWN HYPERTENSIVE PATIENT`, `BAD OBSTETRIC HISTORY / 4 MISCARRIAGES`, `1 PREVIOUS SCAR 2022`.
- The legacy dump has a `dependant_id` column absent from the current model. **Out of scope.**

### Server
- `alert.routes.ts` — `verify` only (JWT presence). No role enforcement.
- `authorize()` (`core/middleware/authorize.ts`) exists but is used in **zero routes app-wide**. Dead code.
- JWT payload (`staff.ts:185`) already carries `role` **and** `department` — no DB lookup needed for gating.
- `getAlerts` already filters `status: Status.ACTIVE` (`alert.repository.ts:39`).
- `AlertService.getAlerts` resolves `visit_id → patient_id` and contains a stray `console.log(body)` (`alert.service.ts:19`) plus a confused `if (Object.values(body).length)` branch.

### Client — where alerts appear today
| Surface | File | Reach | Create form? |
|---|---|---|---|
| Alerts tab | `programs/antenatal/tabs/Alerts.vue` | antenatal `Tabs.vue` only, gated `nurseAllowedTabs` | **Yes** |
| Pulse icon → modal | `consultation/components/PulseIcons.vue` → `AlertsModal.vue` | consultation + antenatal Tabs only | No (read-only) |

- **The real doctor gate** is `programs/antenatal/Tabs.vue:161` — `v-if="nurseAllowedTabs.includes(currentUser.role)"` where `nurseAllowedTabs: ['Super Admin', 'Nurse']` (line 247). Doctors (`doctorAllowedTabs: ['Administrator', 'Medical Practitioners']`, line 245, gated on **`department`**) never see that tab, so they get the read-only modal only.
- `visits/page/Tabs.vue` also maps an Alerts tab (line 71) but is only reached via `treatment-records`.
- `consultation/Tabs.vue` (the `visit-details` page) has **no** alert surface beyond the pulse icon.
- **Gating fields are inconsistent app-wide**: nurse gates use `currentUser.role`, doctor gates use `currentUser.department`.

### The `:id` trap (critical)
`Header.vue:237` `displayPatientDetails` lists **26 routes** where the patient header renders. Every route path is `:id`, but the meaning differs:
- `visit-details`, `ante-natal-visit`, `create-vitals` → **visit id**
- `admission-*` (`AdmissionOperations.vue:166` → `admission/fetchAdmission`) → **admission id**

`alert/fetchAlerts` sends `visit_id`, and the server calls `VisitService.getVisitById(visit_id)`. **Reusing it on admission pages would resolve the wrong patient or throw — i.e. show Patient A's alerts under Patient B's name.** This is why the fetch keys off `currentPatient.id` instead (see T4).

Every header route already dispatches `patient/setCurrentPatient({ ...res.insurance, ...res.patient })`, so `currentPatient.id` is uniformly correct on all of them.

### Existing precedent to follow
`layout/header/PatientDetails.vue:52-61` renders a pulsing red badge — **"Difficult Patient"** — driven by `patient.is_difficult_patient`, in the global header. This is the house style for "stop and read this" and the new badge sits alongside it.

## Design Decisions (agreed)

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Surface shape | **Badge + banner** | Badge (icon + count) always visible; banner for higher severity. |
| 2 | Dismissal scope | **Client-only, per user + patient + session** (`sessionStorage`) | No schema change; no medico-legal "who acknowledged" record created by accident. Badge stays as the durable signal. |
| 3 | Fetch path | **New `GET /alerts/patient/:patientId`**, header watches `currentPatient.id` | Sidesteps the visit-vs-admission `:id` trap entirely. No changes to the 8 `setCurrentPatient` call sites. |
| 4 | Create form location | **Header popover "Add Alert"** (all header routes) **+ widened tab gate** | Doctors get authoring anywhere; nurses' existing tab workflow is untouched (no retraining). |
| 5 | Server enforcement | **None — UI gate only** | Consistent with the whole codebase; `authorize()` is unused everywhere. Hardening one low-risk endpoint while ~200 higher-risk ones stay open is security theatre. Failure mode of over-permissive create (an extra note, attributed + reversible) is far milder than a doctor blocked from flagging an allergy. **Follow-up issue to be filed** for app-wide `authorize()`. |
| 6 | Severity | **`Critical` / `Warning` / `Info` enum** | Without tiers the banner fires equally for "allergic to penicillin" and "family requests updates", training people to swat it. |
| 7 | Banner threshold | **`Critical` + `Warning`**; badge popover lists all | |
| 8 | Legacy default | **`Warning`** | Legacy rows are real clinical risk flags; defaulting to `Info` would silently silence "KNOWN HYPERTENSIVE PATIENT" on ship day — a safety regression. Per-session dismissal caps the day-one noise at one click per patient. |
| 9 | Severity on create | **Required, `Warning` preselected** | Deliberate choice, one click, nobody has to think hard to submit. |
| 10 | Who can author | **`doctorAllowedTabs` (`Administrator`, `Medical Practitioners`) by `department`** + existing `Nurse`/`Super Admin` by `role` | Dept 9 holds ~20 specialties; a role-name allowlist would silently exclude any new specialty. Reuses the existing constant rather than inventing a third grouping. |
| 11 | Expiry | **None** — `status` toggle remains the only lifecycle control; **show relative age** in banner/popover | Any auto-expiry rule silently hides permanent facts ("1 PREVIOUS SCAR 2022"). Relative age lets the clinician judge staleness without anything being hidden. Shipping the banner is itself the prompt that gets stale alerts toggled off. |
| 12 | Attribution | **Author fullname + absolute date/time + relative age** on every surface | Explicit user requirement. |
| 13 | Inactive alerts | **Never displayed** on any surface | Already guaranteed by `status: Status.ACTIVE` in the repository where-clause. |

### Explicitly out of scope
- Applying `authorize()` app-wide (separate follow-up issue).
- `dependant_id` alerts.
- Persisted/auditable acknowledgements.
- Turning alerts into non-patient-scoped system broadcasts.

---

## Tasks

### T1 — `severity` column + enum  ·  Complexity: S
- [x] Add `AlertSeverity` enum to `server/src/database/enums.ts`: `CRITICAL = 'Critical'`, `WARNING = 'Warning'`, `INFO = 'Info'`.
- [x] Add `severity` column to `Alert` model: `DataType.ENUM(...)`, `defaultValue: AlertSeverity.WARNING`, `allowNull: false`.
- [x] Create migration `server/src/database/migrations/<timestamp>-add-severity-to-alerts.js` — `addColumn` with the same default so **existing rows backfill to `Warning`**.
- [x] Write the `down` migration (`removeColumn`, and drop the ENUM type on Postgres).

**Acceptance:** Migration runs clean on a copy of production data; every pre-existing row reads `Warning`; `down` reverses without error.

### T2 — Accept and validate `severity` on create  ·  Complexity: S
- [x] `validations.ts` — add `severity: Joi.string().valid(...Object.values(AlertSeverity)).required()`.
- [x] `alert.repository.ts::createAlert` — destructure and persist `severity` (it is currently dropped on the floor even if sent).
- [x] Confirm `updateAlert` passes `severity` through (it spreads `data`, so it already does).

**Acceptance:** POST with a valid severity persists it; POST with `severity: "Urgent"` returns 400; POST with no severity returns 400.

### T3 — Clean up `AlertService.getAlerts`  ·  Complexity: S
- [x] Remove the `console.log(body)` at `alert.service.ts:19` (violates the no-debugging-artifacts standard).
- [x] Collapse the redundant `if (Object.values(body).length)` branch — both arms call `getAlerts`; defaults live in the repository signature already.

**Acceptance:** Existing visit-scoped alert fetches behave identically; no console output on request.

### T4 — New endpoint `GET /alerts/patient/:patientId`  ·  Complexity: M
- [x] `alert.repository.ts` — add `getAlertsByPatient({ patient_id })`: `status: ACTIVE`, `include: [{ model: Staff, attributes: staffAttributes }]`, `order: [['createdAt','DESC']]`. **Unpaginated** (header needs the full set for an accurate count).
- [x] `alert.service.ts` — `getPatientAlerts(patientId)`.
- [x] `alert.controller.ts` — `getPatientAlerts` handler; reject a non-numeric `:patientId` with 400.
- [x] `alert.routes.ts` — `router.get('/patient/:patientId', verify, AlertController.getPatientAlerts)`. **Register before any conflicting route.**

**Acceptance:** Returns only Active alerts for that patient, newest first, each with `staff` (fullname), `createdAt`, `severity`. Returns `[]` (not 404) for a patient with none. Inactive alerts never appear.

### T5 — Vuex: patient-scoped alerts  ·  Complexity: S
- [x] `moduleAlertState.js` — add `patientAlerts: []`.
- [x] `moduleAlertMutations.js` — `SET_PATIENT_ALERTS`.
- [x] `moduleAlertActions.js` — `fetchPatientAlerts({ commit }, patientId)` → `GET /alerts/patient/${patientId}`.
- [x] Keep the existing visit-scoped `alerts` state untouched so the tab and modal keep working.

**Acceptance:** Dispatching populates `patientAlerts` without disturbing `alerts`.

### T6 — Header badge in `PatientDetails.vue`  ·  Complexity: M
- [x] Add a pulsing `label-danger ... pulse` badge **next to the Difficult Patient badge**, matching its markup exactly. Icon `fas fa-exclamation-triangle`, text `{{ count }} Alert(s)` (correct singular/plural).
- [x] `v-if` on `patientAlerts.length` — render nothing when there are none.
- [x] Colour by highest severity present: `label-danger` if any `Critical`, else `label-warning`.
- [x] `watch` `currentPatient.id` (immediate, guarded against null) → dispatch `fetchPatientAlerts`. Clear `patientAlerts` when `currentPatient` becomes null, so alerts never bleed between patients.
- [x] Click opens the popover/modal (T7).

**Acceptance:** Badge appears on all 26 header routes for a patient with active alerts — **verify at least one `admission-*` route and one visit route**, confirming the same patient's alerts on both. Navigating from Patient A to Patient B replaces the count; it never shows A's alerts under B's name.

### T7 — Alerts popover/modal with attribution + Add Alert  ·  Complexity: M
- [x] Modal listing every active alert: text, **severity badge**, **author fullname**, **absolute date/time** (`DD/MM/YYYY, h:mma` — matches `AlertsTable`), and **relative age** (`dayjs('from','now')`, e.g. "2 years ago").
- [x] **Null-author fallback**: `alert.staff?.fullname || 'Unknown'`. `staff_id` is nullable and legacy rows may not resolve — `AlertsTable.vue:22` would throw on these today.
- [x] "Add Alert" button, shown only to authorised staff (T9): textarea + **required** severity select preselected to `Warning`.
- [x] On submit → `alert/addAlert` with `patient_id`, then re-fetch `fetchPatientAlerts`.

**Acceptance:** Every row shows author, timestamp, and age. An alert with a missing staff record renders "Unknown" rather than crashing the modal. Creating an alert updates the badge count without a page reload.

> **Note — `addAlert` needs a `patient_id` path.** The create endpoint currently requires `visit_id` (`validations.ts`), which the header does not have on admission routes. **Change the Joi schema to accept either `visit_id` or `patient_id` (`Joi.alternatives` / `xor`)**, and have `AlertService.createAlert` skip the visit lookup when `patient_id` is supplied directly. Without this, authoring from the header fails on exactly the pages the trap affects.

### T8 — Dismissible banner  ·  Complexity: M
- [x] New component rendered in `Layout.vue` directly above `<router-view />`, so it spans the content area on every page.
- [x] Shows only alerts with severity `Critical` or `Warning`; renders nothing if none, or if `currentPatient` is null.
- [x] Each entry: text, severity, author, date/time, relative age.
- [x] Dismiss (×) writes to `sessionStorage` keyed **`alertsDismissed:<staffSub>:<patientId>`** (staff id from `parseJwt`), so dismissal is per user, per patient, per session, per decision #2.
- [x] Re-shows on a new session, or for a different patient in the same session.
- [x] Wrap `sessionStorage` access in `try/catch` — it throws in some privacy modes.

**Acceptance:** Banner appears on first patient page load; dismissing hides it across route changes for that patient; switching patients shows it again; a new browser session shows it again. The badge (T6) stays visible after dismissal.

### T9 — Widen the authoring gate  ·  Complexity: S
- [x] `programs/antenatal/Tabs.vue:161` — change the Alerts tab `v-if` to `nurseAllowedTabs.includes(currentUser.role) || doctorAllowedTabs.includes(currentUser.department)`. **Leave the other `nurseAllowedTabs` tabs (incl. Items, line 174) unchanged.**
- [x] Apply the same combined condition to the "Add Alert" control in T7.
- [x] Add a shared helper (e.g. `canCreateAlerts(currentUser)`) so the rule lives in one place rather than being duplicated across three components.

**Acceptance:** A `General Practitioner` and a `Cardiologist` both see the Alerts tab and the Add Alert button. A `Nurse` and `Super Admin` retain exactly their current tab set. A `Pharmacy` user sees neither control (but note per decision #5 the API remains open — this is a signpost, not a security boundary).

### T10 — Fix the null-staff crash in `AlertsTable`  ·  Complexity: XS
- [x] `AlertsTable.vue:22` — `{{ alert.staff?.fullname || 'Unknown' }}`.

**Acceptance:** The existing tab/modal render legacy alerts with unresolvable staff without throwing.

### T11 — Verification pass (Always Works™)  ·  Complexity: M
- [ ] Run the app; log in as a **doctor**, create an alert from the header on a `visit-details` page.
- [ ] Log in as a **nurse**; confirm the same alert is visible in the badge, banner, tab, and pulse modal, with the doctor's name and timestamp.
- [ ] Repeat creation from an **`admission-*`** page — this is the `:id` trap; confirm the alert lands on the right patient.
- [ ] Toggle an alert **Inactive**; confirm it disappears from badge, banner, popover, and modal.
- [ ] Confirm a `Info`-severity alert appears in the popover but **not** the banner.
- [ ] Check the browser console for errors on each surface.
- [ ] Verify on a patient with **zero** alerts that no badge or banner renders.

**Acceptance:** All of the above observed directly in the running app, not inferred.

---

## Risks & Open Items
- **Cross-patient leakage** is the highest-severity risk. Mitigated by keying strictly off `currentPatient.id` (never `$route.params.id`) and clearing state when the patient changes. T11 verifies this explicitly.
- **Day-one banner noise** — all legacy rows become `Warning`. Accepted per decision #8; per-session dismissal caps the cost. Monitor after release; if noisy, triage historical rows down to `Info` (not an auto-rule).
- **`Administrator` in the authoring gate** — included by reusing `doctorAllowedTabs`. If `Administrator` means IT staff rather than senior clinicians in this deployment, revisit T9.
- **Follow-up issue to file:** apply `authorize()` app-wide, or delete it. Alert `update` (which can silence another clinician's alert) is the strongest candidate for the first real enforcement.
- **Unpaginated patient alert fetch** (T4) is fine at current volumes. If any patient accumulates dozens of active alerts, cap the banner at the top N by severity and link to the modal for the rest.

## Change: standalone "Add Alert" header button

The badge renders only when the patient **already has** alerts (`v-if="alerts.length"`), so an
authorised user viewing a patient with **none** had no way to author the first one from the header —
they would have fallen back to the Alerts tab, which does not exist on `visit-details`, the page
doctors actually work from. That defeated the point of the header entry point.

Resolved with a **standalone "Add Alert" button** in the header, next to the badge, shown to
authorised staff (`canCreateAlerts`) regardless of whether any alert exists. It opens the same modal
straight into the create form via a new `start-in-form` prop.

Two entry points, one modal:

| Control | Shown when | Opens |
|---|---|---|
| Alert count badge | the patient has ≥1 active alert (everyone) | modal, list view |
| "Add Alert" button | the user may create alerts (everyone else's view: hidden) | modal, form view |

**Placement:** the button is a sibling of the `<ul class="menu-nav">`, not a `<li>` inside it, wrapped
in `<div class="ml-auto">` — mirroring the pattern the original author left commented out at the
bottom of the same file. `flex-grow-1` was added to the component root because `.header-menu` is
`display:flex` with no grow, so without it the root only spans its content and `ml-auto` has nothing
to push against. Verified in Chrome at 1600px and 1100px: the button sits hard right, patient details
stay left.

**Right-alignment required a second change, in `Header.vue`.** `_header-menu.scss` gives `flex-grow: 1`
to `.header-navs`, `.tab-content` and `.tab-pane`, but NOT to `.header-menu` itself, so that container
shrank to its content width and `ml-auto` inside it had nothing to push against. Fixed by adding
`flex-grow-1` to the `#kt_header_menu` div (`Header.vue:132`) rather than editing the shared Metronic
SCSS, which would affect every page's nav.

**The modal closes on successful save.** An earlier version only collapsed the form back to the list
view, leaving the user to dismiss the modal by hand. It now sets `activePrompt = false` after the
refetch resolves, so the header badge and banner already reflect the new alert as the modal closes;
`@hidden="resetForm"` then clears the draft, so reopening starts clean. A FAILED save still keeps the
modal open, with the typed content intact and the error shown inline.

**Deactivation was missing for doctors — fixed.** The only deactivate control in the app was the
toggle in `AlertsTable.vue`, gated `allowedRoles: ['Nurse']` and reachable only from the antenatal
tab and the old pulse-icon modal. So a doctor could now raise an alert but could not retract one,
from anywhere. The new modal gains a per-alert deactivate control (a `×` on each row) gated on the
same `canCreateAlerts` rule as authoring: whoever may raise an alert may retract one. It confirms via
SweetAlert2 first, matching the existing toggle's pattern, then PUTs `{status: 'Inactive'}` and
refetches so the badge, banner and list update together.

**BUG FOUND IN TESTING — dismissal silenced future alerts.** The dismissal key was
`alertsDismissed:<user>:<patient>`, carrying no alert identity, so one dismissal suppressed the banner
for that patient for the rest of the session — including alerts created AFTER the dismissal. Reported
from the running app: "created a critical alert and the banner did not show up, although it did show
before then I dismissed."

Fixed by including the sorted ids of the banner-eligible alerts in the key:
`alertsDismissed:<user>:<patient>:<id,id,...>`. Dismissing `{5,9}` no longer silences `{5,9,12}` — a
new alert changes the key and the banner returns. Ids are sorted so a reordered fetch does not
resurface a dismissal, and the key is null when no banner-eligible alert exists.

Verified across 10 scenarios: the reported bug, dismissal persisting across reloads, order-
insensitivity, a shrinking set (stays dismissed — correctly, since that exact set was dismissed
earlier), per-patient and per-user isolation, and Info-only alerts never reaching the banner.

**Deactivation is one-way in the UI.** `status` flips back in the data, but Inactive alerts are
filtered out of every read path, so nothing can list one to reactivate. The confirm dialog says the
alert will no longer be shown to any staff. Reactivation is not in scope; if it is wanted, it needs a
deliberate surface (an "include inactive" toggle on the modal) rather than being inferred.

The modal's own inline "Add Alert" launcher was removed — the header now owns that action, so there
is exactly one place to start authoring. Cancel closes the modal; a successful save returns to the
list with the new alert visible.

## Implementation Notes & Deviations

1. **Dialect is MySQL**, not Postgres (`config.json` / `db-config.ts`). The plan's note about dropping an ENUM type in the `down` migration does not apply — `removeColumn` alone is correct.
2. **Table name is `Alerts`** — inferred, matching the `Patients`/`Visits`/`Staffs` convention in existing migrations; there is no `tableName` override and no `define` option in `data-source.ts`.
3. **`CreateAlert.vue` (the existing nurse form) had to be updated**, which the plan did not call out. `severity` is now required by `validateAlert`, so the untouched nurse form would have started returning 400. It now has a severity select defaulting to `Warning`, and pre-fills severity when editing.
4. **The update path is unaffected** by the new required field — `validateAlert` is only invoked on create (`alert.controller.ts:27`); `updateAlert` uses the `isEmpty` check only. The disable toggle (`{id, status}`) and the edit flow keep working.
5. **A shared helper was added** at `client/src/core/plugins/alertPermissions.js` holding `canCreateAlerts`, the severity constants, `highestSeverity`, and a non-throwing `getCurrentUser` (`parseJwt` throws on a missing/invalid token, which is unacceptable in a component that renders on every page).
6. **`white-space: pre-wrap`** on alert text in both new components — legacy rows contain embedded newlines (e.g. `BAD OBSTETRIC HISTORY\n4 MISCARRIAGES`) that would otherwise collapse.
7. **`vue-template-compiler` resolves to 2.7.16**, not 2.6.x — optional chaining in templates compiles fine (verified directly). This matches existing `alerts?.length` usage already in the codebase.
8. **Pre-existing broken build on `master`**: `client/src/core/services/store/laboratory/moduleLaboratoryMutations.js:95` has a `console.log` that fails the `no-console` lint rule during `yarn build`. Introduced in commit `60b9ba9e`, unrelated to this work. **Left as-is — needs a separate decision.**

## Verification Status

| Check | Status |
|---|---|
| Server typecheck (`tsc --noEmit`, whole project) | **Pass** |
| Create-validation matrix (7 cases, incl. both real callers) | **Pass** |
| Repository pagination defaults survive the T3 branch removal | **Pass** |
| `canCreateAlerts` / `highestSeverity` logic matrix | **Pass** |
| ESLint on all new/changed client files | **Pass** |
| Banner dismissal scoping matrix (7 scenarios) | **Pass** |
| Client production build (`yarn build`) | **Pass** |
| SQL twin matches the Sequelize migration's emitted DDL | **Pass** |
| Modal entry-path matrix (5 states, both controls) | **Pass** |
| Modal template compiles after markup restructure | **Pass** |
| Migration executed against a database | **Not run** — blocked |
| End-to-end run-through (T11) | **Not run** — blocked |

### SQL twin
`server/src/database/scripts/alert-severity.sql` mirrors the Sequelize migration for DBA-led
deployment, following the house style of `goods-receipt-entry-paths.sql` (#28): rationale, Up, Down,
pre-checks and rehearsal checks.

Equivalence was verified by running the JS migration through a real `queryInterface` with a stubbed
executor:

```
UP  : ALTER TABLE `Alerts` ADD `severity` ENUM('Critical', 'Warning', 'Info') NOT NULL DEFAULT 'Warning';
DOWN: ALTER TABLE `Alerts` DROP `severity`;
```

The twin differs only by the cosmetic `AFTER \`status\`` clause, which the script documents as
droppable. Apply **one** of the two, never both — and if the SQL script is used, insert the
migration filename into `SequelizeMeta` (the script says how) so a later `db:migrate` does not
re-apply it.

Unlike #28's script, **this one has NOT been rehearsed against a schema-only clone** — the table name
`Alerts` is inferred from the model and the naming convention, not read from the live dump. Pre-check 0
in the script confirms it before anything is altered.

### Blocked
Docker is not running locally, and a direct MySQL connection attempt was denied by the sandbox (it embeds the production DB password). So the migration has **not** been executed and no surface has been exercised in a browser. **T11 remains genuinely unverified** — the code is typechecked, lint-clean and unit-verified at the logic level, but nothing has been observed running.

To finish verification:
```
cd server && yarn migration     # applies 20260904000000-add-severity-to-alerts
cd client && yarn serve
```
Then work through the T11 checklist, paying closest attention to creating an alert from an `admission-*` page (the visit-vs-admission `:id` trap).

## Review
_To be completed after T11 verification._
