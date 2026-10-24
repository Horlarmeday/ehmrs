# #90 — Stop pre-applying the insurance co-pay: send gross drug totals and cash prices to Accounting

Branch: `90-gross-charges` (cut from `svsh_branch`). PR base: `svsh_branch`.
Governing contract: `ehmrs_accounting` ADR-0095 (payer tariff amount and fixed patient share),
ADR-0096 (`charge.split.updated` to the EMR), ADR-0097 (nets on return/void/reversal).
Accounting side: `ehmrs_accounting#627`, `#630`, `#631`, `#639`. Accounting merges first.

This plan is the implementation plan only. Nothing here is implemented yet.

---

## 1. What the EMR must change

The EMR currently pre-applies the insurance patient share before `charge.captured`, so Accounting
splits an already-reduced amount a second time. Remove every local reduction and every local
tariff selection from the prescribing paths; send the full/gross amount and the quantity the amount
was built from; then accept Accounting's resolved split back through the reverse inbox and display
it without computing any share locally.

The final reverse contract is **`charge.split.updated`**, not the earlier `charge.resolved`:

- Envelope: `aggregate = { type: "reverse_charge_line", id: <Accounting charge line id> }`,
  `sequence` per charge line starting at 1, overwrite semantics.
- `idempotency_key = charge-split:{chargeLineId}:{sequence}`.
- Body:

```jsonc
{
  "external_line_ref": { "type": "drug", "id": "123" },
  "encounter_id": "visit:456",
  "outcome": "co_pay",                 // capitated | ffs_claimable | co_pay | patient_liable | retainership
  "amount_kobo": "1000000",
  "patient_share_kobo": "150000",
  "patient_net_kobo": "150000",
  "insurer_amount_kobo": "850000",
  "insurer_net_kobo": "850000",
  "corporate_amount_kobo": "0",
  "corporate_net_kobo": "0"
}
```

All money fields are strings of integer kobo. On a capitated line the notional gross is sent with
every portion and net at `"0"`. A line with no split is a cash line (or, per the owner decision
below, an insured line still awaiting its split).

---

## 2. Decisions confirmed with the owner (2026-10-24)

| Question | Decision |
|---|---|
| Reverse event | `charge.split.updated` (the final ADR-0096/0097 contract) |
| Split storage | 8 columns on each of the five `Prescribed_*` line tables |
| Split money unit | Naira `DECIMAL(12,2)`, converted once from integer kobo in the applier |
| Drug/consumable price | `Inventory_Items.selling_price × quantity_to_dispense`; no `× 0.1` |
| Drug tariff code | Stop calling `getDrugPrice`/`DrugTariff` in every prescribing path |
| Inventory selection | Keep the client-supplied `inventory_id`; use the first FEFO layer's `selling_price` |
| Test/investigation cash price | The request body `price` (what the UI copies from the catalogue) |
| Service line total | Cash unit price × quantity, so every service line is a line total |
| Existing tariff code | Leave functions, tables and admin endpoints dormant; remove the calls, not the data |
| Insured type with no insurance row | Coerce the line to `Cash`; do not raise it as an insurance line |
| NHIS daily quota basis | Gross store price (sum of gross line totals) |
| Captured detection | Query `Outbox_Events` for `charge:{type}:{id}` |
| Immutability scope | Pharmacy update endpoints only (single and bulk variants) |
| Rejection style | 400 only when the value actually differs; unchanged values are accepted |
| Additional-item consolidation | Remove entirely; every extra quantity is a new line with its own event |
| Insured line with no split | Show “Awaiting split”, not a locally computed share |
| Split display | Total / Patient pays / Payer covers for every captured line |
| Summary display | Combined prescription-level Total / Patient pays / Payer covers |
| `charge.captured.quantity` | `quantity_to_dispense` for drug and additional_item; existing fallback for the rest |
| Feature flag | None; coordinate merge order |
| `original_total_price` | Keep, set equal to the gross line total |
| Backfill | None |
| Auto-item price | Current store `selling_price`, fall back to the default-config price when no layer exists |
| “Total” after a split | The resolved split amount (`split_amount`), so the three figures conserve |
| Malformed split | Dead-letter / FAILED; never guess a value |
| Split for a missing line | Dead-letter / FAILED (same as `payment.settled`) |

---

## 3. Verified current state (do not re-investigate from scratch)

### Pre-applied reductions — all nine sites

- `server/src/modules/Orders/Pharmacy/pharmacy-order.service.ts:129` — bulk drug create.
- `server/src/modules/Orders/Pharmacy/pharmacy-order.service.ts:242` — single drug create.
- `server/src/modules/Orders/Pharmacy/pharmacy-order.service.ts:314` — additional item create,
  including the misplaced `|| totalPrice` fallback.
