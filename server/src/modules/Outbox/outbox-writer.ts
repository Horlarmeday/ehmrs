import { ModelStatic, QueryTypes, Transaction } from 'sequelize';
import { Model } from 'sequelize-typescript';
import { sequelizeConnection } from '../../database/config/data-source';
import { OutboxEvent } from '../../database/models/outboxEvent';
import { Patient } from '../../database/models/patient';
import { PatientInsurance } from '../../database/models/patientInsurance';
import { PrescribedAdditionalItem } from '../../database/models/prescribedAdditionalItem';
import { PrescribedDrug } from '../../database/models/prescribedDrug';
import { PrescribedInvestigation } from '../../database/models/prescribedInvestigation';
import { PrescribedService } from '../../database/models/prescribedService';
import { PrescribedTest } from '../../database/models/prescribedTest';
import { Drug } from '../../database/models/drug';
import { Test } from '../../database/models/test';
import { Investigation } from '../../database/models/investigation';
import { Service } from '../../database/models/service';
import { Visit } from '../../database/models/visit';
import { VisitCategory } from '../../database/enums';
import dayjs from 'dayjs';
import {
  buildChargeCapturedEvent,
  buildChargeReversalRequestedEvent,
  buildChargeVoidedEvent,
  buildEncounterClosedEvent,
  buildEncounterOpenedEvent,
  buildPatientDemographicsChangedEvent,
  patientAggregateId,
  visitAggregateId,
  PrescribedLineInput,
  ChargeReversalRequestedInput,
  ChargeVoidedInput,
} from './event-builder';
import {
  COVERAGE_TYPE_FIELD_BY_TYPE,
  PRESCRIBED_LINE_TYPES,
  PRICE_FIELD_BY_TYPE,
  PrescribedLineType,
  VOIDABLE_PREDICATE_BY_TYPE,
} from './prescribed-line-types';
import { PayerResolver } from './payer-derivation';

/**
 * Writes charge.captured events to the outbox INSIDE a clinical write transaction (ADR-0018).
 *
 * The whole point of an outbox is atomicity: the prescribed-line INSERT and the outbox INSERT
 * commit together or not at all. So every method here takes the caller's `Transaction` and does
 * its work on it — never opening its own. If the clinical write rolls back, so does the event.
 *
 * Gated by EMR_OUTBOX_ENABLED. Off, `emitChargeCaptured` is a no-op, so the table and this code
 * can land in production inert and be switched on per environment once verified.
 */

const TENANT_KEY = process.env.EMR_TENANT_KEY || 'default';

export const MODEL_BY_TYPE: Record<PrescribedLineType, ModelStatic<Model>> = {
  drug: PrescribedDrug,
  investigation: PrescribedInvestigation,
  service: PrescribedService,
  test: PrescribedTest,
  additional_item: PrescribedAdditionalItem,
};

function buildContext(sequence: number, occurredAt: Date) {
  return { tenantKey: TENANT_KEY, sequence, occurredAt, sentAt: occurredAt };
}

const IDEMPOTENT_SKIP_EVENT_TYPES = new Set(['charge.voided', 'encounter.closed']);

async function persistOutboxEvent(
  event: {
    aggregate_type: string;
    aggregate_id: string;
    sequence: number | string;
    event_type: string;
    event_version: number;
    idempotency_key: string;
    payload: Record<string, unknown>;
  },
  transaction: Transaction
): Promise<OutboxEvent> {
  if (IDEMPOTENT_SKIP_EVENT_TYPES.has(event.event_type)) {
    const existing = await OutboxEvent.findOne({
      where: { idempotency_key: event.idempotency_key },
      transaction,
    });
    if (existing) {
      return existing;
    }
  }

  return OutboxEvent.create(
    {
      aggregate_type: event.aggregate_type,
      aggregate_id: event.aggregate_id,
      sequence: Number(event.sequence),
      event_type: event.event_type,
      event_version: event.event_version,
      idempotency_key: event.idempotency_key,
      payload: event.payload,
    },
    { transaction }
  );
}

export function isOutboxEnabled(): boolean {
  return process.env.EMR_OUTBOX_ENABLED === 'true';
}

/**
 * Claims a block of sequential sequences for an aggregate, inside the caller's transaction.
 */
