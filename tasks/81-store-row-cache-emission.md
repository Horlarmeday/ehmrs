# #81 — Emit `store.row.changed` and answer `store.row.requested` for Accounting's store-row cache

Branch: `81-store-row-cache` (from `svsh_branch`). PR base: `svsh_branch`.

## Context

Accounting (ehmrs_accounting#307) caches the EMR's `(drug, drug_type)` store row — whether it exists and its selling price — to drive the goods-receipt form (create vs increment; pre-fill price). Accounting's side lands first with degradation (ADR-0064); this repo must supply the emission and the resync answer. Shape follows #79 (`item.changed` / `vendor.changed` label channels).

## Decisions (confirmed with user, 2026-09-26)

| Question | Decision |
|---|---|
| Aggregate identity | `store-row:{itemCode}:{drugType}` — keyed exactly like Accounting's cache slot; distinct from `store:{id}` used by `stock.returned` |
| INACTIVE rows (no DELETE exists, only soft deactivate) | Emit `rowExists: false` on deactivation — an INACTIVE row must not be offered as an increment target |
| Resync against INACTIVE row | `rowExists: false` (unscoped lookup, consistent with above) |
| Null selling price | Emit `sellingPriceKobo: null` (explicit "unpriced", matches inbound `parseOptionalKobo` contract) |
| Quantity-only writes (EMR reorder, applier INCREMENT path) | No emission — rowExists and price unchanged |

## Codebase findings driving the plan

- `nhis_selling_price` / `private_selling_price` are request-body fields only; all three create paths (`createCashItem` / `createNHISItem` / `createPrivateItem`, `store.repository.ts:146-166`) write the single nullable `selling_price` DECIMAL column. **`selling_price` is the governing column for every drug_type** — resolves the issue's "review this part" concern; no per-class column mapping needed.
- `nairaStringToKoboString` (`server/src/modules/Outbox/money.ts:35-75`) rejects JS numbers and sub-kobo, returns integer-kobo string, no null pass-through — null handling wraps it in the caller.
- No DELETE endpoint; `deactivate` is `updatePharmacyStoreItem({id}, {status: INACTIVE})` via `store.service.ts:177-179`. Model DefaultScope filters ACTIVE (`pharmacyStore.ts:28-32`); resync and emission lookups must use `unscoped()`.
- Applier precedent: resync branches sit **before** `claimSequence` (`applier.ts:148-154`), unsatisfiable → `UNHANDLED` never throw. `stock.received` drug_type set: `RECEIVABLE_DRUG_TYPES` (`applier.ts:377`) = Cash/NHIS/Private/Retainership/Plaschema.
- Emit-helper contract: return `undefined` when outbox disabled / row missing — never roll back the store write.
- Body carries only code, class enum, boolean, kobo string → **no `DEMOGRAPHIC_EVENT_TYPES` change**.

## Tasks

### 1. Outbox: builder + writer (complexity: M)

- [ ] 1.1 `event-builder.ts`: `StoreRowChangedInput { item_code, drug_type, row_exists, selling_price_kobo: string | null }`; validation: code 1–43 chars (match item precedent), drug_type in the five-value `RECEIVABLE_DRUG_TYPES` vocabulary (move/share the constant, don't duplicate), `row_exists` boolean; when `row_exists` is true, `selling_price_kobo` must be a string of integer digits or null; when false, price must be null. Builder + `storeRowChangedIdempotencyKey(itemCode, drugType, sequence)` (`store-row-changed:{itemCode}:{drugType}:{sequence}`) and `storeRowAggregateId(itemCode, drugType)` (`store-row:{itemCode}:{drugType}`), shaped on `vendorChanged*`.
- [ ] 1.2 `outbox-writer.ts`: add `store.row.changed` to `PERMITTED_EVENT_TYPES`; add `emitStoreRowChanged(...)` returning `undefined` when disabled/unsatisfiable; add `emitStoreRowChangedForDrug(drugId, drugType, transaction)` helper: `Drug` lookup (must have non-empty `code` — **codeless drug → skip + return undefined**, ADR-0040 silent-skip class), `unscoped` store-row lookup by `(drug_id, drug_type)`, treat INACTIVE as absent, convert `selling_price` decimal-string → kobo via `nairaStringToKoboString` (null pass-through), claim sequence, persist.
- [ ] 1.3 Kobo round-trip unit test: decimal-string naira → kobo string → `Number(BigInt(kobo))/100` both directions, including `null`, `0.00`, and sub-kobo rejection at build time.

### 2. Trigger: EMR store flows (complexity: M)

- [ ] 2.1 `createStoreItem` (`store.repository.ts:53-139`): after `PharmacyStore.create` inside the existing transaction, emit `store.row.changed` (`rowExists: true`) with the created row's `selling_price`. Same transaction commit.
- [ ] 2.2 `updatePharmacyStoreItems` (`store.repository.ts:529-574`): emit only when the update changed `selling_price` or `status` (status → ACTIVE emits `rowExists: true`; INACTIVE emits `rowExists: false`, price null). Gate on `affected > 0` per the `updateVendor` precedent.
- [ ] 2.3 `deactivate` path (`store.service.ts:177-179`): verify 2.2 covers it (it routes through `updatePharmacyStoreItems`); if not, hook it. Emission: `rowExists: false`.
- [ ] 2.4 Confirm no other store-row create/price-write paths exist (grep `PharmacyStore.create` / `selling_price` writes); hook any stragglers.

### 3. Trigger: `stock.received` applier create path (complexity: S)

- [ ] 3.1 `applier.ts` create path (~568-647): after `PharmacyStore.create` + history row, inside the same transaction, emit `store.row.changed` (`rowExists: true`, price from the created row — created unpriced, so expect `sellingPriceKobo: null`). INCREMENT path emits nothing.

### 4. Inbound: `store.row.requested` applier branch (complexity: M)

- [ ] 4.1 `applier.ts`: add `store.row.requested` branch beside `item.requested`/`vendor.requested` **before** `claimSequence`. `applyStoreRowRequest(body)`: validate `itemCode` non-empty string + `drugType` in vocabulary → malformed → `UNHANDLED`; `Drug.findOne({ code: itemCode })`; no drug → `UNHANDLED` (no throw); drug found → `emitStoreRowChangedForDrug` (INACTIVE → `rowExists: false`); emitted → `APPLIED`, else `UNHANDLED`.

### 5. Tests (the #79 bar) (complexity: L)

- [ ] 5.1 Builder tests (extend `label-channels.test.ts` or sibling): body shape/equality, sequence-qualified key, aggregate id, validation throws (bad code, bad drug_type, price/non-null invariants), no-demographic-assertion passes without exemption.
- [ ] 5.2 `PERMITTED_EVENT_TYPES` membership test.
- [ ] 5.3 Applier/store integration tests over real MySQL asserting the **emitted `OutboxEvent` row payload**, not just outcomes:
  - createStoreItem (each of the 3 create flavors) → event with correct code/class/price/null-price
  - price update → new event with new price; no-op update → no event
  - deactivate → `rowExists: false`
  - codeless drug → no event, no throw, write still commits
  - applier create path → event with null price; applier INCREMENT → no event
  - `store.row.requested`: answered (existing ACTIVE row, assert emitted body), answered-as-absent (no row; INACTIVE row), UNHANDLED (unknown code; malformed body) with `OutboxEvent.count()` unchanged

### 6. Wrap-up

- [ ] 6.1 `npx tsc --noEmit` + eslint on touched files.
- [ ] 6.2 Run `yarn test` for Outbox/Inbox/Store suites.
- [ ] 6.3 Review section below, commit `feat(#81): ...`, push, `gh pr create --base svsh_branch`.

## Open items

- None — all design questions answered (see Decisions table).

## Review (2026-09-26)

### Summary of implemented changes
- `event-builder.ts`: `STORE_ROW_DRUG_TYPES` (five-value vocabulary, now shared), `isStoreRowDrugType`, `storeRowAggregateId` (`store-row:{itemCode}:{drugType}`), `storeRowChangedIdempotencyKey` (sequence-qualified), `buildStoreRowChangedEvent` with strict validation (code 1–43, class vocabulary, boolean `row_exists`, kobo-string-or-null price, price forbidden when absent). No `DEMOGRAPHIC_EVENT_TYPES` change.
- `outbox-writer.ts`: `store.row.changed` in `PERMITTED_EVENT_TYPES`; `emitStoreRowChanged` + `emitStoreRowChangedForDrug(drugId, drugType, t, pharmacyStoreId?)` — reads POST-WRITE state (`unscoped`, INACTIVE → `rowExists: false`), kobo-converts via `normalisePrice` + `nairaStringToKoboString`, codeless drug → skip (`undefined`), never rolls back the store write.
- Store hooks (same-transaction): `createStoreItem` (always), `updatePharmacyStoreItems` (only when selling_price/status actually change — values compared, not key presence, because the screen posts the full row), `reorderPharmacyItems` (only when the payload carries a price), `deactivatePharmacyStoreItems` (now transactional, emits `row_exists: false`).
- Applier: `store.row.requested` branch before the sequence claim (UNHANDLED on malformed/unknown code; existing-drug-no-bin answers `row_exists: false`); `RECEIVABLE_DRUG_TYPES` now aliases the shared `STORE_ROW_DRUG_TYPES`; emissions on CREATE path (always) and INCREMENT path (only when the receipt reprices).
- Tests: `store-row-channel.test.ts` (builder + kobo round-trip), `store-row-changed.test.ts` (6 integration), `store-row-resync.test.ts` (8 integration), `PERMITTED_EVENT_TYPES` pin updated to 15.

### Deviations from the plan (deliberate)
1. **INCREMENT path emits when the receipt reprices the bin** — the plan said applier INCREMENT emits nothing, but `selling_price_kobo` can change the cached price; emitting an overwrite is idempotent and prevents a stale pre-fill.
2. **Reorder emits when its payload carries a price** — `reorderPharmacyItems` spreads `...item` (which includes `selling_price`) onto the bin, so a clerk restock CAN reprice; quantity-only reorders (null price) emit nothing.
3. **Update-path gate compares values, not key presence** — the store screen posts the full row back, so `'selling_price' in rest` is always true; the hook emits only when the value actually differs.

### Impact assessment
- New outbound wire type `store.row.changed`; new inbound instruction `store.row.requested`. Accounting's PR merges first (its INBOUND_EVENT_TYPES gate refuses these until then) — no behavior change until its side lands.
- `deactivatePharmacyStoreItems` is now transactional (previously a bare `PharmacyStore.update`); return shape preserved (`[affected]`).
- No schema change; no new endpoint; no UI.

### Testing evidence
- `npx tsc --noEmit` clean; eslint clean on touched files (pre-existing warnings only).
- Full Outbox + Inbox + Store suites: **34 suites / 425 tests, all pass** (real MySQL).
- Post-review fix round: same suites re-run after the changes below — all pass (`emit-for-rows.test.ts` fails identically with the changes stashed; pre-existing, unrelated).

### Review follow-up (code-review fixes, 2026-09-26)
1. **Duplicate-bin slot resolution corrected.** The no-id lookup in `emitStoreRowChangedForDrug` picked the newest bin regardless of status, so a newer INACTIVE bin masked an older ACTIVE sibling (answer: `row_exists: false` where an increment target existed). The fallback now scopes to `status: ACTIVE`, resolving the slot to the newest ACTIVE bin. `deactivatePharmacyStoreItems` emits slot-level (no row id), so deactivating one of two duplicate bins answers from the remaining ACTIVE sibling instead of wrongly declaring the whole slot gone. Regression tests added in both `store-row-changed.test.ts` and `store-row-resync.test.ts`.
2. **Deactivate re-emission gated.** Only rows that were ACTIVE pre-update emit; re-deactivating an already-INACTIVE row no longer produces a duplicate event.
3. **`sameAmount` normalises `undefined` to `null`** so a payload key with an undefined value no longer counts as a price change.

### Limitations / future considerations
- Duplicate-bin rows (12 pairs on production, C3c) resolve to the newest ACTIVE bin on resync; Accounting's own refuse-on-duplicates rule still guards receipts.
- `store.row.requested` is answered per (code, class); a cold-start full send (`store.rows.requested` list) could be added later if Accounting wants one, mirroring `catalogue.requested`.
