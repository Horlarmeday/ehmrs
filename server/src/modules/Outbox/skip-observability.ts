import { logger, taggedMessaged } from '../../core/helpers/logger';

/**
 * Why a `stock.returned` emission was skipped. Both reasons are legitimate states the producer
 * must tolerate, not errors: a store row predating the #297 applier has no `external_batch_id`,
 * and a drug may carry no catalogue `code`.
 */
export type StockReturnedSkipReason = 'missing_batch_id' | 'missing_item_code';

export type StockReturnedSkipSource = 'dispensary_to_store' | 'patient_to_dispensary';

export interface StockReturnedSkip {
  source: StockReturnedSkipSource;
  reason: StockReturnedSkipReason;
  return_id?: number | null;
  drug_id?: number | null;
  pharmacy_store_id?: number | null;
  inventory_item_id?: number | null;
}

const REASON_DETAIL: Record<StockReturnedSkipReason, string> = {
  missing_batch_id: 'the source store row carries no external_batch_id',
  missing_item_code: 'the drug carries no catalogue code',
};

const ID_FIELDS = ['return_id', 'drug_id', 'pharmacy_store_id', 'inventory_item_id'] as const;

const message = taggedMessaged('stock.returned');

/**
 * Records that stock moved but no `stock.returned` event was emitted (EMR #21, #22).
 *
 * The guards that cause the skip are correct — `buildStockReturnedEvent` throws on an empty batch
 * id, so emitting would abort a clinical transaction, and #295 D3 forbids fabricating one. The
 * defect this closes is that the skip was INVISIBLE: Accounting cannot detect an event it never
 * receives, so its per-location stock split silently under-counted every legacy-batch return.
 *
 * `warn`, deliberately, and not `info`: logger.ts resolves the level to 'warn' outside
 * development, so an `info` line would itself be invisible in production — the very defect.
 *
 * Ids only, never demographics (ADR-0016 applies to logs as to event bodies): no patient, no
 * reason for return, no price. Never throws — observability must not be able to abort the
 * clinical transaction the guards exist to protect.
 */
export const logStockReturnedSkip = (skip: StockReturnedSkip): void => {
  try {
    const ids = ID_FIELDS.filter(field => skip[field] !== undefined && skip[field] !== null)
      .map(field => `${field}=${skip[field]}`)
      .join(' ');

    logger.warn(
      message(
        `not emitted for a ${skip.source} return: ${REASON_DETAIL[skip.reason]} ` +
          `[reason=${skip.reason}${ids ? ` ${ids}` : ''}]. Stock moved; Accounting was not told.`
      )
    );
  } catch {
    // Logging must never abort a clinical transaction.
  }
};
