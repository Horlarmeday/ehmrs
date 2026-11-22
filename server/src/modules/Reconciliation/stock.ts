import { QueryTypes, Transaction } from 'sequelize';
import { sequelizeConnection } from '../../database/config/data-source';
import { HistoryType } from '../../database/enums';
import { StockRequest } from './request';
import { tables } from './tables';

/**
 * Stock movement totals per Accounting batch for the reconciliation (#109). Dispenses and both
 * kinds of return are read from the dispensary layer history, named by the layer's frozen batch
 * id; receipts from the store history row the `stock.received` applier stamps. A patient return
 * carries its visit and a dispensary-to-store return does not, which is what tells them apart.
 */

export const MAX_BATCHES = 5000;

export interface BatchTotals {
  readonly external_batch_id: string;
  readonly item_code: string | null;
  readonly drug_type: string | null;
  readonly last_movement_at: string | null;
  readonly dispensed: number;
  readonly returned_by_patient: number;
  readonly returned_to_store: number;
  readonly received: number;
}

export interface UntrackedTotals {
  readonly dispensed: number;
  readonly returned_by_patient: number;
  readonly returned_to_store: number;
}

export interface StockResponse {
  readonly batches: BatchTotals[];
  readonly untracked: UntrackedTotals;
  readonly settling_batches: number;
  readonly truncated: boolean;
}

interface MutableTotals {
  itemCode: string | null;
  drugType: string | null;
  lastMovementAt: Date | null;
  dispensed: number;
  returnedByPatient: number;
  returnedToStore: number;
  received: number;
}

function emptyTotals(): MutableTotals {
  return {
    itemCode: null,
    drugType: null,
    lastMovementAt: null,
    dispensed: 0,
    returnedByPatient: 0,
    returnedToStore: 0,
    received: 0,
  };
}

function later(a: Date | null, b: Date): Date {
  return a === null || b.getTime() > a.getTime() ? b : a;
}

function zeroUntracked(): UntrackedTotals {
  return { dispensed: 0, returned_by_patient: 0, returned_to_store: 0 };
}

async function batchesActiveSince(from: Date, transaction: Transaction): Promise<string[]> {
  const t = tables();
  const rows = await sequelizeConnection.query<{ batch: string }>(
    `SELECT DISTINCT layer.external_batch_id AS batch FROM ${t.layerHistory} history ` +
      `JOIN ${t.layer} layer ON layer.id = history.inventory_item_id ` +
      'WHERE history.createdAt >= :from AND history.history_type IN (:dispensaryTypes) ' +
      'AND layer.external_batch_id IS NOT NULL ' +
      'UNION ' +
      `SELECT DISTINCT external_batch_id AS batch FROM ${t.storeHistory} ` +
      'WHERE createdAt >= :from AND history_type = :supplied AND external_batch_id IS NOT NULL',
    {
      replacements: {
        from,
        dispensaryTypes: [HistoryType.DISPENSED, HistoryType.RETURNED],
        supplied: HistoryType.SUPPLIED,
      },
      type: QueryTypes.SELECT,
      transaction,
    }
  );
  return rows.map(row => String(row.batch));
}

