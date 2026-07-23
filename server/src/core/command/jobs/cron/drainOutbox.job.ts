import { logger, taggedMessaged } from '../../../helpers/logger';
import { drainOnce, httpPoster } from '../../../../modules/Outbox/drainer';
import { isOutboxEnabled } from '../../../../modules/Outbox/outbox-writer';

/**
 * The outbox drainer's scheduled entry point (ADR-0018, ADR-0023).
 *
 * Registered as a recurring Agenda job so it runs in the OS-supervised worker process, NEVER
 * inline in an HTTP request: a slow or down Accounting inbox must never block a clinician. A
 * missed tick loses nothing — the unsent rows are still in the outbox and the next tick sends
 * them. That is the whole point of the table being the durability boundary.
 *
 * Gated by EMR_OUTBOX_ENABLED, so with the flag off this is a cheap no-op and the drainer never
 * touches the network.
 */
export const drainOutbox = async (): Promise<void> => {
  const message = taggedMessaged('DrainOutbox');

  if (!isOutboxEnabled()) {
    return;
  }

  try {
    const result = await drainOnce(httpPoster);
    if (result.claimed > 0) {
      logger.notice(
        message(
          `Drained outbox: claimed ${result.claimed}, sent ${result.sent}, ` +
            `failed ${result.failed}, dead-lettered ${result.deadLettered}`
        )
      );
    }
    if (result.deadLettered > 0) {
      // Surfacing, not swallowing: a dead-lettered event is money the EMR captured that Accounting
      // may never hear about. It stays in the table for replay, but an operator must know.
      logger.error(
        message(`${result.deadLettered} outbox event(s) have exhausted retries and need attention`)
      );
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    logger.error(message(`Outbox drain pass failed: ${detail}`));
  }
};