- `server/src/modules/Orders/Pharmacy/pharmacy-order.repository.ts:812` — auto-added
  syringes/needles/gloves; also contains the broken `/gloves/i.test(item)` special case.
- `server/src/modules/Visit/visit.repository.ts:892,943` — dialysis defaults.
- `server/src/modules/Orders/Radiology/radiology-order.repository.ts:172,210` — HSG defaults.
- `server/src/modules/Admission/admission.repository.ts:606` — admission defaults; its
  `/gloves/i.test(item)` tests the object, not the name, so it is always false.

### Tariff selection at prescription

- `getDrugPrice` (`Pharmacy/pharmacy.repository.ts:411`) → `DrugTariff`.
- `getTestPrice` (`Laboratory/laboratory.repository.ts:224`) → `TestTariff`, `nhis_price`,
  `phis_price`, `retainership_price`.
- `getInvestigationPrice` (`Radiology/radiology.repository.ts:253`) → `InvestigationTariff`, the
  same three columns.
- `getServicePrice` (`AdminSettings/admin.repository.ts:463`) → `ServiceTariff`.
- Only the four order services call them in the prescribing flow. Leave the functions/tables
  dormant after the calls are removed.

### Event and inbox

- `charge.captured.quantity` is `Number(row.quantity_prescribed ?? row.quantity ?? 1)` at
  `Outbox/outbox-writer.ts:1039`.
- The outbox key is `charge:{type}:{id}` (`chargeIdempotencyKey`, `Outbox/event-builder.ts:258`).
- `emitChargeCapturedForRows` is the single emit helper used by all prescribe paths.
- The inbox applier already has per-aggregate overwrite sequencing (`InboxSequence`,
  `claimSequence`, `Inbox/applier.ts:130-181`) and a five-type model map.
- Unknown event types become `UNHANDLED`; malformed handled events throw `ApplyError` and are
  dead-lettered by `Inbox/processor.ts`.

### Consolidation

- `bulkCreateAdditionalItems` (`pharmacy-order.repository.ts:355-430`) calls
  `consolidateAdditionalItems` and updates an existing PENDING/PENDING row's quantity and
  `total_price` without emitting anything.
- `consolidateAdditionalItems` (`:658-753`) matches by drug/unit/type/patient/examiner/day and
  merges. It does not include `prescribed_drug_id`, so it also merges across different injections.
- `prescribeBulkDrugs` separately emits for the additional items returned by
  `bulkCreateAdditionalItems` (`:181-186`), which would double-emit once the helper emits itself.

### Daily quota

- Single path (`pharmacy-order.service.ts:211-233`) sums stored `total_price` (today 10%) plus the
  new drug's full price — two different bases.
- Bulk path (`:669-700`) sums `original_total_price` (today gross) plus the new gross.
- Both cover only `EXCLUDED_INSURANCE` (NHIS/FHSS), non-admitted patients, groups by
  `DrugGroup.PRIMARY`, and add every additional item for the day.

### Schema / tests

- The five line tables have no split columns.
- Tests run against `server/src/database/test-schema/schema.sql` **plus every migration whose
  filename sorts after `20230606`** (see `setup-test-db.js`). The new migration is applied on top
  of the snapshot; do NOT also add the columns to `schema.sql` or the setup fails with
  `Duplicate column name`.
- Order tests use `server/src/modules/Orders/__fixtures__/order-fixtures.ts`.
- `pharmacy-order.test.ts` is a skipped placeholder.
- The outbox tests build plain rows and assert payloads; the inbox tests seed rows with FK checks
  off and assert the real tables.

---

## 4. Data model

Add the same eight nullable columns to:

- `Prescribed_Drugs` (`PrescribedDrug`)
- `Additional_item_prescriptions` (`PrescribedAdditionalItem`)
- `Prescribed_Tests` (`PrescribedTest`)
- `Prescribed_Investigations` (`PrescribedInvestigation`)
- `Prescribed_Services` (`PrescribedService`)

| Column | Type | Meaning |
|---|---|---|
| `coverage_outcome` | `ENUM('capitated','ffs_claimable','co_pay','patient_liable','retainership') NULL` | Accounting's resolved outcome |
| `split_amount` | `DECIMAL(12,2) NULL` | Resolved gross (the split basis) |
| `patient_share` | `DECIMAL(12,2) NULL` | Split patient portion |
| `patient_net` | `DECIMAL(12,2) NULL` | Patient net after returns/reductions |
| `insurer_amount` | `DECIMAL(12,2) NULL` | Insurer portion as captured |
| `insurer_net` | `DECIMAL(12,2) NULL` | Insurer net after unwinds |
| `corporate_amount` | `DECIMAL(12,2) NULL` | Corporate (retainership) portion as captured |
| `corporate_net` | `DECIMAL(12,2) NULL` | Corporate net after unwinds |

Rules:

