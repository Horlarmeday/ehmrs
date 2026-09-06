# EMR #32 — Emit `charge.returned` from `returnDrugToInventory` (the patient refund half)

Narrow successor to #297, filed from the ACCT-side #174 plan (revision 2d, §8), which cannot close
without it.

## The gap

#297 shipped **one of the two events** a patient drug return produces.
`returnDrugToInventory` (`server/src/modules/Pharmacy/pharmacy.repository.ts:882`) emits
`stock.returned` in-transaction — the stock half. It emits nothing for the **sale unwind**, so
Accounting's derived stock is restored, but the patient's charge line stays `settled`, revenue
stays recognised, and no refund obligation is created.

`charge.returned` has **no producer anywhere in the EMR** today. Verified:

```
grep -rn "charge\.returned" server/src  →  5 matches, all guard rails, no producer
  dispense-return-emission.test.ts:433,469  — a granted store return emits no charge.returned
  dispense-and-return-events.test.ts:186,193 — "Flow 2 has no patient and no sale"
  inventory.repository.ts:521               — the same rule as a comment
```

The consumer is ACCT #174's `ChargeReturnedHandler`; this issue is its **only** producer. The
hospital still records refunds in its older accounting package, so this is a **parity gap to close
before cutover**, not money vanishing today.

## The asymmetry this issue exists for

`pharmacy.repository.ts:935-941` skips emission entirely when `resolveExternalBatchId` or
`resolveItemCode` misses. That is **correct for `stock.returned`** — a stock movement that cannot
name its batch has nowhere to land, and `buildStockReturnedEvent` throws on an empty batch id by
design.

