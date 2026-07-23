# Task Plan — Issue #4 Phase A1: EMR-side transactional outbox (EMR → Accounting)

**Repo:** `ehmrs` (Express + Sequelize + MySQL + TypeScript). Branch `feat/4-a1-emr-outbox`, cut
from `svsh_branch`. **This repo's conventions govern** — `ehmrs_accounting`'s CONVENTIONS.md does
not apply here, and none of its tooling (schema guard, `Money` type, strict lint floor) exists.

**Governing ADRs** (all live in `ehmrs_accounting`, which is where the contract is defined):
**0025** (the *frozen v1 event contract* — §2 envelope, §3 idempotency, §4 sequencing, §5 HMAC),
**0018** (transactional outbox/inbox over signed HTTP; durability lives in the DB, HTTP is
transport only), **0023** (co-deployed per hospital → signed **localhost** POST; HMAC
authenticates the *sender*), **0026** (single tenant per deployment; `tenant_key` is sender
authentication, never tenant selection), **0016** (identity by reference — no demographics).

**The receiver is already live** (`ehmrs_accounting` PR #100). Build against it, not against a
reimplementation of it:
- `apps/api/src/modules/integration/inbound-signature.ts` — the exact verification.
- `apps/api/src/modules/integration/event-contract.ts` — the Zod guards this payload must pass.
- `apps/api/test/harness/emr-signer.ts` — a reference signer written from the ADR. **Our signing
  must produce byte-identical output.**

---

## Reality check — verified in this repo before planning

Every claim below was checked against the code, not assumed.

- **All five prescribed tables have `INTEGER autoIncrement` PKs** — `prescribedDrug`,
  `prescribedTest`, `prescribedService`, `prescribedInvestigation`, `prescribedAdditionalItem`.
  **This completes the verification of proposal Q3.1**, the single answer the whole idempotency
  scheme rests on: `charge:{type}:{id}` is safe only because line ids are immutable and never
  reused. It holds for all five.
- **No outbox exists anywhere** — greenfield, exactly as ADR-0018 predicted.
- **Prices are `DECIMAL(12,2)` and arrive from the driver as STRINGS** — probed against the live
  `ehmrs_prod` DB: a real `total_price` returned `'2000.00'`, `typeof === 'string'`. Money is
  therefore exact end to end and never passes through a float. **But the models annotate these
  fields as `number`**, which is wrong about the runtime type and is the single most likely
  source of a money bug here (see decision 2).
- **Consumables are not an edge case.** `prescribeBulkDrugs` auto-creates syringes and needles
  (`PrescribedAdditionalItem`) *inside the same transaction* as the injections that trigger them.
  The consumables path is driven by the main drug flow, so missing it would silently drop charges
  the patient genuinely owes.
- **16 prescribed-line creation sites across 7 files — and only 4 are inside a transaction.**
  See the table in A1.2. This is materially larger than the kickoff assumed and it sizes the
  whole phase.

### ⚠️ Contract mismatch found: there is no `encounter_id`

ADR-0025 §4 makes the **encounter** the aggregate for every event, and the live receiver enforces
it: `parseEnvelope` requires `aggregate.type === 'encounter'`, and `ChargeCapturedHandler`
dead-letters a body whose `encounter_id` disagrees with `aggregate.id`.

**All five prescribed tables carry `visit_id` and `patient_id`. None carries `encounter_id`.**
An `Encounter` model does exist, but it is a *clinical note* (`encounter_type`,
`encounter_summary`, `time_of_encounter`) hanging off a Visit — not the order-grouping ADR-0025
describes. A visit may have zero or many, so it cannot identify a charge's aggregate.

**Decision (owner, 2026-07-21): map the EMR's Visit onto the contract's encounter aggregate.**

- Emit `aggregate: { type: 'encounter', id: "visit:{visit_id}" }`, and the same value as
  `body.encounter_id` so the receiver's cross-check passes.
- The sequence counter is therefore **per visit**, which still serialises only same-visit writes
  and never across visits.
- The `visit:` prefix is deliberate: it makes the mapping **self-describing on the wire**, so an
  operator reading a payload or a DLQ row sees immediately that this id is a visit, not an
  encounter minted elsewhere. It also keeps the id namespace from colliding if a real
  encounter-grouping is introduced later.
- **This needs an ADR amendment in `ehmrs_accounting`** (A1.0) recording that for *this* EMR,
  "encounter" means "visit". Without it, a foreign EMR integrator reads ADR-0025 and builds
  against a grouping this one does not have. **Not optional** — the contract is the product's
  integration surface.

---

## Design decisions settled before implementation

1. **The payload builder is the ONLY enforcement point.** This repo has no schema guard, no
   `Money` type, and no strict lint floor. Everything ADR-0016/CONVENTIONS §1 enforce structurally
   on the Accounting side must be enforced here by one function that **rejects before insert**:
   a demographic field, a numeric (non-string) money value, or an unknown
   `external_line_ref.type`. One builder, used by every emit site, tested directly.

2. **Money is a string of integer kobo, converted from the DECIMAL string — never through a
   `number`.** *(Verified empirically; better than first assumed.)*

   **The price columns are `DECIMAL(12,2)`, and `mysql2` returns DECIMAL as a `string`.** Probed
   against the live `ehmrs_prod` database: a real `Prescribed_Drugs.total_price` row came back as
   `'2000.00'` with `typeof === 'string'`. So MySQL stores the amount exactly and the driver
   preserves that exactness all the way to us — **no float exists anywhere in the path**, and the
   conversion is pure string manipulation: strip the decimal point, pad to 2 places, `BigInt`.

   ⚠️ **The models declare `total_price: number`, which is WRONG about the runtime type.** That
   declaration is actively dangerous: it invites `Math.round(total_price * 100)`, which
   reintroduces the float trap the DECIMAL column exists to avoid. The builder must treat the
   value as the string it actually is. Where the field is typed `number`, that is a *type
   annotation bug*, not a fact — assert the runtime type in the builder and reject a real
   `number` rather than silently coercing it.

   The builder rejects any value that does not land on a whole kobo, rather than rounding it.

   **Which field:** `total_price` (owner, 2026-07-21). Note the name differs by table —
   `total_price` on `prescribedDrug` / `prescribedAdditionalItem`, but **`price`** on
   `prescribedTest` / `prescribedService` / `prescribedInvestigation`. The per-type field mapping
   lives in the closed type set (decision 3) so the two cannot drift apart.

3. **`external_line_ref.type` is a closed set of exactly five**, defined once and shared by every
   emit site. Ids are autoincrement **per table**, so they collide across tables: `drug:1` and
   `additional_item:1` are different charges. The type prefix is the only thing keeping the
   idempotency key unique, so an omitted or misspelled type is a **silent cross-table collision
   that discards a real charge as a duplicate**. A test asserts those two produce different keys.

   The set carries the **per-table price field**, because the name is not uniform:

   | `type` | Model | Price field |
   |---|---|---|
   | `drug` | `PrescribedDrug` | `total_price` |
   | `additional_item` | `PrescribedAdditionalItem` | `total_price` |
   | `test` | `PrescribedTest` | **`price`** |
   | `service` | `PrescribedService` | **`price`** |
   | `investigation` | `PrescribedInvestigation` | **`price`** |

   Keeping the field name in the same table as the type is deliberate: reading the wrong column
   would emit a wrong amount or `undefined`, and a per-site literal is exactly how that drifts.

4. **Sequence: a per-visit counter row with `SELECT … FOR UPDATE`, inside the clinical
   transaction.** Lock the counter, read `n`, write `n+1` to both the counter and the outbox row.
   Strictly monotonic per visit; serialises only concurrent writes to the *same* visit (near-zero
   in practice); never across visits. **Monotonic, NOT gapless** — a rolled-back clinical
   transaction legitimately consumes-then-releases a number. Never assert contiguity; the
   receiver processes-and-alerts on gaps rather than blocking.

5. **Emission is behind a feature flag, default OFF.** Every A1.2/A1.3 change touches a live
   clinical write path. The flag lets the table and the builder land inert, then enables emission
   per environment. A bug with the flag off costs nothing.

6. **The drainer holds only *when to run*, never the event.** Durability rests on the
   `outbox_event` table (ADR-0018). The drainer selects unsent rows with `FOR UPDATE SKIP
   LOCKED`, POSTs, and marks `sent_at`. It runs in a **separate OS-supervised process**, not the
   EMR app process (ADR-0023).

7. **Re-sign every retry with a fresh `sent_at`** (ADR-0025 Q5.2). Replaying the original
   signature makes every retry fail once the 5-minute window closes — a failure that looks like a
   key problem and is not.

---

## Phase A1 tasks — in build order

### A1.0 — Record the visit↔encounter mapping (in `ehmrs_accounting`)

- [ ] **A1.0 ADR amendment.** An ADR in `ehmrs_accounting/docs/adr/` recording that this EMR maps
  its **Visit** onto the contract's **encounter** aggregate, with the `visit:` prefix, and why
  (no order-grouping exists on its prescribed lines). Amends ADR-0025 §4 rather than editing the
  frozen contract in place.
  *AC:* A foreign-EMR integrator reading ADR-0025 is pointed at this amendment. Landed on a
  branch in the Accounting repo (its own PR).
  *Effort:* S

### A1.1 — The table, landed inert

- [ ] **A1.1a `outbox_event` model + Sequelize migration.** Columns per §2: `id` PK,
  `aggregate_type`, `aggregate_id`, `sequence` BIGINT, `event_type`, `event_version`,
  `idempotency_key` **UNIQUE**, `payload` JSON, `created_at`, `sent_at` NULL, `attempts` default
  0, `last_error` TEXT NULL. Index `(sent_at, id)` for the drainer's scan.
  Plus **`outbox_sequence`**: `aggregate_id` PK, `last_sequence` BIGINT — the counter row A1.2
  locks.
  *AC:* Migration runs and is re-runnable on a scratch MySQL DB. **No writers yet** — the table
  is inert, so this task cannot affect clinical behaviour.
  *Effort:* M
- [ ] **A1.1b The payload builder + the closed type set.** `buildChargeCapturedEvent()`:
  prescribed line → a v1 envelope. Owns the kobo conversion (decision 2), the type set (decision
  3), and the rejection rules (decision 1).
  *AC:* Unit tests: money emitted as a **string** of integer kobo; a float naira value converts
  exactly; a sub-kobo value is **rejected**, not rounded; a demographic key is rejected; an
  unknown type is rejected; **`drug:1` and `additional_item:1` produce different idempotency
  keys**; the envelope passes the **receiver's own Zod guard** (imported or vendored from
  `event-contract.ts`), including `event_id` being a **UUIDv7** (v4 is rejected there).
  *Effort:* M
