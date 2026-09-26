# #82 — Emit insurance/HMO name channels and answer catalogue.requested full sends

Parent: Horlarmeday/ehmrs_accounting#394 (Slice C) · Contract: ehmrs_accounting#396 (ADR-0067).
Follows #79 (`item.changed` / `vendor.changed`).

## Goal

Accounting's finance screens cannot ask officers to type EMR database ids (`insurance_id`,
`hmo_id`) that no EMR screen shows. The EMR must emit payer names and answer whole-list requests
so Accounting can pick payers by name.

## Decisions (confirmed with owner 2026-09-26)

- `catalogue.requested` idempotency: inbox idempotency-key dedup suffices; no new ledger table.
  A redelivered request with the same key never re-reaches the applier. Tested explicitly.
- `line_type` values are lowercase line-type vocabulary: `drug` | `test` | `service` |
  `investigation`.
- Investigation IS included (both write-time emission and full send) — contract permits it and the
  model exists; #83 dependency noted but not blocking.
- Reverse `payer.requested` is a FULL payer send: emit `insurance.changed` for every insurance and
  `hmo.changed` for every HMO (same shape as `catalogue.requested` kind `payer`).
- Minimal transaction scope: wrap only the four Insurance write paths that now emit
  (`createInsurance`, `updateInsurance`, `createHMO`, `updateHMO`).

## Wire contract

- `insurance.changed` body: `{ insurance_id: string, name: string, is_retainership: boolean }`.
  `is_retainership` = `insurance.name === 'Retainership'` — the exact rule in
  `classifyPayer` (`server/src/modules/Outbox/payer-classification.ts`). Aggregate
  `insurance:<insurance_id>`.
- `hmo.changed` body: `{ hmo_id: string, insurance_id: string, name: string, hmo_num: string }`.
  Aggregate `hmo:<hmo_id>`.
- `item.changed` body gains `line_type` (lowercase, one of the four catalogue kinds). Aggregate
  stays `item:<type>:<code>`.
- Envelope aggregate types: `insurance`, `hmo` join the permitted set; `item`/`vendor` unchanged.

## Tasks

- [x] 1. Event builders (`event-builder.ts`)
  - `buildInsuranceChangedEvent`, `buildHmoChangedEvent` + idempotency-key helpers
    (`insurance-changed:{id}:{seq}`, `hmo-changed:{id}:{seq}`), 1–256 char name validation,
    `assertNoDemographics` exemption entries.
  - `ItemChangedInput` gains `line_type`; builder validates it against the closed set
    (`drug | test | service | investigation`) and includes it in the body.
  - Register `insurance.changed` and `hmo.changed` in `PERMITTED_EVENT_TYPES` (outbox-writer.ts)
    and the event-type lists in label-channels/event-builder tests.
  - Effort: M. Acceptance: builder unit tests pass; a mis-typed `line_type` or oversized name
    throws `EventBuildError`.

- [x] 2. Emitters (`outbox-writer.ts`)
  - `emitInsuranceChanged(insuranceId, tx)`: load insurance, undefined when disabled/missing/
    unnamed; sequence per aggregate; persist.
  - `emitHmoChanged(hmoId, tx)`: load HMO, undefined when disabled/missing; persist.
  - Generalise `emitItemChanged` to `emitItemChangedForKind(kind, id, tx)` covering Drug, Test,
    Service, Investigation (keep `emitItemChanged(drugId, tx)` signature working for the Inbox
    applier call site). Kind → model + `line_type` map, analogous to `PRICE_FIELD_BY_TYPE`.
  - Effort: M. Acceptance: emits exactly one event per row per kind on a full send.

- [x] 3. Write-path hooks (`Insurance/insurance.repository.ts`)
  - Wrap `createInsurance`, `updateInsurance`, `createHMO`, `updateHMO` in a transaction and emit
    the matching `*.changed` inside it. Catalogue-write must never roll back because a label could
    not be emitted → emission failures of the "row missing/no name" kind are skipped (undefined),
    matching the `emitItemChanged` posture.
  - Effort: S. Acceptance: creating/updating an HMO emits exactly one `hmo.changed`; same for
    insurance.

