# Operation notes in past visit history

## Problem
The consultation "Past History" tab lists each visit with tabs (Vitals, Consultation, Diagnoses, ...),
but operation notes for a visit were not included, so a doctor reviewing past visits could not see them.

## Decisions (2026-11-20)
- Show an "Operation Notes" tab on a past visit only when that visit has notes.
- Owner chose to show it everywhere the shared history uses this data: Consultation Past History,
  NHIS Patient History modal, Antenatal Summary. Pharmacy history uses a different endpoint and is unaffected.

## Tasks
- [x] 1. Server: `getVisitPrescriptions` (`server/src/modules/Consultation/consultation.repository.ts`) also loads
  operation notes for the page of visits (one query, grouped by `visit_id`) and returns `operationNotes` per visit. (S)
  `getOperationNotes` in `surgery.repository.ts` now accepts one visit id or a list.
- [x] 2. Client: `HistoryAccordion.vue` adds an "Operation Notes" tab (`v-if` notes exist) reusing `OperationNotesTable`. (S)
- [x] 3. Client: the "history is empty" checks in `consultation/tabs/History.vue`, `nhis/components/PatientHistoryModal.vue`
  and `programs/antenatal/tabs/Summary.vue` also consider operation notes, so a history with only notes is not hidden. (S)
- [x] 4. Verify. (S)

## Review
- No schema change, no new endpoint. `/consultations/history/get` and `/admission/summary/:id` each gain an
  additive `operationNotes` field (the admission client only stores the response, so nothing else changes).
- Staff names in the notes rely on the `OperationNote` association fix from `SURGERY_TAB_OPERATION_NOTES.md`.

### Testing evidence (local stack, admin, patient EHS/041161)
- `GET /consultations/history/get?visitId=27657`: visit 27657 returns 2 notes (surgeons doc Theatre, Dare Oladotun); visit 27053 returns `[]`.
- Past History UI: the July 2024 visit shows an "Operation Notes" tab listing notes A and B with correct surgeon and scrub nurse;
  the June 2024 antenatal visit has no such tab. Eye icon on row B opens B's details next to row B.
- `GET /admission/summary/1724`: 200, keys include `operationNotes`.
- `npx tsc --noEmit` (server) clean; eslint on changed files has no errors (only existing prettier warnings on untouched lines).
- Not clicked through in the browser: NHIS Patient History modal and Antenatal Summary. Both use the same endpoint and component already verified.