export async function claimSequences(
  aggregateId: string,
  count: number,
  transaction: Transaction
): Promise<number> {
  if (count <= 0) {
    throw new Error('Outbox: count must be greater than 0');
  }
  await sequelizeConnection.query(
    `INSERT INTO Outbox_Sequences (aggregate_id, last_sequence, createdAt, updatedAt)
     VALUES (:aggregateId, LAST_INSERT_ID(:count), NOW(), NOW())
     ON DUPLICATE KEY UPDATE last_sequence = LAST_INSERT_ID(last_sequence + :count), updatedAt = NOW()`,
    { replacements: { aggregateId, count }, transaction, type: QueryTypes.INSERT }
  );

  const [row] = await sequelizeConnection.query<{ seq: number }>('SELECT LAST_INSERT_ID() AS seq', {
    transaction,
    type: QueryTypes.SELECT,
  });
  return Number(row.seq);
}

/**
 * Claims the next sequence for an aggregate, inside the caller's transaction.
 *
 * A per-aggregate counter row with `SELECT … FOR UPDATE`: lock it, read `last_sequence`, write
 * `+1` to both the counter and the returned value. Strictly monotonic per aggregate; serialises
 * ONLY concurrent writes to the SAME visit, never across visits. Monotonic, not gapless — a
 * rolled-back clinical transaction consumes a number and releases it.
 *
 * `INSERT … ON DUPLICATE KEY UPDATE` with `LAST_INSERT_ID` folds the "first event for this
 * aggregate" and "nth event" cases into one atomic statement that also takes the row lock, so
 * there is no read-then-write window for a concurrent transaction to slip through.
 */
export function claimSequence(aggregateId: string, transaction: Transaction): Promise<number> {
  return claimSequences(aggregateId, 1, transaction);
}

/**
 * Builds and persists a charge.captured outbox row for one prescribed line, on the caller's
 * transaction. No-op when the outbox is disabled.
 *
 * The sequence is claimed here (not by the caller) so the counter lock is held for the minimum
 * span and always in the same transaction as the row it stamps.
 */
export async function emitChargeCaptured(
  line: Omit<PrescribedLineInput, never>,
  transaction: Transaction
): Promise<OutboxEvent | undefined> {
  if (!isOutboxEnabled()) {
    return undefined;
  }

  const aggregateId = visitAggregateId(line.visit_id);
  const sequence = await claimSequence(aggregateId, transaction);

  const event = buildChargeCapturedEvent(line, { tenantKey: TENANT_KEY, sequence });

  return persistOutboxEvent(event, transaction);
}

/**
 * Builds and persists an `encounter.opened` outbox row on the caller's transaction — the same
 * transaction the Visit INSERT runs in, so the visit and its opening event commit together or not
 * at all. No-op when the outbox is disabled.
 */
export async function emitEncounterOpened(
  visitId: number | string,
  emergency: boolean,
  transaction: Transaction
): Promise<OutboxEvent | undefined> {
  if (!isOutboxEnabled()) {
    return undefined;
  }

  const aggregateId = visitAggregateId(visitId);
  const sequence = await claimSequence(aggregateId, transaction);

  const event = buildEncounterOpenedEvent(
    { visit_id: visitId, emergency },
    { tenantKey: TENANT_KEY, sequence }
  );

  return persistOutboxEvent(event, transaction);
}

export async function emitEncounterClosed(
  visitId: number | string,
  occurredAt: Date,
  transaction: Transaction,
  sequenceOverride?: number
): Promise<OutboxEvent | undefined> {
  if (!isOutboxEnabled()) {
    return undefined;
  }

  const aggregateId = visitAggregateId(visitId);
  const sequence =
    sequenceOverride !== undefined
      ? sequenceOverride
      : await claimSequence(aggregateId, transaction);

  const event = buildEncounterClosedEvent(
    { visit_id: visitId },
    buildContext(sequence, occurredAt)
  );

  return persistOutboxEvent(event, transaction);
}

