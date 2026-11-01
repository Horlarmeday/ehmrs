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

## Patient chart

Header always visible: identity, hospital number, age, insurance and active visit. Sections: Overview, Visit and consultation, Vitals, Orders and results, Prescriptions, Admission, Insurance, Dependants, Details. **Specialty sections** for Gynaecology, Pediatrics, Ophthalmology, Psychiatry, Cardiology, Urology, General Practice and Hematology add to the consultation; their content is still open.

## Risks

- A single chart means one screen loads what several pages load today. Each section should load when opened.
- Who sees a section must match today's role checks. Those checks are spread across views, and some may exist only in the client, so each needs an audit during design. Hiding a menu item doesn't secure anything.

## Pages to remove

These 14 routes only let users choose a sub-page, which the menu replaces. `/quill`, a template leftover, is also marked for removal in the table below.

`/employee/choose-type`, `/insurance/insurance-type`, `/inventory/inventory-type`, `/laboratory/laboratory-type`, `/laboratory/test-orders-home`, `/orders/orders-type`, `/patient/choose-patient-type`, `/patient/patient-operations`, `/pharmacy/pharmacy-type`, `/program/program-type`, `/radiology/radiology-type`, `/request/request-type`, `/settings/choose-type`, `/store/store-type`

## Where every route goes

Generated from `client/src/router.js`: 171 routes, including the two sign-in pages. Mapping is by path, so a few may move when each screen is designed.

