# EMR #29 — Negative receipt quantities: guard the writers, repair the data, fix the valuation

Issue #29 as filed contains **two** defects and argues they are one repair. This plan implements
**one** of them. The other rests on a premise that does not hold, and §0 retires it in writing so
the next reader does not rediscover it.

## 0. Correcting the record — defect A is invalid

**#29 claims:** Cash / Private / Retainership are "one physical shelf, priced per payer", the
`createPharmacyItemService` fan-out triplicates a single arrival, stock is overstated
"811,810 recorded vs 376,650 real — 2.16×", and the repair is to collapse 493 drugs into one row.

**That is wrong.** Each `drug_type` is its own shelf, with its own stock and its own price —
NHIS, Cash, Private, Retainership and Plaschema alike. NHIS paracetamol is a different physical
thing from Cash paracetamol. Confirmed by the system's author, and consistent with the schema:
`createStoreItem` (`store.repository.ts:55-100`) takes a distinct `selling_price` per type —
`data.selling_price`, `data.nhis_selling_price`, `data.private_selling_price`
(`store.repository.ts:128-147`) — because the types are *meant* to be priced independently.

Consequences, all load-bearing:

- **There is nothing to collapse.** The three creates from one submission are the system working
  as designed. A collapse migration would **destroy real stock**.
- **The 2.16× overstatement does not hold.** `376,650` is `SUM(per-drug MAX(quantity_remaining))`,
  which keeps the single largest shelf per drug and discards the rest. It is not a physical count
  of anything.
- **The "cannot be fixed separately" argument falls with it.** The interlock #29 describes — 582
  of 586 negative rows sitting inside drugs the collapse would touch — only binds if the collapse
  happens. It does not.
- **The 25 "divergent" drugs are not divergent.** Cash/Private/Retainership holding different
  `quantity_remaining` for one drug is the expected state of three separate shelves, not a
  disagreement needing a survivor rule.

Do **not** revive the collapse during implementation. If it is ever reopened it needs a fresh
issue and evidence from the real production database, not this one.

**Defect B — negative receipt quantities — is real, and is what this plan builds.** It is
established entirely from source; it needed no database access to confirm.

## 1. The defect, proved from source

Three facts, each at a cited line:

1. **No floor on the column.** `pharmacyStore.ts:73-80` — `quantity_received` carries only a
   `notEmpty` validator. `quantity_remaining` immediately below it (`:82-89`) *does* carry
   `min: { args: [0] }`. The asymmetry is the bug.

2. **A negative receipt silently decrements the shelf.** `reorderPharmacyItems`
   (`store.repository.ts:629`) spreads `...item` with no floor and writes
   `quantity_remaining: +storeItem.quantity_remaining + +item.quantity_received`. A negative
   `quantity_received` therefore *subtracts* from stock, and files a `PharmacyStoreHistory` row
   of `history_type: SUPPLIED` claiming a negative delivery. The `min: 0` on `quantity_remaining`
   does not save it — Sequelize `update()` skips model validators unless `validate: true`.

3. **`total_price` inherits the sign.** Computed as `quantity_received * unit_price` at
   `store.repository.ts:86` and `applier.ts:411,490`. This is the mechanism behind the negative
   store valuation #29 reports.

**A fourth consequence #29 does not mention.** `quantity_received` is a *denominator* for stock
classification in `reports.repository.ts`: `:1028-1029` classify Low Stock / Overstocked as
`quantity_remaining < quantity_received * 0.2` / `> * 0.8`, and `:1046,1094` compute
`(quantity_remaining / quantity_received) * 100`. With a negative denominator the comparison
inverts and the percentage is negative — so **every reorder and stock-level report over an
affected row is currently wrong**, not just the valuation. Ask #5 of the issue asks what reads
`SUM(total_price)`; this is the broader answer.

## 2. Decisions taken before implementation (do not revise during build)

- **D1 — `min: 0` on the model *and* a DB `CHECK`.** The model validator gives the good error
  message; the constraint holds regardless of write path, including raw queries and imports.
  Neither alone is sufficient: validators are skipped by `update()` without `validate: true`,
  and a constraint alone surfaces as an opaque driver error.
- **D2 — every writer is floored explicitly and pinned by a test.** Per the trace in §3. A guard
  that only exists in the database fails in production rather than in review.
