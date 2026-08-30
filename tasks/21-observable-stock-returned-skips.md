# EMR #21 / #22 — Make the silent `stock.returned` emission skips observable

Filed by the Accounting #298 re-audit. Both issues are the same failure mode on the
`stock.returned` producer: a return moves stock, hits a guard, and emits **nothing** — no log,
no counter, no error. Accounting cannot detect an event it never receives, so its per-location
stock split silently under-counts.

## Scope

The guards themselves are **correct and stay**. `buildStockReturnedEvent` throws on an empty
batch id, so emitting would abort a clinical transaction, and fabricating a batch id is
forbidden by #295 D3. This change makes the skip *visible*; it does not change when an event is
or is not emitted.

Decisions taken before implementation (do not revise during build):

- **D1 — a structured `warn` log line, not a counter table.** The EMR has no metrics facility to
  hang a counter on, and a new table is more surface than either issue asked for. `warn` and not
  `info`: `logger.ts` `level()` returns `'warn'` in production, so an `info` line would itself be
  invisible — reintroducing the very defect being fixed.
- **D2 — one shared helper, both flows.** Flow 2 (`dispensary_to_store`, #21/#22) and Flow 1
  (`patient_to_dispensary`, `pharmacy.repository.ts:929`) carry the identical silent skip. Flow 1
  is not named in either issue but is the same defect and the same blind spot for Accounting.
- **D3 — the log names ids only, never demographics.** ADR-0016 applies to logs as it does to
  event bodies: `Return_Items.id` / history id, drug id, store row id, and the failing guard.
  No patient, no reason_for_return, no price.
- **D4 — the helper never throws.** Observability must not be able to abort a clinical
  transaction; that is the failure the guards exist to prevent.

## Tasks

- [x] **T1** — Add `logStockReturnedSkip` to the Outbox module: takes the flow, the reason
      (`missing_batch_id` | `missing_item_code`), and the id set; emits one `warn` line.
      <!-- evidence: test="skip-observability.test.ts" -->
- [x] **T2** — Call it from Flow 2's two guard misses in `inventory.repository.ts`.
      <!-- evidence: test="skip-observability.test.ts -t 'dispensary_to_store'" -->
- [x] **T3** — Call it from Flow 1's combined guard miss in `pharmacy.repository.ts`.
      <!-- evidence: test="skip-observability.test.ts -t 'patient_to_dispensary'" -->
- [x] **T4** — Unit test: both reasons, both flows, log level is `warn`, ids present,
      no demographics, helper does not throw.
      <!-- evidence: test="skip-observability.test.ts" -->
- [x] **T5** — Integration proof: a granted return on the legacy (null-batch) fixture row still
      moves stock, still emits no event, and now logs. Extends the existing
      `dispense-return-emission.test.ts` fixture, which already has `storeRowLegacy`.
      <!-- evidence: test="dispense-return-emission.test.ts -t 'legacy'" -->
- [x] **T6** — `yarn lint` + `tsc --noEmit` clean; run the unit suite.

## Review

### What changed

`server/src/modules/Outbox/skip-observability.ts` (new) exports `logStockReturnedSkip`, a single
`warn`-level log naming the flow, the failing guard, and the id set. Both producers call it where
they previously fell silently off the end of a guard:

- Flow 2 — `inventory.repository.ts`, the granted store-return loop. The nested
  `if (batch) { if (code) { … } }` became a three-branch `if / else if / else`, so the two
  reasons are distinguishable in the log rather than collapsed.
- Flow 1 — `pharmacy.repository.ts`, `returnDrugToInventory`. `if (batch && code)` gained an
  `else` that attributes whichever resolver missed.

**No change to when an event is or is not emitted.** The guards are unchanged in effect; the diff
adds only the record of the skip.

### Technical decisions

- **`warn`, not `info`.** `logger.ts` `level()` returns `'warn'` outside development. An `info`
  line would be dropped in production — reintroducing the exact invisibility being fixed. Pinned
  by a test asserting `logger.info` is never called.
- **A log line, not a counter table.** The EMR has no metrics facility; a new table and migration
  is more surface than either issue asked for. The `[stock.returned]` tag makes the skips
  greppable as one class, which is the counter in practice.
- **Flow 1 included though neither issue names it.** `pharmacy.repository.ts:929` carried the
  identical silent skip, and a legacy-batch patient return is equally invisible to Accounting.
  Fixing only Flow 2 would have left the reported gap half open.
- **The helper swallows its own errors.** Observability must not be able to abort a clinical
  transaction — the very outcome the guards exist to prevent.
- **Ids only.** ADR-0016 applies to logs as to event bodies; a test asserts no patient, price,
  cost, or reason-for-return reaches the line.

### Testing evidence

- `skip-observability.test.ts` — 23 passing: both reasons × both flows, warn-not-info, the id set,
  the tag, absent ids omitted rather than printed as `null`, no demographics, and no throw when
  the logger itself fails.
- `dispense-return-emission.test.ts` — 15 passing (was 14). The added case drives a real granted
  return on the legacy null-batch fixture row against MySQL and asserts all three facts together:
  stock moved (`quantity_remaining` decremented, status `RETURNED`), still no outbox row, and now
  exactly one skip line naming `reason=missing_batch_id` and the real `return_id`.
- Regression sweep: `src/modules/Outbox src/modules/Pharmacy src/modules/Inbox` → 288 passing.
- `tsc --noEmit` clean on all touched files; `eslint` clean on the new and modified files.

### Discovered during implementation

- The new integration test initially broke the pre-existing `'no emitted body carries a cost or a
  price'` case: that test scans whatever rows remain in the outbox, and calling `clearOutbox()` in
  a case that emits nothing by design left it with none. Fixed in the new test by taking a
  store-aggregate count delta instead of draining shared state.
- `pharmacy.test.ts` fails 3 cases (generic drugs, dosage forms). Verified identical on a stashed
  clean tree — pre-existing and unrelated to returns; not addressed here.
- 4 unused-import warnings in the two touched repositories are likewise pre-existing (same 5
  warning lines before the change).

### Follow-ups

- Neither issue's underlying data condition is fixed: legacy store rows still have no
  `external_batch_id`, so Accounting's per-location split still under-counts those returns — it is
  now merely *visible* that it does. A backfill of `external_batch_id` onto the ~1,644 legacy rows
  is the actual remedy and remains unfiled.