- All eight are `NULL` until a `charge.split.updated` arrives.
- Only the inbox applier writes them. No create path, update endpoint, or controller may set them.
- No `split_applied_at` / `split_sequence` column: `InboxSequence` already holds the
  high-water mark per `reverse_charge_line` aggregate.
- No backfill. Existing rows stay `NULL`.

Files:

- New migration, e.g. `server/src/database/migrations/20261024000000-add-charge-split-columns.js`
  (add in `up`, remove in `down`, `after` the existing money column for readability).
- Add the fields to the five Sequelize models (`server/src/database/models/prescribed*.ts`).
- Do not edit `server/src/database/test-schema/schema.sql`: `yarn test:db:setup` applies every
  migration after `20230606` on top of the snapshot, including this one.

---

## 5. Money handling

The split arrives as integer-kobo strings; the EMR stores naira `DECIMAL(12,2)`. Prescribing must
also stop doing float multiplication for gross totals.

### 5.1 New pure helper

Add `server/src/core/helpers/money.ts` (or extend the existing `Outbox/money.ts` only if the
dependency direction is acceptable — prefer a neutral helper under `core/helpers`):

- `nairaToCents(value: string | number, field: string): bigint` — accepts a decimal string or a
  finite number with at most two decimal places; rejects sub-kobo precision and non-numeric input.
- `multiplyNairaByQuantity(unitPrice: string | number, quantity: number, field?: string): string` —
  returns a 2dp decimal string, e.g. `'100.00' × 3 → '300.00'`. Reject non-positive/non-integer
  quantities where the caller requires a positive integer.
- `koboStringToNairaString(kobo: unknown, field: string): string` — validates
  `/^\d+$/`, uses `BigInt`, returns e.g. `'1000000' → '10000.00'`. Negative kobo is rejected by the
  split handler before conversion.
- `isZeroMoney(value: string): boolean` — for the additional-item fallback, because `'0.00'` is
  truthy in JS.
- `sameMoney(a: unknown, b: unknown): boolean` — compares a client number/string with a DECIMAL
  string at 2dp, for the post-capture guard.

Do not route DECIMAL values through `Number` for arithmetic. The models still annotate money as
`number`; treat those as lies and pass the runtime string through the helpers.

### 5.2 Why this matters now

`charge.captured` reads the just-created row and calls `normalisePrice`. Today a value computed as
`selling_price * qty` is a JS number; a float artefact (e.g. `12.35 * 3`) can throw the outbox
sub-kobo guard and roll back a clinical write. Returning a 2dp string from the helper removes that
class of failure and makes `original_total_price` and `total_price` exact.

---

## 6. Inbound `charge.split.updated`

### 6.1 Applier branch

In `server/src/modules/Inbox/applier.ts`, add a branch next to the other handled types, **before**
`statusFor`:

```ts
if (eventType === 'charge.split.updated') {
  return applyChargeSplit(aggregateId, sequence, body, transaction);
}
```

`applyChargeSplit`:

1. `claimSequence(aggregateId, sequence, transaction)` — reuse the existing high-water logic.
   The aggregate id is Accounting's charge line id (UUID), already `STRING(64)`-safe.
   A stale sequence returns `DISCARDED_STALE`; a stale split must never overwrite a newer one.
2. `readLineRef(body)` — reuse the existing five-type validation.
3. Look up the line by type/id with `MODEL_BY_TYPE`; a missing row throws `ApplyError` (dead-letter).
4. Validate `outcome` against the five-value vocabulary.
5. Validate and convert all seven money fields:
   - string, `/^\d+$/`, non-negative;
   - `patient_net ≤ patient_share`, `insurer_net ≤ insurer_amount`,
     `corporate_net ≤ corporate_amount` (the same contract Accounting enforces);
   - `patient_share + insurer_amount + corporate_amount = amount` except when outcome is
     `capitated`, where all three portions must be `0` and `amount` is the notional gross.
   Any violation throws `ApplyError` — the row dead-letters rather than storing a guessed figure.
6. Update only the eight split columns on the line, in the same transaction as the sequence claim.
7. Return `{ outcome: 'APPLIED' }`.

Cash lines receive no event. A line with `NULL` split columns is rendered as cash or “awaiting
split” by the UI (see §10).

### 6.2 Tests

- Applies a valid `co_pay` body and stores all eight fields exactly (`'150000' → '1500.00'`, etc.).
- Applies `capitated` with zero portions and a non-zero notional amount.
- Applies `retainership` and `patient_liable`.
- Discards an older sequence for the same charge line; applies a newer one.
- Does not advance the encounter high-water mark (a `payment.settled` for the same encounter still
  applies after a split).
- Dead-letters: unknown line type, missing line id, unknown outcome, missing field, non-numeric
  kobo, negative kobo, conservation violation, net above share.
