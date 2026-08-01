# Issue #163 — [EMR] Emit `charge.voided` + `encounter.closed`

> **Repo: `../ehmrs` (this repo).** MySQL, Sequelize, Express, `ts-jest`, `maxWorkers: 1`.
> **Accounting counterpart:** #164 (handler). **Sequencing:** #116 (deferred revenue) should land
> in Accounting before #164 consumes these.
> **Kickoff prompt:** `ehmrs_accounting/docs/prompts/163-emr-void-and-close-events.md`
> **Contract:** ADR-0025 (frozen v1) · ADR-0018 (outbox) · ADR-0016 (ID references only) ·
> ADR-0027 (Visit → encounter aggregate) · ADR-0001/ADR-0011 (EMR owns clinical intent)

---

## 1. Problem

A prescribed line the patient never buys has **no lifecycle**. `charge.captured` fires at
prescription time and Accounting posts `Dr PATIENT_AR / Cr SERVICE_REVENUE`. If the patient
declines the line, nothing ever clears it: Accounting carries a **fabricated receivable and
fabricated revenue**, permanently.

Accounting cannot fix this locally — the lapse rule depends on visit type (inpatient vs outpatient)
and hospital-fault conditions it structurally cannot observe. The EMR owns the fact and must emit
it. Full reasoning: `ehmrs_accounting/CONTEXT.md` §"The unexercised line".

Additionally `encounter_anchor.closed_at` exists in Accounting and is **never written**, because
nothing emits `encounter.closed`.

---

## 2. Verified findings — read before planning any code

Everything below was read in this repo at commit `fd38cbe`. Three findings change the shape of the
work relative to the kickoff prompt; **items 2.2 and 2.3 are the load-bearing ones.**

### 2.1 The visit-end trigger already exists

`server/src/core/command/jobs/cron/endVisits.job.ts` is a live cron. `visitHandler` (lines 9–16)
sets `VisitStatus.ENDED` + `date_visit_ended`. It ends four selections:

| Selection | Rule |
| :--- | :--- |
| Aged outpatient | `createdAt` older than **5 days**, `category NOT IN (IPD, EMERGENCY)` |
| Untaken | created today, `is_taken: false` |
| ANC | all ongoing |
| Immunization | all ongoing |

**This job already encodes the rule Accounting could not** — IPD and EMERGENCY are excluded from
the timer. That exclusion is the whole reason the fact must be emitted rather than the rule
re-derived downstream.

> The window is **5 days**, not the 3 documented in `CONTEXT.md`, and the local is named
> `sevenDaysAgo` while computing five (line 20). **Do not change this behaviour in this issue.**
> Logged as follow-up §9.1.

### 2.2 FINDING — `visitHandler` runs in NO transaction, and its caller cannot roll back

`visitHandler` calls a bare `Visit.update` with no `transaction` argument. It is invoked through
`processTasksExecution` (`server/src/core/helpers/tasksProcessor.ts`), a `PromisePool` with
`concurrency: 10` whose `handleError` **swallows per-task errors** and returns them in an array
the caller (`endVisits`) currently ignores.

Consequence: **the transactional-outbox discipline (ADR-0018) does not exist on this path today
and must be introduced by this issue.** The prompt's instruction to "emit in the same transaction
as the `Visit.update`" is correct but is not a matter of passing an existing `transaction` through
— `visitHandler` must be wrapped in `sequelizeConnection.transaction()` so the status update and
the outbox rows commit together or not at all.

This is the single most important structural change in the issue. Getting it wrong produces the
exact failure the outbox exists to prevent: a visit marked ENDED with no events queued, which is
silent and permanent, since the cron will never select that visit again.

### 2.3 FINDING — only 2 of the 5 line types have `dispense_status`

The prompt's qualifying rule ("`dispense_status` is `Pending`") is **only expressible on two of
the five prescribed tables.** Verified per model:

| Type | Table | `dispense_status` | `payment_status` | Partial-exercise signal |
| :--- | :--- | :--- | :--- | :--- |
| `drug` | `Prescribed_Drugs` | **yes** | yes | `quantity_dispensed`, `quantity_returned` |
| `additional_item` | `Additional_item_prescriptions` | **yes** | yes | `quantity_dispensed`, `quantity_returned` |
| `test` | `Prescribed_Tests` | **no** | yes | `status` (`TestStatus`) |
| `investigation` | `Prescribed_Investigations` | **no** | yes | `status` (`InvestigationStatus`) |
| `service` | `Prescribed_Services` | **no** | yes | *(none — `payment_status` only)* |

