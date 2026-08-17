import { randomBytes } from 'crypto';
import { nairaStringToKoboString } from './money';
import {
  PRESCRIBED_LINE_TYPES,
  PRICE_FIELD_BY_TYPE,
  PrescribedLineType,
  isPrescribedLineType,
} from './prescribed-line-types';

/**
 * Builds the v1 EMR→Accounting event envelope (ADR-0025 §2), the shape the co-deployed
 * Accounting inbox verifies against. This is the ONE place that translates an EMR prescribed line
 * into a wire event, and the only enforcement point for the contract's money and demographic
 * rules — this repo has no schema guard or Money type, so if the rules are not upheld here they
 * are not upheld anywhere.
 */

const DEMOGRAPHIC_KEYS = [
  'name',
  'firstname',
  'lastname',
  'middlename',
  'fullname',
  'complete_name',
  'phone',
  'email',
  'address',
  'date_of_birth',
  'dob',
  'gender',
  'photo',
  'hospital_number',
  'membership_number',
  'nok_name',
  'next_of_kin',
];

/**
 * A UUIDv7 (ADR-0025 Q1.2): 48-bit millisecond timestamp, then random, with the version (7) and
 * variant (10) nibbles fixed. Time-sortable, and the receiver's envelope guard REJECTS a v4, so
 * `crypto.randomUUID()` (which is v4) cannot be used.
 */
