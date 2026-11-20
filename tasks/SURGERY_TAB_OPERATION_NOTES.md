# Show operation notes in the consultation Surgery tab

## Problem
The consultation page's Surgery accordion (`SurgeryDetails.vue`) only shows the surgery request.
Operation notes created in the Surgery module (`/surgery/requests/:visitId`) are not visible there,
so the doctor must go back to the Surgery module to see what they wrote.

Separately, `OperationNotesTable.vue` gives every row the same popover target id
(`popover-reactive-73`), so the details popover always anchors to the first row.

## Approach (approved 2026-11-19)
Frontend only. Reuse the existing endpoint `GET /surgeries/operation-notes/:visitId`,
the `surgery/fetchOperationNotes` Vuex action and `OperationNotesTable`.

## Tasks
- [x] 1. `SurgeryDetails.vue`: fetch notes for `surgery.visit_id` on create, render an
  "Operation Notes" sub-section with `OperationNotesTable`, loading skeleton while fetching,
  tooltip "Add Operation Notes" / "View / Add Operation Notes" depending on whether notes exist. (S)
  - Acceptance: after creating a note in the Surgery module and pressing Back, the note is listed
    in the consultation Surgery tab without a manual refresh.
- [x] 2. `OperationNotesTable.vue`: unique popover target per row; popover only mounted when a row
  is selected; clicking another row moves the popover to that row; `href="#"` no longer navigates. (S)
  - Acceptance: with 2+ notes, clicking row N's eye icon opens the popover next to row N showing row N's data.
- [x] 3. Lint (`npm run lint`) and verify in the browser on both pages (consultation + Surgery module). (S)

## Out of scope
- Operation notes are linked to the visit, not to a specific surgery request (no `surgery_request_id`).
  Fine while a visit has one surgery (`getPatientSurgery` returns one). Revisit if that changes.

## Review
Status: done and verified in Chrome on 2026-11-19 (local stack, admin login, visit 27657 / surgery 4).

- `SurgeryDetails.vue`: fetches notes by `surgery.visit_id`, shows skeleton then `OperationNotesTable`; tooltip reflects whether notes exist.
- `OperationNotesTable.vue`: per-row target id `operation-note-<uid>-<noteId>`, popover mounted only for the active row (keyed so it re-anchors), `@click.prevent` so `href="#"` does not navigate, rows keyed by note id.
- `OperationNotePopover.vue` (deviation, found during implementation): `:show` → `:show.sync`. The existing computed setter that emits `closePopover` was never wired, so closing by blur left the parent thinking the popover was open.
- `server/src/database/models/operationNote.ts` (deviation, found during browser testing): the four `@BelongsTo(() => Staff)` associations had no foreign key, so surgeon, scrub nurse and requester all resolved to the anaesthetist. Saved IDs were always correct; only the read was wrong. Now `@BelongsTo(() => Staff, 'surgeon_id')` etc., matching `admission.ts`. No migration needed.
- Impact: the Surgery module page uses the same table and gets all fixes; it previously showed the wrong surgeon and scrub nurse too. No schema or API contract change.

### Testing evidence
- Empty state: "No Data", tooltip "Add Operation Notes".
- Created notes A and B through the Surgery module form (POST 201 each), pressed Back: both listed without refresh, tooltip "View / Add Operation Notes".
- Before the model fix the API returned the anaesthetist name for every staff role; after it, A = doc Theatre / ABU grace, B = Dare Oladotun / JOY nkechi as entered.
- Popover: row B icon anchors to row B with B data; clicking row A moves it to A (one popover); × closes; clicking outside closes; reopening the same row after either close works; URL never changes to `#`.
- Same checks on `/surgery/requests/27657`: correct names, popover on the clicked row.
- `npx eslint` on changed client files clean; `npx tsc --noEmit` in server clean. Console: no new errors (existing 404 for the patient photo `/static/images/null`).
- Test data left in the local DB: Operation_Notes ids 1 and 2 on visit 27657.
