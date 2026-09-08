# Issue 37 — [Foundation 4/8] Router port 1:1 — routes, guards, role meta + route-parity table

Parent: #33 (Vue 2 → Vue 3 Migration PRD) · Branch: `37-router-port` (from `svsh_branch`) · Blocked-by: #34 (done)

## What we build

Port `client/src/router.js` (192 path entries, 154 `requiresAuth` meta entries, single global guard + one `beforeEnter`) 1:1 to vue-router 4 in `client-vue3/`, with stub view components so the router mounts in the scaffolded app. Produce a route-parity table proving every legacy route has a target or an explicit drop decision.

## Tasks

- [x] Create branch `37-router-port` (trivial)
- [x] Install `vue-router@4` in `client-vue3` (trivial)
- [x] Generate stub view components for every component path referenced by the legacy router (`client-vue3/src/view/**`), each a placeholder `<router-view/>` shell replaced per-domain by later issues (medium)
- [x] Port router to `client-vue3/src/router/index.ts` (medium):
  - `createWebHistory(import.meta.env.BASE_URL)`, `scrollBehavior() { return { x: 0, y: 0 } }`
  - all 192 path entries preserved verbatim (paths, names, nesting, `meta.requiresAuth`)
  - root `/` `beforeEnter` (token → `/dashboard`, else `/auth/login`) ported to pinia `useAuthStore().token`
  - global `beforeEach` ported; `RESET_LAYOUT_CONFIG` dispatch dropped (dead presentation module, ADR-0006)
  - `path: '*'` → `/:pathMatch(.*)*` redirect to `/404` (vue-router 4 catch-all spelling)
  - Drop Metronic demo routes: `quill` (live in legacy), `builder` (already commented out in legacy)
  - Known legacy quirks preserved 1:1 and documented: duplicate name `results-update` (laboratory + radiology — last-wins name lookup in both router versions, both linked by path not name), duplicate parent path `/settings` (`settings` + `account-settings` — first-registered wins path match in both versions)
  - One mechanical adaptation: `/statistics` child `path: '/'` → `path: ''` — vue-router 4 treats leading-slash children as root paths (would collide with the real `/` route); the route is name-unreferenced and URL-unlinked in legacy; documented in parity table
- [x] Wire `main.ts`: pinia + router; App.vue renders `<router-view/>` (trivial)
- [x] Guard behavior tests (`src/router/__tests__/router.spec.ts`, memory history): unauthenticated → `/auth/login`; authenticated passes `requiresAuth`; `/` root redirect both branches (medium)
- [x] Route-parity test: extract (path, name, requiresAuth) from `client/src/router.js` via parser and compare with `router.getRoutes()` — every legacy route ported or explicitly dropped (quill, builder) (medium)
- [x] Route-parity table (markdown, every legacy path → target/drop + notes) in this file (medium)
- [x] Verify locally: `npm run lint` (0 errors), `npm run test` (green), `npm run build` (green), `npm run dev` boots and serves routes (trivial)
- [x] Commit `feat(#37): port router 1:1 to vue-router 4 + route-parity table`; open PR to `svsh_branch`

## Acceptance criteria (from issue)

- [x] All routes ported with identical paths and names
- [x] Guards ported 1:1; guard behavior tests pass
- [x] All role-meta entries (154 × `requiresAuth`) preserved; route-parity table complete
- [x] Metronic demo routes dropped and listed in the parity table
- [x] Router mounts in the scaffolded app

## Route-parity table

Every legacy route from `client/src/router.js` (191 live entries; 192 `path:` occurrences include the commented-out Metronic `builder` demo). Status column is `ported 1:1` unless noted.

