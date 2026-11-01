# Workflow map (draft for owner correction)

Task 1 of `tasks/ui-ux-redesign.md`. Drafted 2026-11-01 from `client/src/router.js`, role dashboards (`view/pages/home/**/dashboardItems.js`), department lists and patient views.

**Everything here is inferred from code.** It shows what the system allows, not how staff actually work. Items marked **[check]** most need the owner's correction. This describes jobs and hand-offs only; no legacy layout carries over.

## How navigation works today

- The top menu is mostly commented-out template content. Each role's **dashboard is its real navigation**: a set of tiles chosen by `role` and `sub_role`.
- 16 doctor specialties have nearly identical dashboards, so they look like one role with a specialty label. **[check]**
- The router has 186 route paths and 480+ view files. `consultation` and `vitals` have no dashboard tile, so they are presumably reached from a queue or a patient. **[check]**
- **8 tile destinations don't exist in `router.js`** and presumably land on the 404 page: `/reports/active`, `/statistics/active`, `/analytics`, `/payments`, `/appointment/active`, `/pharmacy/reports`, `/radiology/reports`, `/radiology/appointments`. The owner confirmed they are planned.

## The patient journey

```
Search ──found──> Profile ──> Start visit ──> Queue ──> Vitals/triage (nurse)
  │                                                       │
  └─not found─> Register (normal, emergency, dependant,   ▼
                insurance) ──> Start visit           Consultation (doctor)
                                                          │
             ┌───────────────┬──────────────┬─────────────┼──────────────┐
             ▼               ▼              ▼             ▼              ▼
        Lab: collect,   Radiology:     Pharmacy:      Treatments     Admission:
        enter, validate, request,      prescribe,     (nurse)        ward care, surgery,
        approve         result,        dispense                      discharge
                        approve             │
                                            ▼
                        Billing, insurance authorization and accounts run alongside each step [check]
```

## Roles and their jobs

| Role (from code) | Main jobs | Areas | Hands off to |
| --- | --- | --- | --- |
| Medical Records | Find patient, register, start visit, programs | `patient`, `visit`, `program`, `medicalRecords` | Nurse, doctor |
| Reception, Customer Care | Find patient, see active visits; two dashboards differ **[check: are these distinct jobs?]** | `customerCare`, `visit`, `admission` | Records, nurse |
| Nurse, OPD | Vitals, treatments | `visit`, `vitals`, `triage`, `nurse` | Doctor |
| Nurse, wards (male, female, children, VIP, emergency) | Admitted patients, observations, care plans, I/O charts, notes, discharge | `admission`, `visit` | Doctor, pharmacy |
| Nurse, maternity and antenatal | Antenatal, deliveries, postnatal, immunization | `program`, `immunization`, `admission` | Doctor |
| Nurse, theatre | Surgery requests, operation notes | `surgery`, `admission` | Ward |
| Nurse, head of department | All nursing queues, staff department changes | `nurses`, `visit`, `admission` | Nurses |
| Doctor (all specialties) | Queue, consultation, orders, inpatients, antenatal | `consultation`, `visit`, `orders` | Lab, radiology, pharmacy, nurses |
| Lab scientist, head of lab | Collect samples, enter, validate and approve results, setup | `laboratory`, `store/laboratory` | Doctor |
| Radiographer | Requested investigations, results, approval | `radiology` | Doctor |
| Pharmacist, head of pharmacy | Prescriptions, dispense, requests, returns, drug setup | `pharmacy`, `request`, `inventory` | Patient, store |
| Pharmacy store | Items, vendors, stock reports, requests | `store`, `request`, `inventory` | Pharmacy |
| NHIS / insurance | Active NHIS visits, patient insurance, HMOs | `nhis`, `insurance`, `patient` | Doctor, accounts |
| Finance officer | Transactions. Its other tiles all point to the lab, which looks like a copy error **[check]** | `account` | Accounts |
| Admin, Super Admin | Everything, staff, settings, departments, wards, merge accounts | `settings`, `admin`, `employees`, `system` | All |

## Every area in `view/pages`

| Area | Owner role | Note |
| --- | --- | --- |
| `patient`, `medicalRecords` | Records | Front door |
| `visits`, `triage`, `orders`, `consultation` | Records, nurse, doctor | Shared across the visit |
| `admission`, `surgery`, `nurse` | Nurses, doctor | Inpatient care |
| `programs`, `immunization` | Maternity nurses | Antenatal and immunization |
| `laboratory`, `radiology` | Lab, radiographer | Diagnostics |
| `pharmacy`, `store`, `inventory`, `requests` | Pharmacy, store | Drugs and stock |
| `nhis`, `insurance` | Insurance | |
| `account` | Finance | **[check: where are bills and payments taken?]** |
| `customerCare` | Customer care | |
| `home` | All | Role dashboards |
| `employees`, `settings`, `admin`, `statistics` | Admin | |
| `auth`, `error` | All | System pages |
| `wizard`, `Builder.vue`, `Quill.vue`, `Dashboard.vue` at the top level | Unused | Look like template leftovers **[check before removal]** |

## Patient search and registration: what must carry over

These are facts for the first design, not a layout.

- **Search:** by name (empty search is refused) or by registration date range, with server-side paging. Results show hospital number, name, gender, age, account type, insurance, registration date, status and who registered the patient.
- **Permissions:** only Super Admin, Medical Records and Admin can start a visit, and only for an active patient. Only Super Admin and Admin can deactivate a patient, with a confirmation.
- **Registration types:** normal, emergency, dependant and insurance.
- **Normal registration fields:** names, email, phone and alternate phone, religion, date of birth, gender, marital status, country, state, local government area, address, occupation, next of kin (name, address, phone, relationship), and a registration fee choice.
- **Duplicates:** a "patient exists" check runs during registration. Its exact rule is read in task 3.

The owner requires search by hospital number, phone and name. The backend already supports this from one search term (`getPatients` in `patient.repository.ts`): name and phone match anywhere in the value, and hospital number matches the end of the value. Only the screen's wording limits it to names, so no backend change is needed.

## Owner answers (2026-11-01)

- **At arrival:** records staff may have a hospital number, a phone number or only a name. Search must work well with all three.
- **Payment:** depends on patient type. Exact rules per type are still to be mapped.
- **The 8 missing destinations:** planned. Navigation reserves space for them, but they are not built during the migration.
- **Doctors:** all share the same queue and consultation flow, with extra sections per specialty. Named by the owner: Gynaecology, Pediatrics, Ophthalmology, Psychiatry, Cardiology, Urology, General Practice, Hematology. The other specialties in the code use the shared flow until told otherwise.

- **Front desk:** Reception and Customer Care are one job.

## Still open

- Payment rules for each patient type.
- What each specialty's extra sections contain.
- Which roles are actually in use.