- [ ] **A1.1c HMAC signing.** `signEvent()` per §5: base
  `event_id + "\n" + tenant_key + "\n" + sent_at + "\n" + sha256(raw_body)`, over the **bytes
  actually POSTed**. Headers `X-Ehmrs-Signature: v1=<hex>`, `X-Ehmrs-Key-Id`,
  `X-Ehmrs-Timestamp`. Inbound-direction key from config.
  *AC:* **Byte-identical to `ehmrs_accounting`'s reference signer** for a fixed input — asserted
  against a vector copied from it, so drift is caught here rather than as a 401 in production.
  *Effort:* S

### A1.2 — Write the outbox row inside the clinical transaction ⚠️ HIGHEST RISK

> This is the task that modifies a running clinical system. Everything above is inert; everything
> below depends on this being right. **Flag-gated (decision 5), staged site by site.**

**The 16 creation sites, verified:**

| Txn? | File | Line | Model |
|---|---|---|---|
| ✅ | `Orders/Pharmacy/pharmacy-order.repository.ts` | 141 | `PrescribedDrug.bulkCreate` |
| ✅ | `Orders/Radiology/radiology-order.repository.ts` | 74 | `PrescribedInvestigation.bulkCreate` |
| ✅ | `Orders/Radiology/radiology-order.repository.ts` | 207 | `PrescribedDrug.bulkCreate` |
| ✅ | `Orders/Radiology/radiology-order.repository.ts` | 208 | `PrescribedAdditionalItem.bulkCreate` |
| ❌ | `Orders/Pharmacy/pharmacy-order.repository.ts` | 96 | `PrescribedDrug.create` |
| ❌ | `Orders/Pharmacy/pharmacy-order.repository.ts` | 299 | `PrescribedAdditionalItem.create` |
| ❌ | `Orders/Pharmacy/pharmacy-order.repository.ts` | 358 | `PrescribedAdditionalItem.bulkCreate` |
| ❌ | `Orders/Laboratory/lab-order.repository.ts` | 17 | `PrescribedTest.create` |
| ❌ | `Orders/Laboratory/lab-order.repository.ts` | 34 | `PrescribedTest.bulkCreate` |
| ❌ | `Orders/Service/service-order.repository.ts` | 16 | `PrescribedService.bulkCreate` |
| ❌ | `Orders/Service/service-order.repository.ts` | 36 | `PrescribedService.create` |
| ❌ | `Orders/Radiology/radiology-order.repository.ts` | 45 | `PrescribedInvestigation.create` |
| ❌ | `Admission/admission.repository.ts` | 122 | `PrescribedService.create` |
| ❌ | `Surgery/surgery.repository.ts` | 28 | `PrescribedService.create` |
| ❌ | `Visit/visit.repository.ts` | 903 | `PrescribedDrug.bulkCreate` |
| ❌ | `Visit/visit.repository.ts` | 948 | `PrescribedAdditionalItem.bulkCreate` |