- End-to-end through `verifyAndWrite` + `processOne` with a signed envelope.
- A cash line with no split remains all-`NULL`.

---

## 7. Outbound `charge.captured`

Change the quantity at `Outbox/outbox-writer.ts:1039`:

```ts
quantity: Number(row.quantity_to_dispense ?? row.quantity_prescribed ?? row.quantity ?? 1),
```

Effect:

- `drug` / `additional_item` now send `quantity_to_dispense`.
- `test` / `investigation` have neither field and send `1`.
- `service` keeps its existing `quantity` column when present.

Do not change the amount field (`total_price` for drug/additional_item, `price` for the other
three). Update `emit-for-rows.test.ts` and any contract tests that assert the old quantity; add a
test that a row whose `quantity_prescribed` and `quantity_to_dispense` differ emits the latter.

---

## 8. Prescribing: send gross amounts / cash prices

### 8.1 Drugs (single, bulk, additional items)

`pharmacy-order.service.ts`:

- Get the unit price from the first inventory layer's `selling_price`; do not call `getDrugPrice`.
- `grossLineTotal = multiplyNairaByQuantity(inventoryItem.selling_price, quantity_to_dispense)`.
- `total_price: grossLineTotal` — unconditionally, for every `drug_type`.
- `original_total_price: grossLineTotal` — keep the column, now equal to the line total.
- Additional items: `clientLineTotal = multiplyNairaByQuantity(price, quantity_to_dispense)`;
  `total_price: isZeroMoney(grossLineTotal) ? clientLineTotal : grossLineTotal`. This preserves the
  intended fallback for a missing/zero inventory price, for both insured and cash lines.
- Remove the now-unused `getDrugPrice` import.

The `quantity_prescribed`/`quantity_to_dispense` split in the request is unchanged. The amount is
always built from `quantity_to_dispense`.

### 8.2 Auto-added consumables (injections)

`pharmacy-order.repository.ts`, `bulkSyringeNeedlePrescriptions`:

- Make the `selectSyringe` lookup async (or prefetch a price map once) and resolve the current
  `Inventory_Items` layer for `(prescription.inventory_id, syringe.drug.drug_id)`.
- `total_price = multiplyNairaByQuantity(layer.selling_price, quantity)`.
- Fall back to `syringe.drug.price` **only** when no layer/price exists.
- Remove `isNHIS` and the gloves condition. The glove line is still auto-added; its co-pay becomes
  an Accounting per-item rule.
- Keep `drug_type: prescription.drug_type` on each generated line.
- `prescribeBulkDrugs` must stop re-emitting for items returned by `bulkCreateAdditionalItems` once
  the helper emits itself (§9).

### 8.3 Dialysis defaults

`visit.repository.ts`:

- Replace `getDrugPrice(...) * qty` with `multiplyNairaByQuantity(inventoryItem.selling_price, qty)`
  for drugs and consumables.
- Remove the `× 0.1` and the `isNHIS` variable.
- Remove the `getDrugPrice` import if it becomes unused.

### 8.4 Admission defaults

`admission.repository.ts`:

- Prefetch a `drug_id → gross line total` map for the selected inventory before `createItems` runs,
  using the current inventory layer's `selling_price` and the item quantity.
- `total_price` = that map's value; fall back to `item.drug.price × quantity` only when no layer
  exists.
- Remove `isNHIS` and the broken `/gloves/i.test(item)` condition entirely.
- Wrap the `bulkCreateAdditionalItems` calls in one transaction (or rely on the helper opening its
  own, §9) so lines and `charge.captured` commit atomically.

### 8.5 Radiology HSG defaults

`Orders/Radiology/radiology-order.repository.ts`:

- Replace both `getDrugPrice(...) * qty` calls with
  `multiplyNairaByQuantity(inventoryItem.selling_price, qty)`.
- Remove both `× 0.1` conditions and the `getDrugPrice` import.

### 8.6 Tests, investigations and services

- `lab-order.service.ts`: replace
  `price: (await getTestPrice(patient, test)) || test.price` with `price: test.price`.
- `radiology-order.service.ts`: replace
  `price: (await getInvestigationPrice(patient, investigation)) || investigation.price` with
  `price: investigation.price`.
- `service-order.service.ts`: replace the `getServicePrice(...) || +price * (+quantity || 1)` with
  `multiplyNairaByQuantity(service.price, service.quantity || 1)`, so a service line is always
  `unit × quantity`.
- Remove the now-unused imports and any unused `patient` lookups in those methods.
- Leave `getTestPrice`, `getInvestigationPrice`, `getServicePrice`, `getDrugPrice`, the tariff
  models and the admin tariff endpoints in place, dormant.

### 8.7 NHIS-typed lines with no insurance row

At every create path after the default insurance lookup:

```ts
const effectiveType = insurance?.id ? requestedType : Cash;
```

