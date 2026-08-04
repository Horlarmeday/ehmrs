# Task Plan — Issue #192: Emit EMR Visit Metadata on `charge.captured`

**Status:** COMPLETED. Branch: `192-emit-visit-metadata` in `ehmrs` repository.

## 0. Context & Invariants

This issue implements the EMR-side emission of the visit metadata fields (`visit_type` and `consultation_valid_until`) on the `charge.captured` event body.
This is the emission side of the rollout:
`EMR (#192) emits` → `Accounting (#193) ingests` → `Accounting (#194) returns` → `Client (#68) renders`.

* **Governing ADRs:** **0031** (visit metadata rides on `charge.captured`) · **0016** (no demographics on transactions; ID-only references) · **0025** (frozen v1 envelope shape but additive evolution).
* **CONVENTIONS:** Money as integer kobo string, no demographic leakage, backward-compatible layout (fields omitted when not applicable).

---

## 1. Decisions & Assumptions (Aligned with User feedback)

### D1 — Consultation validity window is 5 days
For all categories except `IPD` and `EMERGENCY` (i.e. Outpatient, Antenatal, Immunization, Maternity, Dialysis), the consultation window is exactly 5 days (120 hours). EMR has a cron job (`endVisits.job.ts`) that automatically closes these visits after 5 days. Therefore, their validity limit is unconditionally `date_visit_start` + 5 days.

### D2 — IPD & EMERGENCY Validity
For `IPD` (Inpatient) and `EMERGENCY` visits (which are excluded from the 5-day auto-close cron):
* If the visit has ended/closed, `consultation_valid_until` is set to `date_visit_ended` (discharge date).
* If the visit is ongoing, `consultation_valid_until` is omitted from the event payload.


---

## 2. Task List

### Phase 1 — Event Builder (`event-builder.ts`)
- [x] 1.1 Widen `PrescribedLineInput` interface to include optional `visit_type?: string` and `consultation_valid_until?: string`.
- [x] 1.2 Update `buildChargeCapturedEvent` to copy `visit_type` and `consultation_valid_until` to the payload body if present.
- [x] 1.3 Add unit tests in `event-builder.test.ts` to assert that:
  - Both fields are included when provided.
  - Both fields are omitted from the payload (not sent as `null` or `undefined`) when not provided (retaining backward compatibility).

### Phase 2 — Visit Resolution (`outbox-writer.ts`)
- [x] 2.1 Implement `VisitResolver` class in `outbox-writer.ts` to cache lookups by `visit_id` over the transaction.
- [x] 2.2 Map EMR `VisitCategory` values to the wire `visit_type` values (`Inpatient`, `Outpatient`, `Emergency`, `Antenatal`, `Immunization`, `Maternity`, `Dialysis`).
- [x] 2.3 Calculate `consultation_valid_until` using `dayjs`:
  - Non-IPD/EMERGENCY -> `date_visit_start` + 5 days.
  - IPD/EMERGENCY -> `date_visit_ended` (if set).
- [x] 2.4 Update `emitChargeCapturedForRows` to instantiate `VisitResolver` and pass resolved fields to `emitChargeCaptured`.

### Phase 3 — Validation & Verification
- [x] 3.1 Unit tests in `outbox-writer.test.ts` / `emit-for-rows.test.ts` asserting correct metadata emission for OPD and IPD rows.
- [x] 3.2 Verify existing EMR test suite remains green.