It is **wrong for `charge.returned`**. A patient who returns a drug is owed money whether or not
the dispensary layer carries a batch identity, and `pharmacy_store_id` is permanently nullable
(#295 D3) — legacy layers are a live, ongoing case, not a migration artifact. Target shape:

```ts
await emitChargeReturned(…, t);          // ALWAYS — the patient is owed money
if (externalBatchId && itemCode) {
  await emitStockReturned(…, t);         // only when the layer can be named
} else {
  logStockReturnedSkip({ … });           // stock half only
}
```

Getting this gate wrong reintroduces the exact defect for every legacy-layer return.

---

## Decisions taken before implementation (do not revise during build)

- **D1 — idempotency key is per-RETURN, not per-line: `charge-returned:{history_id}`.**
  Keyed on the `Inventory_Item_Histories` row this return writes — the same identity
  `stock.returned` already uses via `stockReturnedIdempotencyKey('patient_to_dispensary', id)`.
  A line-scoped key (`charge-returned:drug:5554`, following the `charge.voided` naming precedent)
  would be **wrong, not merely coarse**: `getReturnStatus` (`pharmacy.repository.ts:704`) produces
  `PARTIAL_RETURNED`, so a line can be returned several times, and the second partial return would
  collide on the UNIQUE index and never refund. This is the identical trap
  `dispenseIdempotencyKey` already documents for repeat partial dispenses.

- **D2 — a duplicate key RAISES; `charge.returned` is NOT added to `IDEMPOTENT_SKIP_EVENT_TYPES`.**
  Matches `dispense.recorded` and `stock.returned`. The AC's "idempotent under redelivery" is
  satisfied by the UNIQUE index on `idempotency_key`; a silent skip would hide a genuine
  key-collision bug. `charge.voided` and `encounter.closed` are in the skip set because they are
  re-derived in bulk at visit close — a return is not.

- **D3 — `reason` IS carried on the wire, trimmed, truncated to 500 chars, omitted when blank.**
  The issue specifies `reason?`. Note the tension recorded honestly: `stock.returned` deliberately
  excludes `reason_for_return` as narrative under ADR-0016, and
  `dispense-and-return-events.test.ts:181` asserts its absence there. That test constrains
  `stock.returned` only and stays green. `assertNoDemographics` scans **key names**, not values, so
  `reason` passes it — the free text could in principle contain a name. Accepted as an explicit
  decision; the 500-char cap bounds payload size for a signed body.

- **D4 — an EMR-side `PERMITTED_EVENT_TYPES` allowlist, enforced in `persistOutboxEvent`, throwing
  on an unknown type.** AC line 7 asks for this. No such allowlist exists today: `event_type` is a
  free `STRING(64)` (`20260721000000-create-outbox-events.js:33-36`), `gate-check.ts` is the
  fail-closed *payment* gate and carries no event types, and `drainer.ts` does not filter. One
  chokepoint every emitter already funnels through; a typo'd type aborts the clinical write rather
  than reaching Accounting's inbox to be dropped as unrecognised.

- **D5 — the allowlist uses WIRE type strings, verified against the builders.** Note
  `buildChargeReversalRequestedEvent` emits `charge.reversal.requested` (dots), **not**
  `reversal_requested` — its idempotency key uses the underscore form. Copying the key format into
  the allowlist would break every reversal emit. The nine permitted types are enumerated in T4.

- **D6 — `emitChargeReturned` no-ops when the outbox is disabled**, like every sibling emitter, so
  this lands in production inert behind `EMR_OUTBOX_ENABLED`.

- **D7 — emission stays inside the caller's transaction (ADR-0018).** No return may unwind stock
  without the sale-unwind event committing alongside it.

## Open item to confirm with the ACCT repo (does not block this work)

AC line 7 also names "gate-check coverage". The EMR's `gate-check.ts` has no event-type surface, so
this is read as ACCT #174's inbox-side accept list. **Confirm with the ACCT repo that
`charge.returned` is registered in its permitted event types and schema registry**, otherwise the
inbox will reject or drop every event this issue produces. Flagged, not assumed.

---

## Tasks

### T1 — `buildChargeReturnedEvent` in `event-builder.ts` *(complexity: M)*

Add `ChargeReturnedInput`, `chargeReturnedIdempotencyKey`, and the builder, placed beside
`buildStockReturnedEvent`.

```ts
export interface ChargeReturnedInput {
  readonly type: PrescribedLineType;      // 'drug' | 'additional_item' in practice
  readonly id: number | string;
  readonly visit_id: number | string;
  readonly quantity: number;
  /** Inventory_Item_Histories.id for this physical return. */
  readonly return_id: number | string;
  readonly reason?: string;
}
```

Body (ID-only, no demographics, no money — ADR-0016 / ADR-0009):

```ts
{
  external_line_ref: { type, id: String(id) },   // charge.voided precedent
  encounter_id: visitAggregateId(visit_id),
  quantity,
  reason?                                        // trimmed, ≤500, omitted when blank
}
```

Validation, mirroring the siblings:
- unknown `type` → `EventBuildError` (via `isPrescribedLineType`)
- `quantity` not a positive integer → `EventBuildError`
- `assertNoDemographics(body, 'charge.returned')`
- **must NOT require a batch id or item code** — it carries neither

`chargeReturnedIdempotencyKey(returnId)` → `` `charge-returned:${returnId}` `` (D1).

**Acceptance:** builder returns `aggregate_type: 'encounter'`, `event_type: 'charge.returned'`,
`event_version: 1`, the payload envelope shape the siblings use, and throws on bad type/quantity.

- [x] Implemented

### T2 — `emitChargeReturned` in `outbox-writer.ts` *(complexity: S)*

Follows `emitStockReturned` exactly: no-op when `!isOutboxEnabled()`, `claimSequence` on
`visitAggregateId(input.visit_id)`, `buildChargeReturnedEvent`, `persistOutboxEvent` on the
caller's transaction. Export from the module's existing surface.

**Acceptance:** returns `undefined` with `EMR_OUTBOX_ENABLED` unset; writes exactly one row when set.

- [x] Implemented

### T3 — Restructure the emit block in `returnDrugToInventory` *(complexity: M — the crux)*

`pharmacy.repository.ts:~930-960`. Emit `charge.returned` **before and outside** the
`if (!externalBatchId || !itemCode)` guard; leave the guard and `logStockReturnedSkip` untouched
for the stock half.

- `type`: `data.prescription_id ? 'drug' : 'additional_item'` — the same discriminant
  `dispenseDrug` uses at line ~816.
- `id`: `data.prescription_id ?? data.additional_item_id`.
- `visit_id`: `prescribedDrug.visit_id` (the emitter derives `encounter_id`).
- `quantity`: `+quantity_to_return` — a `PARTIAL_RETURNED` reverses only this portion.
- `return_id`: `history.id`, the row created just above.
- `reason`: `reason_for_return`.

Add a comment recording **why** this one sits outside the guard (the D-decision above), so the next
reader does not "tidy" it back inside.

**Acceptance:** a legacy-layer return (null `external_batch_id`) writes one `charge.returned` row,
zero `stock.returned` rows, and one skip log line.

- [x] Implemented

### T4 — `PERMITTED_EVENT_TYPES` allowlist in `outbox-writer.ts` *(complexity: S)*

A module-level `Set` checked at the top of `persistOutboxEvent`, throwing on an unknown type.
Exactly these nine, copied from the builders' literals (D5):

```
charge.captured, charge.voided, charge.reversal.requested, charge.returned,
dispense.recorded, stock.returned,
encounter.opened, encounter.closed, patient.demographics.changed
```

**Acceptance:** every existing emitter still writes; a hand-built row with `event_type: 'nope'`
throws and rolls back.

- [x] Implemented

### T5 — Builder unit tests (`event-builder.test.ts`) *(complexity: M)*

- body carries `external_line_ref {type,id}`, `encounter_id`, `quantity`
- no cost, no price, no patient fields (regex scan, as the `stock.returned` test does)
- rejects `quantity` 0, negative, non-integer
- rejects an unknown `type`
- **builds successfully with NO batch id and NO item code** — the asymmetry, at the unit level
- `reason`: present when supplied, trimmed, truncated at 500, key absent when blank/whitespace
- idempotency key is `charge-returned:{return_id}` and differs across two returns on one line

- [x] Implemented

### T6 — Integration test: the legacy-layer regression guard *(complexity: M)*

In `dispense-return-emission.test.ts`, beside the existing patient-return test. Run
`returnDrugToInventory` against a layer whose `external_batch_id` is NULL and assert:

- exactly **one** `charge.returned` row, `quantity` matching the returned quantity
- **zero** `stock.returned` rows
- the skip is still logged

This is the test that fails if someone later re-gates the emission behind the batch guard.

- [x] Implemented

### T7 — Integration test: the happy path and the transaction boundary *(complexity: S)*

- a normal return (batch id present) emits **both** `charge.returned` and `stock.returned`, on the
  same `encounter:{visit_id}` aggregate with distinct sequences
- a return that throws mid-transaction leaves **neither** row (ADR-0018), mirroring the existing
  "a failed dispense leaves NEITHER stock NOR outbox changed" test
- a redelivered `charge.returned` (same `return_id`) **raises** on the UNIQUE index (D2)

- [x] Implemented

### T8 — Confirm the standing Flow 2 guard tests stay green *(complexity: S)*

`dispense-return-emission.test.ts:469` and `dispense-and-return-events.test.ts:186` must pass
unchanged. Flow 2 (`inventory.repository.ts`) is **not** touched by this issue.

- [x] Verified

### T9 — Full suite, typecheck, lint *(complexity: S)*

Run the whole server test suite (not just the touched files) — T4's allowlist is a new global
chokepoint and could break an emitter this issue never looks at. Record the output.

- [x] Verified

---

## Files touched

| File | Change |
|---|---|
| `server/src/modules/Outbox/event-builder.ts` | +`ChargeReturnedInput`, `chargeReturnedIdempotencyKey`, `buildChargeReturnedEvent` |
| `server/src/modules/Outbox/outbox-writer.ts` | +`emitChargeReturned`, +`PERMITTED_EVENT_TYPES` guard |
| `server/src/modules/Pharmacy/pharmacy.repository.ts` | restructure the emit block in `returnDrugToInventory` |
| `server/src/modules/Outbox/event-builder.test.ts` | T5 |
| `server/src/modules/Outbox/dispense-return-emission.test.ts` | T6, T7 |

No migration: `event_type` is already a free `STRING(64)`, and the new allowlist is code-level.
No API, controller, service or client change — the emission is invisible to the caller.

## Acceptance criteria (from the issue)

- [x] `charge.returned` emitted from `returnDrugToInventory` within the existing transaction — T3, T7
- [x] Emission **not** gated on `external_batch_id` / `item_code`; a legacy-layer return still
      emits it and still logs the `stock.returned` skip — T3, T6
- [x] `quantity` carries the returned quantity, so `PARTIAL_RETURNED` reverses only that portion — T3, T5
- [x] Body is ID-only — no patient name, no cost, no price — T1, T5
- [x] Flow 2 still never emits it; both standing guard tests green — T8
- [x] Idempotent under redelivery via the outbox sequence/UNIQUE machinery — D1, D2, T7
- [x] Added to the outbox's permitted event types — T4; **gate-check coverage is ACCT-side**, see
      the open item above

## Review

### Summary of changes

`charge.returned` now has a producer. `returnDrugToInventory` emits both halves of a patient
return inside one transaction: the sale unwind unconditionally, the stock movement only when the
layer can name its batch.

- **`event-builder.ts`** — `ChargeReturnedInput`, `chargeReturnedIdempotencyKey`,
  `buildChargeReturnedEvent`. The input carries **no** `external_batch_id` and **no** `item_code`,
  so the asymmetry is enforced by the type, not by a caller remembering it.
- **`outbox-writer.ts`** — `emitChargeReturned` (mirrors `emitStockReturned`), plus the exported
  `PERMITTED_EVENT_TYPES` allowlist enforced at the top of `persistOutboxEvent`.
- **`pharmacy.repository.ts`** — the emit block restructured: `emitChargeReturned` first and
  outside the guard, then the existing `if (!externalBatchId || !itemCode)` for the stock half,
  with a comment saying why it must not be "tidied" back inside.

### Technical decisions and trade-offs

D1–D7 above were settled before implementation and none were revised during the build. Two are
worth restating as trade-offs actually taken:

- **`reason` on the wire (D3).** `charge.reversal.requested` turned out to be an existing
  precedent — it already carries an optional `reason` — which makes this less of an outlier than
  the plan assumed. Still a genuine tension with `stock.returned`, which omits it as narrative
  under ADR-0016. Trimmed, capped at 500 chars, key omitted when blank. `assertNoDemographics`
  scans key names only, so a clinician who types a patient's name into the free-text box will put
  it on the wire. Accepted knowingly.
- **The allowlist throws rather than skipping (D4).** An unpermitted type aborts the clinical
  write. That is the loud failure mode, chosen over a silent drop at Accounting's inbox — but it
  does mean a future event type added without touching this set will fail closed in production.
  The T4 test asserting `size === 9` is the tripwire.

### Impact assessment

No migration, no API/controller/service change, no client change — the emission is invisible to
the caller. `emitChargeReturned` no-ops under `EMR_OUTBOX_ENABLED`, so this lands inert.

The allowlist is the one change with reach beyond this issue: it is a new global chokepoint on
every outbox write. That is why the full suite was run rather than just the touched files.

### Testing evidence

- `dispense-and-return-events.test.ts` — **28 passed**, including 12 new `buildChargeReturnedEvent`
  cases: builds with no batch id and no item code; rejects 0/negative/fractional quantity and
  unknown types; reason trimmed/omitted/truncated; two partial returns yield distinct keys.
- `dispense-return-emission.test.ts` — **21 passed** against real MySQL, including the four new
  integration cases:
  - both halves emitted on one encounter with distinct sequences
  - **a LEGACY-layer return emits `charge.returned`, zero `stock.returned`, and logs the skip** —
    the regression guard for the issue's headline asymmetry
  - two partial returns of one line each emit their own event
  - a redelivered `charge.returned` raises on the UNIQUE key rather than double-refunding
- Standing Flow 2 guards green, unchanged: `dispense-return-emission.test.ts` "no charge.returned"
  and `dispense-and-return-events.test.ts:186`.
- Whole Outbox module: **274 tests passed**.
- `tsc --noEmit` clean. `eslint` 0 errors on all touched files (4 pre-existing unused-import
  warnings in `pharmacy.repository.ts`, untouched).
- **Full server suite, baseline vs. change (re-verified by stashing the diff and re-running):**
  baseline **31 failed suites / 94 failed tests**; with the change **30 failed / 93 failed, 428
  passed**. `comm` on the two FAIL sets is empty in the regression direction — **no new failures** —
  and names exactly one suite failing only at baseline: `emit-for-rows.test.ts`, which the change
  fixes (it exercises `persistOutboxEvent`, so the allowlist landing green repairs it). The
  remaining pre-existing failures are stale `dist/` builds and empty suites, untouched here.

  An earlier draft of this line recorded the two sets as "identical (31 each, diff empty in both
  directions)". That was wrong in the harmless direction: the change fixes one suite rather than
  leaving the set unchanged. Corrected against an actual stash-and-rerun.

### Discovered limitations

1. **`charge.returned` is inert until ACCT #174 registers it.** The EMR now produces the event;
   ACCT's inbox must accept it or every one is dropped. Confirm before enabling the flag.
2. **The reason field can carry demographics** — see D3. A content filter, not just a length cap,
   would be the stricter choice if ADR-0016 is read literally.
3. **One test I wrote and removed** queried the DB after the suite's `afterAll` closed the
   connection. Its two sibling assertions cover the allowlist without needing the DB.

### Follow-ups

- Confirm `charge.returned` in ACCT's permitted event types / schema registry (the AC's
  "gate-check coverage" half, which has no EMR-side home).
- Consider whether `stock.returned` should gain `reason` for symmetry, or `charge.returned` lose
  it — the two now differ in posture on the same column.
