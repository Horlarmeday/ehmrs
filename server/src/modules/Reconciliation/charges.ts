import { QueryTypes, Transaction } from 'sequelize';
import { sequelizeConnection } from '../../database/config/data-source';
import { PRESCRIBED_LINE_TYPES, PrescribedLineType } from '../Outbox/prescribed-line-types';
import { ChargeLinesRequest, ChargesRequest } from './request';
import { tables } from './tables';

/**
 * Charge counts per visit and line type for Accounting's reconciliation (#109). A line is counted
 * once whether it is still live or was hard-deleted by a reversal request: the
 * `charge.reversal.requested` outbox row is the only record a deleted line leaves.
 */

const REVERSAL_EVENT_TYPE = 'charge.reversal.requested';
const REVERSAL_KEY_PATTERN = /^reversal_requested:([a-z_]+):(\d+)$/;
const VISIT_AGGREGATE_PATTERN = /^visit:(\d+)$/;
export const MAX_LINES = 1000;

export type LineCounts = Record<PrescribedLineType, number>;

export interface VisitCounts {
  readonly visit_id: string;
  readonly patient_id: string | null;
  readonly last_activity_at: string | null;
  readonly lines: LineCounts;
}

export interface ChargesResponse {
  readonly visits: VisitCounts[];
  readonly next_after_visit_id: string | null;
  readonly settling_visits: number;
}

export type LineState = 'LIVE' | 'DELETED';

export interface LineRef {
  readonly type: PrescribedLineType;
  readonly id: string;
  readonly state: LineState;
  readonly created_at: string;
}

export interface ChargeLinesResponse {
  readonly lines: LineRef[];
  readonly truncated: boolean;
}

interface LineRow {
  readonly visitId: number;
  readonly type: PrescribedLineType;
  readonly id: number;
  readonly state: LineState;
  readonly createdAt: Date;
}

function isLineType(value: string): value is PrescribedLineType {
  return PRESCRIBED_LINE_TYPES.some(type => type === value);
}

function emptyCounts(): LineCounts {
  return { drug: 0, investigation: 0, service: 0, test: 0, additional_item: 0 };
}

function visitIdFromAggregate(aggregateId: string): number | null {
  const match = VISIT_AGGREGATE_PATTERN.exec(aggregateId);
  return match === null ? null : Number(match[1]);
}

function laterOf(a: Date | null, b: Date): Date {
  return a === null || b.getTime() > a.getTime() ? b : a;
}

/** Latest activity per visit since `from`, across the five line tables and reversal requests. */
async function activitySince(from: Date, transaction: Transaction): Promise<Map<number, Date>> {
  const lineSelects = PRESCRIBED_LINE_TYPES.map(
    type =>
      `SELECT visit_id, MAX(createdAt) AS last_at FROM ${tables().line[type]} ` +
      'WHERE createdAt >= :from AND visit_id IS NOT NULL GROUP BY visit_id'
  );
  const lineRows = await sequelizeConnection.query<{ visit_id: number; last_at: Date }>(
    lineSelects.join(' UNION ALL '),
    { replacements: { from }, type: QueryTypes.SELECT, transaction }
  );
  const reversalRows = await sequelizeConnection.query<{ aggregate_id: string; last_at: Date }>(
    `SELECT aggregate_id, MAX(createdAt) AS last_at FROM ${tables().outbox} ` +
      'WHERE event_type = :eventType AND createdAt >= :from GROUP BY aggregate_id',
    { replacements: { from, eventType: REVERSAL_EVENT_TYPE }, type: QueryTypes.SELECT, transaction }
  );

  const lastActivity = new Map<number, Date>();
  for (const row of lineRows) {
    const visitId = Number(row.visit_id);
    lastActivity.set(visitId, laterOf(lastActivity.get(visitId) ?? null, new Date(row.last_at)));
  }
  for (const row of reversalRows) {
    const visitId = visitIdFromAggregate(row.aggregate_id);
    if (visitId !== null) {
      lastActivity.set(visitId, laterOf(lastActivity.get(visitId) ?? null, new Date(row.last_at)));
    }
  }
  return lastActivity;
}

/** Every line of the given visits since the start date: live rows, then deleted ids not live. */
async function linesOf(
  visitIds: readonly number[],
  startDate: Date,
  transaction: Transaction
): Promise<LineRow[]> {
  if (visitIds.length === 0) {
    return [];
  }

  const rows: LineRow[] = [];
  const liveKeys = new Set<string>();
  for (const type of PRESCRIBED_LINE_TYPES) {
    const live = await sequelizeConnection.query<{ id: number; visit_id: number; createdAt: Date }>(
      `SELECT id, visit_id, createdAt FROM ${tables().line[type]} ` +
        'WHERE visit_id IN (:visitIds) AND createdAt >= :startDate',
      { replacements: { visitIds, startDate }, type: QueryTypes.SELECT, transaction }
    );
    for (const row of live) {
      liveKeys.add(`${type}:${row.id}`);
      rows.push({
        visitId: Number(row.visit_id),
        type,
        id: Number(row.id),
        state: 'LIVE',
        createdAt: new Date(row.createdAt),
      });
    }
  }

  const reversals = await sequelizeConnection.query<{
    idempotency_key: string;
    aggregate_id: string;
    createdAt: Date;
  }>(
    `SELECT idempotency_key, aggregate_id, createdAt FROM ${tables().outbox} ` +
      'WHERE event_type = :eventType AND aggregate_id IN (:aggregateIds) AND createdAt >= :startDate',
    {
      replacements: {
        eventType: REVERSAL_EVENT_TYPE,
        aggregateIds: visitIds.map(id => `visit:${id}`),
        startDate,
      },
      type: QueryTypes.SELECT,
      transaction,
    }
  );
  const deletedKeys = new Set<string>();
  for (const row of reversals) {
    const match = REVERSAL_KEY_PATTERN.exec(row.idempotency_key);
    const visitId = visitIdFromAggregate(row.aggregate_id);
    if (match === null || visitId === null || !isLineType(match[1])) {
      continue;
    }
    const key = `${match[1]}:${match[2]}`;
    if (liveKeys.has(key) || deletedKeys.has(key)) {
      continue;
    }
    deletedKeys.add(key);
    rows.push({
      visitId,
      type: match[1],
      id: Number(match[2]),
      state: 'DELETED',
      createdAt: new Date(row.createdAt),
    });
  }
  return rows;
}