export async function emitChargeVoided(
  line: ChargeVoidedInput,
  occurredAt: Date,
  transaction: Transaction,
  sequenceOverride?: number
): Promise<OutboxEvent | undefined> {
  if (!isOutboxEnabled()) {
    return undefined;
  }

  const aggregateId = visitAggregateId(line.visit_id);
  const sequence =
    sequenceOverride !== undefined
      ? sequenceOverride
      : await claimSequence(aggregateId, transaction);

  const event = buildChargeVoidedEvent(line, buildContext(sequence, occurredAt));

  return persistOutboxEvent(event, transaction);
}

export async function emitChargeReversalRequested(
  line: ChargeReversalRequestedInput,
  transaction: Transaction
): Promise<OutboxEvent | undefined> {
  if (!isOutboxEnabled()) {
    return undefined;
  }

  const aggregateId = visitAggregateId(line.visit_id);
  const sequence = await claimSequence(aggregateId, transaction);

  const event = buildChargeReversalRequestedEvent(line, {
    tenantKey: TENANT_KEY,
    sequence,
  });

  return persistOutboxEvent(event, transaction);
}

export async function deletePrescribedLineWithReversalRequested(
  type: PrescribedLineType,
  lineId: number,
  findLine: (transaction: Transaction) => Promise<{ id: number; visit_id: number | string } | null>,
  destroyLine: (transaction: Transaction) => Promise<number>
): Promise<number> {
  return sequelizeConnection.transaction(async transaction => {
    const line = await findLine(transaction);
    if (!line) {
      return 0;
    }

    if (isOutboxEnabled()) {
      await emitChargeReversalRequested(
        { type, id: line.id, visit_id: line.visit_id },
        transaction
      );
    }

    return destroyLine(transaction);
  });
}

export async function getQualifyingVoidableLinesForVisit(
  visitId: number | string,
  transaction: Transaction
): Promise<Array<{ type: PrescribedLineType; id: number }>> {
  const qualifyingLines: Array<{ type: PrescribedLineType; id: number }> = [];
  for (const type of PRESCRIBED_LINE_TYPES) {
    const predicate = VOIDABLE_PREDICATE_BY_TYPE[type];
    const model = MODEL_BY_TYPE[type];
    const rows = await model.findAll({
      where: { visit_id: visitId, ...predicate.voidableWhere() },
      transaction,
    });

    for (const row of rows) {
      const plain = asPrescribedRecord(row);
      if (predicate.qualifies(plain)) {
        qualifyingLines.push({ type, id: Number(plain.id) });
      }
    }
  }
  return qualifyingLines;
}

export async function emitChargeVoidedForVisit(
  visitId: number | string,
  occurredAt: Date,
  transaction: Transaction,
  startSequenceOverride?: number
): Promise<number> {
  if (!isOutboxEnabled()) {
    return 0;
  }

  const lines = await getQualifyingVoidableLinesForVisit(visitId, transaction);
  if (lines.length === 0) {
    return 0;
  }

  const aggregateId = visitAggregateId(visitId);
  const endSequence =
    startSequenceOverride !== undefined
      ? startSequenceOverride + lines.length - 1
      : await claimSequences(aggregateId, lines.length, transaction);
  const startSequence = endSequence - lines.length + 1;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const sequence = startSequence + i;
    await emitChargeVoided(
      { type: line.type, id: line.id, visit_id: visitId },
      occurredAt,
      transaction,
      sequence
    );
  }

  return lines.length;
}

/**
 * Emits `patient.demographics.changed` for one patient, on the caller's transaction.
 *
 * The ONE event carrying demographic content (ADR-0016 tier 1) — it feeds Accounting's erasable
 * demographic cache, which is what lets the settlement counter show a name and hospital number
 * without a synchronous call into this system.
 *
 * Reads the patient and their COMPLETE `Patient_Insurances` set. The completeness matters: the
 * receiver reconciles by diff and hard-deletes any insurance absent from the array, so emitting a
 * partial list would silently drop a patient's live coverage.
 *
 * Returns undefined when the outbox is disabled or the patient no longer exists — a missing
 * patient must never roll back the clinical write that triggered this.
 */
