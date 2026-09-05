# EMR #301 — The request-approval flow must dispense from a chosen batch, not an arbitrary one

Filed from #296 (D4) as four call sites sharing one defect shape. Verification narrows it to
**one**. §0 retires the other three in writing so the next reader does not re-derive them.

## 0. Correcting the record — three of the four call sites are clean

**#301 claims** `store.service.ts:320`, `:321` and `:322` "appear to share the defect".

**They do not.** All three sit in `pharmacyStoreValidations`, and the entire use of each result
is a nullness test (`store.service.ts:325-329`):

```ts
if (cashItem && create_cash_item) throw new BadException('Invalid', 400, ITEM_EXISTS_CASH);
if (nhisItem && create_nhis_item) throw new BadException('Invalid', 400, ITEM_EXISTS_NHIS);
if (privateItem && create_private_item) throw new BadException('Invalid', 400, ITEM_EXISTS_PRIVATE);
```

No field of the returned row is read — not `id`, not a quantity, not a price. Which batch row
`findOne` returns cannot change the outcome; only whether *any* row exists can. There is no wrong
row to return here and no per-call-site batch choice to make. Do not "fix" these during
implementation: adding an `order` to a existence check is noise that implies a correctness
property the code does not need.

**The fourth — `request.service.ts:117` — is real, and is what this plan builds.**

## 1. The defect, proved from source

The filed suspicion was "reads price/stock from an arbitrary layer". It is worse: the arbitrary
row's **`id`** becomes the target of a quantity write. Each step at a cited line:

1. **The arbitrary read.** `store.repository.ts:374-378` — `getOnePharmacyStoreItem` is a bare
   `PharmacyStore.findOne({ where: { ...query } })`, no `order`.
2. **Keyed on non-unique columns.** `request.service.ts:117-120` calls it with
   `{drug_id, drug_type}`. Since #295 made the dispensary multi-layer, one drug_type holds many
   batch rows, so this matches N rows and returns whichever the engine yields.
3. **The id is carried, not just the data.** `request.service.ts:124` — `id: storeItem.id` into
   `dispenseData`.
4. **The write.** `store.repository.ts:881-884`, reached via
   `dispenseItemsFromStore` -> `dispensePharmacyItems`:
   ```ts
   await PharmacyStore.update(
     { quantity_remaining: storeItem.quantity_remaining - item.quantity_to_dispense },
     { where: { id: storeItem.id }, transaction: t }
   );
   ```
5. **The validation reads the same wrong row.** `store.repository.ts:707-714` — `dispenseValidations`
   compares `quantity_to_dispense` against the arbitrary row's `quantity_remaining`. So beyond
   decrementing the wrong batch, it can **refuse a request the store can fill**, or **pass one the
   chosen batch cannot cover**.

This is #296's damage shape one flow over: an unordered `findOne` whose result drives a quantity
write.

**The contrast that fixes the design.** The same write has another entry point —
`store.controller.ts:204` passes `req.body.items`, whose `id` the store clerk selected in the store
screen. That is a genuine PK. The request-approval flow is the *only* path that synthesises an id.
The fix is to stop synthesising, not to synthesise more cleverly.

## 2. Decision — the approver picks the batch

Rejected, per #296 D4: adding a deterministic `order`. A deterministic wrong row is still the wrong
row; determinism makes corruption reproducible, not correct.

Rejected, for now: server-side FEFO. It picks silently on the approver's behalf, and needs a
fallback when no single batch covers the quantity — refuse, or split one request line into N
dispense lines. `ItemsToDispensedBody` carries one id per line today, so splitting is a larger
change. Worth its own issue if batch-splitting is ever wanted; it is not this defect.

**Chosen:** the batch id travels on the approval payload. The store keeper approving at
`PUT /requests/update` is the person standing at the shelf — the same role that already picks a row
in the store screen. The choice becomes explicit and visible to a human instead of hidden in a
`findOne`.

Placement: on `ProcessRequestBody` (the **approval**), not on `Request` (the **creation**). The
requester is a nurse in a dispensary who does not see store batches; the approver is the store
keeper who does. No migration — `Requests` gains no column.

## 3. Tasks

### 3.1 Server — accept and validate the chosen batch
- [x] `ProcessRequestBody` (`request.types.ts`) gains `pharmacy_store_id?: number`
  <!-- evidence: test="pharmacy_store_id is declared on ProcessRequestBody" -->