Apply it to `drug_type`, `test_type`, `investigation_type`, `service_type`. When coerced:

- do not set `nhis_status: PENDING`;
- do not set `drug_group: PRIMARY` / `test_group` / `investigation_group` / service group from the
  insurance path;
- still store `patient_insurance_id: null` (there is no insurance row).

This covers the 315 local rows described in the issue going forward. No backfill.

### 8.8 Daily quota

Unify both implementations on the gross basis:

- Single path: sum stored `total_price` (now gross) for today + the new gross line total.
- Bulk path: sum stored `total_price` (now gross) + the new gross line total.
- Keep the existing cohort and grouping rules: only `EXCLUDED_INSURANCE` (NHIS/FHSS), only
  non-admitted patients, only `DrugGroup.PRIMARY` drug lines, plus all additional items for the day.
- Keep the comparison against `SystemSettings.nhis_daily_quota_amount`.
- `original_total_price` is no longer the quota basis, but it remains written as the same gross.

Document the basis in a short comment above `checkNHISDailyQuotaLimit` and the single-path block.

---

## 9. No silent changes after capture

### 9.1 Remove additional-item consolidation

- Delete `consolidateAdditionalItems`, `querySimilarAdditionalItems`, `getSimilarityKey` and the
  merge branch in `bulkCreateAdditionalItems`.
- `bulkCreateAdditionalItems` becomes: open a transaction if one was not supplied, `bulkCreate` all
  items, call `emitChargeCapturedForRows('additional_item', created, date, t)` once, return the
  created rows.
- Remove the second emit in `prescribeBulkDrugs`.
- Result: prescribing the same injection twice creates two sets of consumable rows, each with its
  own `charge.captured`. Different injections no longer merge their syringes/needles either.
- No dedupe by `prescribed_drug_id` is kept; each line is a separate billable fact.

### 9.2 Captured-line guard

Add a helper next to the outbox writer:

```ts
export async function hasEmittedChargeCaptured(
  type: PrescribedLineType,
  id: number,
  transaction?: Transaction
): Promise<boolean>
```

It checks `OutboxEvent` by `idempotency_key = chargeIdempotencyKey(type, id)`. The outbox row is the
authoritative record of emission; there is no new `captured_at` column.

In `pharmacy-order.repository.ts`:

- `updatePrescribedDrug`: open a transaction, lock/fetch the existing row, and if a captured event
  exists:
  - compare `total_price`, `quantity_prescribed`, `quantity_to_dispense`;
  - if any differs, throw `BadException('Error', 400, CAPTURED_LINE_CHANGE_NOT_ALLOWED)`;
  - if they are unchanged, accept and apply the other fields.
- `updateAdditionalItem`: the same for `total_price`, `quantity_prescribed`,
  `quantity_to_dispense`.
- The bulk update functions route through these per-row functions, so they inherit the guard.
- Strip the eight split columns from any update body before applying it — the inbox is the
  only writer of those columns.
- Add the message(s) to `orders/Pharmacy/messages/response-messages.ts`, e.g.:
  - `CAPTURED_LINE_CHANGE_NOT_ALLOWED = 'This line has already been billed. Price and quantity can no longer be changed; create a new line instead.'`
  - `CAPTURED_LINE_INTERNAL_FIELD = 'Charge split fields are managed by the accounting integration.'`
  (if internal fields are rejected rather than stripped; recommend stripping for updates and
  rejecting on create validation).

Also ensure the create paths do not persist client-supplied split fields:

- `prescribeAdditionalItems` spreads `...item` into the bulk body;
- `orderBulkTest`, `orderBulkInvestigationService`, `orderBulkService` spread the request row.
- Add a `stripChargeSplitFields` helper or extend the Joi validations to forbid the split-column keys. Prefer stripping at the service boundary and keeping the Joi schemas
  explicit.

### 9.3 What remains allowed

The NHIS tabs and the account screen continue to update `nhis_status`, `payment_status`,
`billing_status`, `drug_group`, `auth_code`, processed-by/date fields, `dosage_completed` and
similar. Only price and quantity are frozen after capture.

Delete/void behaviour is unchanged: the existing `charge.reversal.requested` path remains the way
to unwind a captured line.

---

## 10. Client display

### 10.1 Shared presentation logic

Add one shared Vue 2 helper/mixin, e.g. `client/src/common/chargeSplit.js`, used by every screen
below. It must never compute a percentage or divide by `0.1`.

Functions:

- `hasSplit(line)` — `line.coverage_outcome != null`.
- `isCashLine(line)` — no `patient_insurance_id` and the line type (`drug_type`, `test_type`,
  `investigation_type`, `service_type`) is `Cash`.
- `displayTotal(line)` — split amount when present; otherwise `total_price` / `price`.
- `displayPatient(line)`:
  - split → `patient_net`; show `patient_share` beside it when different;
  - cash line → `total_price` / `price`;
  - otherwise → `null` (“Awaiting split”).
