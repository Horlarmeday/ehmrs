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

function assertNoDemographics(body: Record<string, unknown>): void {
  for (const key of Object.keys(body)) {
    if (DEMOGRAPHIC_KEYS.includes(key.toLowerCase())) {
      throw new EventBuildError(
        `Refusing to emit demographic field "${key}" in an event body (ADR-0016): events carry ` +
          'ID references only.'
      );
    }
  }
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

  assertNoDemographics(body);

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