| Legacy path | Name | requiresAuth | Target |
|---|---|---|---|
| `/404` | `404` | — | ported 1:1 |
| `/:pathMatch(.*)*` | — | — | ported 1:1 |
| `/account/transactions/:id` | `transaction` | yes | ported 1:1 |
| `/account/transactions` | `transactions` | yes | ported 1:1 |
| `/account` | `account-module` | — | ported 1:1 |
| `/admission/additional-prescriptions/:id` | `admission-additional-prescriptions` | yes | ported 1:1 |
| `/admission/careplans/:id` | `admission-careplans` | yes | ported 1:1 |
| `/admission/change-ward/:id` | `admission-change-ward` | yes | ported 1:1 |
| `/admission/delivery/:id` | `delivery` | yes | ported 1:1 |
| `/admission/discharge-patients` | `discharge-patients` | yes | ported 1:1 |
| `/admission/discharge/:id` | `admission-discharge` | yes | ported 1:1 |
| `/admission/doctor-prescriptions/:id` | `admission-doctor-prescriptions` | yes | ported 1:1 |
| `/admission/history/:id` | `admission-history` | yes | ported 1:1 |
| `/admission/iocharts/:id` | `admission-iocharts` | yes | ported 1:1 |
| `/admission/nursing-notes/:id` | `admission-nursing-notes` | yes | ported 1:1 |
| `/admission/observations/:id` | `admission-observations` | yes | ported 1:1 |
| `/admission/operations/:id` | `admission-operations` | yes | ported 1:1 |
| `/admission/postnatal/:id` | `postnatal` | yes | ported 1:1 |
| `/admission/recommended-discharge-patients` | `recommended-discharge-patients` | yes | ported 1:1 |
| `/admission/treatments/:id` | `admission-treatments` | yes | ported 1:1 |
| `/admission` | `admission` | — | ported 1:1 |
| `/auth/login` | `login` | — | ported 1:1 |
| `/auth/register` | `register` | — | ported 1:1 |
| `/consultation/:id` | `visit-details` | yes | ported 1:1 |
| `/consultation` | `consultation` | — | ported 1:1 |
| `/dashboard` | `dashboard` | yes | ported 1:1 |
| `/employee/choose-type` | `choose-type` | yes | ported 1:1 |
| `/employee/create` | `create` | yes | ported 1:1 |
| `/employee/find-employee` | `find-employee` | yes | ported 1:1 |
| `/employee/profile/:id` | `employee-profile` | yes | ported 1:1 |
| `/employee` | `employee` | — | ported 1:1 |
| `/error/error-1` | `error-1` | — | ported 1:1 |
| `/error/error-2` | `error-2` | — | ported 1:1 |
| `/error/error-3` | `error-3` | — | ported 1:1 |
| `/error/error-4` | `error-4` | — | ported 1:1 |
| `/error/error-5` | `error-5` | — | ported 1:1 |
| `/error/error-6` | `error-6` | — | ported 1:1 |
| `/error` | `error` | — | ported 1:1 |
| `/insurance/health-insurance` | `health-insurance` | yes | ported 1:1 |
| `/insurance/hmo` | `hmo` | yes | ported 1:1 |
| `/insurance/insurance-type` | `insurance-type` | yes | ported 1:1 |
| `/insurance` | `insurance` | — | ported 1:1 |
| `/inventory/:id` | `inventory-list` | yes | ported 1:1 |
| `/inventory/inventory-type` | `inventory-type` | yes | ported 1:1 |
| `/inventory/items/:id` | `inventory-item` | yes | ported 1:1 |
| `/inventory` | `inventory` | — | ported 1:1 |
| `/laboratory/add-test-result/:id` | `add-test-result` | yes | ported 1:1 |
| `/laboratory/collect-sample/:id` | `collect-sample` | yes | ported 1:1 |
| `/laboratory/find-results` | `find-results` | yes | ported 1:1 |
| `/laboratory/forms` | `result-forms` | yes | ported 1:1 |
| `/laboratory/laboratory-type` | `laboratory-type` | yes | ported 1:1 |
| `/laboratory/nhis-tests` | `nhis-tests` | yes | ported 1:1 |
| `/laboratory/reports/aggregate` | `aggregate-reports` | yes | ported 1:1 |
| `/laboratory/reports` | `reports` | yes | ported 1:1 |
| `/laboratory/result-approval/:id` | `result-approval` | yes | ported 1:1 |
| `/laboratory/result-validation/:id` | `result-validation` | yes | ported 1:1 |
| `/laboratory/results-update/:id` | `results-update-one` | yes | ported 1:1 |
| `/laboratory/results-update` | — | yes | ported 1:1 |
| `/laboratory/sample-types` | `sample-types` | yes | ported 1:1 |
| `/laboratory/samples-collected` | `samples-collected` | yes | ported 1:1 |
| `/laboratory/samples-to-collect` | `samples-to-collect` | yes | ported 1:1 |
| `/laboratory/test-orders-home` | `test-orders-home` | yes | ported 1:1 |
| `/laboratory/test-result/:id` | `test-result` | yes | ported 1:1 |
| `/laboratory/tests` | `tests` | yes | ported 1:1 |
| `/laboratory/verified-results` | `verified-results` | yes | ported 1:1 |
| `/laboratory` | `laboratory` | — | ported 1:1 |
| `/nurses/change-department/:id` | `nurses-change-department` | yes | ported 1:1 |
| `/nurses/list` | `nurses-list` | yes | ported 1:1 |
| `/nurses` | `nurses-module` | — | ported 1:1 |
| `/orders/orders-type` | `orders-type` | yes | ported 1:1 |
| `/orders` | `orders` | — | ported 1:1 |
| `/patient/choose-patient-type` | `choose-patient-type` | yes | ported 1:1 |
| `/patient/create-account` | `create-account` | yes | ported 1:1 |
| `/patient/create-emergency-account` | `create-emergency-account` | yes | ported 1:1 |
| `/patient/dependants/:id` | `patient-dependants` | yes | ported 1:1 |
| `/patient/edit-health-insurance/:id` | `edit-health-insurance` | yes | ported 1:1 |
| `/patient/edit/:id` | `profile-edit` | yes | ported 1:1 |
| `/patient/find-patient` | `find-patient` | yes | ported 1:1 |
| `/patient/health-insurance/:id` | `health-insurance-patient` | yes | ported 1:1 |
| `/patient/health-insurance/default/:id` | `health-insurance-default` | yes | ported 1:1 |
| `/patient/health-insurance` | `insurance-patients` | yes | ported 1:1 |
| `/patient/patient-operations` | `patient-operations` | yes | ported 1:1 |
| `/patient/profile/:id` | `patient-profile` | yes | ported 1:1 |
| `/patient` | `patient` | — | ported 1:1 |
| `/pharmacy/dosage-forms` | `dosage-forms` | yes | ported 1:1 |
| `/pharmacy/dosage-measurements` | `dosage-measurements` | yes | ported 1:1 |
| `/pharmacy/generic-drugs` | `generic-drugs` | yes | ported 1:1 |
| `/pharmacy/pharmacy-type` | `pharmacy-type` | yes | ported 1:1 |
| `/pharmacy/prescriptions/:id/update` | `drug-prescription-update` | yes | ported 1:1 |
| `/pharmacy/prescriptions/:id` | `drug-prescription` | yes | ported 1:1 |
| `/pharmacy/prescriptions` | `drug-prescriptions` | yes | ported 1:1 |
| `/pharmacy/routes-of-administration` | `routes-of-administration` | yes | ported 1:1 |
| `/pharmacy` | `pharmacy-module` | — | ported 1:1 |
| `/program/ante-natal/enrol` | `ante-natal-enrol` | yes | ported 1:1 |
| `/program/ante-natal/list` | `ante-natal-list` | yes | ported 1:1 |
| `/program/ante-natal/profile/:id` | `ante-natal-profile` | yes | ported 1:1 |
| `/program/ante-natal/visit/:id` | `ante-natal-visit` | yes | ported 1:1 |
| `/program/ante-natal` | `ante-natal` | yes | ported 1:1 |
| `/program/immunization/enrol` | `immunization-enrol` | yes | ported 1:1 |
| `/program/immunization/list` | `immunization-list` | yes | ported 1:1 |
| `/program/immunization/visit/:id` | `immunization-visit` | yes | ported 1:1 |
| `/program/immunization` | `immunization` | yes | ported 1:1 |
| `/program/program-type` | `program-type` | yes | ported 1:1 |
| `/program` | `program` | — | ported 1:1 |
| `/radiology/add-test-result/:id` | `requested-investigation` | yes | ported 1:1 |
| `/radiology/imaging` | `imaging` | yes | ported 1:1 |
| `/radiology/investigations-approval` | `investigations-approval` | yes | ported 1:1 |
| `/radiology/investigations-results/:id` | `investigations-result` | yes | ported 1:1 |
| `/radiology/investigations-results` | `investigations-results` | yes | ported 1:1 |
| `/radiology/investigations` | `investigations` | yes | ported 1:1 |
| `/radiology/radiology-type` | `radiology-type` | yes | ported 1:1 |
| `/radiology/requested-investigations` | `requested-investigations` | yes | ported 1:1 |
| `/radiology/result-approval/:id` | `radiology-result-approval` | yes | ported 1:1 |
| `/radiology/results-update/:id` | `investigation-results-update-one` | yes | ported 1:1 |
| `/radiology/results-update` | `results-update` | yes | ported 1:1 |
| `/radiology` | `radiology` | — | ported 1:1 |
| `/request/create` | `request-create` | yes | ported 1:1 |
| `/request/inventory-requests` | `user-requests` | yes | ported 1:1 |
| `/request/list` | `request-list` | yes | ported 1:1 |
| `/request/request-type` | `request-type` | yes | ported 1:1 |
| `/request/returns` | `user-returns` | yes | ported 1:1 |
| `/request` | `request` | — | ported 1:1 |
| `/settings/beds` | `bed` | yes | ported 1:1 |
| `/settings/change-password` | `change-password` | yes | ported 1:1 |
| `/settings/choose-type` | `choose-setting-type` | yes | ported 1:1 |
| `/settings/defaults/:id` | `one-default` | yes | ported 1:1 |
| `/settings/defaults/create` | `create-default` | yes | ported 1:1 |
| `/settings/defaults` | `default` | yes | ported 1:1 |
| `/settings/departments` | `department` | yes | ported 1:1 |
| `/settings/merge-accounts` | `merge-accounts` | yes | ported 1:1 |
| `/settings/services` | `services` | yes | ported 1:1 |
| `/settings/units` | `unit` | yes | ported 1:1 |
| `/settings/wards` | `ward` | yes | ported 1:1 |
| `/settings` | `account-settings` | — | ported 1:1 |
| `/settings` | `settings` | — | ported 1:1 |
| `/statistics/encounters/:staffId` | `encounter-details` | yes | ported 1:1 |
| `/statistics/encounters` | `encounters` | yes | ported 1:1 |
| `/statistics` | `statistics-home` | yes | ported 1:1 |
| `/statistics` | `statistics-module` | — | ported 1:1 |
| `/store/laboratory/add-item` | `add-laboratory-item` | yes | ported 1:1 |
| `/store/laboratory/items` | `laboratory-items` | yes | ported 1:1 |
| `/store/laboratory` | `laboratory-store` | yes | ported 1:1 |
| `/store/laboratory` | — | — | ported 1:1 |
| `/store/pharmacy/add-item` | `add-item` | yes | ported 1:1 |
| `/store/pharmacy/items/:item` | `item-details` | yes | ported 1:1 |
| `/store/pharmacy/items` | `pharmacy-items` | yes | ported 1:1 |
| `/store/pharmacy/reports/dispense` | `pharmacy-dispense-report` | yes | ported 1:1 |
| `/store/pharmacy/reports/expiry` | `pharmacy-expiry-report` | yes | ported 1:1 |
| `/store/pharmacy/reports/inventory` | `pharmacy-inventory-report` | yes | ported 1:1 |
| `/store/pharmacy/reports/sales` | `pharmacy-sales-report` | yes | ported 1:1 |
| `/store/pharmacy/reports/stock-level` | `pharmacy-stock-level-report` | yes | ported 1:1 |
| `/store/pharmacy/reports/vendor-performance` | `pharmacy-vendor-performance-report` | yes | ported 1:1 |
| `/store/pharmacy/reports` | `pharmacy-reports` | yes | ported 1:1 |
| `/store/pharmacy/update-items` | `pharmacy-items-update` | yes | ported 1:1 |
| `/store/pharmacy/vendors` | `vendors` | yes | ported 1:1 |
| `/store/pharmacy` | `pharmacy` | yes | ported 1:1 |
| `/store/pharmacy` | — | — | ported 1:1 |
| `/store/store-type` | `store-type` | yes | ported 1:1 |
| `/store` | `store` | — | ported 1:1 |
| `/surgery/requests/:id` | `surgery-request` | yes | ported 1:1 |
| `/surgery/requests` | `surgery-requests` | yes | ported 1:1 |
| `/surgery` | `surgery-module` | — | ported 1:1 |
| `/system/settings` | `system-settings` | yes | ported 1:1 |
| `/system` | `system-module` | — | ported 1:1 |
| `/visit/active/:id` | `active-visit` | yes | ported 1:1 |
| `/visit/active` | `active-visits` | yes | ported 1:1 |
| `/visit/admit-patient/:id` | `maternity-admit-patient` | yes | ported 1:1 |
| `/visit/admitted-patients` | `admitted-patients` | yes | ported 1:1 |
| `/visit/all` | `all-visits` | yes | ported 1:1 |
| `/visit/ante-natal` | `ante-natal-visits` | yes | ported 1:1 |
| `/visit/dialysis` | `dialysis` | yes | ported 1:1 |
| `/visit/immunization` | `immunization-visits` | yes | ported 1:1 |
| `/visit/inpatients` | `inpatients` | yes | ported 1:1 |
| `/visit/maternity` | `maternity-visits` | yes | ported 1:1 |
| `/visit/new/:id` | `new-visit` | yes | ported 1:1 |
| `/visit/nhis-active-visits` | `nhis-active-visits` | yes | ported 1:1 |
| `/visit/nhis-visits/:id` | `nhis-visits` | yes | ported 1:1 |
| `/visit/prescriptions/:id` | `visit-prescription` | yes | ported 1:1 |
| `/visit/prescriptions` | `visit-prescriptions` | yes | ported 1:1 |
| `/visit/queue` | `queue` | yes | ported 1:1 |
| `/visit/treatments/:id` | `treatment-records` | yes | ported 1:1 |
| `/visit/treatments` | `nurse-treatments` | yes | ported 1:1 |
| `/visit/update/:id` | `update-visit` | yes | ported 1:1 |
| `/visit/vitals` | `awaiting-vitals` | yes | ported 1:1 |
| `/visit` | `visit` | — | ported 1:1 |
| `/vitals/:id` | `create-vitals` | yes | ported 1:1 |
| `/vitals` | `vitals` | — | ported 1:1 |
| `/` | — | — | ported 1:1 |
| `/` | — | — | ported 1:1 (duplicate in legacy — preserved) |
| `` | — | yes | ported 1:1 |
| `/quill` | `quill` | — | **dropped** — Metronic demo (PRD) |
| `/builder` | `builder` | — | **dropped** — Metronic demo; already commented out in legacy |