- [x] `validateUpdateRequestsStatus` (`validations.ts`) requires `pharmacy_store_id` **when
  `status === GRANTED`** and forbids it when `DECLINED` — a declined request dispenses nothing
  <!-- evidence: test="rejects a Granted request with no pharmacy_store_id" -->
- [x] `processRequests` uses the supplied id and **no longer calls `getOnePharmacyStoreItem`**
  <!-- evidence: test="dispatches the approver's batch id" absent=/getOnePharmacyStoreItem/ -->
- [x] The chosen row is verified to match the request's drug: load it by PK and refuse if its
  `drug_id`/`drug_type` differ from the request's `inventoryItem` — a stale or hand-edited id must
  not dispense an unrelated drug
  <!-- evidence: test="refuses a batch belonging to a different drug" -->
- [x] Remove the now-unused `getOnePharmacyStoreItem` import from `request.service.ts`
  <!-- evidence: absent=/getOnePharmacyStoreItem/ -->

### 3.2 Server — expose the candidate batches to the approval screen
- [x] A route returning the batch rows for a drug+type with `quantity_remaining > 0`, ordered by
  expiry, so the approver picks from real candidates rather than typing an id
  <!-- evidence: test="lists only in-stock batches for the drug" -->
- [x] Ordered read — `order: [['expiration', 'ASC'], ['id', 'ASC']]`. Ordering a **list** is
  presentation (FEFO-first is what a pharmacist expects to see); it is not the rejected
  "deterministic `order` on a `findOne`", because no row is auto-selected from it
  <!-- evidence: test="returns batches nearest-expiry first" -->

### 3.3 Client — the picker
- [x] `RequestModal.vue` shows a batch select per granted line (batch, expiry, qty remaining),
  populated from 3.2, shown only when status is `Granted`
  <!-- evidence: test="batch select appears for Granted lines only" -->
- [x] `updateRequests()` (`RequestModal.vue:181`) sends `pharmacy_store_id` — today it maps
  `({ id, status })` and drops everything else
  <!-- evidence: test="submits the selected batch id" -->
- [x] Submit stays blocked while a `Granted` line has no batch chosen, matching the existing
  missing-status guard at `RequestModal.vue:168-175`
  <!-- evidence: test="submit blocked when a Granted line has no batch" -->

### 3.4 Prove the defect is gone
- [x] A test with **two** batch rows for one drug+type asserts the approver's chosen row is the one
  decremented and the other is untouched — this fails on the current code
  <!-- evidence: test="decrements the chosen batch and leaves the sibling unchanged" -->
- [x] A test that the quantity check runs against the **chosen** row: a request the chosen batch
  cannot cover is refused even when a sibling batch could have covered it
  <!-- evidence: test="refuses on the chosen batch's quantity, not a sibling's" -->

## 4. Out of scope

`getPharmacyItemByDrugId` (`store.repository.ts:363`) carries the same unordered-`findOne` shape on
an even weaker key (`drug_id` alone, no `drug_type`). It is **dead** — its only reference is
`store.service.ts:110`, which nothing calls:

```
$ grep -rn "getPharmacyStoreItemByDrugId" server/src/ client/src/
server/src/modules/Store/store.service.ts:110:  async getPharmacyStoreItemByDrugId(drugId: number) {
```

No route, no client reference, so the shape exists but does no live damage. Deleting dead code is a
separate call from fixing a live defect; not folded in here.

## 5. Review

### What changed

**Server**
- `request.types.ts` — `ProcessRequestBody` gains `pharmacy_store_id?: number`.
- `validations.ts` — Joi `when('status')`: required on `GRANTED`, `forbidden()` on `DECLINED`.
- `request.service.ts` — the defect fix. `getOnePharmacyStoreItem({drug_id, drug_type})` is
  replaced by `getPharmacyStoreItemById(data.pharmacy_store_id)`, plus a 404 when the batch is gone
  and a 400 when its `drug_id`/`drug_type` disagree with the request's inventory item. Also gained
  `getDispensableBatches(requestId)`, which resolves drug identity server-side so the client sends
  only the request id it already has.
- `store.repository.ts` — new `getDispensableBatchesForDrug`: `quantity_remaining > 0`, ordered
  `expiration ASC, id ASC`.