- [ ] **A1.2a Emit from the 4 already-transacted sites.** Smallest blast radius first: these
  already have a `t` to join, so the change is "add one INSERT to an existing transaction".
  *AC:* A forced failure between the prescribed-line INSERT and the outbox INSERT leaves
  **neither**. Existing clinical tests pass. Added latency **measured**, not assumed.
  *Effort:* M
- [ ] **A1.2b Give the 12 untransacted sites a transaction, then emit.** Each becomes
  `sequelizeConnection.transaction(async t => …)` with both writes inside. Staged **one file at a
  time**, each its own commit, so a regression is bisectable to a single clinical path.
  **This is a real behaviour change beyond the outbox:** these writes are currently
  non-atomic among themselves (e.g. `visit.repository.ts` creates drugs at :903 and consumables
  at :948 with no transaction, so a failure between them already leaves a half-written
  prescription). Wrapping them **fixes** that, but it changes failure semantics on a live path
  and must be called out in review rather than smuggled in as outbox plumbing.
  *AC:* Per file: forced-failure leaves neither; existing tests pass; latency measured.
  *Effort:* L
- [ ] **A1.2c The per-visit sequence counter.** `SELECT … FOR UPDATE` on `outbox_sequence` inside
  the same transaction (decision 4).
  *AC:* Two concurrent orders on the **same** visit get distinct increasing sequences — proven
  with a **real concurrent** test (two open transactions), not a serial one. Different visits do
  not contend. **No contiguity assertion anywhere.**
  *Effort:* M

