# Information architecture

Task 2 of `tasks/ui-ux-redesign.md`. Built from `workflow-map.md` and the owner's answers. It defines where things live, not how screens look.

## Owner decisions (2026-11-01)

- Approved: one patient chart, role worklists as Home, and removal of the 14 "choose a type" pages. Each page is confirmed as chooser-only when its area is designed.
- Reception and Customer Care are one front-desk job.
- A search with no match offers registration and carries over what was typed. The duplicate check still runs.

## Principles

1. **Find any patient from anywhere.** One search in the top bar takes a name, phone or hospital number, with a keyboard shortcut. The backend already supports this.
2. **Home is the role's worklist.** Staff land on the patients waiting for them, not on tiles to pick from.
3. **One patient chart.** Everything about a patient lives in one chart, instead of separate pages for vitals, consultation, admission and insurance. Each section still applies today's guards and API calls.
4. **Navigation shows only what the role can do.** No "choose a type" pages: the menu replaces them.

## Navigation

| Section | Contains | Who sees it |
| --- | --- | --- |
| Home | The role's worklist and key counts | All |
| Patients | Search, register (normal, emergency, dependant, insurance) | Records, front desk, admin; others use top bar search |
| Worklists | Doctor queue, vitals, treatments, dialysis, active visits | Doctors, nurses, records |
| Inpatients | Admitted by ward, maternity, theatre, discharge | Doctors, ward and theatre nurses, reception |
| Programs | Antenatal, immunization | Maternity nurses, doctors, records |
| Laboratory | Collect, enter, validate, approve, results, setup | Lab, finance where allowed |
| Radiology | Requests, results, approval, setup | Radiology, theatre |
| Pharmacy | Prescriptions, dispense, setup | Pharmacy |
| Stock | Items, vendors, unit inventory, requests, returns | Pharmacy, store, lab |
| Insurance | NHIS visits, patient insurance, HMOs | Insurance, admin |
| Finance | Transactions, *payments (reserved)* | Finance, admin |
| Reports | Existing lab, pharmacy stock and encounter reports, *others reserved* | By role |
| Appointments | *Reserved* | Records, doctors |
| Administration | Staff, departments, wards, beds, services, defaults, merge accounts | Admin |

**Reserved** means space in the structure for the 8 planned destinations, hidden from the menu until built.

## Menu by role

Built in #41 (`client-vue3/src/view/layout/navigation.ts`) by copying each role's legacy dashboard tiles (`client/src/view/pages/home/**/dashboardItems.js`) and placing each tile in the section the route table below gives it. The role and sub-role choice copies `home/Dashboard.vue`, including its fallback to Medical Records. Tiles that point at the 8 missing pages are reserved and hidden. Each section links to the role's first legacy page in it. Hiding a menu item is not security; route guards decide access.

| Role | Menu |
| --- | --- |
| Super Admin | Home, Patients, Worklists, Programs, Laboratory, Radiology, Pharmacy, Stock, Insurance, Finance, Orders, Reports, Administration |
| Admin | Home, Patients, Worklists, Programs, Laboratory, Radiology, Pharmacy, Stock, Insurance, Finance, Orders, Reports, Administration |
| Medical Records (and any unknown role) | Home, Patients, Worklists, Programs |
| Customer Care | Home, Patients, Inpatients, Pharmacy |
| NHIS | Home, Insurance |
| Finance Officer | Home, Finance, Reports |
| General Practitioner | Home, Worklists, Inpatients, Programs |
| Specialists (15 roles) | Home, Worklists, Inpatients, Programs |
| Laboratory | Home, Laboratory, Reports |
| Laboratory, HOD | Home, Laboratory, Reports |
| Radiology | Home, Radiology |
| Pharmacy | Home, Pharmacy, Stock |
| Pharmacy, HOD | Home, Pharmacy, Stock |
| Pharmacy Store | Home, Stock |
| Nurse, G-OPD | Home, Worklists |
| Nurse, Female Ward | Home, Inpatients |
| Nurse, Male Ward | Home, Inpatients |
| Nurse, Children Ward | Home, Inpatients, Programs |
| Nurse, Maternity | Home, Inpatients |
| Nurse, ANC | Home, Programs |
| Nurse, Theater | Home, Inpatients |
| Nurse, HOD | Home, Worklists, Inpatients, Programs, Administration |
| Nurse, Accident & Emergency | Home, Inpatients |
| Nurse, VIP/Private | Home, Inpatients |
| Nurse, any other sub-role | Home |