| Route | New location |
| --- | --- |
| `/auth/login` | Sign in |
| `/auth/register` | Sign in |
| `/*` | System: one error page |
| `/404` | System: one error page |
| `/account` | Finance: transactions |
| `/account/transactions` | Finance: transactions |
| `/account/transactions/:id` | Finance: transactions |
| `/admission` | Patient chart: admission |
| `/admission/additional-prescriptions/:id` | Patient chart: admission |
| `/admission/careplans/:id` | Patient chart: admission |
| `/admission/change-ward/:id` | Patient chart: admission |
| `/admission/delivery/:id` | Patient chart: admission |
| `/admission/discharge-patients` | Inpatients: discharge |
| `/admission/discharge/:id` | Inpatients: discharge |
| `/admission/doctor-prescriptions/:id` | Patient chart: admission |
| `/admission/history/:id` | Patient chart: admission |
| `/admission/iocharts/:id` | Patient chart: admission |
| `/admission/nursing-notes/:id` | Patient chart: admission |
| `/admission/observations/:id` | Patient chart: admission |
| `/admission/operations/:id` | Patient chart: admission |
| `/admission/postnatal/:id` | Patient chart: admission |
| `/admission/recommended-discharge-patients` | Inpatients: discharge |
| `/admission/treatments/:id` | Patient chart: admission |
| `/consultation` | Patient chart: consultation |
| `/consultation/:id` | Patient chart: consultation |
| `/dashboard` | Home |
| `/employee` | Administration: staff |
| `/employee/create` | Administration: staff |
| `/employee/find-employee` | Administration: staff |
| `/employee/profile/:id` | Administration: staff |
| `/error` | System: one error page |
| `/error/error-1` | System: one error page |
| `/error/error-2` | System: one error page |
| `/error/error-3` | System: one error page |
| `/error/error-4` | System: one error page |
| `/error/error-5` | System: one error page |
| `/error/error-6` | System: one error page |
| `/insurance` | Insurance: setup |
| `/insurance/health-insurance` | Insurance: setup |
| `/insurance/hmo` | Insurance: setup |
| `/inventory` | Stock: unit inventory |
| `/inventory/:id` | Stock: unit inventory |
| `/inventory/items/:id` | Stock: unit inventory |
| `/laboratory` | Laboratory: worklist |
| `/laboratory/add-test-result/:id` | Laboratory: worklist |
| `/laboratory/collect-sample/:id` | Laboratory: worklist |
| `/laboratory/find-results` | Laboratory: worklist |
| `/laboratory/forms` | Laboratory: setup |
| `/laboratory/nhis-tests` | Laboratory: setup |
| `/laboratory/reports` | Reports: laboratory |
| `/laboratory/reports/aggregate` | Reports: laboratory |
| `/laboratory/result-approval/:id` | Laboratory: worklist |
| `/laboratory/result-validation/:id` | Laboratory: worklist |
| `/laboratory/results-update` | Laboratory: worklist |
| `/laboratory/results-update/:id` | Laboratory: worklist |
| `/laboratory/sample-types` | Laboratory: setup |
| `/laboratory/samples-collected` | Laboratory: worklist |
| `/laboratory/samples-to-collect` | Laboratory: worklist |
| `/laboratory/test-result/:id` | Laboratory: worklist |
| `/laboratory/tests` | Laboratory: setup |
| `/laboratory/verified-results` | Laboratory: worklist |
| `/nurses` | Administration: staff |
| `/nurses/change-department/:id` | Administration: staff |
| `/nurses/list` | Administration: staff |
| `/orders` | Orders |
| `/patient` | Patients |
| `/patient/create-account` | Patients: register |
| `/patient/create-emergency-account` | Patients: register |
| `/patient/dependants/:id` | Patient chart: dependants |
| `/patient/edit-health-insurance/:id` | Patient chart: edit details |
| `/patient/edit/:id` | Patient chart: edit details |
| `/patient/find-patient` | Patients: search |
| `/patient/health-insurance` | Insurance: patient insurance |
| `/patient/health-insurance/:id` | Patient chart: insurance |
| `/patient/health-insurance/default/:id` | Patient chart: insurance |
| `/patient/profile/:id` | Patient chart: overview |
| `/pharmacy` | Pharmacy: setup |
| `/pharmacy/dosage-forms` | Pharmacy: setup |
| `/pharmacy/dosage-measurements` | Pharmacy: setup |
| `/pharmacy/generic-drugs` | Pharmacy: setup |
| `/pharmacy/prescriptions` | Pharmacy: prescriptions |
| `/pharmacy/prescriptions/:id` | Pharmacy: prescriptions |
| `/pharmacy/prescriptions/:id/update` | Pharmacy: prescriptions |
| `/pharmacy/routes-of-administration` | Pharmacy: setup |
| `/program` | Programs |
| `/program/ante-natal` | Programs |
| `/program/ante-natal/enrol` | Programs |
| `/program/ante-natal/list` | Programs |
| `/program/ante-natal/profile/:id` | Programs |
| `/program/ante-natal/visit/:id` | Programs |
| `/program/immunization` | Programs |
| `/program/immunization/enrol` | Programs |
| `/program/immunization/list` | Programs |
| `/program/immunization/visit/:id` | Programs |
| `/quill` | Remove (template leftover) |
| `/radiology` | Radiology: worklist |
| `/radiology/add-test-result/:id` | Radiology: worklist |
| `/radiology/imaging` | Radiology: setup |
| `/radiology/investigations` | Radiology: worklist |
| `/radiology/investigations-approval` | Radiology: worklist |
| `/radiology/investigations-results` | Radiology: worklist |
| `/radiology/investigations-results/:id` | Radiology: worklist |
| `/radiology/requested-investigations` | Radiology: worklist |
| `/radiology/result-approval/:id` | Radiology: worklist |
| `/radiology/results-update` | Radiology: worklist |
| `/radiology/results-update/:id` | Radiology: worklist |
| `/request` | Stock: requests and returns |
| `/request/create` | Stock: requests and returns |
| `/request/inventory-requests` | Stock: requests and returns |
| `/request/list` | Stock: requests and returns |
| `/request/returns` | Stock: requests and returns |
| `/settings` | Administration: setup |
| `/settings/beds` | Administration: setup |
| `/settings/change-password` | Account menu |
| `/settings/defaults` | Administration: setup |
| `/settings/defaults/:id` | Administration: setup |
| `/settings/defaults/create` | Administration: setup |
| `/settings/departments` | Administration: setup |
| `/settings/merge-accounts` | Administration: setup |
| `/settings/services` | Administration: setup |
| `/settings/units` | Administration: setup |
| `/settings/wards` | Administration: setup |
| `/statistics` | Reports: encounters |
| `/statistics/` | Reports: encounters |
| `/statistics/encounters` | Reports: encounters |
| `/statistics/encounters/:staffId` | Reports: encounters |
| `/store` | Stock |
| `/store/laboratory` | Stock: laboratory |
| `/store/laboratory/add-item` | Stock: laboratory |
| `/store/laboratory/items` | Stock: laboratory |
| `/store/pharmacy` | Stock: pharmacy |
| `/store/pharmacy/add-item` | Stock: pharmacy |
| `/store/pharmacy/items` | Stock: pharmacy |
| `/store/pharmacy/items/:item` | Stock: pharmacy |
| `/store/pharmacy/reports` | Reports: pharmacy stock |
| `/store/pharmacy/reports/dispense` | Reports: pharmacy stock |
| `/store/pharmacy/reports/expiry` | Reports: pharmacy stock |
| `/store/pharmacy/reports/inventory` | Reports: pharmacy stock |
| `/store/pharmacy/reports/sales` | Reports: pharmacy stock |
| `/store/pharmacy/reports/stock-level` | Reports: pharmacy stock |
| `/store/pharmacy/reports/vendor-performance` | Reports: pharmacy stock |
| `/store/pharmacy/update-items` | Stock: pharmacy |
| `/store/pharmacy/vendors` | Stock: pharmacy |
| `/surgery` | Inpatients: theatre |
| `/surgery/requests` | Inpatients: theatre |
| `/surgery/requests/:id` | Inpatients: theatre |
| `/system` | Administration: setup |
| `/system/settings` | Administration: setup |
| `/visit` | Worklists: visits |
| `/visit/active` | Worklists: visits |
| `/visit/active/:id` | Worklists: visits |
| `/visit/admit-patient/:id` | Patient chart: admit |
| `/visit/admitted-patients` | Inpatients: admitted |
| `/visit/all` | Worklists: visits |
| `/visit/ante-natal` | Programs: antenatal |
| `/visit/dialysis` | Worklists: dialysis |
| `/visit/immunization` | Programs: immunization |
| `/visit/inpatients` | Inpatients: admitted |
| `/visit/maternity` | Inpatients: maternity |
| `/visit/new/:id` | Patient chart: start visit |
| `/visit/nhis-active-visits` | Insurance: NHIS visits |
| `/visit/nhis-visits/:id` | Insurance: NHIS visits |
| `/visit/prescriptions` | Pharmacy: prescriptions |
| `/visit/prescriptions/:id` | Pharmacy: prescriptions |
| `/visit/queue` | Worklists: doctor queue |
| `/visit/treatments` | Worklists: treatments |
| `/visit/treatments/:id` | Worklists: treatments |
| `/visit/update/:id` | Patient chart: visit |
| `/visit/vitals` | Worklists: vitals |
| `/vitals` | Patient chart: vitals |
| `/vitals/:id` | Patient chart: vitals |
