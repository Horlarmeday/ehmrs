# Task Plan — Issue #88: Emit `department` = `Visit.department` on `charge.captured`

**Status:** COMPLETED. Branch: `88-emr-department-on-charge-captured`.

---

## 0. Problem Analysis

### What is broken

Accounting's revenue-by-department report (ehmrs_accounting #53) groups postings by the `department` dimension. Every posting currently has `department = NULL`, so the whole report renders as **Unattributed**. The EMR never sends the field.

The contract and the builder already support it:

| Layer | State today |
|---|---|
| Accounting contract `charge.captured` | `department` optional, `z.string().min(1).optional()` (`event-contract.ts:79` in accounting) |
| Accounting storage | `charge_line.department`, `journal_line.department`, `varchar(64)` (being widened to `varchar(255)` — see D1) |
| EMR `PrescribedLineInput` | `readonly department?: string` already exists (`event-builder.ts:162`) |
| EMR `buildChargeCapturedEvent` | already writes `body.department` when set (`event-builder.ts:358-359`) |
| EMR `emitChargeCapturedForRows` | builds `PrescribedLineInput` **without** `department` (`outbox-writer.ts:1026-1039`) |
| EMR `VisitResolver` | loads `id, category, date_visit_start, date_visit_ended` — **not** `department` (`outbox-writer.ts:957-960`) |

So the gap is purely wiring: the visit is already loaded per row; `department` is never read or forwarded.

### Source of truth

