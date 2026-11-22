# #109 — Accounting reconciliation reads: charge counts, stock movements, outbox depth

Branch: `109-accounting-reconciliation-reads` (cut from `origin/svsh_branch`). PR base: `svsh_branch`.
Parent: `ehmrs_accounting#747` (PRD §10.8). Accounting plan: `ehmrs_accounting`
`tasks/747-emr-cross-system-reconciliation.md` (D1–D16, P1–P13), approved 2026-11-22.
EMR merges first; Accounting builds against the contract in §2.

---

## 1. What the EMR must add

Four read-only routes Accounting calls to compare the two systems, and a fix so exhausted outbox
rows stop starving the drainer. Nothing here writes clinical data.

## 2. Contract (v1)

All routes are `POST` under `/api/integration/accounting/reconciliation`, mounted before the global
JSON parser with a route-scoped raw parser, and verified by `verifyReverseSignature` against the
reverse-inbox key (`EMR_INBOUND_KEY_ID`/`EMR_INBOUND_SECRET`). That is the key Accounting signs
reverse events with (Accounting D15).

| Condition | Status |
| :--- | :--- |
| `EMR_INBOX_ENABLED !== 'true'` | `503` |
| Headers, window, key, signature or tenant key fail | `401`, nothing read |
| Verified but the body breaks the rules below | `400` with a message |
| Success | `200` |

Every body carries `event_id` (a fresh id per request) and `tenant_key`. Dates: `start_date` is
`YYYY-MM-DD` (counted from `00:00:00` server time); `window_start` and `cutoff` are ISO instants
with `window_start <= cutoff`. Ids are positive-integer strings, except batch ids, which are
Accounting's ids (non-empty, at most 64 characters). Responses carry ids, counts and timestamps
only. No names, money or demographics (ADR-0016).

### 2.1 `/charges`

Request: `{ event_id, tenant_key, start_date, window_start, cutoff, after_visit_id, limit, visit_ids }`.

- `visit_ids` empty → **window mode**. A visit is in the window when its last activity is in
  `[window_start, cutoff]`. If its last activity is after `cutoff`, it is *settling*. Visits are
  ordered by numeric id, after `after_visit_id` (null for the first page), up to `limit` (1–500).
- `visit_ids` non-empty (≤ 500) → **lookup mode**. Paging is ignored. Each id is answered,
  with zero counts and `last_activity_at: null` when the visit has no lines. A settling visit
  is left out and counted.

*Lines* of a visit and type = the union of live `Prescribed_*` row ids with `createdAt >=
start_date`, and ids named by `charge.reversal.requested` outbox rows
(`reversal_requested:{type}:{id}`) with `createdAt >= start_date`. A reversal request
hard-deletes its row, so the outbox row is the only record that the line existed. *Last activity*
is the latest `createdAt` among those rows.

```json
{ "visits": [ { "visit_id": "812", "patient_id": "4410", "last_activity_at": "…",
    "lines": { "drug": 4, "investigation": 0, "service": 2, "test": 1, "additional_item": 1 } } ],
  "next_after_visit_id": "812", "settling_visits": 3 }
```
`next_after_visit_id` is null on the last page and in lookup mode. All reads for one request share
one consistent snapshot (a read transaction).

### 2.2 `/charges/lines`

Request: `{ event_id, tenant_key, start_date, visit_id }`.
Response: `{ "lines": [ { "type": "drug", "id": "4521", "state": "LIVE", "created_at": "…" } ], "truncated": false }`.
`DELETED` lines are reversal-requested ids with no live row. Ordered by type then numeric id,
capped at 1000.

### 2.3 `/stock`

Request: `{ event_id, tenant_key, start_date, window_start, cutoff, batch_ids }`. Window or
lookup mode exactly as charges, with no paging (cap 5000 batches, then `truncated: true` and an
empty list).

| Figure | Source (rows with `createdAt >= start_date`) |
| :--- | :--- |
| `dispensed` | `Inventory_Item_Histories` `Dispensed`, `quantity_dispensed`, batch from the layer `Inventory_Items.external_batch_id` |
| `returned_by_patient` | `Inventory_Item_Histories` `Returned` with `visit_id` set, `quantity_returned`, layer batch |
| `returned_to_store` | `Inventory_Item_Histories` `Returned` with no `visit_id`, `quantity_returned`, layer batch |
| `received` | `Pharmacy_Store_Histories` `Supplied` with `external_batch_id`, `quantity_supplied` |

Verified writers: patient dispense `Pharmacy/pharmacy.repository.ts:784`, patient return `:930`,
dispensary-to-store return `Inventory/inventory.repository.ts:483`, receipt applier
`Inbox/applier.ts:606,693`. The other `Dispensed` matches are reads. `item_code` (`Drugs.code`) and
`drug_type` come from the layer, or from the store row for a receipt-only batch.

`untracked` = window-mode units in `[window_start, cutoff]` from dispensary history rows whose layer
has no batch id. Lookup mode returns zeros.

```json
{ "batches": [ { "external_batch_id": "…", "item_code": "…", "drug_type": "NHIS", "last_movement_at": "…",
    "dispensed": 120, "returned_by_patient": 2, "returned_to_store": 0, "received": 500 } ],
  "untracked": { "dispensed": 31, "returned_by_patient": 0, "returned_to_store": 0 },
  "settling_batches": 1, "truncated": false }
```