- `displayPayer(line)`:
  - split → `insurer_net` and/or `corporate_net`, labelled “HMO covers” / “Company covers”, with
    the captured `insurer_amount` / `corporate_amount` beside them when different;
  - capitated → “Covered by capitation”;
  - cash line → ₦0 / “—”.
- `splitState(line)` — `'split' | 'cash' | 'awaiting'`.
- `formatCurrency` — reuse the existing `toLocaleString` approach.

### 10.2 Screens that print line totals

Update each of these to render Total / Patient pays / Payer covers from the helper (three figures
when a split exists, the pending/cash state otherwise):

- `client/src/view/pages/account/components/drugs/PrescribedDrugsTable.vue`
- `client/src/view/pages/account/components/drugs/AdditionalItemsTable.vue`
- `client/src/view/pages/nhis/page/tabs/Medications.vue`
- `client/src/view/pages/nhis/page/tabs/Items.vue`
- `client/src/view/pages/pharmacy/PrescriptionDetail.vue`
- `client/src/view/pages/pharmacy/PrescriptionDetailUpdate.vue`
- `client/src/view/pages/pharmacy/drugDispense/DrugInfoBanner.vue`
- `client/src/view/pages/pharmacy/drugDispense/AdditionalItemDispenseSection.vue`
- `client/src/view/pages/pharmacy/components/prescriptionUpdate/DrugDispenseCardUpdate.vue`
- `client/src/view/pages/pharmacy/components/prescriptionUpdate/AdditionalItemCardUpdate.vue`
- `client/src/view/pages/pharmacy/components/prescriptionUpdate/PricingSummaryCardUpdate.vue`
- `client/src/view/pages/patient/page/components/tables/ItemsTable.vue`
- `client/src/view/components/table/MedicationsTable.vue`
- `client/src/view/components/table/AdditionalItemsTable.vue`
- `client/src/view/components/table/TempMedicationTable.vue`
- `client/src/view/components/modal/DrugDetailsModal.vue`
- `client/src/view/components/popover/DrugPopover.vue`

`store/laboratory/StoreItems.vue` and the consultation draft sidebars also use `total_price`, but
they are not prescribed-line displays; leave them alone unless a review finds a direct dependency
on the new columns.

### 10.3 Remove local share calculations

- `PrescriptionDetail.vue:119-133`: delete `nhisMappedTotalPrice`, `nhis90PercentDrugsPrice`,
  `nhis10PercentDrugsPrice` and the “NHIS 10% / NHIS 90%” header. Replace with the three summary
  figures.
- `PrescriptionDetailUpdate.vue:348-366` and the two “90% covered + 10% cash” strings: delete the
  share math and describe the split state from the data instead.
- `PricingSummaryCardUpdate.vue:18,27,80`: remove the hardcoded “NHIS (90%)” / “CASH (10%)”
  breakdown and render Total / Patient pays / Payer covers.
- Summary totals: sum `displayTotal`, sum `displayPatient` (cash lines count as their total; split
  lines count as net; awaiting lines are excluded from the patient total and counted in an
  “Awaiting split” note), and sum `displayPayer`. Show the three combined figures wherever a
  prescription-level total is shown.

### 10.4 Unit price

- `DrugDispenseCardUpdate.vue:396`: divide `displayTotal(prescription)` by
  `prescription.quantity_to_dispense` (not `quantity_prescribed`).
- `AdditionalItemCardUpdate.vue:347`: already divides by `quantity_to_dispense`; switch the
  numerator to `displayTotal`.
- Account tables already divide by `quantity_to_dispense`; switch the numerator to `displayTotal`.

### 10.5 Edge cases

- **Cash line, no split:** Total = stored price, Patient pays = stored price, Payer covers = ₦0.
- **Insured line, no split yet:** Total = stored price, patient/payer = “Awaiting split”; never
  compute 90/10.
- **Capitated:** Total = notional split amount, Patient pays = ₦0, Payer covers = “Covered by
  capitation”.
- **Net differs from captured share:** show the net as the primary figure and the captured share
  beside it, per ADR-0096/0097.
- **Both insurer and corporate non-zero:** show both labelled lines.
- **Split amount differs from EMR `total_price`:** Total is the split amount, so the three columns
  conserve. Do not show the EMR price unless a design review asks for it.

---

## 11. Test plan

### 11.1 Unit / helper

- `multiplyNairaByQuantity`: exact 2dp results, zero, large values, sub-kobo rejection,
  non-integer quantity rejection where required.
- `koboStringToNairaString`: exact conversion, zero, large values, malformed/negative rejection.
- `sameMoney`: number vs DECIMAL string, unchanged vs changed.
- `charge.split.updated` body validation: all five outcomes, conservation, capitated exception,
  net-above-share, negative/malformed money.