export async function emitPatientDemographicsChanged(
  patientId: number | string,
  transaction: Transaction
): Promise<OutboxEvent | undefined> {
  if (!isOutboxEnabled()) {
    return undefined;
  }

  const patient = await Patient.findOne({
    where: { id: patientId },
    attributes: [
      'id',
      'firstname',
      'middlename',
      'lastname',
      'date_of_birth',
      'hospital_id',
      'phone',
    ],
    transaction,
  });
  if (!patient) {
    return undefined;
  }

  const insurances = await PatientInsurance.findAll({
    where: { patient_id: patientId },
    attributes: ['id', 'enrollee_code', 'hmo_id', 'insurance_id', 'plan', 'is_default'],
    transaction,
  });

  const aggregateId = patientAggregateId(patientId);
  const sequence = await claimSequence(aggregateId, transaction);

  const event = buildPatientDemographicsChangedEvent(
    {
      patient_id: patientId,
      first_name: patient.firstname ?? null,
      middle_name: patient.middlename ?? null,
      last_name: patient.lastname ?? null,
      date_of_birth: toIsoDate(patient.date_of_birth),
      // Renamed on the wire: Accounting's schema guard exempts any `*_id` field as an ID
      // reference, so a field named `hospital_id` would slip past it onto a transaction table.
      hospital_number: patient.hospital_id ?? null,
      phone: patient.phone ?? null,
      insurances: insurances.map(insurance => ({
        patient_insurance_id: insurance.id,
        enrollee_code: insurance.enrollee_code ?? null,
        hmo_id: insurance.hmo_id ?? null,
        insurance_id: insurance.insurance_id ?? null,
        plan: insurance.plan ?? null,
        is_default: insurance.is_default === true,
      })),
    },
    { tenantKey: TENANT_KEY, sequence }
  );

  return persistOutboxEvent(event, transaction);
}
function toIsoDate(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

/**
 * The subset of a Prescribed_* model the outbox reads. The five Sequelize models don't share a
 * base type, so a row arrives as `unknown` and is narrowed here: the fields read (id, patient_id,
 * visit_id, the per-type price column, a quantity) exist on all five, and the builder validates
 * the values it actually uses. Narrowing rather than casting keeps a malformed row from silently
 * producing a bad event.
 */
export function asPrescribedRecord(row: Model | Record<string, unknown>): Record<string, unknown> {
  if (!row || typeof row !== 'object') {
    throw new Error('Outbox: expected a prescribed-line record, got a non-object.');
  }

  if ('get' in row && typeof row.get === 'function') {
    const plain = row.get({ plain: true });
    if (plain && typeof plain === 'object' && !Array.isArray(plain)) {
      const record: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(plain)) {
        record[key] = val;
      }
      return record;
    }
    throw new Error('Outbox: expected a plain object from Model.get');
  }

  const record: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    record[key] = val;
  }
  return record;
}

/**
 * Normalises a price to the decimal STRING the builder expects.
 *
 * A price reaches here two ways: from a reloaded row it is already the DECIMAL driver string; from
 * a just-created row it may still be the JS number the HTTP request body carried. A number from a
 * price field is a legitimate naira amount (the DECIMAL column would store it identically), NOT the
 * float-artifact the builder's number-rejection guards against — so convert an integer-or-2dp
 * number to its exact string here. A number with more than 2 decimal places is refused: that is
 * sub-kobo precision the money layer must not silently round.
 */
export function normalisePrice(value: unknown): unknown {
  if (typeof value !== 'number') {
    return value;
  }
  if (!Number.isFinite(value)) {
    throw new Error(`Outbox: price is not a finite number (${value}).`);
  }
  // toFixed(2) is exact for a value with <= 2 decimal places; reject anything finer than a kobo.
  const rounded = Number(value.toFixed(2));
  if (rounded !== value) {
    throw new Error(`Outbox: price ${value} has sub-kobo precision; refusing to round.`);
  }
  return value.toFixed(2);
}

export class VisitResolver {
  private readonly cache = new Map<
    number,
    { visit_type: string; consultation_valid_until?: string } | null
  >();

  constructor(private readonly transaction: Transaction) {}

