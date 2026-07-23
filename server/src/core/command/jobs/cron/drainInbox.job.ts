import { logger, taggedMessaged } from '../../../helpers/logger';
import { drainInbox } from '../../../../modules/Inbox/processor';
import { isInboxEnabled } from '../../../../modules/Inbox/config';

/**
 * The reverse-inbox drainer's scheduled entry point (ADR-0018, ADR-0023, ADR-0025 §6b).
 *
 * The HTTP endpoint only VERIFIES and RECORDS an instruction (ACK-on-commit); this job is what
 * APPLIES the PENDING rows — flipping payment_status — off the request path, so a slow apply never
 * blocks the ACK. A missed tick loses nothing: the row stays PENDING and the next tick applies it,
 * which is the whole point of the inbox table being the durability boundary.
 *
 * Gated by EMR_INBOX_ENABLED, so with the flag off this is a cheap no-op.
 */
export const drainInboxJob = async (): Promise<void> => {
  const message = taggedMessaged('DrainInbox');

  if (!isInboxEnabled()) {
    return;
  }

  try {
    const result = await drainInbox();
    if (result.claimed > 0) {
      logger.notice(
        message(
          `Drained inbox: claimed ${result.claimed}, applied ${result.applied}, ` +
            `discarded ${result.discarded}, unhandled ${result.unhandled}, failed ${result.failed}`
        )
      );
    }
    if (result.failed > 0) {
      // Surfacing, not swallowing: a failed instruction is money Accounting recorded that the EMR
      // could not act on — a paying patient's gate may stay shut. It is dead-lettered for replay,
      // but an operator must know.
      logger.error(
        message(`${result.failed} inbox instruction(s) dead-lettered and need attention`)
      );
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    logger.error(message(`Inbox drain pass failed: ${detail}`));
  }
};