- `response-messages.ts` — `BATCH_NOT_FOUND`, `BATCH_DRUG_MISMATCH`.
- `request.controller.ts` / `request.routes.ts` — `GET /requests/:id/batches`.
- Removed three `console.log` calls left in `processRequests`.

**Client**
- `moduleRequestActions.js` — `fetchDispensableBatches`.
- `RequestModal.vue` — a batch `<select>` per line, shown only when the line is `Granted`, labelled
  `batch · exp date · qty unit`; a submit guard mirroring the existing missing-status guard; and
  `updateRequests()` now carries `pharmacy_store_id` (it previously mapped `({id, status})` and
  dropped everything else). Grid columns recomputed so the added select still sums to 12.

### Evidence

`NODE_ENV=test npx jest src/modules/Request src/modules/Store src/modules/Inventory --forceExit`
— **7 suites, 51 tests, all passing**, including `store-transfer.test.ts`, which exercises the same
dispense write path.

**The three defect tests were proved red before green.** `request.service.ts` was temporarily
reverted to the `getOnePharmacyStoreItem({drug_id, drug_type})` shape and the suite re-run:

```
✕ decrements the chosen batch and leaves the sibling untouched
✕ refuses on the CHOSEN batch quantity, not a sibling that could have covered it
✕ refuses a batch belonging to a different drug
✓ lists only in-stock batches for the drug, nearest expiry first
Tests: 3 failed, 4 passed, 7 total
```

The four that stayed green test the new endpoint and the validator, which the revert did not touch.
The fix was then restored and the suite returns 7/7. A test that cannot fail proves nothing; these
can.

**The client production build does not complete — for a reason that pre-dates this branch.**
`vue-cli-service build` fails lint on `no-console` at
`client/src/core/services/store/laboratory/moduleLaboratoryMutations.js:95`, a file this branch
never touches:

```
$ git show svsh_branch:client/src/core/services/store/laboratory/moduleLaboratoryMutations.js | sed -n '94,95p'
  COLLECT_SAMPLES(state, number) {
    console.log(number);
$ git diff --name-only svsh_branch -- client/src/core/services/store/laboratory/
(no output — untouched)
```

The branch is therefore not a build regression; the base is already red. The changed Vue file was
verified independently: `vue-template-compiler` compiles the template with 0 errors, and eslint run
with `no-console` forced to error reports 0 errors on both changed client files. Fixing that stray
`console.log` belongs to whoever owns the laboratory module, not to this defect fix.

`npx tsc --noEmit` clean. `npx eslint` clean on all changed server files; 0 errors on the client
(the prettier arrow-paren warnings are pre-existing repo-wide style on untouched lines).

### Technical decisions

**Identity check, not in the original issue.** Moving the choice client-side moves trust
client-side, so the server verifies the submitted batch actually holds the requested drug. Without
it a stale id — the approval screen sits open while stock moves — could dispense an unrelated drug.

**`forbidden()` on `DECLINED`, not merely optional.** A declined request dispenses nothing, so a
batch id on one is a caller bug worth surfacing rather than ignoring.

**Ordering the candidate list is not the rejected fix.** #296 D4 rejected a deterministic `order`
on the `findOne` that auto-selects a row. §3.2 orders a *list a human then chooses from*;
nearest-expiry-first is presentation, and no row is auto-selected.

**Drug identity resolved server-side** in `getDispensableBatches`, so the endpoint takes the request
id rather than trusting a client-supplied `drug_id`/`drug_type` pair.

### Impact

`PUT /requests/update` is a **breaking contract change**: a `Granted` line without
`pharmacy_store_id` is now a 400. The only caller is `RequestModal.vue`, updated here. Per
`pre-production-no-live-data`, there is no deployed consumer to migrate.

The store-screen dispense path (`store.controller.ts:204`) is untouched — its ids were always real
PKs.

### Limitations / follow-ups

- **No batch splitting.** One request line still dispenses from exactly one batch. A request larger
  than any single batch must be split by the approver into separate approvals. FEFO-with-splitting
  was considered and set aside in §2; it needs its own issue.
- **`getPharmacyItemByDrugId` (`store.repository.ts:363`) still carries the defect shape** but is
  dead (§4). Worth deleting under a cleanup issue.
- **The batch dropdown does not live-refresh.** If stock moves while the approval screen is open,
  the approver sees stale quantities; the server's identity and quantity checks catch the
  consequences, returning an error rather than dispensing wrongly.