### 11.2 Outbox

- `charge.captured.quantity` = `quantity_to_dispense` for drug and additional_item.
- Existing tests updated for the new quantity; test/investigation/service still behave.
- NHIS drug line emits `amount_kobo = selling_price × quantity_to_dispense` in kobo, with no
  reduction.

### 11.3 Prescribing integration (real MySQL)

Extend `order-fixtures.ts` with minimal Insurance/HMO/PatientInsurance, Inventory, InventoryItem,
Drug, and Default seeds.

- Pharmacy single and bulk, NHIS + FHIS/PHIS/Retainership: `total_price` equals
  `selling_price × quantity_to_dispense`; `original_total_price` equals the same.
- Additional item with a zero inventory price falls back to client `price × quantity`.
- Injection prescribed twice in one prescription → two additional-item rows (and two events) with
  distinct ids and `charge.captured` keys; no merge.
- Auto syringe/needle uses the current inventory `selling_price`; falls back to the default price
  when no layer exists.
- Admission defaults and dialysis defaults produce gross totals.
- Lab test with an insurance and a seeded tariff + `nhis_price`: stored `price` is the request's
  cash price, not the tariff.
- Investigation with the same setup: same.
- Service with a tariff and quantity 3: stored `price` = cash unit × 3, not the tariff unit price.
- NHIS-typed line with no `patient_insurance_id`: stored as `Cash`, no `nhis_status`.
- Quota: two prescriptions whose gross totals exceed the setting are rejected; the same amounts as
  patient shares would not be. Prove both single and bulk paths use the same basis.
- No `× 0.1` remains: a source-level grep or a dedicated regression test over the known files.

### 11.4 Immutability

- Captured drug update with a changed `total_price`, `quantity_prescribed` or
  `quantity_to_dispense` → 400 with the message; the row is unchanged.
- Captured drug update with `total_price` present but unchanged, or with `nhis_status`,
  `payment_status`, `billing_status`, `drug_group`, `auth_code`, `dosage_completed` → accepted.
- Captured additional item: same matrix.
- Bulk update routes inherit the guard.
- Attempting to write any split column through an update is stripped/rejected.
- A line with no outbox row (outbox disabled or legacy) remains updatable.

### 11.5 Inbox

As §6.2, including the `DISCARDED_STALE` and dead-letter paths through `processOne`, and the
`InboxSequence` separation between `reverse_charge_line` and `reverse_encounter`.

### 11.6 Client

- `npm run lint` and `npm run build`.
- Manually (or with the existing tooling) verify: cash line, awaiting line, co-pay line with
  share ≠ net, insurer-net ≠ insurer-amount, corporate line, capitated line, and a summary with a
  mix of all states.

---

## 12. Migration / test-database commands

```bash
cd server
yarn migration                     # applies the new migration to the live/dev DB
yarn test:db:setup                 # recreates the test DB from schema.sql + post-snapshot migrations
npx tsc --noEmit
yarn test
```

`test:db:setup` applies `20261024000000-add-charge-split-columns.js` on top of the snapshot, so the
test DB gets the split columns without a snapshot edit.

---

## 13. Implementation order

1. **Schema and models** — migration and five models (no `schema.sql` edit).
2. **Money helpers** — exact naira/kobo arithmetic and the split parser.
3. **Inbox split handler** — applier branch, validation, tests.
4. **Outbox quantity** — one-line change and test updates.
5. **Prescribing prices** — pharmacy single/bulk/additional, injections, dialysis, admission, HSG.
6. **Tests/investigations/services** — cash price and service line total.
7. **Coercion and quota** — coerce to Cash, unify the quota basis.
8. **Consolidation removal and immutability** — new-line semantics, captured guard, internal-field
   stripping.
9. **Client display** — shared helper and all affected screens.
10. **Regression** — `npx tsc --noEmit`, eslint, full `yarn test`, client lint/build, source grep
    for `0.1` in prescribing paths.
11. **Commit and PR** — `feat(#90): ...`, push, `gh pr create --base svsh_branch`.

Suggested commit sequence (one coherent step per commit):

1. `feat(#90): add charge split columns and models`
2. `feat(#90): apply charge.split.updated in the inbox`
3. `feat(#90): send quantity_to_dispense on charge.captured`
4. `feat(#90): send gross drug totals and cash prices`
5. `feat(#90): freeze captured pharmacy lines and remove consolidation`
6. `feat(#90): display resolved charge splits`
7. `test(#90): cover gross pricing and charge split application`

---

## 14. Risks / things that will bite

1. **Merge order is real.** The EMR starts storing gross amounts immediately on deploy, even with
   the outbox disabled, because the pricing code is not flag-gated. Accounting's rules and
   `charge.split.updated` must be deployed first. If that slips, the EMR screens show gross patient
   totals until splits arrive (insured lines show “Awaiting split”).