Owner decisions on the legacy tiles (2026-11-14), applied in `ownerMenuChanges`:

- **Finance Officer** loses Laboratory: its Financial History, Insurance Claims and Transactions tiles pointed at lab pages, a copy error.
- **Customer Care** and **Nurse, Theater** lose Radiology: their Statistics tile pointed at radiology approvals.
- **Admin and Super Admin** gain Finance (transactions), as the navigation table says, although their legacy dashboards had no tile for it.

Kept as in legacy, approved by the owner:

- **Nurse, HOD** reaches Administration only for the Nurses list.
- **Orders** is its own section, because the route table places `/orders` there.
- **A nurse with any other sub-role** sees only Home, as the legacy dashboard shows nothing.
- **Reports** is hidden for most roles because their Reports tile points at a missing page.

## Patient chart

Header always visible: identity, hospital number, age, insurance and active visit. Sections: Overview, Visit and consultation, Vitals, Orders and results, Prescriptions, Admission, Insurance, Dependants, Details. **Specialty sections** for Gynaecology, Pediatrics, Ophthalmology, Psychiatry, Cardiology, Urology, General Practice and Hematology add to the consultation; their content is still open.

## Risks

- A single chart means one screen loads what several pages load today. Each section should load when opened.
- Who sees a section must match today's role checks. Those checks are spread across views, and some may exist only in the client, so each needs an audit during design. Hiding a menu item doesn't secure anything.

## Pages to remove

These 14 routes only let users choose a sub-page, which the menu replaces. `/quill`, a template leftover, is also marked for removal in the table below.

`/employee/choose-type`, `/insurance/insurance-type`, `/inventory/inventory-type`, `/laboratory/laboratory-type`, `/laboratory/test-orders-home`, `/orders/orders-type`, `/patient/choose-patient-type`, `/patient/patient-operations`, `/pharmacy/pharmacy-type`, `/program/program-type`, `/radiology/radiology-type`, `/request/request-type`, `/settings/choose-type`, `/store/store-type`

## Where every route goes