async function totalsFor(
  batchIds: readonly string[],
  startDate: Date,
  transaction: Transaction
): Promise<Map<string, MutableTotals>> {
  const result = new Map<string, MutableTotals>();
  for (const batchId of batchIds) {
    result.set(batchId, emptyTotals());
  }
  if (batchIds.length === 0) {
    return result;
  }

  const t = tables();
  const dispensary = await sequelizeConnection.query<{
    batch: string;
    history_type: HistoryType;
    with_visit: number;
    dispensed: string | number | null;
    returned: string | number | null;
    last_at: Date;
  }>(
    'SELECT layer.external_batch_id AS batch, history.history_type, ' +
      '(history.visit_id IS NOT NULL) AS with_visit, ' +
      'SUM(history.quantity_dispensed) AS dispensed, SUM(history.quantity_returned) AS returned, ' +
      'MAX(history.createdAt) AS last_at ' +
      `FROM ${t.layerHistory} history JOIN ${t.layer} layer ON layer.id = history.inventory_item_id ` +
      'WHERE layer.external_batch_id IN (:batchIds) AND history.createdAt >= :startDate ' +
      'AND history.history_type IN (:dispensaryTypes) ' +
      'GROUP BY layer.external_batch_id, history.history_type, with_visit',
    {
      replacements: {
        batchIds,
        startDate,
        dispensaryTypes: [HistoryType.DISPENSED, HistoryType.RETURNED],
      },
      type: QueryTypes.SELECT,
      transaction,
    }
  );
  for (const row of dispensary) {
    const totals = result.get(String(row.batch));
    if (totals === undefined) {
      continue;
    }
    totals.lastMovementAt = later(totals.lastMovementAt, new Date(row.last_at));
    if (row.history_type === HistoryType.DISPENSED) {
      totals.dispensed += Number(row.dispensed ?? 0);
    } else if (Number(row.with_visit) === 1) {
      totals.returnedByPatient += Number(row.returned ?? 0);
    } else {
      totals.returnedToStore += Number(row.returned ?? 0);
    }
  }

  const receipts = await sequelizeConnection.query<{
    batch: string;
    received: string | number | null;
    last_at: Date;
  }>(
    'SELECT external_batch_id AS batch, SUM(quantity_supplied) AS received, MAX(createdAt) AS last_at ' +
      `FROM ${t.storeHistory} WHERE external_batch_id IN (:batchIds) AND createdAt >= :startDate ` +
      'AND history_type = :supplied GROUP BY external_batch_id',
    {
      replacements: { batchIds, startDate, supplied: HistoryType.SUPPLIED },
      type: QueryTypes.SELECT,
      transaction,
    }
  );
  for (const row of receipts) {
    const totals = result.get(String(row.batch));
    if (totals !== undefined) {
      totals.lastMovementAt = later(totals.lastMovementAt, new Date(row.last_at));
      totals.received += Number(row.received ?? 0);
    }
  }

  await attachItemIdentity(batchIds, result, transaction);
  return result;
}

async function attachItemIdentity(
  batchIds: readonly string[],
  result: Map<string, MutableTotals>,
  transaction: Transaction
): Promise<void> {
  const t = tables();
  const fromLayers = await sequelizeConnection.query<{
    batch: string;
    code: string | null;
    drug_type: string | null;
  }>(
    'SELECT layer.external_batch_id AS batch, drug.code, layer.drug_type FROM ' +
      `${t.layer} layer JOIN ${t.drug} drug ON drug.id = layer.drug_id ` +
      'WHERE layer.external_batch_id IN (:batchIds)',
    { replacements: { batchIds }, type: QueryTypes.SELECT, transaction }
  );
  const fromReceipts = await sequelizeConnection.query<{
    batch: string;
    code: string | null;
    drug_type: string | null;
  }>(
    'SELECT history.external_batch_id AS batch, drug.code, store_row.drug_type FROM ' +
      `${t.storeHistory} history JOIN ${t.storeRow} store_row ON store_row.id = history.pharmacy_store_id ` +
      `JOIN ${t.drug} drug ON drug.id = store_row.drug_id ` +
      'WHERE history.external_batch_id IN (:batchIds)',
    { replacements: { batchIds }, type: QueryTypes.SELECT, transaction }
  );
  for (const row of [...fromReceipts, ...fromLayers]) {
    const totals = result.get(String(row.batch));
    if (totals === undefined) {
      continue;
    }
    const code = typeof row.code === 'string' ? row.code.trim() : '';
    if (totals.itemCode === null && code.length > 0) {
      totals.itemCode = code;
    }
    if (totals.drugType === null && row.drug_type !== null) {
      totals.drugType = String(row.drug_type);
    }
  }
}

