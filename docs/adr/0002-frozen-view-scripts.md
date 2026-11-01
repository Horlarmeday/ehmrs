# Frozen view scripts: 1:1 translation, free templates

Logic-freeze boundary for the Vue 3 migration. Code audit: only 1 of ~644 view files calls
axios directly (API access lives in the Vuex modules), but 482 views carry view-local
orchestration logic — guards, prefills, confirm flows (e.g.
`pharmacy/components/prescriptionUpdate/DrugDispenseCardUpdate.vue: handleDispense()`
blocks dispensing via `shouldDisableDispense` and prefills remaining quantity before any
dispatch). Freezing only "what views dispatch" (the original plan's rule #2) would have
left this logic unprotected.

Decision: each migrated view's script block is a **1:1 translation** of the legacy script
(methods → functions, computed → computed, watch → watch), marked as frozen; Open Design /
implementers redesign only the template. Considered and rejected: free re-expression
against a per-view trace table (invites the logic drift that killed the first Vue 3
attempt); extracting composables first (482 extractions of pure risk with no behavior
change — composables are a post-cutover cleanup, like the optional Pinia move).

Precise freeze line: **the sequence of guards → dispatches/commits (with payloads) →
post-dispatch behavior (toast, redirect, state change) is frozen. The visual container is
free** — a confirm-modal may become a confirm-drawer, columns may regroup — but removing a
confirm step, auto-firing a dispatch on input, or reordering guards is a logic change
requiring explicit sign-off.

## Consequences

- Script translation is mechanically checkable (line-by-line old ↔ new diff per view PR).
- `store/pharmacy/reports/components/ExportButton.vue` — the one view that calls axios —
  is treated as logic: ported verbatim, not redesigned.
- The single-export exception aside, no new API calls may appear in views.

## Amendment (owner decision, 2026-11-01)

The system gets a new UI/UX design (`tasks/ui-ux-redesign.md`), so a new screen may combine or reorder today's views. Script code may therefore be reorganized across components rather than translated 1:1 per view. The freeze line above still holds: guards, dispatches with their payloads, and post-dispatch behaviour stay the same unless the owner signs off. Without a line-by-line diff per view, each screen needs behaviour tests and closer review.