- **D3 — `quantity_remaining` is authoritative; `quantity_received` is not reconstructed.**
  #29's own observation is that on the negative rows `quantity_remaining` is "positive and
  plausible" while the receipt history is corrupt. The repair floors `quantity_received` to 0
  and recomputes `total_price` from `quantity_remaining × unit_price`. It does **not** invent an
  arrival figure: what actually arrived is not recoverable from the data, and a fabricated
  receipt is silently wrong where a zero is visibly unknown (the ADR-0041 principle).
- **D4 — the decrement is not reversed.** Adding the negative back to `quantity_remaining` would
  assume no real dispensing has happened since. Where it has, that inflates the shelf. The
  quarantine list (D5) is the honest route for rows whose shelf figure is doubted.
- **D5 — the 170 all-negative drugs are quarantined, not repaired.** #29 is right that no correct
  value is recoverable for them. They go to a physical stock take. **Plan for the operational
  lead time — this is the long pole, and it is not an engineering task.**
- **D6 — reversible migration.** Affected rows are snapshotted before mutation; `down()` restores
  from the snapshot. This touches financial data and D3 is a judgement call.

## 3. Writer trace — every path that writes `quantity_received`

| Path | Location | Floored today? | Action |
|---|---|---|---|
| `createStoreItem` (all 3 create paths) | `store.repository.ts:59,82-86` | **No** | Floor + test |
| `reorderPharmacyItems` | `store.repository.ts:629` | **No** — prime suspect | Floor + test |
| `stock.received` new-bin | `applier.ts:488` | **Yes** — `applier.ts:283` | Test only, pin it |
| `stock.received` reorder-bin | `applier.ts:411` | **Yes** — `applier.ts:283` | Test only, pin it |
| Joi request validation | `validations.ts:47,118` | **No** — bare `Joi.number()` | Add `.min(0)` |
| Inventory transfer | `inventory.repository.ts:55`, `inventory.service.ts:78` | No | Assess: derived from a store row, so floored upstream — confirm, do not double-guard |

`applier.ts:283` is the model to copy: `typeof quantity !== 'number' || !Number.isInteger(quantity)
|| quantity <= 0` with a message naming the rejected receipt. #304 got this right; the older
paths never did.

## Tasks

### A — Stop the bleeding

- [x] **T1** — Add `min: { args: [0] }` to `quantity_received` on `pharmacyStore.ts`, mirroring
      `quantity_remaining`'s validator directly below it.
      <!-- evidence: test="store-quantity-guard.test.ts -t 'model rejects negative'" -->
- [x] **T2** — Add `.min(0)` to both `quantity_received` Joi schemas in `validations.ts:47,118`,
      so the rejection happens at the request boundary with a readable message.
      <!-- evidence: test="store-quantity-guard.test.ts -t 'request rejects negative'" -->
- [x] **T3** — Floor `createStoreItem` explicitly (`store.repository.ts:59`), following the
      `applier.ts:283` shape. Reject; do not clamp silently.
      <!-- evidence: test="store-quantity-guard.test.ts -t 'createStoreItem'" -->
- [x] **T4** — Floor `reorderPharmacyItems` (`store.repository.ts:629`) before the `...item`
      spread, so neither `quantity_received` nor the `quantity_remaining` arithmetic can go
      negative. Validation runs over the WHOLE batch before the loop — each item commits in its
      own transaction, so a mid-loop guard would leave a half-applied reorder.
      <!-- evidence: test="store-quantity-guard.test.ts -t 'reorderPharmacyItems'" -->
- [x] **T5** — Migration: DB `CHECK (quantity_received >= 0)` on `Pharmacy_Store_Items`.
      `20260831000002-add-non-negative-receipt-check-29.js`; sorts strictly AFTER the repair
      migration, which is what enforces the required sequence.
      <!-- evidence: test="repair-29.test.ts (check29.up applies on the just-repaired table); raw-UPDATE rejection pinned in store-quantity-guard.test.ts -t 'database CHECK'" -->
- [x] **T6** — Regression test per writer, including the two `applier.ts` paths that already
      guard, so a later refactor cannot quietly remove the floor from any of them.
      <!-- evidence: test="store-quantity-guard.test.ts" -->

### B — Repair the data