async function patientIdsOf(
  visitIds: readonly number[],
  transaction: Transaction
): Promise<Map<number, string>> {
  if (visitIds.length === 0) {
    return new Map();
  }
  const rows = await sequelizeConnection.query<{ id: number; patient_id: number | null }>(
    `SELECT id, patient_id FROM ${tables().visit} WHERE id IN (:visitIds)`,
    { replacements: { visitIds }, type: QueryTypes.SELECT, transaction }
  );
  const result = new Map<number, string>();
  for (const row of rows) {
    if (row.patient_id !== null) {
      result.set(Number(row.id), String(row.patient_id));
    }
  }
  return result;
}

async function countsFor(
  visitIds: readonly number[],
  startDate: Date,
  transaction: Transaction
): Promise<Map<number, { counts: LineCounts; lastActivity: Date | null }>> {
  const result = new Map<number, { counts: LineCounts; lastActivity: Date | null }>();
  for (const visitId of visitIds) {
    result.set(visitId, { counts: emptyCounts(), lastActivity: null });
  }
  for (const line of await linesOf(visitIds, startDate, transaction)) {
    const entry = result.get(line.visitId);
    if (entry !== undefined) {
      entry.counts[line.type] += 1;
      entry.lastActivity = laterOf(entry.lastActivity, line.createdAt);
    }
  }
  return result;
}

function toVisitCounts(
  visitId: number,
  entry: { counts: LineCounts; lastActivity: Date | null },
  patients: Map<number, string>
): VisitCounts {
  return {
    visit_id: String(visitId),
    patient_id: patients.get(visitId) ?? null,
    last_activity_at: entry.lastActivity === null ? null : entry.lastActivity.toISOString(),
    lines: entry.counts,
  };
}

async function windowPage(
  request: ChargesRequest,
  transaction: Transaction
): Promise<ChargesResponse> {
  const from =
    request.startDate.getTime() > request.windowStart.getTime()
      ? request.startDate
      : request.windowStart;
  const activity = await activitySince(from, transaction);

  let settling = 0;
  const inWindow: number[] = [];
  for (const [visitId, lastAt] of activity) {
    if (lastAt.getTime() > request.cutoff.getTime()) {
      settling += 1;
    } else {
      inWindow.push(visitId);
    }
  }
  inWindow.sort((a, b) => a - b);

  const after = request.afterVisitId;
  const remaining = after === null ? inWindow : inWindow.filter(id => id > after);
  const page = remaining.slice(0, request.limit);
  const counts = await countsFor(page, request.startDate, transaction);
  const patients = await patientIdsOf(page, transaction);

  return {
    visits: page.map(visitId => toVisitCounts(visitId, counts.get(visitId), patients)),
    next_after_visit_id:
      remaining.length > page.length && page.length > 0 ? String(page[page.length - 1]) : null,
    settling_visits: settling,
  };
}

async function lookup(request: ChargesRequest, transaction: Transaction): Promise<ChargesResponse> {
  const counts = await countsFor(request.visitIds, request.startDate, transaction);
  const patients = await patientIdsOf(request.visitIds, transaction);

  let settling = 0;
  const visits: VisitCounts[] = [];
  for (const visitId of [...request.visitIds].sort((a, b) => a - b)) {
    const entry = counts.get(visitId);
    if (entry.lastActivity !== null && entry.lastActivity.getTime() > request.cutoff.getTime()) {
      settling += 1;
    } else {
      visits.push(toVisitCounts(visitId, entry, patients));
    }
  }
  return { visits, next_after_visit_id: null, settling_visits: settling };
}

export async function chargeCounts(request: ChargesRequest): Promise<ChargesResponse> {
  return sequelizeConnection.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ },
    transaction =>
      request.visitIds.length > 0 ? lookup(request, transaction) : windowPage(request, transaction)
  );
}

export async function chargeLines(request: ChargeLinesRequest): Promise<ChargeLinesResponse> {
  return sequelizeConnection.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ },
    async transaction => {
      const lines = await linesOf([request.visitId], request.startDate, transaction);
      const typeOrder = (type: PrescribedLineType) => PRESCRIBED_LINE_TYPES.indexOf(type);
      lines.sort((a, b) => typeOrder(a.type) - typeOrder(b.type) || a.id - b.id);
      return {
        lines: lines.slice(0, MAX_LINES).map(line => ({
          type: line.type,
          id: String(line.id),
          state: line.state,
          created_at: line.createdAt.toISOString(),
        })),
        truncated: lines.length > MAX_LINES,
      };
    }
  );
}