async function untrackedBetween(
  from: Date,
  cutoff: Date,
  transaction: Transaction
): Promise<UntrackedTotals> {
  const t = tables();
  const rows = await sequelizeConnection.query<{
    history_type: HistoryType;
    with_visit: number;
    dispensed: string | number | null;
    returned: string | number | null;
  }>(
    'SELECT history.history_type, (history.visit_id IS NOT NULL) AS with_visit, ' +
      'SUM(history.quantity_dispensed) AS dispensed, SUM(history.quantity_returned) AS returned ' +
      `FROM ${t.layerHistory} history LEFT JOIN ${t.layer} layer ON layer.id = history.inventory_item_id ` +
      'WHERE layer.external_batch_id IS NULL AND history.createdAt >= :from AND history.createdAt <= :cutoff ' +
      'AND history.history_type IN (:dispensaryTypes) GROUP BY history.history_type, with_visit',
    {
      replacements: {
        from,
        cutoff,
        dispensaryTypes: [HistoryType.DISPENSED, HistoryType.RETURNED],
      },
      type: QueryTypes.SELECT,
      transaction,
    }
  );
  let dispensed = 0;
  let returnedByPatient = 0;
  let returnedToStore = 0;
  for (const row of rows) {
    if (row.history_type === HistoryType.DISPENSED) {
      dispensed += Number(row.dispensed ?? 0);
    } else if (Number(row.with_visit) === 1) {
      returnedByPatient += Number(row.returned ?? 0);
    } else {
      returnedToStore += Number(row.returned ?? 0);
    }
  }
  return {
    dispensed,
    returned_by_patient: returnedByPatient,
    returned_to_store: returnedToStore,
  };
}

function toBatchTotals(batchId: string, totals: MutableTotals): BatchTotals {
  return {
    external_batch_id: batchId,
    item_code: totals.itemCode,
    drug_type: totals.drugType,
    last_movement_at: totals.lastMovementAt === null ? null : totals.lastMovementAt.toISOString(),
    dispensed: totals.dispensed,
    returned_by_patient: totals.returnedByPatient,
    returned_to_store: totals.returnedToStore,
    received: totals.received,
  };
}

function split(
  batchIds: readonly string[],
  totals: Map<string, MutableTotals>,
  cutoff: Date
): { batches: BatchTotals[]; settling: number } {
  let settling = 0;
  const batches: BatchTotals[] = [];
  for (const batchId of [...batchIds].sort()) {
    const entry = totals.get(batchId);
    if (entry.lastMovementAt !== null && entry.lastMovementAt.getTime() > cutoff.getTime()) {
      settling += 1;
    } else {
      batches.push(toBatchTotals(batchId, entry));
    }
  }
  return { batches, settling };
}

export async function stockTotals(request: StockRequest): Promise<StockResponse> {
  return sequelizeConnection.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ },
    async transaction => {
      if (request.batchIds.length > 0) {
        const totals = await totalsFor(request.batchIds, request.startDate, transaction);
        const { batches, settling } = split(request.batchIds, totals, request.cutoff);
        return {
          batches,
          untracked: zeroUntracked(),
          settling_batches: settling,
          truncated: false,
        };
      }

      const from =
        request.startDate.getTime() > request.windowStart.getTime()
          ? request.startDate
          : request.windowStart;
      const active = await batchesActiveSince(from, transaction);
      if (active.length > MAX_BATCHES) {
        return { batches: [], untracked: zeroUntracked(), settling_batches: 0, truncated: true };
      }
      const totals = await totalsFor(active, request.startDate, transaction);
      const { batches, settling } = split(active, totals, request.cutoff);
      return {
        batches,
        untracked: await untrackedBetween(from, request.cutoff, transaction),
        settling_batches: settling,
        truncated: false,
      };
    }
  );
}