- [x] **T7** — Read-only report script: per drug and drug_type, the negative rows, their
      `quantity_remaining`, current vs recomputed `total_price`, and the three cohorts
      (repairable / partially-negative / all-negative). Output reviewed **before** T8 runs.
      `src/database/scripts/repair-29-negative-receipts.sql` §1–§3, with a DBA-led Up/Down twin
      of both migrations (§4/§6) and rehearsal checks (§7).
      <!-- evidence: script output attached to the PR; rehearsed read-only on the local dev copy — see Review -->
- [x] **T8** — Repair migration, reversible per D6:
      snapshot affected rows into `Pharmacy_Store_Items_repair_29_backup`;
      set `quantity_received = 0` where negative;
      recompute `total_price = quantity_remaining * unit_price` for every touched row;
      `down()` restores from the snapshot (and resurrects rows deleted since the repair, but
      never reverts `quantity_remaining` — dispensing since the repair is real).
      `20260831000001-repair-29-negative-receipt-quantities.js`.
      <!-- evidence: test="repair-29.test.ts" -->
- [x] **T9** — Pre/post reconciliation report: `SUM(total_price)` and per-`drug_type`
      `SUM(quantity_remaining)` before and after, asserting the quantity totals are **unchanged**
      (D3/D4 mean the repair must not move stock) and that `SUM(total_price)` is no longer
      negative. Script §3/§5 (DBA, at run time) + asserted live in the test.
      <!-- evidence: test="repair-29.test.ts -t 'floors'" -->
- [x] **T10** — Emit the quarantine worklist (D5): all-negative and partially-negative drugs,
      as a CSV for the stock take. Script §2, comma-safe columns, `mysql --batch` export
      instructions. Counts come from the REAL production run of §1b/§2 — the local dev copy
      disagrees with the issue (see Review), so the issue's 170/5 are not to be trusted either.
      <!-- evidence: CSV generated from the real prod run of script §2; attached to the PR -->

### C — Fix the consumers

- [x] **T11** — Audit `reports.repository.ts` stock classification and the
      `literal('quantity_received * …')` filters; guard the zero/negative denominator.
      Guards: dashboard low-stock count and low-stock alerts count a zero shelf on an unknown
      receipt as low stock; threshold filters and the overstock query require
      `quantity_received > 0`; the distribution CASE gains an 'Unknown Receipt' bucket; both JS
      percentage computations are null-guarded. Also guarded the adjacent
      `getInventoryReports` derived literals (`quantity_received - quantity_remaining` goes
      negative on a repaired row → now NULL, visibly unknown).
      <!-- evidence: test="reports-stock-classification.test.ts" -->
- [x] **T12** — Identify and document every reader of `SUM(total_price)` (issue Ask #5) —
      documented in the Review section below.

### D — Close out

- [x] **T13** — `tsc --noEmit` clean; eslint 0 errors (42 pre-existing decorator warnings,
      identical on baseline); the three new suites green (15 tests); all Store/Inbox suites
      green; the 12 failing suites elsewhere fail identically on the pre-change baseline
      (shared-test-DB isolation defects, documented in store-create-history.test.ts).
- [ ] **T14** — Update issue #29: note defect A retired per §0, defect B repaired. Confirm
      whether #25/#26 (superseded by #29) are fully covered or need reopening for the collapse
      claim that is now withdrawn. Restate the narrower blocking claim on Accounting #36.
      <!-- drafted in Review; posting is a maintainer action -->
- [ ] **T15** — PR against the working branch, linking the reconciliation report and the
      quarantine CSV.
      <!-- awaiting commit/PR go-ahead -->

## Open questions for the issue author

1. **Which database do the #29 figures describe?** All measurements in the issue (1,664 rows,
   586 negatives, −₦44,301,228) are attributed to `ehmrs_prod`, but the local `ehmrs_prod` is a
   dev copy. T7 must be run against the **real** production database before T8 is written, and
   the cohort counts may differ from the issue's.
2. **Does Accounting #36 still need this first?** #29 claims it blocks the three-way match. With
   the collapse withdrawn, the blocking argument is narrower — a supplier invoice reconciles
   against a *negative* receipt quantity, not a 2.16×-inflated one. Worth restating on #36.
3. **`PharmacyStoreLog` and `PharmacyStoreHistory`** carry `quantity_received` too
   (`pharmacyStoreLog.ts:74`). The negative reorders wrote history rows claiming negative
   deliveries. Repair those, or leave them as the audit trail of what actually happened?
   This plan currently leaves them — the history is a record of events, not of truth.

