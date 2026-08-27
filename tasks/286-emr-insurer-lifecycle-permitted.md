# Task Plan — Accounting #286 (EMR half): apply the insurer lifecycle

**Counterpart:** Accounting PR #292 (`ehmrs_accounting`), which adds `authorisation.granted` to the
frozen outbound contract and wires the three emissions. **This is the half that applies them.**

**Governing ADRs (Accounting's numbering):** **0025** (the frozen v1 event contract), **0039**
(this amendment — `authorisation.granted` added to the closed outbound set), **0023** (co-deployed
per hospital), **0011** (versioned external contract).

---

## Context

The EMR has declared, gated on, and rendered a `Permitted` payment status since before the reverse
channel existed — but **nothing could produce it**. `PaymentStatus.PERMITTED` is in `enums.ts:107`,
is a column value on all five `Prescribed_*` models, and is in the local gate's
`RELEASING_STATUSES` (`gate.ts:38-42`). The applier's `statusFor` handled only `payment.settled`
and `payment.refunded`, and its own comment named `authorisation.rejected` as unhandled.

So an HMO-authorised line stayed `Pending` and the pharmacy held.

## Verification before implementing

- [x] `PaymentStatus.PERMITTED` exists and is a valid column value on all five prescribed models
      <!-- evidence: file=server/src/database/enums.ts present=/PERMITTED = 'Permitted'/ -->
- [x] The local gate already treats `Permitted` as releasing, so only the producer was missing
      <!-- evidence: file=server/src/modules/Inbox/gate.ts present=/PaymentStatus.PERMITTED/ -->
- [x] No event-type allowlist in the verifier, inbox-writer, controller or processor — `statusFor`
      is the single place event types are interpreted, so the applier is the whole wiring
      <!-- evidence: test="a valid-but-unhandled reverse type is UNHANDLED, not applied and not failed" -->
- [x] `claimSequence` already implements the overwrite stale-discard, so D5's EMR obligation is to
      TEST it for the new types, not to build it
      <!-- evidence: file=server/src/modules/Inbox/applier.ts present=/async function claimSequence/ -->

## Implementation

- [x] `statusFor` gains `authorisation.granted → PaymentStatus.PERMITTED`
      <!-- evidence: test="authorisation.granted flips payment_status to Permitted and touches nothing else" -->
- [x] `statusFor` gains `authorisation.rejected → PaymentStatus.PENDING`
      <!-- evidence: test="authorisation.rejected returns the line to Pending, which HOLDS" -->
- [x] Remove the comment naming `authorisation.rejected` as unhandled; document the insurer
      lifecycle on the module docblock instead
      <!-- evidence: file=server/src/modules/Inbox/applier.ts absent=/authorisation\.rejected, stock\.received/ -->

## Tests (real MySQL, per this suite's existing posture)

- [x] A grant flips to `Permitted` and touches nothing else — decision 9 holds for authorisations
      <!-- evidence: test="authorisation.granted flips payment_status to Permitted and touches nothing else" -->
- [x] A rejection returns the line to `Pending` and the gate HOLDS
      <!-- evidence: test="authorisation.rejected returns the line to Pending, which HOLDS" -->
- [x] A `Permitted` line releases the gate without the patient having paid — the point of the slice
      <!-- evidence: test="a Permitted line releases the gate without the patient having paid" -->
- [x] **D5's EMR half:** a redelivered grant at a lower sequence is discarded, and does not claw a
      rejected line back to `Permitted`. Mutation-checked (see Review)
      <!-- evidence: test="discards a stale authorisation.granted redelivery, keeping the fresher state" -->
- [x] A grant naming a nonexistent line raises rather than silently no-opping
      <!-- evidence: test="a granted instruction naming a line that does not exist is an error, not a silent no-op" -->
- [x] The pre-existing "unhandled" test no longer uses `authorisation.rejected` as its example,
      since that type is handled now — it uses `stock.received`
      <!-- evidence: test="a valid-but-unhandled reverse type is UNHANDLED, not applied and not failed" -->

---

## Review

### Summary

`statusFor` gains two cases; everything else was already in place. The change is 15 lines of source
(two `case` arms plus the docblock) and 6 tests. No migration — `Permitted` is already a valid
enum value in the schema, on all five prescribed-line tables.

### What was already built, and what this needed

The valuable finding is how little was missing. `PERMITTED` was already a storable column value and
already in the gate's releasing set; `claimSequence` already implemented the overwrite
stale-discard generically, keyed on the aggregate rather than the event type. There is no
event-type allowlist anywhere in the inbox path — verifier, writer, controller and processor all
pass `event_type` straight through — so `statusFor` really is the single interpretation point.

That means the gap was exactly what the issue said it was: a missing producer for a status the
whole system was otherwise ready to honour.

### D5's split obligation, now closed on both sides

Accounting proves *monotonic per-encounter allocation*; the EMR proves the *discard*. The EMR half
is now asserted, and it is not a tautology — disabling the `sequence <= applied` guard in
`claimSequence` makes it fail:

```
✕ discards a stale authorisation.granted redelivery, keeping the fresher state
Tests: 1 failed, 12 skipped, 13 total
```

The test is deliberately shaped as grant(4) → reject(5) → **redelivered** grant(4), so it asserts
the consequence that matters clinically: a late redelivery must not resurrect `Permitted` on a line
the HMO has since refused.

### An honest scoping note on "the pharmacy holds"

The issue's framing — an authorised line held at the counter — is true of the **local** gate
(`Inbox/gate.ts`), which reads the recorded `payment_status`. But that gate is **deliberately
unwired** (#137): its own docblock says no release path calls it. The authoritative gate is
`Outbox/gate-check.ts`, which asks **Accounting** over signed HTTP and never reads the EMR's local
column.

So this change makes the EMR **record and display** `Permitted` correctly, and makes the local gate
agree. Whether a dispense is released is decided Accounting-side, by the same reverse-channel state
this slice now applies. Both halves matter; neither one alone is "the fix".

### Testing evidence

- `applier.test.ts` — **13 passing** (7 pre-existing + 6 new), real MySQL.
- Full Inbox + Outbox suites — **19 suites, 208 tests**, all passing.
- `npx tsc --noEmit` — clean. `npx eslint` on both changed files — clean.
- Stale-discard test mutation-checked (above).

### Discovered limitations

- **No `Declined` status.** `authorisation.rejected` maps to `Pending`, so "the HMO refused" and
  "nobody has asked yet" are indistinguishable in the row. They gate identically, so this is UX
  rather than correctness — and it would cost a MySQL `ALTER` across five tables plus every
  `payment_status` switch in the Vue client. Out of scope, as Accounting's issue records.
- **Authorisation expiry is not honoured.** Once `Permitted`, always `Permitted`: a lapsed
  authorisation still releases. Accounting now sends `expires_at` on the wire, so the raw material
  is here when that decision lands, but nothing reads it yet.
- **Test database provisioning.** This machine's `server/.env` carries only `TEST_DB_HOST`, not
  `TEST_DB_USER`/`TEST_DB_PASS`/`TEST_DB_NAME`, so `yarn test` cannot connect as-is. The suite was
  run with those supplied inline against a freshly provisioned `ehmrs_test`
  (`node src/database/test-schema/setup-test-db.js`). Worth adding to `.env` locally; not a code
  change and not touched here.