- [x] 4. Inbox applier (`Inbox/applier.ts`)
  - `catalogue.requested { kind: 'payer' | 'vendor' | 'item' }`: full send through the outbox —
    payer → every Insurance + HMO; vendor → every Vendor; item → every Drug/Test/Service/
    Investigation. Sits before the sequence claim (resync semantics, like `item.requested`).
    Unknown/absent kind → UNHANDLED, never throws.
  - `payer.requested`: same as kind `payer` — full payer send.
  - Effort: M. Acceptance: one event per row per kind; re-delivered request (same inbox key) does
    not double the outbox.

- [x] 5. Contract handshake (`contract-handshake.test.ts`)
  - Reconstructed Accounting guards for the two new bodies + `item.changed` `line_type` literal
    check; signed-event-accepted assertions for both new types.
  - Effort: S.

- [x] 6. Tests
  - Builder/label-channel coverage for the new types and `line_type`.
  - Integration (test DB): emit-on-write for the four insurance paths; full sends for all three
    kinds; idempotency re-delivery test; `is_retainership` agrees with `classifyPayer` for the
    same insurance; outbox disabled → nothing emitted.
  - Effort: M.

- [x] 7. Wrap-up
  - `npx tsc --noEmit`, `yarn test` (Outbox + Inbox suites), lint.
  - Feature branch `82-payer-name-channels` from `svsh_branch`, PR via `gh pr create`.

## Out of scope

- HMOList.vue `href="#"` fix (client presentation; separate slice).
- Investigation charging changes owned by #83.
- Accounting-side inbox schema changes (their repo).

## Review (implemented 2026-09-26)

### Summary
- `event-builder.ts`: `buildInsuranceChangedEvent` / `buildHmoChangedEvent` with per-aggregate
  idempotency keys and `insurance:` / `hmo:` aggregates; `item.changed` gains validated
  `line_type` (lowercase, closed set); both new types added to the per-type demographic exemption.
- `outbox-writer.ts`: `emitInsuranceChanged` / `emitHmoChanged`; `emitItemChangedForKind` covers
  Drug/Test/Service/Investigation (kind → model + attributes map). `emitItemChanged` kept as the
  drug wrapper for the existing Inbox call site.
- `insurance.repository.ts`: the four write paths now run inside a transaction and emit inside it.
- `Inbox/applier.ts`: `catalogue.requested` and `payer.requested` handled before the sequence
  claim; `payer.requested` is a full payer send; unknown kind → UNHANDLED.

### Deviations / notes
- Investigation rows are wired but currently emit nothing: the `Investigations` table has no
  `code` column (that is the #83 dependency). The emitters never fabricate an item_code, so
  investigation rows flow automatically once #83 adds codes. Documented in code and tests.
- Over-long (>43 char) catalogue codes are SKIPPED in the emitters rather than thrown — a full
  send must never dead-letter on one bad row; a write must never roll back because a label could
  not be emitted. Builder validation unchanged.
- Emitter trims the catalogue code BEFORE claiming the sequence, so padded-code duplicates of one
  code share one aggregate (found via a real unique-key collision in tests).
- `PERMITTED_EVENT_TYPES` pin test in `dispense-return-emission.test.ts` updated to 14 (the pin
  was already stale on the base branch at 10 vs an actual 12; corrected to the real size).
- Pre-existing failures (verified identical on the base branch, untouched here):
  `Insurance/insurance.test.ts` (2 update-endpoint status-code tests), `Pharmacy/pharmacy.test.ts`
  (3 shared-DB pollution tests).

### Testing
- `npx tsc --noEmit` clean; eslint clean (no errors) on all touched files.
- New `payer-channels.test.ts`: 12 integration tests covering emit-on-write per path,
  classifyPayer agreement, full sends for all three kinds, unknown kind, payer.requested, and the
  redelivery double-emission guard (unique inbox key + terminal-row re-drain skip).
- Full `src/modules/Outbox` + `src/modules/Inbox`: 363/363 pass.