2. **No backfill.** Existing local rows still contain 10% totals. They are pre-production; do not
   mix them into quota or display tests.
3. **Float precision.** Keep all money math in the helper; do not reintroduce `* 0.1`,
   `selling_price * qty`, or `Number(decimal)` arithmetic.
4. **Split columns are inbox-owned.** The create/update paths currently spread request objects; a
   missing strip is a write-through vulnerability.
5. **`original_total_price` is now redundant.** It is kept and set equal to the gross line total;
   do not use it as a second source of truth in the quota.
6. **Consolidation removal changes line counts.** Two identical injections now produce more
   additional-item rows. That is the intended billing behaviour, but any report that assumed one
   merged line per drug/day needs a review.
7. **Default-config prices are second-class.** Auto-added items prefer the current inventory layer;
   the default price is only a fallback. If a default item has no current store layer, the
   fallback keeps the line billable.
8. **Deleted captured line.** A split that arrives for a line deleted after capture dead-letters;
   the reversal should already have been requested. This is visible, not silent.
9. **The UI must not derive a share.** Any remaining `/ 0.1`, `* 0.9`, `NHIS 10%`, `90%` string in a
   prescribed-line screen is a defect.
10. **`charge.split.updated` is not an outbound event.** Do not add it to
    `PERMITTED_EVENT_TYPES`; it belongs to the inbox only.

---

## 15. Acceptance-criteria mapping

| Acceptance criterion | Implemented by |
|---|---|
| No `× 0.1` in any prescribing path | §8.1–8.5; source grep in §13 |
| NHIS drug line total = `selling_price × quantity_to_dispense` | §8.1, tests §11.3 |
| Insured test/investigation/service store and emit cash `price` | §8.6, tests §11.3 |
| `charge.captured.quantity` = `quantity_to_dispense` | §7 |
| Two injections → two consumable lines, each with its own event | §9.1, test §11.3 |
| Captured update rejects price/quantity changes, accepts other fields | §9.2, tests §11.4 |
| Daily quota on one documented basis | §8.8 |
| Pharmacy screens show correct unit/share figures from gross totals | §10 |

---

## 16. Open items

None. Every decision needed for implementation has been answered by the owner (2026-10-24).
Remaining choices are implementation-level and noted inline (file names, exact message wording,
helper placement).

---

## 17. Implementation status (2026-10-24)

Implemented on `90-gross-charges`:

- **Schema**: migration `20261024000000-add-charge-split-columns.js`, eight columns on each of the
  five `Prescribed_*` models. `schema.sql` is intentionally untouched — `test:db:setup` applies
  post-snapshot migrations, so editing both would produce `Duplicate column name`.
- **Helper**: `server/src/core/helpers/money.ts` — exact cent arithmetic, kobo→naira conversion,
  `sameMoney`, `isPositiveMoney`.
- **Inbox**: `charge.split.updated` applier branch with per-charge-line sequencing, conservation
  checks, capitated handling, net-above-share checks, kobo conversion, and dead-letter-on-malformed.
- **Outbox**: `charge.captured.quantity` now prefers `quantity_to_dispense`.
- **Pricing**: all nine `× 0.1` sites removed; drugs/consumables use the current store
  `selling_price`; tests/investigations use the request cash price; services use `unit × quantity`;
  auto-added injection/admission consumables prefer the current inventory layer with the
  configured price as fallback.
- **Coercion/quota**: insured types with no insurance row are written as Cash; both quota paths use
  gross `total_price`.
- **Immutability**: consolidation removed; `updatePrescribedDrug` / `updateAdditionalItem` lock the
  row, reject a changed price or quantity when `charge:{type}:{id}` exists, accept other fields, and
  strip the eight inbox-owned split columns.
- **Client**: `client/src/common/chargeSplit.js` + `ChargeSplitFigures.vue`, used by the pharmacy,
  account, NHIS, patient and shared-line screens. Local `0.1`/`0.9` share math and the hardcoded
  90/10 labels are gone.
- **Tests added**: money helper, split applier, outbox quantity, pharmacy gross pricing (including
  two injections), captured-line immutability, lab/investigation/service cash pricing.
  `yarn test` on those suites: 14 suites / 96 tests pass (plus the new pricing suite coverage).
- **Pre-existing failures not caused by this work**: `Outbox/emit-for-rows.test.ts` fails on
  `Investigation.create` catalogue-code fixtures, and `Orders/Laboratory/lab-order.test.ts` counts a
  `patient.demographics.changed` row as a charge event. Both reproduce without these changes.

Deviations from the original plan text:

- `schema.sql` is not edited (see above).
- The additional-item fallback also tolerates a missing/layerless store row, not just a zero price.
- The client summary uses a shared mixin/component instead of duplicating the three figures per
  screen.