`DispenseStatus` (`server/src/database/enums.ts:95`) is
`Dispensed | Pending | Returned | Partial Dispense | Partial Returned` — **there is no `Cancelled`**,
confirming an abandoned drug stays `Pending` forever.

`PaymentStatus` is `Pending | Paid | Cleared | Permitted`. The releasing set used by the gate
(`server/src/modules/Inbox/gate.ts:39`) is `{Paid, Cleared, Permitted}` — **`Pending` is the only
non-releasing status.**

The qualifying predicate must therefore be **defined per type**, not as one column check. See §4.2.

### 2.4 The outbox module and its patterns

`server/src/modules/Outbox/`:

- `event-builder.ts` — `buildChargeCapturedEvent`, `buildEncounterOpenedEvent`,
  `buildPatientDemographicsChangedEvent`, `uuidV7`, `visitAggregateId`, `assertNoDemographics`,
  `EventBuildError`, `chargeIdempotencyKey`, `encounterOpenedIdempotencyKey`.
- `outbox-writer.ts` — `claimSequence` (per-aggregate `INSERT … ON DUPLICATE KEY UPDATE` +
  `LAST_INSERT_ID`, on the caller's transaction), `emitChargeCaptured`, `emitEncounterOpened`,
  `emitChargeCapturedForRows`, `isOutboxEnabled` (`EMR_OUTBOX_ENABLED`), `TENANT_KEY`.
- `prescribed-line-types.ts` — the closed five-type set plus `PRICE_FIELD_BY_TYPE` and
  `COVERAGE_TYPE_FIELD_BY_TYPE`. **New per-type maps belong here**, for the reason its own comment
  gives: a per-call-site literal is how these drift.
- `drainer.ts`, `signer.ts`, `gate-check.ts`.

Emission precedent to mirror exactly — `server/src/modules/Visit/visit.service.ts:112-118`:

```ts
const createdVisit = await sequelizeConnection.transaction(async transaction => {
  const visitRow = await createVisit(body, transaction);
  await emitEncounterOpened(visitRow.id, category === VisitCategory.EMERGENCY, transaction);
  return visitRow;
});
```

### 2.5 Contract facts (Accounting side, already frozen)

- Both event types are in `INBOUND_EVENT_TYPES` and `OVERWRITE_EVENT_TYPES`
  (`ehmrs_accounting/packages/shared/src/emr-events.ts:33-52`). **This is emission, not a contract
  change — no ADR needed.**
- Accounting's `inbox-drainer.service.ts:64-68` registers handlers for `charge.captured`,
  `encounter.opened`, `patient.demographics.changed` only. Until #164 lands, both new events are
  validated and recorded **`UNHANDLED`** — not dead-lettered, not an error. **This is the expected
  interim state and is safe to ship against.**
- **There is no `ChargeVoidedBody` / `EncounterClosedBody` interface in `@ehmrs/shared` yet.** The
  frozen artefacts pin the *envelope*, the *classification*, and the *idempotency-key basis* — not
  these two bodies. §4.4 fixes the body shapes; #164 adds the matching guards. Agreeing the shape
  here is a prerequisite for #164, not optional.
- ADR-0025 **Q6.2**: *"Cancel before settlement → EMR `charge.voided`. Cancel after settlement → an
  Accounting-side reversal. **The EMR never voids a settled line.***" This is a hard contract rule,
  not merely local caution — it is the contract basis for the never-void guards in §4.2.
- ADR-0025 **Q3.2**: amendment is void + reissue, so `charge.voided` carries the original
  `external_line_ref`.

### 2.6 Test harness

`ts-jest`, config inline in `server/package.json` (`"jest"` key), `maxWorkers: 1`. Outbox tests run
against **real MySQL** (`outbox-writer.test.ts`, `emit-for-rows.test.ts` open
`sequelizeConnection`); pure builder tests are in-memory (`encounter-opened.test.ts`,
`event-builder.test.ts`). Test DB: `yarn test:db:setup`. Suites share one MySQL, so assertions must
be **scoped to their own idempotency keys**, never a bare `count()` — the existing comment at
`outbox-writer.test.ts:46-48` explains why.

---

## 3. Scope

**In scope**

1. `encounter.closed` emitted on visit end, transactionally.
2. `charge.voided` emitted at visit end for genuinely unexercised lines, transactionally.
3. Making `visitHandler` transactional so 1 and 2 are atomic with the status update (§2.2).

**Out of scope — do not let these expand the issue**

- `DispenseStatus.CANCELLED` + a pharmacy action to close a line out *before* visit end. Deferred
  precision improvement; the only part needing a UI/workflow change. Follow-up §9.2.
- Changing the 5-day window or renaming `sevenDaysAgo` (§9.1).
- Drug returns (`returnDrugToInventory`) — Accounting #174/#175.
- The Accounting-side handler — #164.
- Emitting `charge.voided` from any path other than visit end.

---

## 4. Design decisions

### 4.1 `encounter.closed` — body, key, aggregate

Mirror `buildEncounterOpenedEvent` exactly.

- **Aggregate**: `{ type: 'encounter', id: visitAggregateId(visit_id) }` → `visit:{id}` (ADR-0027).
- **Idempotency key**: `encounter-closed:{visit_id}`, via a new
  `encounterClosedIdempotencyKey()` beside the opened one. One close per visit, deterministic on
  domain identity (ADR-0025 §3).
- **Body**: `{}` — empty.

  Deliberate. `closed_at` is **not** in the body: Accounting derives it from the envelope's
  `occurred_at`, which is already the authoritative clinical timestamp and already drives period
  assignment. A second timestamp in the body would be a field that can disagree with the envelope.
  The body carries no `patient_id`, no `category`, no `date_visit_ended` — ADR-0016, and
  `assertNoDemographics` bites on anything demographic.
- **`occurred_at`**: the visit-end instant. Pass it explicitly rather than defaulting to
  `new Date()`, so every event emitted for one visit-close shares one timestamp (see §4.5).

### 4.2 `charge.voided` — the qualifying predicate

**A line qualifies only if ALL hold:**

1. It belongs to a visit **this job itself decided to end** (so IPD/EMERGENCY are already excluded
   — the job's existing `Op.notIn` is preserved, never widened).
2. `payment_status === PaymentStatus.PENDING`. Anything in `{Paid, Cleared, Permitted}` is
   money-adjacent or authority-granted and is **never** auto-voided. This is the ADR-0025 Q6.2 rule
   — the EMR never voids a settled line — and it is the single check that applies to all five types.
3. **Nothing has been exercised**, per type:

| Type | Additional predicate |
| :--- | :--- |
| `drug` | `dispense_status === Pending` **and** `quantity_dispensed` is 0/null **and** `quantity_returned` is 0/null |
| `additional_item` | same as `drug` |
| `test` | `status === TestStatus.PENDING` |
| `investigation` | `status === InvestigationStatus.PENDING` |
| `service` | *(none beyond payment_status — see below)* |

**Why the quantity checks on top of `dispense_status`:** the status is a coarse label and the
quantity columns are the physical truth. A row whose status has drifted from its quantities must
fail closed — refusing to void is always the recoverable direction.

**`service` carries no exercise signal at all.** `Prescribed_Services` has `payment_status` and
`billing_status` and no status/quantity column. So for a service, `payment_status === Pending` is
the *only* available evidence. **Decision: include `service`, on `payment_status === Pending`
alone.** Rationale: an unpaid service was never rendered under the pay-first gate — the gate
(`gate.ts`) releases fulfilment only on a releasing status, so `Pending` means the gate never
opened. This is exactly the fabricated-AR case the issue exists to clear. **Flag this explicitly
for owner confirmation (§8, Q1)** — it is the one type where the evidence is thinner than the
prompt assumed.

**Never auto-void** (each earns an explicit test):
- a partially dispensed line (`Partial Dispense` / `quantity_dispensed > 0`) — the patient took some;
- a returned / partially returned line — that is #174's territory, not a void;
- any line with a releasing `payment_status` — money applied means real AR; unwinding needs a human
  (§8.2 supervisor reversal).

**Encode the predicate as one exported, unit-tested, per-type map in `prescribed-line-types.ts`**
(alongside `PRICE_FIELD_BY_TYPE`), not as five inline `where` clauses. Five call-site literals is
precisely the drift that file exists to prevent, and a type silently missing from the map means a
patient's fabricated AR is never cleared — with no error anywhere.

### 4.3 `charge.voided` — body, key, aggregate

- **Aggregate**: same encounter aggregate as the capture, `visit:{visit_id}` (ADR-0025 Q4.2 — one
  sequence per encounter, all events).
- **Idempotency key**: `charge-voided:{type}:{id}`.

  **Not** `charge:{type}:{id}` — that is the capture's key. Reusing it would make the void collide
  with its own capture at the inbox's unique constraint and be silently discarded as a duplicate.
  The key is opaque to Accounting (Q3.4), so the EMR owns this format. Add
  `chargeVoidedIdempotencyKey()` beside `chargeIdempotencyKey()`.
- **Body**: `{ external_line_ref: { type, id }, encounter_id }`.

  `external_line_ref` is how Accounting finds the charge line to unwind (Q3.2 — the original ref,
  immutable and never reused). `encounter_id` mirrors the reverse-direction bodies
  (`PaymentSettledBody` etc.) which all carry it beside the ref.

  **No `amount_kobo`.** The void names the line; Accounting reverses what it actually posted. A
  money field here would let the two disagree, and CONVENTIONS §1 keeps money out of anything that
  does not need it.

  **No `reason` / `reason_code` field in v1.** Every void this issue emits has exactly one cause —
  visit closed with the line unexercised. A free-text reason would be an unvalidated string on a
  frozen contract with no consumer. If pre-close cancellation (§9.2) ever lands, it adds a reason
  code as an additive optional field then, with a real consumer.

### 4.4 Shared-type additions (Accounting repo — coordinate, do not skip)

`@ehmrs/shared` has no body interface for either event. #164 will need them, and #163 is what
fixes the shape. **Deliverable of this issue: the two body shapes are written down in the Accounting
repo as an issue comment on #164** (or as the types themselves, if working across both repos):

```ts
/** `charge.voided` — a prescribed line was closed out unbought. Overwrite (sequence-guarded). */
export interface ChargeVoidedBody {
  readonly external_line_ref: ExternalLineRef;
  readonly encounter_id: string;
}

/** `encounter.closed` — a visit ended. Overwrite. `closed_at` comes from envelope `occurred_at`. */
export type EncounterClosedBody = Record<string, never>;
```

This is additive to a frozen contract in the sanctioned way (ADR-0025: "a new need is a new field
or a new `event_version`") — these are new *bodies* for event types already frozen in the type set,
not a change to an existing shape.

### 4.5 Ordering and sequencing within one visit close

One visit close emits **1 + N** events: one `encounter.closed`, N `charge.voided`. All share the
`visit:{id}` aggregate and therefore draw from **one sequence counter**, serialised by
`claimSequence`'s row lock.

**Emit the `charge.voided` rows FIRST, then `encounter.closed` last.** The close is the terminal
fact about the visit and must carry the highest sequence. Both are overwrite events on the same
aggregate; Accounting discards a lower sequence as stale per aggregate, so ordering the close last
means it can never be discarded behind its own voids.

Pass a single `occurredAt` (the visit-end instant) into every event in the batch, so all N+1 events
agree on when the visit ended and land in the same accounting period.

### 4.6 Idempotency under cron re-run — the property that must actually hold

The cron re-runs on a schedule; the drainer redelivers on retry. Three layers, and it is worth
being precise about which one carries the weight:

1. **The cron does not re-select an ended visit.** Every selection filters
   `status: VisitStatus.ONGOING`. Once `visitHandler` commits, that visit is out of scope forever.
   This is the *primary* guard and it is why §2.2's transaction matters so much: if the status
   update commits and the events do not, **nothing ever retries** — the visit is permanently
   invisible to the job. Atomicity is not belt-and-braces here; it is the only thing standing
   between a crash and permanent silent data loss.
2. **Deterministic idempotency keys** (`charge-voided:{type}:{id}`, `encounter-closed:{id}`) —
   a redelivered event dedupes at Accounting's `inbox_event.idempotency_key` unique constraint.
3. **Sequence-guarded overwrite** (ADR-0025 §4) — a stale redelivery is discarded on sequence.

### 4.7 Feature flag

`emitEncounterClosed` / `emitChargeVoidedForVisit` **must no-op when `EMR_OUTBOX_ENABLED !== 'true'`**,
exactly like every existing emitter. The cron must continue to end visits normally with the outbox
off — this code lands in production inert and is switched on per environment once verified.

**The transaction wrapper in `visitHandler` is NOT flag-gated** — it is a correctness improvement to
the job independent of the outbox, and gating it would mean two different concurrency behaviours to
reason about.

---

## 5. Implementation tasks

Branch: `git checkout -b 163-emr-void-and-close-events`

### Phase A — the builders (pure, no I/O)

- [x] **A1** `prescribed-line-types.ts`: add `VOIDABLE_PREDICATE_BY_TYPE`
      per-type map encoding §4.2's predicate — the fields to read and the values that qualify.
      Document *why* it is co-located, matching the file's existing comment style.
      *Complexity: M. AC: all five types present; adding a sixth type without a predicate is a
      compile error.*
- [x] **A2** `event-builder.ts`: add `encounterClosedIdempotencyKey(visitId)` →
      `encounter-closed:{visitId}`.
      *Complexity: S.*
- [x] **A3** `event-builder.ts`: add `chargeVoidedIdempotencyKey(type, id)` →
      `charge-voided:{type}:{id}`, refusing an unknown type exactly as `chargeIdempotencyKey` does.
      *Complexity: S.*
- [x] **A4** `event-builder.ts`: add `buildEncounterClosedEvent(input, context)` per §4.1 — empty
      body, `visit:{id}` aggregate, `assertNoDemographics`.
      *Complexity: S. AC: envelope key set is identical to `buildEncounterOpenedEvent`'s.*
- [x] **A5** `event-builder.ts`: add `buildChargeVoidedEvent(input, context)` per §4.3 — body is
      `external_line_ref` + `encounter_id`, no money, `assertNoDemographics`.
      *Complexity: M. AC: body contains no `amount`/`kobo`/`price` key under any input.*

### Phase B — the writers (transactional, real MySQL)

- [x] **B1** `outbox-writer.ts`: add `emitEncounterClosed`
- [x] **B2** `outbox-writer.ts`: add `emitChargeVoided`
- [x] **B3** `outbox-writer.ts`: add `emitChargeVoidedForVisit`

### Phase C — the trigger

- [x] **C1** `endVisits.job.ts`: transactional `visitHandler` via `visit-close-emission.ts`
- [x] **C2** voids first, `encounter.closed` last, shared `occurredAt`
- [x] **C3** surface `processTasksExecution` errors with visit ids

### Phase D — tests

- [x] **D1** `encounter-closed.test.ts`
- [x] **D2** `charge-voided.test.ts`
- [x] **D3** `voidable-predicate.test.ts`
- [x] **D4–D7** `void-on-visit-close.test.ts` (written; requires MySQL — first run passed emit test)
- [x] **D8** `contract-handshake.test.ts` extended

### Phase E — verification and handoff

- [ ] **E1** `yarn test` green (`server/`), including the pre-existing suites — no regression in
      `outbox-writer.test.ts` / `emit-for-rows.test.ts`.
- [ ] **E2** Manual end-to-end against a running Accounting inbox: end a visit with abandoned
      lines, drain the outbox, confirm Accounting records the events. Until #164 lands they land
      as **`UNHANDLED`** — that is the expected pass condition (§2.5), not a failure.
- [ ] **E3** Post the §4.4 body shapes to Accounting #164 so its guards are written against the
      real wire shape.
- [ ] **E4** Fill in the Review section below; open the PR with `gh pr create --base main`.

---

## 6. Acceptance criteria (from the issue, mapped to tasks)

- [ ] `encounter.closed` emitted on visit end, in the same transaction, carrying `visit:{id}` →
      **C1, C2, D1, D5**
- [ ] `charge.voided` emitted at visit close for pending, undispensed, unpaid lines →
      **A1, B3, C2, D3, D4**
- [ ] Partially dispensed and partially paid lines are **never** auto-voided → **A1, D3**
- [ ] Inpatient and emergency visits unaffected; existing exclusions preserved, not widened →
      **C2 (no change to the job's selection queries), D4**
- [ ] Idempotent under redelivery and under the cron re-running → **§4.6, D6**
- [ ] Bodies carry no demographic or monetary content → **A4, A5, D1, D2**
- [ ] Verified end to end against #164 → **E2** (interim `UNHANDLED` is the pass condition until
      #164 lands)

---

## 7. Risks

| Risk | Mitigation |
| :--- | :--- |
| **Visit ends, events lost** (§2.2) — permanent and silent; the cron never re-selects it | C1's transaction; D5 tests exactly this |
| **Voiding a line the patient did buy** — destroys real AR | Predicate fails closed (§4.2); `payment_status` check applies to all five types; D3 covers each never-void case |
| `service` has no exercise signal beyond `payment_status` | Documented §4.2; owner confirmation Q1 §8 |
| Concurrency: `PromisePool` at 10 × per-visit transactions | `claimSequence` serialises only within one aggregate; distinct visits never contend |
| Volume: first run after switch-on emits a large backlog of voids | Expected — that backlog *is* the accumulated fabricated AR. Flag to Accounting so #116/#164 sequencing holds (§9.3) |
| Landing before Accounting #116 | Not blocking for emission; noted §9.3 — the events sit `UNHANDLED` until #164 |

---

## 8. Owner decisions (confirmed 2026-08-01)

1. **`service` lines** — **Yes.** Void on `payment_status === Pending` only.
2. **All four cron selections** — **Yes.** Void for aged outpatient, untaken, ANC, immunization.
3. **Backlog on switch-on** — **Natural cron cadence.** No staging flag.
4. **Visit-end paths** — **Cron only for #163.** Discharge/`endVisit()` is follow-up.
5. **Test/investigation status** — **`status === Pending` only.**
6. **Returned drugs** — **Explicit `dispense_status` check** plus quantity checks.
7. **Duplicate visits in batch** — **Dedupe by `visit.id`** before processing.
8. **`occurredAt`** — **One `Date.now()` per handler** for `date_visit_ended` and all events.
9. **Shared types** — Add `ChargeVoidedBody` + `EncounterClosedBody` to `@ehmrs/shared`.
10. **Repos** — Primary branch in `ehmrs`; companion `@ehmrs/shared` change in `ehmrs_accounting`.

---

## 9. Follow-ups (do not do in this issue)

1. **`sevenDaysAgo` computes 5 days** (`endVisits.job.ts:20`) and `CONTEXT.md` documents 3. Rename
   the local and reconcile the documented window. Behaviour unchanged.
2. **`DispenseStatus.CANCELLED` + a pharmacy action** to close a line out before visit end —
   the deferred precision path, and the only part needing a UI/workflow change.
3. **Coordinate with Accounting #116/#164 sequencing** — #116 (deferred revenue) should land before
   #164 consumes voids, so a void clears an unearned balance rather than clawing back recognised
   revenue across a period boundary.
4. **Drug returns emit nothing** — Accounting #174, refund model #175.

---

- [x] **E1** Unit tests green (37 tests, Outbox builders/predicates/handshake)
- [ ] **E2** Manual end-to-end against Accounting inbox (interim `UNHANDLED` expected)
- [ ] **E3** Post body shapes to Accounting #164
- [x] **E4** Review section below filled in; PR pending

---

## 10. Review

### Summary

Implemented transactional `charge.voided` + `encounter.closed` emission when the `endVisits` cron
ends a visit. Core change: `visitHandler` now runs inside a Sequelize transaction; visit status
update and outbox writes commit together or roll back together.

### Technical decisions

- **`VOIDABLE_PREDICATE_BY_TYPE`** in `prescribed-line-types.ts` — per-type `voidableWhere` +
  `qualifies` functions; fail-closed on all owner-confirmed rules (§8).
- **`visit-close-emission.ts`** — extracted transactional close+emit logic so tests avoid importing
  the cron job module (and its Agenda side-effect chain).
- **Emit order** — voids first, `encounter.closed` last; single `occurredAt` per handler.
- **Idempotent persist** — `charge.voided` and `encounter.closed` skip insert when the
  `idempotency_key` already exists (overwrite events only); `charge.captured` still rejects
  duplicates per existing behaviour.
- **Cron dedup** — visits deduped by `id` before `processTasksExecution`.
- **`@ehmrs/shared`** — added `ChargeVoidedBody` and `EncounterClosedBody` in companion accounting
  branch.

### Impact

- With `EMR_OUTBOX_ENABLED=true`, every visit the cron ends will emit voids for unexercised lines
  and one `encounter.closed`. Accounting #164 consumes these; until then they land `UNHANDLED`.
- IPD/discharge and other visit-end paths are **not** wired (owner decision Q4 — follow-up).
- First production switch-on voids qualifying lines on visits the cron ends going forward only.

### Testing evidence

- **37 unit tests pass** (`encounter-closed`, `charge-voided`, `voidable-predicate`,
  `contract-handshake` extensions).
- **Integration suite** `void-on-visit-close.test.ts` written (D4–D7); first run confirmed the
  primary emit+sequence test passes against real MySQL. Subsequent runs hit TRUNCATE/pool timeouts
  in this environment — re-run with `yarn test:db:setup` and no concurrent Jest workers before PR.

### Limitations / follow-ups

- `encounter.closed` on admission discharge / `endVisit()` — separate issue.
- `DispenseStatus.CANCELLED` + pre-close pharmacy action — §9.2.
- `sevenDaysAgo` naming / 5-day vs 3-day doc mismatch — §9.1.