Generated from `client/src/router.js`: 171 routes, including the two sign-in pages. Mapping is by path, so a few may move when each screen is designed. The Archetype column (added in #41) says which pattern each page is built on: List with filters, Entry form, Detail with tabs, Worklist (short lists only), a follow-up archetype (#103 dashboard, #104 report with export, #105 settings), or Bespoke for the high-risk screens designed in their own issues. Parent routes only frame their child pages. Each domain issue confirms its rows when it designs its screens.

| Route | New location | Archetype |
| --- | --- | --- |
| `/auth/login` | Sign in | System |
| `/auth/register` | Sign in | System |
| `/*` | System: one error page | System |
| `/404` | System: one error page | System |
| `/account` | Finance: transactions | Parent route (frames its pages) |
| `/account/transactions` | Finance: transactions | List with filters |
| `/account/transactions/:id` | Finance: transactions | Detail with tabs |
| `/admission` | Patient chart: admission | Parent route (frames its pages) |
| `/admission/additional-prescriptions/:id` | Patient chart: admission | Detail with tabs (patient chart section) |
| `/admission/careplans/:id` | Patient chart: admission | Detail with tabs (patient chart section) |
| `/admission/change-ward/:id` | Patient chart: admission | Entry form |
| `/admission/delivery/:id` | Patient chart: admission | Detail with tabs (patient chart section) |
| `/admission/discharge-patients` | Inpatients: discharge | List with filters |
| `/admission/discharge/:id` | Inpatients: discharge | Entry form |
| `/admission/doctor-prescriptions/:id` | Patient chart: admission | Detail with tabs (patient chart section) |
| `/admission/history/:id` | Patient chart: admission | Detail with tabs (patient chart section) |
| `/admission/iocharts/:id` | Patient chart: admission | Detail with tabs (patient chart section) |
| `/admission/nursing-notes/:id` | Patient chart: admission | Detail with tabs (patient chart section) |
| `/admission/observations/:id` | Patient chart: admission | Detail with tabs (patient chart section) |
| `/admission/operations/:id` | Patient chart: admission | Detail with tabs (patient chart section) |
| `/admission/postnatal/:id` | Patient chart: admission | Detail with tabs (patient chart section) |
| `/admission/recommended-discharge-patients` | Inpatients: discharge | List with filters |
| `/admission/treatments/:id` | Patient chart: admission | Detail with tabs (patient chart section) |
| `/consultation` | Patient chart: consultation | Parent route (frames its pages) |
| `/consultation/:id` | Patient chart: consultation | Detail with tabs (patient chart section) |
| `/dashboard` | Home | Dashboard (#103) |
| `/employee` | Administration: staff | Parent route (frames its pages) |
| `/employee/create` | Administration: staff | Entry form |
| `/employee/find-employee` | Administration: staff | List with filters |
| `/employee/profile/:id` | Administration: staff | Detail with tabs |
| `/error` | System: one error page | System |
| `/error/error-1` | System: one error page | System |
| `/error/error-2` | System: one error page | System |
| `/error/error-3` | System: one error page | System |
| `/error/error-4` | System: one error page | System |
| `/error/error-5` | System: one error page | System |
| `/error/error-6` | System: one error page | System |
| `/insurance` | Insurance: setup | Parent route (frames its pages) |
| `/insurance/health-insurance` | Insurance: setup | Settings (#105) |
| `/insurance/hmo` | Insurance: setup | Settings (#105) |
| `/inventory` | Stock: unit inventory | Parent route (frames its pages) |
| `/inventory/:id` | Stock: unit inventory | Detail with tabs |
| `/inventory/items/:id` | Stock: unit inventory | Detail with tabs |
| `/laboratory` | Laboratory: worklist | Parent route (frames its pages) |
| `/laboratory/add-test-result/:id` | Laboratory: worklist | Bespoke: lab result entry (worklist) |
| `/laboratory/collect-sample/:id` | Laboratory: worklist | Bespoke: lab result entry (worklist) |
| `/laboratory/find-results` | Laboratory: worklist | List with filters |
| `/laboratory/forms` | Laboratory: setup | Settings (#105) |
| `/laboratory/nhis-tests` | Laboratory: setup | Settings (#105) |
| `/laboratory/reports` | Reports: laboratory | Report with export (#104) |
| `/laboratory/reports/aggregate` | Reports: laboratory | Report with export (#104) |
| `/laboratory/result-approval/:id` | Laboratory: worklist | Bespoke: lab result entry (worklist) |
| `/laboratory/result-validation/:id` | Laboratory: worklist | Bespoke: lab result entry (worklist) |
| `/laboratory/results-update` | Laboratory: worklist | List with filters |
| `/laboratory/results-update/:id` | Laboratory: worklist | Bespoke: lab result entry (worklist) |
| `/laboratory/sample-types` | Laboratory: setup | Settings (#105) |
| `/laboratory/samples-collected` | Laboratory: worklist | List with filters |
| `/laboratory/samples-to-collect` | Laboratory: worklist | List with filters |
| `/laboratory/test-result/:id` | Laboratory: worklist | Bespoke: lab result entry (worklist) |
| `/laboratory/tests` | Laboratory: setup | Settings (#105) |
| `/laboratory/verified-results` | Laboratory: worklist | List with filters |
| `/nurses` | Administration: staff | Parent route (frames its pages) |
| `/nurses/change-department/:id` | Administration: staff | Entry form |
| `/nurses/list` | Administration: staff | List with filters |
| `/orders` | Orders | Parent route (frames its pages) |
| `/patient` | Patients | Parent route (frames its pages) |
| `/patient/create-account` | Patients: register | Bespoke: patient search and registration |
| `/patient/create-emergency-account` | Patients: register | Bespoke: patient search and registration |
| `/patient/dependants/:id` | Patient chart: dependants | Detail with tabs (patient chart section) |
| `/patient/edit-health-insurance/:id` | Patient chart: edit details | Entry form |
| `/patient/edit/:id` | Patient chart: edit details | Entry form |
| `/patient/find-patient` | Patients: search | Bespoke: patient search and registration |
| `/patient/health-insurance` | Insurance: patient insurance | List with filters |
| `/patient/health-insurance/:id` | Patient chart: insurance | Detail with tabs (patient chart section) |
| `/patient/health-insurance/default/:id` | Patient chart: insurance | Detail with tabs (patient chart section) |
| `/patient/profile/:id` | Patient chart: overview | Detail with tabs (patient chart section) |
| `/pharmacy` | Pharmacy: setup | Parent route (frames its pages) |
| `/pharmacy/dosage-forms` | Pharmacy: setup | Settings (#105) |
| `/pharmacy/dosage-measurements` | Pharmacy: setup | Settings (#105) |
| `/pharmacy/generic-drugs` | Pharmacy: setup | Settings (#105) |
| `/pharmacy/prescriptions` | Pharmacy: prescriptions | List with filters |
| `/pharmacy/prescriptions/:id` | Pharmacy: prescriptions | Bespoke: dispense (detail) |
| `/pharmacy/prescriptions/:id/update` | Pharmacy: prescriptions | Bespoke: dispense (detail) |
| `/pharmacy/routes-of-administration` | Pharmacy: setup | Settings (#105) |
| `/program` | Programs | Parent route (frames its pages) |
| `/program/ante-natal` | Programs | List with filters |
| `/program/ante-natal/enrol` | Programs | Entry form |
| `/program/ante-natal/list` | Programs | List with filters |
| `/program/ante-natal/profile/:id` | Programs | Detail with tabs |
| `/program/ante-natal/visit/:id` | Programs | Detail with tabs |
| `/program/immunization` | Programs | List with filters |
| `/program/immunization/enrol` | Programs | Entry form |
| `/program/immunization/list` | Programs | List with filters |
| `/program/immunization/visit/:id` | Programs | Detail with tabs |
| `/quill` | Remove (template leftover) | Removed |
| `/radiology` | Radiology: worklist | Parent route (frames its pages) |
| `/radiology/add-test-result/:id` | Radiology: worklist | Entry form |
| `/radiology/imaging` | Radiology: setup | Settings (#105) |
| `/radiology/investigations` | Radiology: worklist | List with filters |
| `/radiology/investigations-approval` | Radiology: worklist | List with filters |
| `/radiology/investigations-results` | Radiology: worklist | List with filters |
| `/radiology/investigations-results/:id` | Radiology: worklist | Detail with tabs |
| `/radiology/requested-investigations` | Radiology: worklist | List with filters |
| `/radiology/result-approval/:id` | Radiology: worklist | Detail with tabs |
| `/radiology/results-update` | Radiology: worklist | List with filters |
| `/radiology/results-update/:id` | Radiology: worklist | Detail with tabs |
| `/request` | Stock: requests and returns | Parent route (frames its pages) |
| `/request/create` | Stock: requests and returns | Entry form |
| `/request/inventory-requests` | Stock: requests and returns | List with filters |
| `/request/list` | Stock: requests and returns | List with filters |
| `/request/returns` | Stock: requests and returns | List with filters |
| `/settings` | Administration: setup | Parent route (frames its pages) |
| `/settings/beds` | Administration: setup | Settings (#105) |
| `/settings/change-password` | Account menu | Entry form |
| `/settings/defaults` | Administration: setup | Settings (#105) |
| `/settings/defaults/:id` | Administration: setup | Entry form |
| `/settings/defaults/create` | Administration: setup | Entry form |
| `/settings/departments` | Administration: setup | Settings (#105) |
| `/settings/merge-accounts` | Administration: setup | Settings (#105) |
| `/settings/services` | Administration: setup | Settings (#105) |
| `/settings/units` | Administration: setup | Settings (#105) |
| `/settings/wards` | Administration: setup | Settings (#105) |
| `/statistics` | Reports: encounters | Report with export (#104) |
| `/statistics/` | Reports: encounters | Report with export (#104) |
| `/statistics/encounters` | Reports: encounters | Report with export (#104) |
| `/statistics/encounters/:staffId` | Reports: encounters | Report with export (#104) |
| `/store` | Stock | Parent route (frames its pages) |
| `/store/laboratory` | Stock: laboratory | List with filters (legacy shows a type chooser here; the new page lists the items) |
| `/store/laboratory/add-item` | Stock: laboratory | Entry form |
| `/store/laboratory/items` | Stock: laboratory | List with filters |
| `/store/pharmacy` | Stock: pharmacy | List with filters (legacy shows a type chooser here; the new page lists the items) |
| `/store/pharmacy/add-item` | Stock: pharmacy | Entry form |
| `/store/pharmacy/items` | Stock: pharmacy | List with filters |
| `/store/pharmacy/items/:item` | Stock: pharmacy | Detail with tabs |
| `/store/pharmacy/reports` | Reports: pharmacy stock | Report with export (#104) |
| `/store/pharmacy/reports/dispense` | Reports: pharmacy stock | Report with export (#104) |
| `/store/pharmacy/reports/expiry` | Reports: pharmacy stock | Report with export (#104) |
| `/store/pharmacy/reports/inventory` | Reports: pharmacy stock | Report with export (#104) |
| `/store/pharmacy/reports/sales` | Reports: pharmacy stock | Report with export (#104) |
| `/store/pharmacy/reports/stock-level` | Reports: pharmacy stock | Report with export (#104) |
| `/store/pharmacy/reports/vendor-performance` | Reports: pharmacy stock | Report with export (#104) |
| `/store/pharmacy/update-items` | Stock: pharmacy | Entry form |
| `/store/pharmacy/vendors` | Stock: pharmacy | List with filters |
| `/surgery` | Inpatients: theatre | Parent route (frames its pages) |
| `/surgery/requests` | Inpatients: theatre | List with filters |
| `/surgery/requests/:id` | Inpatients: theatre | Detail with tabs |
| `/system` | Administration: setup | Parent route (frames its pages) |
| `/system/settings` | Administration: setup | Settings (#105) |
| `/visit` | Worklists: visits | Parent route (frames its pages) |
| `/visit/active` | Worklists: visits | List with filters |
| `/visit/active/:id` | Worklists: visits | Detail with tabs |
| `/visit/admit-patient/:id` | Patient chart: admit | Entry form |
| `/visit/admitted-patients` | Inpatients: admitted | List with filters |
| `/visit/all` | Worklists: visits | List with filters |
| `/visit/ante-natal` | Programs: antenatal | List with filters |
| `/visit/dialysis` | Worklists: dialysis | List with filters |
| `/visit/immunization` | Programs: immunization | List with filters |
| `/visit/inpatients` | Inpatients: admitted | List with filters |
| `/visit/maternity` | Inpatients: maternity | List with filters |
| `/visit/new/:id` | Patient chart: start visit | Entry form |
| `/visit/nhis-active-visits` | Insurance: NHIS visits | List with filters |
| `/visit/nhis-visits/:id` | Insurance: NHIS visits | Detail with tabs |
| `/visit/prescriptions` | Pharmacy: prescriptions | List with filters |
| `/visit/prescriptions/:id` | Pharmacy: prescriptions | Bespoke: dispense (detail) |
| `/visit/queue` | Worklists: doctor queue | List with filters |
| `/visit/treatments` | Worklists: treatments | List with filters |
| `/visit/treatments/:id` | Worklists: treatments | Detail with tabs |
| `/visit/update/:id` | Patient chart: visit | Detail with tabs (patient chart section) |
| `/visit/vitals` | Worklists: vitals | List with filters |
| `/vitals` | Patient chart: vitals | Parent route (frames its pages) |
| `/vitals/:id` | Patient chart: vitals | Bespoke: triage |