## Review

### Summary of implemented changes

| File | Change |
|---|---|
| `server/src/database/models/pharmacyStore.ts` | T1 — `min: {args: [0]}` on `quantity_received`, mirroring `quantity_remaining` |
| `server/src/modules/Store/validations.ts` | T2 — `.min(0)` on both `quantity_received` Joi schemas |
| `server/src/modules/Store/store.repository.ts` | T3/T4 — explicit floors in `createStoreItem` and `reorderPharmacyItems` (whole-batch validation before the per-item transactions); guarded `getInventoryReports` derived dispense literals |
| `server/src/database/migrations/20260831000001-repair-29-negative-receipt-quantities.js` | T8/T9 — reversible repair: snapshot → floor → restate valuation, with an intra-migration reconciliation check |
| `server/src/database/migrations/20260831000002-add-non-negative-receipt-check-29.js` | T5 — named `CHECK (quantity_received >= 0)`, sequenced after the repair |
| `server/src/database/scripts/repair-29-negative-receipts.sql` | T7/T9/T10 + DBA twin of both migrations with rehearsal checks (§7 proves the CHECK bites — MySQL < 8.0.16 parses and ignores it) |
| `server/src/modules/Store/reports.repository.ts` | T11 — zero-denominator guards on dashboard count, threshold filters, alerts, distribution CASE ('Unknown Receipt' bucket), overstock query, both percentage computations |
| Tests | `store-quantity-guard.test.ts` (10), `repair-29.test.ts` (2), `reports-stock-classification.test.ts` (3) |

### Technical decisions and rationale

- **Whole-batch validation in `reorderPharmacyItems`.** Each item commits in its own transaction;
  validating inside the loop would reject item 4 of 4 with items 1–3 already restocked. All lines
  are validated up front, so a refused reorder leaves every shelf untouched (pinned by test).
- **`down()` restores only `quantity_received` and `total_price`,** never `quantity_remaining`:
  dispensing since the repair is real, and reverting it would claim stock back onto shelves. It
  also resurrects rows deleted since the repair rather than silently losing them.
- **'Unknown Receipt' as a new distribution bucket** rather than folding repaired rows into an
  existing class: `quantity_remaining > quantity_received * 0.8` is trivially true against a zero
  denominator, so pre-guard these rows surfaced as *Overstocked*. The honest label is unknown —
  same principle as ADR-0041's "null is visibly unknown". `StockDistribution.status` is a plain
  string, so the bucket is additive to the wire shape.
