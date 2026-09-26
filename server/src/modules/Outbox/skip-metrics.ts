import {
  logStockReturnedSkip,
  StockReturnedSkip,
  StockReturnedSkipReason,
  StockReturnedSkipSource,
} from './skip-observability';
import { logger, taggedMessaged } from '../../core/helpers/logger';

const SUMMARY_INTERVAL_MS = Number(process.env.SKIP_SUMMARY_INTERVAL_MS) || 60 * 60 * 1000;

const message = taggedMessaged('stock.returned');

const counts = new Map<StockReturnedSkipSource, Map<StockReturnedSkipReason, number>>();

let summaryTimer: NodeJS.Timeout | null = null;

const formatSummary = (): string =>
  Array.from(counts.entries())
    .flatMap(([source, byReason]) =>
      Array.from(byReason.entries()).map(
        ([reason, count]) => `source=${source} reason=${reason} count=${count}`
      )
    )
    .join('; ');

const flushSummary = (): void => {
  try {
    if (counts.size > 0) {
      logger.warn(message(`skip summary for the last hour: ${formatSummary()}`));
      counts.clear();
    } else {
      stopTimer();
    }
  } catch {
    // Observability must never abort a clinical transaction.
  }
};

const stopTimer = (): void => {
  if (summaryTimer) {
    clearInterval(summaryTimer);
    summaryTimer = null;
  }
};

const startTimer = (): void => {
  if (!summaryTimer) {
    summaryTimer = setInterval(flushSummary, SUMMARY_INTERVAL_MS);
    summaryTimer.unref();
  }
};

export const recordStockReturnedSkip = (skip: StockReturnedSkip): void => {
  try {
    logStockReturnedSkip(skip);

    const byReason = counts.get(skip.source) ?? new Map<StockReturnedSkipReason, number>();
    byReason.set(skip.reason, (byReason.get(skip.reason) ?? 0) + 1);
    counts.set(skip.source, byReason);

    startTimer();
  } catch {
    // Observability must never abort a clinical transaction.
  }
};