  async resolve(
    visitId: unknown
  ): Promise<{ visit_type: string; consultation_valid_until?: string } | null> {
    const id = Number(visitId);
    if (!Number.isInteger(id)) {
      return null;
    }

    if (this.cache.has(id)) {
      const cached = this.cache.get(id);
      return cached !== undefined ? cached : null;
    }

    const visit = await Visit.findOne({
      where: { id },
      attributes: ['id', 'category', 'date_visit_start', 'date_visit_ended'],
      transaction: this.transaction,
    });

    if (!visit) {
      this.cache.set(id, null);
      return null;
    }

    const visitType = visit.category;
    const result: { visit_type: string; consultation_valid_until?: string } = {
      visit_type: visitType,
    };

    if (visit.category === VisitCategory.IPD || visit.category === VisitCategory.EMERGENCY) {
      if (visit.date_visit_ended) {
        result.consultation_valid_until = dayjs(visit.date_visit_ended).toISOString();
      }
    } else {
      if (visit.date_visit_start) {
        result.consultation_valid_until = dayjs(visit.date_visit_start)
          .add(5, 'days')
          .toISOString();
      }
    }

    this.cache.set(id, result);
    return result;
  }
}

/**
 * Emits a charge.captured for each row a prescribe endpoint created, on its transaction.
 *
 * The single call every emit site makes. Reading the price by the per-type column name (not a
 * fixed field) is what lets one helper serve all five types whose price column differs. A row
 * missing its price is a data bug, not something to paper over — nairaStringToKoboString throws,
 * which rolls the whole clinical write back rather than emitting a zero-value charge.
 */
export async function emitChargeCapturedForRows(
  type: PrescribedLineType,
  rows: readonly (Model | Record<string, unknown>)[],
  serviceDate: string,
  transaction: Transaction
): Promise<void> {
  if (!isOutboxEnabled() || rows.length === 0) {
    return;
  }

  const priceField = PRICE_FIELD_BY_TYPE[type];
  const coverageField = COVERAGE_TYPE_FIELD_BY_TYPE[type];
  const payerResolver = new PayerResolver(transaction);
  const visitResolver = new VisitResolver(transaction);
  const processedPatients = new Set<string>();

  const serviceLineResolver = createServiceLineResolver(type, transaction);

  for (const raw of rows) {
    const row = asPrescribedRecord(raw);
    const patientId = Number(row.patient_id);

    const [payer, serviceLine, visitInfo] = await Promise.all([
      payerResolver.resolve(row.patient_insurance_id, row[coverageField]),
      serviceLineResolver(row),
      visitResolver.resolve(row.visit_id),
    ]);

    const input: PrescribedLineInput = {
      type,
      id: Number(row.id),
      patient_id: patientId,
      visit_id: Number(row.visit_id),
      amount: normalisePrice(row[priceField]),
      quantity: Number(row.quantity_prescribed ?? row.quantity ?? 1),
      service_date: serviceDate,
      payer,
      service_line: serviceLine,
      visit_type: visitInfo?.visit_type,
      consultation_valid_until: visitInfo?.consultation_valid_until,
    };

    await emitChargeCaptured(input, transaction);

    const patientKey = String(patientId);
    if (!processedPatients.has(patientKey)) {
      processedPatients.add(patientKey);
      await emitPatientDemographicsChanged(patientId, transaction);
    }
  }
}

/**
 * Creates a service line resolver function based on the prescribed line type.
 * Uses a factory pattern to encapsulate type-specific logic.
 */
function createServiceLineResolver(
  type: PrescribedLineType,
  transaction: Transaction
): (row: Record<string, unknown>) => Promise<string | undefined> {
  const modelMap: Record<
    PrescribedLineType,
    { model: ModelStatic<Model>; idField: string } | null
  > = {
    drug: { model: Drug, idField: 'drug_id' },
    additional_item: { model: Drug, idField: 'drug_id' },
    test: { model: Test, idField: 'test_id' },
    investigation: { model: Investigation, idField: 'investigation_id' },
    service: { model: Service, idField: 'service_id' },
  };

  const config = modelMap[type];

  if (!config) {
    return async () => undefined;
  }

  return async (row: Record<string, unknown>): Promise<string | undefined> => {
    const id = row[config.idField];
    if (id == null) return undefined;

    const entity = await config.model.findOne({
      where: { id },
      transaction,
    });

    if (entity && 'name' in entity && typeof entity.name === 'string') {
      return entity.name;
    }
    return undefined;
  };
}