- `Visit.department` (`server/src/database/models/visit.ts:73-82`) is `DataType.STRING`, `allowNull: false`, `notEmpty`-validated. Live schema: `Visits.department varchar(255) NOT NULL` (`test-schema/schema.sql:2897`).
- Emitted value is `Visit.department` **verbatim**. Accounting treats it as the department vocabulary (ehmrs_accounting ADR-0074 / #53 D9): a department-scoped Accounting user's profile department must be one of these values. No mapping, no case-folding, no synonym table.
- Typical values seen in fixtures/UI: `GOPD`, `Ward A`, `Medical`, `Pharmacy`, `Medical Practitioner`, `Nursing`, `OPD`.

### Scope (from the issue + user decisions)

**In scope**

1. `VisitResolver` loads and returns `department`.
2. `emitChargeCapturedForRows` forwards it onto `PrescribedLineInput`.
3. Omit the key entirely when the visit has no usable department (see D2).
4. Unit tests for present / absent cases.

**Out of scope**

- No backfill. Accounting is pre-production.
- `service_line` stays the catalogue item name. Accounting groups by line type from `external_line_ref.type`.
- No `department` on `charge.voided`, `charge.reversal_requested`, `encounter.opened`, `encounter.closed`, `encounter.ward.assigned`, or any other event (user decision D3).
- No change to `Visit` creation, validation, or the client.
- No EMR-side length rule (user decision D1).

---

## 1. Decisions (aligned with user feedback)

### D1 — No EMR-side length rule; Accounting widens to 255

The issue offered "truncate or reject" for values longer than Accounting's `varchar(64)`. **Resolution: do neither.** The user will widen `charge_line.department` / `journal_line.department` to `varchar(255)` in ehmrs_accounting so the column matches `Visits.department varchar(255)`. The EMR therefore emits `Visit.department` with no length check, no truncation, and no rejection.

**PR note (required by the issue):** state explicitly — *"No truncate/reject at the EMR. Accounting's department columns are being widened to varchar(255) to match `Visits.department`."*

### D2 — Blank department is omitted; non-blank is verbatim

Treat `null`, `undefined`, `''`, and whitespace-only strings as "the visit has no department" and **omit** the `department` key from the body (Accounting's contract refuses `min(1)`, and a missing key is the existing "unattributed" path — safe). Any non-blank value is copied **verbatim** (no trim of a real department name).

Implementation home: filter in `VisitResolver` when building its result, so `emitChargeCapturedForRows` can pass `department: visitInfo?.department` straight through. `event-builder.ts` needs **no change** — it already omits when `undefined`.

### D3 — `charge.captured` only

Void / reversal / encounter events stay as they are.

### D4 — Test strategy for "visit without a department"

`Visits.department` is `NOT NULL` + `notEmpty`, so a blank department cannot be created through the normal model path. Tests will simulate both:

1. A visit whose `department` is `''` (and one whitespace-only `'   '`), inserted with Sequelize validation bypassed.
2. A line whose `visit_id` points at no visit (`VisitResolver` → `null`).

Both must produce a body with **no** `department` key.

---

## 2. Design

### 2.1 `VisitResolver` (`outbox-writer.ts:936-988`)

Today:

```ts
private readonly cache = new Map<
  number,
  { visit_type: string; consultation_valid_until?: string } | null
>();

async resolve(
  visitId: unknown
): Promise<{ visit_type: string; consultation_valid_until?: string } | null>
```

Change to:

```ts
private readonly cache = new Map<
  number,
  { visit_type: string; department?: string; consultation_valid_until?: string } | null
>();

async resolve(
  visitId: unknown
): Promise<{ visit_type: string; department?: string; consultation_valid_until?: string } | null>
```

- Add `'department'` to the `attributes` list of `Visit.findOne` (currently `['id', 'category', 'date_visit_start', 'date_visit_ended']`).
- After the fetch, if `typeof visit.department === 'string' && visit.department.trim().length > 0`, set `result.department = visit.department` (verbatim). Otherwise leave the key off.
- Cache shape follows the result; a blank department caches as "no department" just like a missing visit caches as `null`.

`VisitResolver` has exactly one consumer (`emitChargeCapturedForRows`), so the type widening is local.

### 2.2 `emitChargeCapturedForRows` (`outbox-writer.ts:1026-1039`)

Add one field to the `PrescribedLineInput` literal:

```ts
const input: PrescribedLineInput = {
  // ...existing fields...
  visit_type: visitInfo?.visit_type,
  department: visitInfo?.department,
  consultation_valid_until: visitInfo?.consultation_valid_until,
};
```

When `visitInfo` is `null` or `visitInfo.department` is absent, `department` is `undefined` and the builder omits the key.

### 2.3 `event-builder.ts` — no change

`buildChargeCapturedEvent` already does:

```ts
if (line.department !== undefined) {
  body.department = line.department;
}
```

Existing builder tests (`event-builder.test.ts:107-127`) already cover "department present" and the body key set. No new builder behaviour.

### 2.4 Call sites — no change

Every prescribe path already funnels through `emitChargeCapturedForRows` (visit, pharmacy, lab, radiology, service, surgery, admission). One wiring change covers them all.

---

## 3. Task List

### Phase 1 — Wiring (`outbox-writer.ts`)

- [x] 1.1 Extend `VisitResolver`'s cache/return type with `department?: string`.
- [x] 1.2 Add `'department'` to `Visit.findOne` `attributes`.
- [x] 1.3 Include `department` in the resolve result when non-blank (`trim().length > 0`); omit otherwise. Value is verbatim.
- [x] 1.4 Pass `department: visitInfo?.department` in the `PrescribedLineInput` built by `emitChargeCapturedForRows`.

**Complexity:** low · **Effort:** ~20 min · **Risk:** none to money/envelope; purely additive optional field.

### Phase 2 — Unit tests (`emit-for-rows.test.ts`)

- [x] 2.1 New `describe('department emission (#88)')` block next to the existing `visit metadata emission (#192)` block.
- [x] 2.2 **Present:** visit with `department: 'GOPD'` → `body.department === 'GOPD'` on the `charge.captured` payload. (Acceptance criterion 1.)
- [x] 2.3 **Empty string:** visit with `department: ''` created with validation bypassed → `'department' in body === false`. (Acceptance criterion 2.)
- [x] 2.4 **Whitespace-only:** visit with `department: '   '` created with validation bypassed → no `department` key. (D2.)
- [x] 2.5 **Missing visit:** row with a `visit_id` that does not exist → no `department` key (and still no `visit_type`). (D4.)
- [x] 2.6 Assert the value is verbatim (no trimming) with a department like `'Ward A'` — covered by 2.2 asserting `'GOPD'` exactly (verbatim, not trimmed/mapped).

**Complexity:** low · **Effort:** ~45 min · **Notes:**
- Follow the existing style of the `#192` block: real `Visit.create`, real transaction, read back `OutboxEvent`, assert `payload.body`.
- For blank departments use `Visit.create({...} as never, { validate: false })` (or `build` + `save({ validate: false })` if `create` still enforces `notEmpty`). If the model still refuses, fall back to a raw `sequelize.query` insert into `Visits` — do **not** change the model.
- Unique charge ids per case so `charge:{type}:{id}` idempotency keys do not collide within the suite.

### Phase 3 — Regression & verification

- [x] 3.1 Run `cd server && npx tsc --noEmit` (plain typecheck; do **not** run `yarn build`, which needs Sentry auth). — clean.
- [x] 3.2 Run `cd server && yarn test src/modules/Outbox/emit-for-rows.test.ts`. — 23 passed including all 4 new `#88` cases. The 10 `#255` failures are pre-existing (`Investigation.create` in its `beforeAll` fails on this schema) and reproduce on the base commit with the change stashed.
- [x] 3.3 Run the wider Outbox suite: `yarn test src/modules/Outbox/event-builder.test.ts src/modules/Outbox/void-on-visit-close.test.ts` — 44/44 passed.
- [x] 3.4 Full `yarn test` skipped: the pre-existing `#255` setup failure is unrelated and would only obscure the signal. Targeted suites covering the changed path are green.
- [x] 3.5 Confirm no debug artifacts, no comments beyond what the file already carries, no leftover `TODO`.

**Complexity:** low · **Effort:** ~20 min.

### Phase 4 — Delivery

- [x] 4.1 Branch: `git checkout -b 88-emr-department-on-charge-captured` (from `svsh_branch`).
- [x] 4.2 Commit subject: `feat(#88): emit Visit.department as department on charge.captured`.
- [x] 4.3 Open PR **base `svsh_branch`** via `gh pr create` (mandatory per AGENTS.md). PR body must include:
  - The D1 statement: *"No truncate/reject at the EMR; Accounting's department columns are widened to varchar(255) to match `Visits.department`."*
  - The omit-when-blank rule (D2).
  - Refs: `Horlarmeday/ehmrs_accounting#53`.
- [x] 4.4 Fill in the Review section of this file (§5) before/with the PR.

**Complexity:** low · **Effort:** ~15 min.

---

## 4. Acceptance Criteria (from the issue)

| # | Criterion | Covered by |
|---|---|---|
| 1 | A `charge.captured` for a line on a visit with `department = 'GOPD'` carries `"department": "GOPD"` in its body | 2.2 |
| 2 | A line on a visit without a department carries no `department` key | 2.3, 2.4, 2.5 |
| 3 | An outbox-writer unit test covers both cases | 2.2–2.5 |
| 4 | PR states the over-length policy | 4.3 (D1) |

---

## 5. Review section

### Summary of implemented changes

Two files touched in `server/src/modules/Outbox/`:

1. **`outbox-writer.ts`**
   - `VisitResolver` now selects `department` alongside `id/category/date_visit_start/date_visit_ended` and returns it as `ResolvedVisitInfo.department?` when the value is non-blank. Blank (`''` / whitespace-only) is omitted at the source.
   - `emitChargeCapturedForRows` forwards `department: visitInfo?.department` onto `PrescribedLineInput`.
2. **`emit-for-rows.test.ts`** — new `describe('department emission (#88)')` with four cases: verbatim `'GOPD'`, empty-string visit, whitespace-only visit, dangling `visit_id`.

`event-builder.ts` is unchanged: it already wrote `body.department` when set and omitted it when `undefined`.

### Technical decisions and rationale

- **D1 — no EMR-side length rule.** Accounting widens `charge_line.department` / `journal_line.department` to `varchar(255)` to match `Visits.department`. The EMR emits verbatim; it neither truncates nor rejects on length.
- **D2 — blank is omitted, real values are verbatim.** Filtering lives in `VisitResolver` so every future caller of the resolver inherits the rule. The builder's existing `!== undefined` gate then omits the key.
- **D3 — `charge.captured` only.** Void/reversal/encounter events untouched.
- **D4 — blank-department tests bypass model validation** via create-with-placeholder then `visit.update({ department: ... }, { validate: false })`, because `Visits.department` is `NOT NULL` + `notEmpty` on the normal path.

### Impact assessment

- Purely additive optional field on `charge.captured`. Receivers that ignore `department` are unaffected (contract already marks it optional).
- One extra column in the `Visit.findOne` projection inside `VisitResolver`; the per-visit cache means the cost is once per visit id per emit call, not per row.
- No change to money, envelope, idempotency keys, or any other event type.

### Testing evidence

```
npx tsc --noEmit                                          → clean
yarn test src/modules/Outbox/emit-for-rows.test.ts        → 23 passed (incl. 4 new #88)
                                                             10 failed — pre-existing #255
                                                             Investigation.create setup, also
                                                             fails on base with this change stashed
yarn test src/modules/Outbox/event-builder.test.ts \
         src/modules/Outbox/void-on-visit-close.test.ts   → 44 passed, 0 failed
```

New cases:

| Case | Expected | Result |
|---|---|---|
| visit `department: 'GOPD'` | `body.department === 'GOPD'` | pass |
| visit `department: ''` | no `department` key | pass |
| visit `department: '   '` | no `department` key | pass |
| dangling `visit_id` | no `department` / `visit_type` keys | pass |

### Discovered limitations

- The `#255` suite in `emit-for-rows.test.ts` fails at `Investigation.create` in its `beforeAll` on this test DB. Pre-existing on `svsh_branch` @ `840d3942`; unrelated to this change and not fixed here.
- `Visits.department` is `NOT NULL` in the live schema, so the "no department" path is defensive. It protects SQL-inserted rows and any future schema relaxation.

### Future considerations

- If Accounting ever needs the dimension on reversals, `buildChargeVoidedEvent` / `buildChargeReversalRequestedEvent` would need the same `VisitResolver` wiring.
- If the department vocabulary is later codified (enum / FK to `Departments`), the verbatim passthrough becomes the place to enforce it — not today.

---

## 6. Open notes

- `Visit.department` is `NOT NULL` at the DB, so the "no department" path is defensive: it protects legacy/SQL-inserted rows and any future schema relaxation. The emit code treats blank exactly like absent.
- Accounting's side (column widen + the #53 report) is a separate repo/PR. Nothing here blocks on it beyond the contract already allowing the optional field.
- `encounter.opened` deliberately carries **no** department (ADR-0016, `event-builder.ts:415`). This change does not touch that invariant.