### A1.3 — Emit from all five prescribed types

- [ ] **A1.3 Every type emits, driven off the shared closed set.** A test per type, enumerated
  from the type set so **adding a sixth prescribed table later fails the suite** rather than being
  silently forgotten.
  *AC:* Prescribing each of the five produces **exactly one** outbox row with the right `type` and
  a money-as-string amount. **All five covered** — consumables included.
  *Effort:* M

### A1.4 — The drainer

- [ ] **A1.4 Supervised drainer process.** Payload-free recurring tick. Body: `SELECT … WHERE
  sent_at IS NULL ORDER BY id LIMIT N FOR UPDATE SKIP LOCKED` → signed localhost POST → mark
  `sent_at` / bump `attempts` / record `last_error`. Dead-letters after N attempts with the reason
  retained. Runs **outside the EMR app process** (ADR-0023).
  *AC:* Kill + restart resumes draining. A double-run never double-sends (SKIP LOCKED +
  concurrency 1). A 5xx from the receiver retries with a **fresh signature**; a 401 does not
  retry blindly (it is a key problem, not a transient one) and surfaces.
  *Effort:* M

### A1.5 — Prove it against the real receiver

- [ ] **A1.5 The handshake.** Against a **running `ehmrs_accounting` inbox**, not a mock:
  a signed event drains → **202 accepted** → a resend **dedupes** → a tampered body is
  **rejected 401** → the Accounting side shows a real journal entry.
  *AC:* Observed end-to-end, not asserted. This is the bulk of Phase D's tracer once Direction B
  lands.
  *Effort:* M