export function uuidV7(now: number = Date.now()): string {
  const bytes = randomBytes(16);
  bytes[0] = Math.floor(now / 2 ** 40) & 0xff;
  bytes[1] = Math.floor(now / 2 ** 32) & 0xff;
  bytes[2] = Math.floor(now / 2 ** 24) & 0xff;
  bytes[3] = Math.floor(now / 2 ** 16) & 0xff;
  bytes[4] = Math.floor(now / 2 ** 8) & 0xff;
  bytes[5] = now & 0xff;
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20
  )}-${hex.slice(20)}`;
}

/**
 * The EMR maps its Visit onto the contract's encounter aggregate (ADR-0027). The `visit:` prefix
 * keeps the mapping self-describing on the wire and the id namespace clean if a real
 * order-grouping is ever introduced.
 */
export function visitAggregateId(visitId: number | string): string {
  return `visit:${visitId}`;
}

/**
 * The aggregate id for a person-scoped event (Accounting ADR-0030).
 *
 * A demographic change is a fact about a PERSON, not a visit: a patient with no open visit must
 * still be able to emit one, and the same change landing under several visits' sequences would be
 * meaningless. So `patient.demographics.changed` carries its own aggregate with its own sequence
 * counter — `claimSequence` is keyed on an opaque string, so this needs no schema change here.
 */
export function patientAggregateId(patientId: number | string): string {
  return `patient:${patientId}`;
}

/**
 * The payer reference carried on `charge.captured` (ADR-0028). Additive, optional, ID-only: it
 * tells Accounting which payer the patient was under at prescription time so it can resolve the
 * split. No demographics (ADR-0016) — scheme/hmo ids only, never a name or membership number. No
 * money. A missing payer means cash; the receiver defaults an absent field to `patient-liable`.
 *
 * The EMR has no `retainership_id`: retainership is an Insurance (scheme) type and the retainer
 * companies are HMO rows under it, so a retainership line carries the company `hmo_id` as
 * `retainership_id` (owned by Accounting #138 on the receiving end).
 */
export interface ChargeCapturedPayer {
  readonly payer_type: 'cash' | 'scheme_hmo' | 'retainership';
  readonly scheme_id?: string;
  readonly hmo_id?: string;
  readonly retainership_id?: string;
  /** EMR Patient_Insurances.id — which membership this line was raised under (ADR-0037). ID only. */
  readonly patient_insurance_id?: string;
}

export interface PrescribedLineInput {
  readonly type: PrescribedLineType;
  readonly id: number | string;
  readonly patient_id: number | string;
  readonly visit_id: number | string;
  /** The price field named by PRICE_FIELD_BY_TYPE for this type, as the DECIMAL driver string. */
  readonly amount: unknown;
  readonly quantity: number;
  readonly service_date: string;
  readonly department?: string;
  readonly service_line?: string;
  /** Payer at prescription time (ADR-0028). Omitted for cash lines; ID references only. */
  readonly payer?: ChargeCapturedPayer;
  readonly visit_type?: string;
  readonly consultation_valid_until?: string;
}

export interface BuildContext {
  readonly tenantKey: string;
  readonly eventVersion?: number;
  readonly sequence: number | string;
  readonly occurredAt?: Date;
  readonly sentAt?: Date;
  readonly now?: number;
}

export class EventBuildError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EventBuildError';
  }
}

/**
 * The ONE event type permitted to carry demographic content (ADR-0016 tier 1, Accounting #43).
 *
 * `patient.demographics.changed` is the sanctioned channel that feeds Accounting's erasable
 * demographic cache. Every other event stays ID-only — which is why this is a per-type EXEMPTION
 * rather than a relaxation of `assertNoDemographics`. Deleting or weakening that assertion to let
 * this event through would silently reopen the hole on `charge.captured` and every future event.
 */
const DEMOGRAPHIC_EVENT_TYPES = ['patient.demographics.changed'];

function assertNoDemographics(body: Record<string, unknown>, eventType: string): void {
  if (DEMOGRAPHIC_EVENT_TYPES.includes(eventType)) {
    return;
  }

  for (const key of Object.keys(body)) {
    if (DEMOGRAPHIC_KEYS.includes(key.toLowerCase())) {
      throw new EventBuildError(
        `Refusing to emit demographic field "${key}" in a ${eventType} body (ADR-0016): only ` +
          `${DEMOGRAPHIC_EVENT_TYPES.join(', ')} may carry demographic content; every other ` +
          'event carries ID references only.'
      );
    }
  }
}

/**
 * Serialises a payer for the wire: `payer_type` plus only the id fields that are present, each as a
 * string (ids are INTEGER autoincrement in the EMR). Absent ids are dropped rather than emitted as
 * null/undefined, so a scheme_hmo payer never carries a stray `retainership_id` and vice versa.
 */
function buildPayer(payer: ChargeCapturedPayer): Record<string, unknown> {
  const wire: Record<string, unknown> = { payer_type: payer.payer_type };
  if (payer.scheme_id !== undefined) {
    wire.scheme_id = String(payer.scheme_id);
  }
  if (payer.hmo_id !== undefined) {
    wire.hmo_id = String(payer.hmo_id);
  }
  if (payer.retainership_id !== undefined) {
    wire.retainership_id = String(payer.retainership_id);
  }
  if (payer.patient_insurance_id !== undefined) {
    wire.patient_insurance_id = String(payer.patient_insurance_id);
  }
  return wire;
}

/**
 * `charge:{type}:{id}` — deterministic on domain identity, never on the send attempt (ADR-0025
 * §3). Safe because prescribed-line ids are autoincrement and never reused (Q3.1). The type prefix
 * is what keeps keys unique across tables whose ids collide, so an unknown type is refused here.
 */
export function chargeIdempotencyKey(type: PrescribedLineType, id: number | string): string {
  if (!isPrescribedLineType(type)) {
    throw new EventBuildError(
      `Unknown prescribed-line type "${type}"; expected one of ${PRESCRIBED_LINE_TYPES.join(', ')}`
    );
  }
  return `charge:${type}:${id}`;
}

/**
 * `encounter-opened:{visit_id}` — one open per visit, deterministic on domain identity rather than
 * on the send attempt (ADR-0025 §3), so a redelivery dedupes at the inbox.
 */
export function encounterOpenedIdempotencyKey(visitId: number | string): string {
  return `encounter-opened:${visitId}`;
}

export function encounterClosedIdempotencyKey(visitId: number | string): string {
  return `encounter-closed:${visitId}`;
}

export function chargeVoidedIdempotencyKey(type: PrescribedLineType, id: number | string): string {
  if (!isPrescribedLineType(type)) {
    throw new EventBuildError(
      `Unknown prescribed-line type "${type}"; expected one of ${PRESCRIBED_LINE_TYPES.join(', ')}`
    );
  }
  return `charge-voided:${type}:${id}`;
}

export function chargeReversalRequestedIdempotencyKey(
  type: PrescribedLineType,
  id: number | string
): string {
  if (!isPrescribedLineType(type)) {
    throw new EventBuildError(
      `Unknown prescribed-line type "${type}"; expected one of ${PRESCRIBED_LINE_TYPES.join(', ')}`
    );
  }
  return `reversal_requested:${type}:${id}`;
}

export interface OutboxEventRow {
  readonly aggregate_type: string;
  readonly aggregate_id: string;
  readonly sequence: number | string;
  readonly event_type: string;
  readonly event_version: number;
  readonly idempotency_key: string;
  readonly payload: Record<string, unknown>;
}

/**
 * Translates a prescribed line into a `charge.captured` outbox row. Money is emitted as a STRING
 * of integer kobo; a demographic field or an unknown type is refused before the row is built.
 */
export function buildChargeCapturedEvent(
  line: PrescribedLineInput,
  context: BuildContext
): OutboxEventRow {
  if (!isPrescribedLineType(line.type)) {
    throw new EventBuildError(
      `Unknown prescribed-line type "${line.type}"; expected one of ${PRESCRIBED_LINE_TYPES.join(
        ', '
      )}`
    );
  }

  const priceField = PRICE_FIELD_BY_TYPE[line.type];
  const amountKobo = nairaStringToKoboString(line.amount, `${line.type}.${priceField}`);

  const encounterId = visitAggregateId(line.visit_id);
  const occurredAt = context.occurredAt ?? new Date();
  const sentAt = context.sentAt ?? new Date();

  const body: Record<string, unknown> = {
    external_line_ref: { type: line.type, id: String(line.id) },
    patient_id: String(line.patient_id),
    visit_id: String(line.visit_id),
    encounter_id: encounterId,
    amount_kobo: amountKobo,
    quantity: line.quantity,
    service_date: line.service_date,
  };
  if (line.department !== undefined) {
    body.department = line.department;
  }
  if (line.service_line !== undefined) {
    body.service_line = line.service_line;
  }
  if (line.payer !== undefined) {
    body.payer = buildPayer(line.payer);
  }
  if (line.visit_type !== undefined) {
    body.visit_type = line.visit_type;
  }
  if (line.consultation_valid_until !== undefined) {
    body.consultation_valid_until = line.consultation_valid_until;
  }

  assertNoDemographics(body, 'charge.captured');

  const payload: Record<string, unknown> = {
    event_id: uuidV7(context.now),
    event_type: 'charge.captured',
    event_version: context.eventVersion ?? 1,
    tenant_key: context.tenantKey,
    occurred_at: occurredAt.toISOString(),
    sent_at: sentAt.toISOString(),
    aggregate: { type: 'encounter', id: encounterId },
    sequence: Number(context.sequence),
    idempotency_key: chargeIdempotencyKey(line.type, line.id),
    body,
  };

  return {
    aggregate_type: 'encounter',
    aggregate_id: encounterId,
    sequence: context.sequence,
    event_type: 'charge.captured',
    event_version: context.eventVersion ?? 1,
    idempotency_key: chargeIdempotencyKey(line.type, line.id),
    payload,
  };
}

export interface EncounterOpenedInput {
  readonly visit_id: number | string;
  readonly emergency: boolean;
}

/**
 * Builds an `encounter.opened` outbox row. The body carries ONE optional boolean and nothing else
 * (ADR-0016): no patient id, no category string, no department.
 *
 * The flag is emitted only when true. Accounting LATCHES on `emergency === true` and has no code
 * path that clears it, so a `false` is indistinguishable from an absent field at the receiver —
 * emitting one would falsely imply an encounter can be corrected back to routine.
 */
export interface EncounterClosedInput {
  readonly visit_id: number | string;
}

export interface ChargeVoidedInput {
  readonly type: PrescribedLineType;
  readonly id: number | string;
  readonly visit_id: number | string;
}

export interface ChargeReversalRequestedInput {
  readonly type: PrescribedLineType;
  readonly id: number | string;
  readonly visit_id: number | string;
  readonly reason?: string;
}

export function buildEncounterClosedEvent(
  input: EncounterClosedInput,
  context: BuildContext
): OutboxEventRow {
  const encounterId = visitAggregateId(input.visit_id);
  const occurredAt = context.occurredAt ?? new Date();
  const sentAt = context.sentAt ?? new Date();
  const idempotencyKey = encounterClosedIdempotencyKey(input.visit_id);
  const eventVersion = context.eventVersion ?? 1;

  const body: Record<string, unknown> = {};

  assertNoDemographics(body, 'encounter.closed');

  const payload: Record<string, unknown> = {
    event_id: uuidV7(context.now),
    event_type: 'encounter.closed',
    event_version: eventVersion,
    tenant_key: context.tenantKey,
    occurred_at: occurredAt.toISOString(),
    sent_at: sentAt.toISOString(),
    aggregate: { type: 'encounter', id: encounterId },
    sequence: Number(context.sequence),
    idempotency_key: idempotencyKey,
    body,
  };

  return {
    aggregate_type: 'encounter',
    aggregate_id: encounterId,
    sequence: context.sequence,
    event_type: 'encounter.closed',
    event_version: eventVersion,
    idempotency_key: idempotencyKey,
    payload,
  };
}

export function buildChargeVoidedEvent(
  input: ChargeVoidedInput,
  context: BuildContext
): OutboxEventRow {
  if (!isPrescribedLineType(input.type)) {
    throw new EventBuildError(
      `Unknown prescribed-line type "${input.type}"; expected one of ${PRESCRIBED_LINE_TYPES.join(
        ', '
      )}`
    );
  }

  const encounterId = visitAggregateId(input.visit_id);
  const occurredAt = context.occurredAt ?? new Date();
  const sentAt = context.sentAt ?? new Date();
  const idempotencyKey = chargeVoidedIdempotencyKey(input.type, input.id);
  const eventVersion = context.eventVersion ?? 1;

  const body: Record<string, unknown> = {
    external_line_ref: { type: input.type, id: String(input.id) },
    encounter_id: encounterId,
  };

  assertNoDemographics(body, 'charge.voided');

  const payload: Record<string, unknown> = {
    event_id: uuidV7(context.now),
    event_type: 'charge.voided',
    event_version: eventVersion,
    tenant_key: context.tenantKey,
    occurred_at: occurredAt.toISOString(),
    sent_at: sentAt.toISOString(),
    aggregate: { type: 'encounter', id: encounterId },
    sequence: Number(context.sequence),
    idempotency_key: idempotencyKey,
    body,
  };

  return {
    aggregate_type: 'encounter',
    aggregate_id: encounterId,
    sequence: context.sequence,
    event_type: 'charge.voided',
    event_version: eventVersion,
    idempotency_key: idempotencyKey,
    payload,
  };
}

export function buildChargeReversalRequestedEvent(
  input: ChargeReversalRequestedInput,
  context: BuildContext
): OutboxEventRow {
  if (!isPrescribedLineType(input.type)) {
    throw new EventBuildError(
      `Unknown prescribed-line type "${input.type}"; expected one of ${PRESCRIBED_LINE_TYPES.join(
        ', '
      )}`
    );
  }

  const encounterId = visitAggregateId(input.visit_id);
  const occurredAt = context.occurredAt ?? new Date();
  const sentAt = context.sentAt ?? new Date();
  const idempotencyKey = chargeReversalRequestedIdempotencyKey(input.type, input.id);
  const eventVersion = context.eventVersion ?? 1;

  const body: Record<string, unknown> = {
    external_line_ref: { type: input.type, id: String(input.id) },
    encounter_id: encounterId,
  };
  if (input.reason !== undefined) {
    body.reason = input.reason;
  }

  assertNoDemographics(body, 'charge.reversal.requested');

  const payload: Record<string, unknown> = {
    event_id: uuidV7(context.now),
    event_type: 'charge.reversal.requested',
    event_version: eventVersion,
    tenant_key: context.tenantKey,
    occurred_at: occurredAt.toISOString(),
    sent_at: sentAt.toISOString(),
    aggregate: { type: 'encounter', id: encounterId },
    sequence: Number(context.sequence),
    idempotency_key: idempotencyKey,
    body,
  };

  return {
    aggregate_type: 'encounter',
    aggregate_id: encounterId,
    sequence: context.sequence,
    event_type: 'charge.reversal.requested',
    event_version: eventVersion,
    idempotency_key: idempotencyKey,
    payload,
  };
}

export function buildEncounterOpenedEvent(
  input: EncounterOpenedInput,
  context: BuildContext
): OutboxEventRow {
  const encounterId = visitAggregateId(input.visit_id);
  const occurredAt = context.occurredAt ?? new Date();
  const sentAt = context.sentAt ?? new Date();
  const idempotencyKey = encounterOpenedIdempotencyKey(input.visit_id);
  const eventVersion = context.eventVersion ?? 1;

  const body: Record<string, unknown> = input.emergency ? { emergency: true } : {};

  assertNoDemographics(body, 'encounter.opened');

  const payload: Record<string, unknown> = {
    event_id: uuidV7(context.now),
    event_type: 'encounter.opened',
    event_version: eventVersion,
    tenant_key: context.tenantKey,
    occurred_at: occurredAt.toISOString(),
    sent_at: sentAt.toISOString(),
    aggregate: { type: 'encounter', id: encounterId },
    sequence: Number(context.sequence),
    idempotency_key: idempotencyKey,
    body,
  };

  return {
    aggregate_type: 'encounter',
    aggregate_id: encounterId,
    sequence: context.sequence,
    event_type: 'encounter.opened',
    event_version: eventVersion,
    idempotency_key: idempotencyKey,
    payload,
  };
}

/** One `Patient_Insurances` row as it crosses the wire. `enrollee_code` is the demographic half. */
export interface PatientInsuranceInput {
  readonly patient_insurance_id: number | string;
  readonly enrollee_code?: string | null;
  readonly hmo_id?: number | string | null;
  readonly insurance_id?: number | string | null;
  readonly plan?: string | null;
  readonly is_default?: boolean;
}

export interface PatientDemographicsInput {
  readonly patient_id: number | string;
  readonly first_name?: string | null;
  readonly middle_name?: string | null;
  readonly last_name?: string | null;
  /** `YYYY-MM-DD`. A timestamp would let a timezone shift someone's birthday across a date. */
  readonly date_of_birth?: string | null;
  /** EMR `patient.hospital_id`. Renamed on the wire — see below. */
  readonly hospital_number?: string | null;
  readonly phone?: string | null;
  /**
   * The COMPLETE insurance set, never a delta. Accounting reconciles by diff and HARD-DELETES any
   * row absent from this array, so a partial list silently drops a patient's live coverage.
   * Omit the field entirely to mean "not stated"; an empty array means "holds none".
   */
  readonly insurances?: readonly PatientInsuranceInput[];
}

/** `patient-demographics:{patient_id}:{sequence}` — deterministic per emission (ADR-0025 §3). */
export function patientDemographicsIdempotencyKey(
  patientId: number | string,
  sequence: number | string
): string {
  return `patient-demographics:${patientId}:${sequence}`;
}

function buildInsurances(
  insurances: readonly PatientInsuranceInput[]
): Array<Record<string, unknown>> {
  return insurances.map(insurance => {
    const wire: Record<string, unknown> = {
      patient_insurance_id: String(insurance.patient_insurance_id),
      is_default: insurance.is_default === true,
    };
    if (insurance.enrollee_code != null) {
      wire.enrollee_code = String(insurance.enrollee_code);
    }
    if (insurance.hmo_id != null) {
      wire.hmo_id = String(insurance.hmo_id);
    }
    if (insurance.insurance_id != null) {
      wire.insurance_id = String(insurance.insurance_id);
    }
    if (insurance.plan != null) {
      wire.plan = String(insurance.plan);
    }
    return wire;
  });
}

/**
 * Builds a `patient.demographics.changed` outbox row — the ONE event that carries demographic
 * content, feeding Accounting's erasable cache (ADR-0016 tier 1, Accounting #43/ADR-0030).
 *
 * Three things are deliberate:
 *
 *   - **Name PARTS, never a composed `legal_name`.** The EMR owns the parts; Accounting composes
 *     once, on write, in a single tested function. Shipping a pre-composed string would be
 *     undecomposable (killing surname sort and receipt-template choice), and composing at RENDER
 *     time would make the composition rule part of the retention guarantee — changing it later
 *     would silently alter every historical reissue.
 *   - **`hospital_id` is renamed to `hospital_number` on the wire.** Accounting's schema guard
 *     exempts any field ending `_id` as an ID reference, so a column literally named
 *     `hospital_id` would slip past it onto a transaction table. The hospital number is
 *     DEMOGRAPHIC and belongs only in the cache.
 *   - **Overwrite semantics.** It carries a per-patient sequence and Accounting discards a lower
 *     one as stale, so a redelivered older change cannot revert a newer one.
 */
export function buildPatientDemographicsChangedEvent(
  input: PatientDemographicsInput,
  context: BuildContext
): OutboxEventRow {
  const aggregateId = patientAggregateId(input.patient_id);
  const occurredAt = context.occurredAt ?? new Date();
  const sentAt = context.sentAt ?? new Date();
  const eventVersion = context.eventVersion ?? 1;
  const idempotencyKey = patientDemographicsIdempotencyKey(input.patient_id, context.sequence);

  if (input.date_of_birth != null && !/^\d{4}-\d{2}-\d{2}$/.test(input.date_of_birth)) {
    throw new EventBuildError(
      `date_of_birth must be YYYY-MM-DD, got "${input.date_of_birth}". A DOB carrying a time can ` +
        'shift across a date boundary under timezone conversion.'
    );
  }

  const body: Record<string, unknown> = { patient_id: String(input.patient_id) };
  if (input.first_name !== undefined) {
    body.first_name = input.first_name;
  }
  if (input.middle_name !== undefined) {
    body.middle_name = input.middle_name;
  }
  if (input.last_name !== undefined) {
    body.last_name = input.last_name;
  }
  if (input.date_of_birth !== undefined) {
    body.date_of_birth = input.date_of_birth;
  }
  if (input.hospital_number !== undefined) {
    body.hospital_number = input.hospital_number;
  }
  if (input.phone !== undefined) {
    body.phone = input.phone;
  }
  if (input.insurances !== undefined) {
    body.insurances = buildInsurances(input.insurances);
  }

  // Exempt by event type — the assertion still bites on every other event. See the constant.
  assertNoDemographics(body, 'patient.demographics.changed');

  const payload: Record<string, unknown> = {
    event_id: uuidV7(context.now),
    event_type: 'patient.demographics.changed',
    event_version: eventVersion,
    tenant_key: context.tenantKey,
    occurred_at: occurredAt.toISOString(),
    sent_at: sentAt.toISOString(),
    aggregate: { type: 'patient', id: aggregateId },
    sequence: Number(context.sequence),
    idempotency_key: idempotencyKey,
    body,
  };

  return {
    aggregate_type: 'patient',
    aggregate_id: aggregateId,
    sequence: context.sequence,
    event_type: 'patient.demographics.changed',
    event_version: eventVersion,
    idempotency_key: idempotencyKey,
    payload,
  };
}