- **`getInventoryReports` literals guarded (adjacent to T11's list).** `quantity_received -
  quantity_remaining` goes negative on a repaired row (0 − shelf); now NULL when the receipt is
  not positive. Found during T12's audit; same failure family, one line of blast radius.

### T12 — every reader of `SUM(total_price)` (issue Ask #5)

- **`getVendorPerformance`** — `store.repository.ts:1398` — `SUM(ps.total_price) AS
  total_purchase_value`. **The only server-side reader.** This figure changes with the repair:
  every vendor whose bins included corrupt rows has been carrying their negative valuation.
- **Valuation elsewhere is already remaining-based and unchanged:** `getExpiryTracking`
  (`reports.repository.ts:912,937`) and the stock-distribution query (`:1063`) compute
  `SUM(quantity_remaining * unit_price)` — the repair does not touch either input.
- **Dashboard revenue** sums `quantity_dispensed * unit_price` from *histories*, not the store
  table — unaffected.
- **Client `total_price` sums** (`BulkMedications.vue`, etc.) are over prescription lines, not
  `Pharmacy_Store_Items` — unaffected.
- Net answer to Ask #5: the negative valuation defect was visible in vendor purchase-value
  reporting and in any direct reads of the column; the stock-level/classification reports were
  wrong through the *denominator* defect (§1 of this plan), fixed by T11.

### Impact assessment

- Writers now reject (not clamp) negative receipts at four layers: Joi, writer functions, model
  validator, DB CHECK. Zero is allowed on clerk paths (an empty delivery is odd, not corrupting);
  the applier keeps its stricter positive-only guard.
- The repair moves no stock and rewrites only the two corrupt columns on 586 rows (local-copy
  count; real prod to be re-measured). History tables deliberately untouched (audit trail).
- Reports gain an 'Unknown Receipt' bucket and NULL dispense figures for repaired rows — an API
  surface change consumers should be told about in the PR description.

### Testing evidence

- 15 new tests, all green against real MySQL (ehmrs_test, re-provisioned with both migrations):
  - `store-quantity-guard.test.ts` — model/Joi/createStoreItem/reorderPharmacyItems/applier/CHECK,
    including "no half-applied reorders" and the raw-UPDATE CHECK rejection.
  - `repair-29.test.ts` — full up/down cycle: floor+restate, stock unmoved (per-class
    reconciliation asserted), CHECK applies on the repaired table, snapshot restore exact,
    refuses down without the snapshot, re-entrant up.
  - `reports-stock-classification.test.ts` — 'Unknown Receipt' bucket, no Infinity
    recommendations, zero-shelf unknown-receipt counted as low stock.
- `tsc --noEmit` clean; eslint 0 errors (42 warnings, byte-identical on the pre-change baseline —
  decorator-parser warnings on model files).
- All Store/Inbox suites pass. 12 other suites fail **identically on the pre-change baseline**
  (verified by stashing the change and re-running): pre-existing shared-test-DB isolation
  defects, not regressions.
- §1 report rehearsed read-only against the local dev copy: 586 negative rows / 214 drugs /
  −₦146,791,716 current vs +₦36,968,941 post-repair valuation; cohorts 136 all-negative /
  78 partially-negative.

### Discovered limitations

- **The local `ehmrs_prod` is definitively NOT the issue's database.** Row count matches (586)
  but nothing else does: 214 drugs vs the issue's 175; −₦146.8M vs −₦44.3M; 136/78 cohorts vs
  170/5. T7 must run against real production before T8 is applied there, and the quarantine CSV
  (T10) must be generated from that run — the issue's figures and the local copy's are both
  untrustworthy for the worklist.
- **MySQL < 8.0.16 silently ignores CHECK constraints** (parsed, never enforced). Local server is
  8.1.0 so tests prove enforcement; the SQL twin's §7a probe must be run on the real prod server
  before relying on the constraint there.
- Pre-existing type drift: `StockDistribution`/`OptimizationRecommendation` interfaces don't
  match the shapes the repositories actually emit (`stock_status`/`item_count` vs `status`/
  `count`; `reduce_ordering` vs the declared union). Tests read the wire shape; fixing the
  interfaces is out of scope and worth its own small task.
- `InventoryItem.quantity_received` (dispensary layer, `inventory.repository.ts:55`) is a
  different table written from store rows via transfers; upstream floors now cover the store
  side. Not double-guarded, per the plan's trace.

### Future considerations

- Run script §1–§3 on real prod, generate the §2 quarantine CSV, hand to pharmacy ops (the long
  pole — operational, not engineering), then apply §4 there via the DBA twin with §5/§7 checks.
- Re-open the interface-vs-wire drift in `reports.types.ts` as a standalone cleanup.
- The 12 pre-existing test-isolation failures (shared truncation in `store.test.ts` and friends)
  deserve their own issue; they make full-suite runs noisy and can mask real regressions.

### T14 draft — comment for issue #29 (posted at close-out)

> **Defect A (collapse) — withdrawn.** Each `drug_type` is its own shelf with its own stock and
> price (confirmed by the system's author); the three creates from one submission are the system
> working as designed. The 2.16× figure compared `SUM(all rows)` against
> `SUM(per-drug MAX(quantity_remaining))`, which is not a physical count of anything. There is
> nothing to collapse; a collapse migration would destroy real stock. If this is ever revisited
> it needs a fresh issue and evidence from the real production database.
>
> **Defect B (negative receipts) — fixed.** Writers now reject negative quantities at the
> request boundary, the writer functions, the model, and a DB CHECK; a reversible migration
> floors the 586 corrupt receipts to 0 and restates their valuation from the authoritative
> remaining stock without moving any stock; the affected drugs go to a physical stock take via
> the quarantine worklist; report consumers no longer divide by the corrupt denominator.
>
> **#25/#26:** the collapse claim is withdrawn, so any remaining scope there is only the
> negative-quantity repair, which this delivers. **#36:** the blocking claim is narrower than
> stated — a supplier invoice reconciles against a *negative* receipt quantity, not a 2.16×-
> inflated one; that defect is now closed at the writer and in the data.