### A1.6 — Gates

- [ ] **A1.6a** The EMR repo's own lint + test suites green, **including pre-existing clinical
  tests** (A1.2 touches live write paths).
- [ ] **A1.6b** Latency on the clinical path measured before/after, with numbers recorded here.
- [ ] **A1.6c** Migration proven re-runnable.
- [ ] **A1.6d** Review section completed.
- [ ] **A1.6e** PR opened against `svsh_branch`.

---

## Risks

1. **A1.2b is the real risk, and it is bigger than the kickoff assumed.** 12 of 16 sites need a
   transaction introduced. That is not outbox plumbing — it changes failure semantics on live
   clinical paths (for the better, but really). Mitigation: flag-gated, one file per commit,
   existing clinical tests as the gate, latency measured.
2. **The kobo conversion is the money-safety chokepoint — and the models mis-declare the type.**
   The columns are `DECIMAL(12,2)` and the driver returns **strings**, so the data is exact; but
   the models annotate the fields as `number`, and that annotation invites
   `Math.round(price * 100)` — reintroducing the float trap the DECIMAL column exists to prevent.
   The EMR has no `Money` type to catch it. Mitigation: convert by **string manipulation only**,
   assert the runtime type in the builder, reject a genuine `number`, reject sub-kobo values
   rather than rounding, and test values beyond `Number.MAX_SAFE_INTEGER` kobo.
3. **Signature drift between the two repos.** The signer here and the verifier there are separate
   implementations by design (a shared helper would let both drift together silently). Mitigation:
   a fixed test vector copied from the receiver's reference signer, asserted byte-for-byte.
4. **`visit:` as the encounter id is a contract decision, not an implementation detail.** If
   A1.0's ADR does not land, ADR-0025 misleads every future integrator. It is listed first for
   that reason.

## Open questions for review

1. ~~**Which price field is authoritative?**~~ **RESOLVED (owner, 2026-07-21): `total_price`**
   — and `price` on the three tables that name it that way (decision 3's table).
   `original_total_price` is not used. Residual, for #6 rather than A1: whether NHIS/insurance
   status should change the *amount Accounting books* is coverage logic on the Accounting side;
   A1 emits the line's own price and lets #6 resolve the split.
2. **Should `A1.2b`'s transaction-wrapping ship as its own PR, ahead of the outbox?** It is a
   defensible standalone improvement (those sites are already non-atomic), and separating it would
   make the outbox PR much easier to review. Slower, but cleaner history and a smaller blast
   radius per merge.
3. **Retry/dead-letter thresholds** for A1.4 — N attempts and backoff shape. Proposed: 5 attempts,
   exponential from 30s, then dead-letter with `last_error` retained.

## Review

*(Completed at implementation.)*
