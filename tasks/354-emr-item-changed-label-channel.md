# Task Plan — Accounting #354 (EMR half): emit `item.changed`, apply `item.requested`

**Counterpart:** Accounting PR #355 (`ehmrs_accounting`), which adds `item.changed` / `item.requested`
to the frozen contract, builds the `item_label` cache, and ships the purchase-order picker.
**This is the half that produces the labels.**

**Governing ADRs (Accounting's numbering):** **0052** (this channel), **0051** (the vendor pair it
copies), **0025** (the frozen v1 contract both amend), **0016** (identity by reference), **0023**
(co-deployed per hospital), **0011** (versioned external contract).

---

## Context

Accounting's purchase-order raise form asked a store officer to type an item code by hand, once per
line, and nothing validated it — Accounting has no item catalogue, and every `item_code` in its
schema is an unvalidated varchar written by someone else. ADR-0052 built the missing channel:
`item_label` cached by the catalogue code, fed by `item.changed`.

**The cache is empty until this PR ships.** The picker offers nothing and the officer types a bare
code — today's behaviour exactly, so nothing regresses while this is pending. That is the same
posture ADR-0051 D5 took for vendors.

The EMR owns the data: `Drug.name` is `allowNull: false` with a `'name is required'` validator
(`server/src/database/models/drug.ts:29-38`), and `createGenericDrug` mints `code: D<6 digits>` for
every drug (`pharmacy.repository.ts:104-109`), so every catalogue row already has both halves.

## Verification before implementing

- [ ] `claimSequence` is keyed on an opaque string, so an `item:` aggregate needs no schema change
      <!-- evidence: file=server/src/modules/Outbox/event-builder.ts present=/claimSequence` is keyed on an opaque string/ -->
- [ ] Two non-encounter aggregates already exist as precedent (`patient:`, `store:`)
      <!-- evidence: file=server/src/modules/Outbox/event-builder.ts present=/export function storeAggregateId/ -->
- [ ] `assertNoDemographics` rejects a body carrying `name` for every type but one
      <!-- evidence: file=server/src/modules/Outbox/event-builder.ts present=/const DEMOGRAPHIC_KEYS/ -->
- [ ] The drug create/update path opens **no** transaction today
      <!-- evidence: file=server/src/modules/Pharmacy/pharmacy.service.ts present=/return createGenericDrug\(body\)/ -->
- [ ] #255's `item_code` emitter landed, so the catalogue code already reaches the wire elsewhere
      <!-- evidence: test="includes item_code on the charge.captured body when present" -->

## Implementation

- [ ] `itemAggregateId(itemCode)` → `item:${itemCode}`, beside the patient and store helpers
      <!-- evidence: test="itemAggregateId prefixes the catalogue code" -->
- [ ] `buildItemChangedEvent` mirroring `buildPatientDemographicsChangedEvent`
      <!-- evidence: test="builds an item.changed envelope with the item aggregate and version 1" -->
- [ ] `'item.changed'` joins `DEMOGRAPHIC_EVENT_TYPES` — a per-type exemption, never a weakening
      of `assertNoDemographics`
      <!-- evidence: test="item.changed may carry a product name while charge.captured still may not" -->
- [ ] `'item.changed'` joins `PERMITTED_EVENT_TYPES`; it does **not** join
      `IDEMPOTENT_SKIP_EVENT_TYPES` — a rename must supersede, not dedup
      <!-- evidence: test="a second item.changed for the same code writes a second row" -->
- [ ] `emitItemChanged(drugId, transaction)` mirroring `emitPatientDemographicsChanged`
      <!-- evidence: test="a disabled outbox emits nothing" test="a deleted drug returns undefined" -->
- [ ] A transaction wraps the drug create/update path, and the emit runs inside it
      <!-- evidence: test="a rolled-back drug write emits no event" -->
- [ ] `createGenericDrug` and `updateGenericDrug` each emit exactly one event
      <!-- evidence: test="creating a drug emits one item.changed" test="renaming a drug emits one item.changed" -->
- [ ] `item.requested` re-emits `item.changed` for the named code
      <!-- evidence: test="item.requested re-emits for a known code and is handled for an unknown one" -->

## Tests (real MySQL, per this suite's existing posture)

- [ ] `contract-handshake.test.ts` — the signed envelope verifies the way Accounting's inbox verifies
      <!-- evidence: test="item.changed verifies like Accounting" -->

## Out of scope

- **Services and investigations.** A purchase-order goods line requires `item_code` AND `drug_type`
  together (`CHK_purchase_order_line_shape`), so only `Drug` rows can be named by one.
- **`inventory_item`** — a stock layer keyed by `drug_id`, not a catalogue.
- **Backfill.** Existing drugs emit on their next update. A bulk first-sight emission, if wanted, is
  a separate explicitly-triggered script — never a migration that floods the outbox on deploy.
- **`vendor.changed` (ADR-0051 D5)** — also unbuilt here, and the same shape. Worth doing together,
  but not silently folded into this PR.

## Risks

- **Emitting outside a transaction** is the one way to corrupt this: an event after a rolled-back
  write names an item that does not exist; a lost event after a committed write leaves the cache
  stale with no resync trigger.
- **Weakening `assertNoDemographics`** instead of exempting the type would reopen the demographic
  hole on every event. The docblock above that constant says so explicitly.

## Review

_To be completed at close._