### 2.4 `/outbox`

Request: `{ event_id, tenant_key }`.
Response: `{ "waiting", "exhausted", "oldest_unsent_at", "max_attempts", "read_at" }`.
`waiting` = unsent with `attempts < max`. `exhausted` = unsent with `attempts >= max`.
`oldest_unsent_at` = oldest `createdAt` among the waiting rows. `max` is the drainer's
`EMR_OUTBOX_MAX_ATTEMPTS` (default 5).

## 3. Decisions taken here

| # | Decision | Why |
| :- | :--- | :--- |
| R1 | Lookup mode replaces "`visit_ids` on the first page only" | Same answer with no mixing of paged and explicit results |
| R2 | One migration adds read indexes: `createdAt` on the five line tables and `Inventory_Item_Histories`, `external_batch_id` on `Pharmacy_Store_Histories`, `(event_type, aggregate_id)` and `(sent_at, attempts)` on `Outbox_Events` | None exist (`schema.sql`, `outbox-events.sql`), and the outbox grows with every event. Recorded as a deviation from the Accounting plan |
| R3 | Raw parameterised SQL (`sequelizeConnection.query` with replacements) for the aggregates | Five-table unions and grouped joins; the outbox writer already does this (`claimSequences`) |
| R4 | The drainer claims only `attempts < max` (Accounting D14) | Exhausted rows at the head starved it (`drainer.ts:58-67`) |

## 4. Findings to report, not fixed here

- `Additional_item_prescriptions.prescribed_drug_id` is `ON DELETE CASCADE`. Deleting a prescribed
  drug deletes its consumables with no `charge.reversal.requested`, so Accounting keeps charges the
  EMR no longer has. The comparison surfaces these as Accounting-higher.
- A patient or store return with a batch but no item code is skipped (logged only). The comparison
  counts those units on the EMR side, so the batch shows EMR-higher.

## 5. Tasks

- [x] Migration with the read indexes (R2). Up, down and up again verified on the test DB.
- [x] `Reconciliation/request.ts`: body validation, flat results (repo compiles without strict null checks).
- [x] `Reconciliation/charges.ts`: window and lookup modes, union counting, cursor, settling, `/charges/lines`.
- [x] `Reconciliation/stock.ts`: four figures per batch, untracked, cap, settling.
- [x] `Reconciliation/outbox-depth.ts`, using the drainer's max attempts.
- [x] Controller and routes: 503/401/400/200, mounted before the JSON parser.
- [x] Drainer claim excludes exhausted rows (R4). The existing dead-letter test still holds.
- [x] Tests on the MySQL test DB: signature refusal, deleted lines counted, start date, paging,
  settling, lookup zeros, stock figures, untracked, outbox figures, starvation, no demographic keys.
- [x] `npx tsc --noEmit`, eslint on changed files, PR against `svsh_branch`.

## Review

**Summary.** New `server/src/modules/Reconciliation/` with four signed `POST` reads mounted at
`/api/integration/accounting/reconciliation` before the JSON parser, verified by the reverse-inbox
verifier and key. The drainer no longer claims exhausted rows. One index migration.

**Deviations from §2 and the Accounting plan.**
- R1: `visit_ids`/`batch_ids` switch the request into lookup mode instead of riding on the first page.
- R2: the index migration, which the Accounting plan did not list.
- Table names come from each model's `getTableName()` (`Reconciliation/tables.ts`), resolved on first
  use. The snapshot spells `inventory_items` while the model and migrations say `Inventory_Items`;
  going through the model names exactly what the ORM already queries.
- A missing inbound key answers `503 not configured` instead of throwing, which in an async Express 4
  handler would leave the request hanging.

**Testing evidence (2026-11-22).**
- `yarn test:db:setup` rebuilt `ehmrs_test`, applying the new migration. Down then up: 11 → 0 → 11
  index-column entries (9 indexes).
- `src/modules/Reconciliation`: 27 passed (14 route tests driving the real deletion, receipt,
  transfer, dispense, patient-return and store-return paths, plus 13 validation tests).
- Mutation checks: skipping deleted lines turns the two charge-count tests red; the old drainer turns
  the starvation test red (`claimed` 3, `sent` 0).
- `src/modules/Outbox` and `src/modules/Inbox`: 31 suites, 410 passed.
- Real process: the API was started against the local dev copy and called with a request signed by
  the configured key. All four routes answered 200, an unsigned call 401. `/outbox` reported the 7
  exhausted dev rows. A charges page took 103 ms. The process also starts the Agenda drain jobs;
  there were no drainable rows, and its log shows no writes. Dev data is a dev copy, used for shape
  and timing only.
- `npx tsc --noEmit` clean; eslint clean on changed files (two existing non-null warnings in
  `drainer.ts`, lines 108–109, untouched).

**Findings (§4)** are reported in the PR, not fixed here.

**Limitations.** `start_date` is midnight in the server's time zone. A line created before the start
date and deleted after it counts only through its reversal row. Each charges page recomputes the
window's visit set, which is cheap at this volume and indexed.
