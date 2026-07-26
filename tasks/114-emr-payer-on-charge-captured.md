# Task Plan — Issue #114: [EMR] Emit the `payer` field on `charge.captured` (ADR-0028)

**Repo:** `ehmrs` (Express + Sequelize + MySQL + TypeScript). Branch
`114-emr-payer-on-charge-captured`, cut from `svsh_branch`. **This repo's conventions govern** —
`ehmrs_accounting`'s CONVENTIONS.md does not apply here, and none of its tooling (`Money` type,
schema guard, strict lint floor) exists.

**Governing ADRs** (all live in `ehmrs_accounting`, where the contract is defined):
**0028** (payer rides on `charge.captured` as a versioned additive field — the spec for this issue),
**0025** (frozen v1 event contract; additive-field evolution rule), **0016** (identity by reference —
IDs only, no demographics), **0015** (payer model: Scheme→HMO, retainership as corporate AR),
**0001** (EMR owns the coverage fact at prescription time).

**The receiver is already live** (`ehmrs_accounting` PR #113). Build against it, not a reimplementation:
- `apps/api/src/modules/integration/event-contract.ts` — `chargeCapturedPayerSchema`, the Zod guard
  the emitted `payer` must pass.
- `apps/api/src/modules/coverage/coverage-resolver.ts` — how each `payer_type` is interpreted.

---

## Reality check — verified in this repo before planning (2026-07-25)

Every claim below was checked against the code on `114-emr-payer-on-charge-captured`, not assumed.

- **The A1 outbox is landed** (commit `d0f9f4c`, PR #5). `buildChargeCapturedEvent`
  (`event-builder.ts`) assembles the wire body; `emitChargeCapturedForRows` (`outbox-writer.ts`) is
  the single call every prescribe site makes. This issue extends both — no new emit path.
- **All five prescribed models carry `patient_insurance_id`** (`prescribedDrug`, `prescribedTest`,
  `prescribedInvestigation`, `prescribedService`, `prescribedAdditionalItem`) — confirmed one
  declaration each. So the payer is derivable from the row itself.
- **`getPatientInsuranceQuery({ patient_id })`** (`Insurance/insurance.repository.ts`) already
  returns `insurance_id`, `hmo_id`, `id`, and includes `Insurance` with its `name`. It is the
  lookup the payer derivation needs — no new query surface. **But it keys by `patient_id`, not by
  `patient_insurance_id`**, and returns *a* patient-insurance (the first match), not necessarily the
  one a line was prescribed under. The row carries the exact `patient_insurance_id`; the derivation
  must resolve *that* row (see decision 3).
- **The insurance `name` values in use are `NHIS`, `FHSS`, `PHIS`, `Retainership`** (from
  `EXCLUDED_INSURANCE`, `getDrugType`, and the `PharmacyDrugType`/`AcceptedDrugType` enums).
  `Retainership` is an `Insurance` (scheme) type; retainer companies are `HMO` rows under it. There
  is **no `retainership_id`** in the EMR (see decision 2).
- **16 emit call sites across 8 files** (`Admission`, `Surgery`, `Visit`, `Orders/{Pharmacy,
  Laboratory,Radiology,Service}`). **None changes** — the payer rides on the row, derived inside
  `emitChargeCapturedForRows`. This is the property that keeps the blast radius to two files
  (`event-builder.ts`, `outbox-writer.ts`) plus tests.
- **The existing outbox tests hit real MySQL** (`emit-for-rows.test.ts`, `contract-handshake.test.ts`)
  with plain-object rows standing in for Sequelize instances; `event-builder.test.ts` is pure. New
  tests extend these in the same style.

---

## Design decisions settled before implementation

1. **The payload builder stays the only enforcement point.** The `payer` object is attached in
   `buildChargeCapturedEvent`, after `service_line`, before `assertNoDemographics` — so the
   demographic guard also walks the payer's keys. IDs are `String(...)`-ed exactly as `patient_id`
   and `external_line_ref.id` already are. The field is emitted **only when it has content**; never
   `payer: undefined`, never an empty object.

2. **Retainership maps to the retainer-company `hmo_id` (SETTLED, owned by Accounting #138).** The
   EMR has no `retainership_id`; a retainership line is a `PatientInsurance` whose `insurance.name`
   is `Retainership`, carrying `insurance_id` + a company `hmo_id`. Accounting reads only
   `retainership_id` for `payer_type: "retainership"`. **The wire `retainership_id` = the EMR
   company `hmo_id`.** This session emits `retainership_id = String(hmo_id)`; the matching
   obligation (Accounting seeding `RetainershipAgreement.retainership_id` to those ids) is issue
   #138's, not ours. Do not fabricate a separate id.

3. **Payer derivation reads the line's own `patient_insurance_id`, not a patient-wide lookup.** A
   patient may hold more than one insurance; the line records which one it was prescribed under.
   The derivation:
   - `patient_insurance_id` is null/absent, **or** the row's `*_type` is `Cash` → `payer_type:
     "cash"`, omit the id fields.
   - otherwise load the `PatientInsurance` by that id (with its `Insurance`), then:
     - `insurance.name === 'Retainership'` → `payer_type: "retainership"`,
       `retainership_id = String(hmo_id)`.
     - any other insurance → `payer_type: "scheme_hmo"`, `scheme_id = String(insurance_id)`,
       `hmo_id = String(hmo_id)`.
   A `patient_insurance_id` that resolves to no row is a data bug: **fall back to cash** (never grant
   unverified coverage) rather than throwing and rolling back a clinical write.

4. **The lookup runs on the caller's transaction and is cached per `patient_insurance_id`.** A bulk
   prescribe creates many rows that share one `patient_insurance_id`; derive once per distinct id,
   not once per row. Never open a new transaction — pass the caller's `{ transaction }`.

5. **No new flag, no `event_version` bump.** The change rides behind the existing
   `EMR_OUTBOX_ENABLED`. Omitting `payer` stays valid (a cash line omits it); old and new senders
   coexist. `event_version` stays 1 — this is an additive field (ADR-0028), not a new version.

6. **ID-only, no demographics (ADR-0016).** Send `insurance_id` / `hmo_id` only — never the
   insurance `name`, `enrollee_code`, `plan`, or `organization`. `assertNoDemographics` catches a
   demographic *key* but not a demographic *value* smuggled into an id field; a test asserts the
   payload carries no name/enrollee_code anywhere.

---

## Tasks (build order)

- [ ] **114.1 — Builder: accept and emit `payer`.** In `event-builder.ts`, add
      `ChargeCapturedPayer` (the contract type) and an optional `payer?: ChargeCapturedPayer` on
      `PrescribedLineInput`; attach it to `body` when present, before `assertNoDemographics`. Unit
      tests in `event-builder.test.ts`: scheme_hmo / retainership / cash-omitted shapes; ids are
      strings; no demographic key or value leaks.
- [x] **114.2 — Payer classification + resolver.** `payer-classification.ts` holds the pure
      `classifyPayer(CoverageFacts)` (model-free, unit-tested in isolation); `payer-derivation.ts`
      holds `PayerResolver`, which loads the line's own `patient_insurance_id` on the caller's
      transaction and caches per id. (Retainership → retainership; NHIS/FHSS/PHIS → scheme_hmo;
      null/Cash → undefined; unresolved id → undefined/cash.)
- [x] **114.3 — Wire it into `emitChargeCapturedForRows`.** Resolves the payer per row and passes
      it to the builder; **no call site changed** (16 sites across 8 files untouched). Integration
      tests (real MySQL): scheme_hmo, retainership, cash-despite-insurance, unresolved-fallback-to-
      cash, one-lookup-per-shared-id.
- [x] **114.4 — Payer passes Accounting's guard.** `contract-handshake.test.ts` reconstructs
      `chargeCapturedPayerSchema` (independently, per the file's existing convention) and asserts
      each built payer passes it; a cash line carries no payer. Real cross-repo resolution is gated
      on #138.
- [x] **114.5 — Suites green.** All 9 Outbox suites pass (96 tests); typecheck clean. Pre-existing
      full-suite failures (Staff/Insurance/Visit/… — 26 suites) reproduce identically on the clean
      baseline with my changes stashed, so they are unrelated cross-suite DB-state failures, not
      regressions.

---

## Downstream dependency — Accounting #138

Accounting's coverage tables currently hold placeholder slugs (`sch_nhis_standard`,
`hmo_zenith_care`, `ret_oilserv_production`), not the EMR's real ids. A correctly-emitted `payer`
therefore still resolves as cash outside test fixtures until **#138** repopulates those tables with
real EMR ids. #114 is not blocked from landing; its real-world resolution is gated on #138. Do not
mistake a passing slug-fixture test for a production-ready split.

---

## Review

**Summary.** Adds the optional, ID-only `payer` to `charge.captured` (ADR-0028). Blast radius: two
production files (`event-builder.ts`, `outbox-writer.ts`), a small `prescribed-line-types.ts`
addition (`COVERAGE_TYPE_FIELD_BY_TYPE`), and two new modules (`payer-classification.ts`,
`payer-derivation.ts`). No prescribe call site changed — the payer rides on the prescribed row and
is derived inside the existing emit helper.

**Key decisions.**
- Payer derived from the line's own `patient_insurance_id`, not the patient default — correct for
  multi-insurance patients (owner-confirmed).
- Unresolved `patient_insurance_id` falls back to cash, never throws — a stale FK must not roll back
  a clinical write, and unverified coverage is never granted (owner-confirmed).
- Retainership → `retainership_id = String(hmo_id)` (the retainer company's EMR HMO id), the settled
  cross-repo mapping; Accounting #138 keys its agreements to match.
- Pure classification split from the DB resolver so it unit-tests without loading Sequelize.

**Testing evidence.** Outbox module: 9 suites / 96 tests green — unit (builder + classification +
handshake) and integration against real MySQL (emit-for-rows payer paths). `tsc --noEmit`: 0 errors.

**Limitations / follow-ups.** Real-deployment resolution is gated on **Accounting #138** (coverage
tables still hold placeholder slugs, not real EMR ids); until it lands an insured charge safely
falls back to cash. The full EMR suite has 26 pre-existing failing suites from cross-suite shared-DB
state — unrelated to this change and confirmed present on the clean baseline.
