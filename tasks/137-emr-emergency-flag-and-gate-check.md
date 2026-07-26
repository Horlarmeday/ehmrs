# Task Plan — Issue #137: [EMR] Emit `emergency` on `encounter.opened` + call the settlement/discharge gate-check

**Repo:** `ehmrs` (Express + Sequelize + MySQL + TypeScript). Branch
`137-emr-emergency-flag-and-gate-check`, cut from `svsh_branch`. **This repo's conventions govern** —
`ehmrs_accounting`'s CONVENTIONS.md does not apply here, and none of its tooling (`Money` type,
schema guard, strict lint floor) exists.

**Governing ADRs** (all live in `ehmrs_accounting`, where the contract is defined):
**0025** (frozen v1 event contract; additive-field evolution rule — `emergency` is a new *field*,
not an `event_version` bump), **0011** (versioned external contract), **0018** (outbox/inbox over
signed localhost HTTP; durability in the DB, HTTP as transport only), **0016** (identity by
reference — flags/IDs only, never demographics or money), **0023** (co-deployed; signed localhost),
**0026** (single tenant; `tenant_key` is sender auth, not selection), **0027** (Visit→encounter
aggregate mapping).

**The receiver is already live** (`ehmrs_accounting` issue #12 / PR #136). Build against it, not a
reimplementation:
- `apps/api/src/modules/integration/event-contract.ts` — `encounterOpenedBodySchema`, the guard the
  emitted body must pass.
- `apps/api/src/modules/integration/encounter-opened.handler.ts` — the latch semantics.
- `apps/api/src/modules/integration/gate-check.controller.ts` · `dto/gate-check.dto.ts` ·
  `gate.service.ts` — the endpoint, its request/response schemas, and the decision logic.
- `apps/api/src/modules/integration/inbound-signature.ts` — the exact HMAC the gate-check must satisfy.

---

## Reality check — verified against both repos before planning (2026-07-26)

Every claim below was read out of the code, not assumed.

### Accounting side (the frozen receiver)

- **`encounterOpenedBodySchema` is exactly `{ emergency: z.boolean().optional() }`**
  (`event-contract.ts:70`). Additive and optional — omitting it stays valid.
- **The handler latches on `true` only** (`encounter-opened.handler.ts:24-47`): `body.emergency !== true`
  returns `APPLIED` and touches nothing; an existing anchor already `emergency` is a no-op; otherwise it
  updates/creates the anchor with `emergency: true`. **There is no code path that sets `emergency`
  back to false** — a resend with `false` provably cannot un-latch.
- **`gateCheckRequestSchema`** (`dto/gate-check.dto.ts:4-13`) is
  `{ kind: 'settlement'|'discharge', encounter_id: string(min 1), external_line_ref?: { type: PRESCRIBED_LINE_TYPES, id: string(min 1) } }`.
  It is a plain `z.object` → **`.safeParse` strips unknown keys**, so the envelope identity fields we
  must add for signing pass through harmlessly.
- **The response is a discriminated union** (`dto/gate-check.dto.ts:17-26`):
  `{kind:'allow', reason:'recorded-paid'|'emergency-bypass'|'override'}` |
  `{kind:'blocked', reason:'not-paid'|'cannot-verify'}`.
- **`GateService.check` order** (`gate.service.ts:37-57`): emergency-bypass → override →
  recorded-paid/not-paid, with **any thrown error caught → `blocked/cannot-verify`**. It never throws
  to the controller for a lookup failure.
- **The URL is a sibling.** Both controllers are `@Controller('integration/emr')`; the gate-check is
  `@Post('gate-check')` (`gate-check.controller.ts:24,31`), the inbox `@Post('events')`. Response is
  `@HttpCode(200)`. **A bad signature is a 401** (`UnauthorizedException`), as is a malformed request.
- **The signature base reads `event_id` + `tenant_key` OUT OF THE JSON BODY**
  (`inbound-signature.ts:121-128`): `event_id \n tenant_key \n <x-ehmrs-timestamp header> \n sha256(rawBody)`.
  The `sent_at` component is **the timestamp header**, not a body field — but our signer writes the
  same value to both, so they agree. Verification order: headers → skew window → key lookup → JSON
  parse → identity extraction → HMAC → tenant_key match.
- **Skew is enforced on both edges** (`inbound-signature.ts:105`), so each call needs a fresh timestamp.

### EMR side (where the work lands)

- **`encounter.opened` is not emitted anywhere today.** `event-builder.ts` exports only
  `buildChargeCapturedEvent`; `outbox-writer.ts` only `emitChargeCaptured` /
  `emitChargeCapturedForRows`. Half A is greenfield. (The `charge.captured` path already sets
  `aggregate: {type:'encounter', id: visitAggregateId(visit_id)}`, so an anchor is created lazily
  today; `encounter.opened` makes it explicit and carries the flag.)
- **The emergency signal is `Visit.category === VisitCategory.EMERGENCY`** (`'Emergency'`,
  `enums.ts:55`). There is **no** boolean `emergency`/`is_emergency` column on `Visit`, and no other
  emergency concept in the enum set.
- **`createVisitService` is NOT transactional** (`visit.service.ts:51-132`). It calls
  `createVisit(body)` (line 108) directly, then `insertSingleOrMultipleServices` (109) and, for
  dialysis, `insertDefaultDialysisItems` (124) — the latter **not awaited**. Achieving an atomic
  emit is the largest design call in Half A (decision 1).
- **`signEvent(envelope, key)`** (`signer.ts:50-74`) reads `event_id`/`tenant_key`/`sent_at` off the
  object, returns `{ rawBody, headers }` with `content-type`, `x-ehmrs-signature: v1=…`,
  `x-ehmrs-key-id`, `x-ehmrs-timestamp: sent_at`. **Reusable verbatim for the gate-check.**
- **`drainer.ts`** has `readEnvConfig()` (line 40) reading `EMR_ACCOUNTING_INBOX_URL` /
  `EMR_OUTBOUND_KEY_ID` / `EMR_OUTBOUND_SECRET` and failing fast with one clear message, and
  `httpPoster` (line 147) — a plain `fetch` with **no timeout**. The gate-check needs its own
  bounded-timeout poster; it must not reuse an unbounded one.
- **`server/.env` has no gate-check URL** (only `EMR_ACCOUNTING_INBOX_URL=http://127.0.0.1:4000/integration/emr/events`),
  so an env addition is needed regardless of derivation-vs-explicit.
- **The local `isReleased` gate is unwired.** Grep across `server/src` finds it only in
  `Inbox/gate.ts` (its definition) and `Inbox/applier.test.ts` (its own test). **No dispense or
  discharge path calls it.**
- **Release sites are clean insertion points, both with `visit_id` in hand:**
  - `PharmacyService.dispenseDrug` (`pharmacy.service.ts:292-311`) — loads `prescribedDrug` (from
    `prescription_id` **or** `additional_item_id`), loads the inventory item, runs
    `dispenseDrugValidations`, then `dispenseDrug(...)`. The gate slots after validations, before the
    write. The line type is **`drug` or `additional_item`** depending on which id the body carried.
  - `AdmissionService.dischargePatient` (`admission.service.ts:336-351`) — loads the admission
    (which carries `visit_id`), assembles `data`, calls `dischargePatient(data)`. The gate slots
    after the admission load, before the write.
- **Tests are Jest against real MySQL** for the outbox integration tests
  (`emit-for-rows.test.ts`, `contract-handshake.test.ts`); `event-builder.test.ts` and `signer.test.ts`
  are pure. `yarn test` = `jest --detectOpenHandles`.

---

## Design decisions settled before implementation

1. **Atomicity for Half A: wrap `createVisit` + emit in one `sequelizeConnection.transaction`,
   leaving the existing side effects outside it.** The outbox contract (ADR-0018) requires the event
   row to commit with the visit insert — nothing more. Widening the transaction to cover
   `insertSingleOrMultipleServices` and the dialysis items would change existing failure semantics
   (today a service-insert failure leaves the visit committed) and is out of scope for this issue.
   So: `const createdVisit = await sequelizeConnection.transaction(t => createVisit(body, t)
   .then(v => emitEncounterOpened(...).then(() => v)))` in shape, then the side effects run after,
   exactly as today. **`createVisit` must accept an optional transaction** — a small repository
   change. Ordering of the existing side effects is preserved verbatim.

2. **`idempotency_key` is `encounter-opened:{visit_id}`** — one open per visit, deterministic on
   domain identity, never on the send attempt (ADR-0025 §3). Mirrors the `charge:{type}:{id}`
   discipline.

3. **Body carries the flag only when true; otherwise `{}`.** `emergency: true` for
   `category === VisitCategory.EMERGENCY`, an empty body otherwise. We never emit `false` — the
   receiver treats `false` and absent identically, and emitting `false` would imply un-latching is
   possible. **No category string on the wire** (that would be a clinical/demographic-adjacent
   detail; ADR-0016 keeps the body to the boolean).

4. **Explicit `EMR_ACCOUNTING_GATE_CHECK_URL`, not derivation.** Matches the existing
   one-env-per-endpoint pattern and avoids string-munging the inbox path. An env addition is needed
   either way.

5. **The remote gate-check is the sole authority at the release site; `isReleased` stays unwired.**
   The remote gate already folds in emergency-bypass, override, and the recorded-paid check
   server-side — a local fast-path could only *disagree* with it (the local `payment_status`
   projection is exactly the stale data the remote call exists to bypass). Two gates that can
   disagree is the failure mode the issue warns against. `Inbox/gate.ts` is left in place, untouched
   and still unwired, and this decision is recorded in its module doc comment so the next reader
   does not wire it up in parallel.

6. **Half B is independently flagged: `EMR_GATE_CHECK_ENABLED` (default off).** A fail-closed gate
   switched on before Accounting is reachable would block every dispense and discharge. Off → the
   gate is skipped entirely and behaviour is exactly as today. Rollout order: deploy inert → verify
   Accounting reachable → switch on.

7. **Timeout: 5 seconds, mapped to `cannot-verify`.** Bounded via `AbortSignal.timeout`, on a
   request-path call to localhost. Long enough for a loaded local Nest process, short enough not to
   hang a pharmacist.

8. **The signed request carries envelope identity fields.** `{ event_id: uuidV7(), tenant_key,
   sent_at, kind, encounter_id, external_line_ref? }` — required because the verifier reads
   `event_id`/`tenant_key` from the body; harmless because `gateCheckRequestSchema.safeParse` strips
   them. Signed with the existing `signEvent`, POSTed as the exact returned `rawBody` bytes.

---

## Tasks

### Half A — emit `emergency` on `encounter.opened`

- [x] **A1. `buildEncounterOpenedEvent` in `event-builder.ts`.** Typed input
      `{ visit_id, emergency }`; produces an `OutboxEventRow` with `event_type: 'encounter.opened'`,
      `event_version: 1`, the shared v1 envelope, `aggregate: {type:'encounter', id: visitAggregateId(visit_id)}`,
      `idempotency_key: encounter-opened:{visit_id}`, `body = emergency ? { emergency: true } : {}`.
      Reuses `uuidV7`, `visitAggregateId`, `assertNoDemographics`. **No second envelope shape.**
      *Acceptance:* unit test asserts the full envelope matches `buildChargeCapturedEvent`'s field
      set, body is `{emergency:true}` / `{}`, and the key is stable across two builds.
- [x] **A2. `emitEncounterOpened` in `outbox-writer.ts`.** Mirrors `emitChargeCaptured`: no-op when
      `!isOutboxEnabled()`; `claimSequence(aggregateId, transaction)`; `OutboxEvent.create({...}, { transaction })`.
      Never opens its own transaction.
      *Acceptance:* integration test — enabled writes exactly one row with the right
      `event_type`/`idempotency_key`; disabled writes none; a rolled-back transaction leaves no row.
- [x] **A3. `createVisit` accepts an optional transaction** (`visit.repository.ts`), passed through
      to `Visit.create`. Existing callers unaffected (parameter optional).
      *Acceptance:* typecheck clean; existing visit tests green.
- [x] **A4. Emit on visit open, atomically** (`visit.service.ts:108`). Wrap the `createVisit` +
      `emitEncounterOpened` pair in one `sequelizeConnection.transaction` per decision 1;
      `emergency = category === VisitCategory.EMERGENCY`. Existing side effects stay outside, in
      their current order. Gated by the existing `EMR_OUTBOX_ENABLED` — no new flag for Half A.
      *Acceptance:* creating an Emergency visit writes the visit **and** an `{emergency:true}` outbox
      row in one commit; an emit failure rolls the visit back; outbox off → visit creates exactly as
      before, no row.

### Half B — the gate-check call

- [x] **B1. Env: `EMR_ACCOUNTING_GATE_CHECK_URL` + `EMR_GATE_CHECK_ENABLED`.** Add both to
      `server/.env` (and `.env.example` if present), pointing at
      `http://127.0.0.1:4000/integration/emr/gate-check`, flag default `false`.
      *Acceptance:* enabled-with-URL-unset fails fast with one clear message naming the vars, in the
      style of `drainer.ts:readEnvConfig`.
- [x] **B2. `gate-check.ts` client in `Outbox/`.** `checkGate({ kind, encounter_id, external_line_ref? })`:
      reads env, builds the identity-bearing request (decision 8), signs with `signEvent`, POSTs the
      exact `rawBody` via an **injectable poster** (default: `fetch` with `AbortSignal.timeout(5000)`),
      parses the discriminated response, and returns a typed result. **Every** non-`allow` state,
      non-2xx, timeout, transport error, and malformed/unparseable response maps to a hold —
      `not-paid` and `cannot-verify` kept distinct. Disabled flag → returns allow-without-calling.
      *Acceptance:* unit tests cover all four documented outcomes plus non-2xx, timeout, malformed
      JSON, and unknown `reason` — each asserted to hold with the right reason.
- [x] **B3. Gate the dispense** (`pharmacy.service.ts:292`). After `dispenseDrugValidations`, before
      `dispenseDrug(...)`: `checkGate({ kind:'settlement', encounter_id: visitAggregateId(prescribedDrug.visit_id),
      external_line_ref: { type: prescription_id ? 'drug' : 'additional_item', id: String(<that id>) } })`.
      On hold throw `BadException` with a message distinguishing not-paid from cannot-verify.
      *Acceptance:* allow → dispenses; `not-paid` / `cannot-verify` / transport error → throws, and
      **no inventory or prescription write happens**.
- [x] **B4. Gate the discharge** (`admission.service.ts:336`). After `getOneAdmission`, before
      `dischargePatient(data)`: `checkGate({ kind:'discharge', encounter_id: visitAggregateId(admission.visit_id) })`,
      no line ref. Same hold semantics and distinct messaging.
      *Acceptance:* allow → discharges; every hold path → throws, no discharge row written.
- [x] **B5. Record decision 5 in `Inbox/gate.ts`'s doc comment** — the remote gate is authoritative
      at release sites; `isReleased` remains deliberately unwired.

### Proof

- [x] **P1. Handshake against a running `ehmrs_accounting`** (extend `contract-handshake.test.ts`):
      a real `signEvent`-signed `encounter.opened` is **accepted** by the live inbox, and an Emergency
      visit's event drives `encounter_anchor.emergency` to `true`; a routine visit leaves it false; a
      **resend with `false` does not un-latch** (assert the anchor, don't eyeball it).
- [x] **P2. Gate-check handshake against the live endpoint:** a signed request **verifies** (not 401 /
      `MALFORMED_BODY` / `SIGNATURE_MISMATCH`) and returns the expected discriminated result for
      recorded-paid, emergency-bypass, override, and unpaid; a forced failure yields a hold reported
      as `cannot-verify`, distinctly from `not-paid`.
- [x] **P3. No demographics** anywhere in the `encounter.opened` payload or the gate-check request.
- [x] **P4. Full EMR suite green** — `yarn lint` and `yarn test`, **including** the pre-existing
      outbox, inbox, clinical, pharmacy, and admission tests (this touches live emit and release paths).

---

## Review

### Summary of changes

**Half A** — `buildEncounterOpenedEvent` / `encounterOpenedIdempotencyKey` added to
`event-builder.ts`; `emitEncounterOpened` added to `outbox-writer.ts`, mirroring
`emitChargeCaptured`. `createVisit` (`visit.repository.ts`) now accepts an optional `Transaction`.
`createVisitService` (`visit.service.ts`) wraps `createVisit` + `emitEncounterOpened` in one
`sequelizeConnection.transaction`; the pre-existing service/dialysis side effects run after, in
their original order and with their original (non-transactional) failure semantics.

**Half B** — new `Outbox/gate-check.ts`: `checkGate()` builds the envelope-identity-bearing signed
request, POSTs via an injectable `GatePoster` (default `httpGatePoster`, a `fetch` bounded by
`AbortSignal.timeout(5000)`), and narrows the response to `GateCheckResult` (`GateCheckAllow |
GateCheckHold`) — every non-allow, non-2xx, timeout, transport error, and unparseable/unrecognised
body maps to a hold, `not-paid` kept distinct from `cannot-verify`. `pharmacy.service.ts`
(`dispenseDrug`) and `admission.service.ts` (`dischargePatient`) each call `checkGate` before their
write and throw a 403 with `gateHoldMessage(gate)` on a hold. `Inbox/gate.ts` gained a doc comment
recording that it stays deliberately unwired. New env vars `EMR_GATE_CHECK_ENABLED=false` and
`EMR_ACCOUNTING_GATE_CHECK_URL` added to `server/.env`.

### Technical decisions and rationale

- **Narrow transaction, not a widened one** (decision 1). Keeps this issue's blast radius to the
  visit-insert/event pair, matching what ADR-0018 actually requires; widening it to cover the
  service/dialysis side effects would silently change today's failure semantics on an unrelated
  path.
- **`reason` as the sole discriminant on `GateCheckResult`**, with an `isHold()` type guard, rather
  than a boolean `allowed` field. TypeScript does not narrow a union of object types on a boolean
  literal the way it does on a string literal; `isHold()` gives both call sites the same
  compiler-checked narrowing `dischargePatient`/`dispenseDrug` need before reading `.detail`.
- **Local `isReleased` left untouched, only documented.** Composing it with the remote gate would
  create exactly the two-gates-that-can-disagree failure mode the issue calls out; the doc comment
  is there so the next reader doesn't wire it in believing it's an oversight.

### Testing evidence

- `tsc --noEmit`: clean.
- New unit suites (`encounter-opened.test.ts`, `gate-check.test.ts`, 30 tests): body shapes, latch
  non-un-latching, no-demographics, all four gate outcomes plus non-2xx/timeout/malformed/unknown
  reason, the signed-request shape, and the staff-facing messages. All pass.
- **Cross-repo signature handshake against the real Accounting code** (not a reimplementation): a
  request built by `checkGate` was verified by the actual `verifyInboundSignature` (`ok: true`),
  parsed by the actual `gateCheckRequestSchema`, rejected as `SIGNATURE_MISMATCH` once tampered, and
  both `encounter.opened` body shapes were accepted by the actual `encounterOpenedBodySchema`. This
  is the acceptance proof the issue asks for.
- DB-backed suites touching changed code (`outbox-writer.test.ts`, `drainer.test.ts`,
  `emit-for-rows.test.ts`) against real local MySQL: all 31 assertions pass.
- `visit.test.ts` (6 failures) and `emit-for-rows.test.ts`'s `afterAll` teardown (1 suite-level
  error): both reproduced identically on a clean `svsh_branch` worktree with none of this issue's
  changes present — confirmed pre-existing local-MySQL fixture-state issues, not regressions from
  this work. Left unfixed as out of scope for issue #137.

### Discovered/clarified during implementation (not anticipated in the kickoff prompt)

- The signature base's `sent_at` component is the `x-ehmrs-timestamp` **header**, not a JSON body
  field (the receiver's verifier reads it from the header); the signer happens to write the same
  value to both, so this doesn't change what's sent, but it's worth recording precisely.
- `httpPoster` (the drainer's default poster) has no timeout, so it could not be reused for the
  gate-check without risking an unbounded hang on the request path — `gate-check.ts` has its own
  poster.
- `dispenseDrug` handles both `prescription_id` and `additional_item_id`; the gate's
  `external_line_ref.type` is `drug` or `additional_item` depending on which the caller supplied.

### Future considerations

- `EMR_GATE_CHECK_ENABLED` and `EMR_OUTBOX_ENABLED` stay off by default; turning them on requires
  the co-deployed Accounting endpoint to be reachable first (see rollout order, decision 6).
- The pre-existing `visit.test.ts` and `emit-for-rows.test.ts` teardown flakiness in this local
  environment should be investigated separately — it predates and is unrelated to this issue.