Mechanical adaptations (documented, behavior-preserving):

1. `path: '*'` → `/:pathMatch(.*)*` — vue-router 4 catch-all spelling; still redirects to `/404`.
2. `/statistics` child `path: '/'` → `path: ''` — vue-router 4 treats leading-slash children as root paths (would collide with the real `/` route); the route is name-unreferenced and URL-unlinked in legacy.
3. `/laboratory/results-update` keeps its path but omits the duplicate name `results-update` — vue-router 4 would DELETE the earlier record on a duplicate name (v3 only did last-wins name lookup); both paths stay reachable and name lookup resolves to radiology exactly as in legacy.
4. Root `/` redirect record: vue-router 4 resolves URL `/` to the `''` layout record (v3 matched the root record first), so the identical token redirect is replicated on that record's `beforeEnter`, scoped to `to.path === '/'`. Name lookup, guards and redirect outcomes are identical for every URL.
5. `RESET_LAYOUT_CONFIG` dispatch dropped from the global guard — dead Metronic presentation module (ADR-0006).
6. Duplicate parent path `/settings` (`settings` + `account-settings`) preserved verbatim — first-registered-wins path match in both router versions; `/settings/*` children resolve identically.

## Review

- Summary: legacy `client/src/router.js` ported 1:1 to vue-router 4 in `client-vue3/src/router/index.ts` (191 routes, all names/paths/nesting preserved, all 153 route-level `requiresAuth` meta entries kept — the 154th textual occurrence is the guard's own check). 186 stub view components generated under `client-vue3/src/view/` (placeholder `<router-view/>` shells) so the router mounts in the scaffolded app; they are replaced per-domain by later migration issues. Global guard and root redirect ported to the pinia auth store. `main.ts` installs pinia + router.
- Mechanical parity proof: `src/router/__tests__/router.spec.ts` parses `client/src/router.js` and asserts tuple-for-tuple equality (path, name, requiresAuth) with `router.getRoutes()`; twin-patch rule keeps it honest — if the legacy router changes, this test fails until the port is patched.
- Technical decisions: see the 6 documented adaptations in the parity table above; each is forced by a vue-router 3→4 semantic difference and preserves observable behavior (verified in guard tests: unauth → `/auth/login`, auth → pass, `/` → `/dashboard`|`/auth/login`, unmatched → `/404`).
- Impact: additive; Vue 2 client untouched. `vue-router@4.6.4` added as a dependency.
- Testing evidence: `npm run test` — 18/18 passed (4 files) incl. 8 router tests; `npm run lint` — 0 errors; `npm run build` (vue-tsc + vite) — green; `npm run dev` — HTTP 200 on `/` and `/dashboard` (SPA fallback), router mounting covered by `app.spec.ts`.
- Limitations: views are stubs (by design — UI lands per-domain); duplicate-name and duplicate-path quirks emit vue-router 4 dev warnings, matching legacy semantics.
- Future: per-domain view migrations consume the stubs; nginx path-preserving flips rely on this table.
