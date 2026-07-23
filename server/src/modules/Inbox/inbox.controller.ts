import { Request, Response } from 'express';
import { logger } from '../../core/helpers/logger';
import { InboxDeadLetter } from '../../database/models/inboxDeadLetter';
import { isInboxEnabled, readVerifierConfig } from './config';
import { verifyAndWrite } from './inbox-writer';

/**
 * The reverse-inbox endpoint: `POST /api/integration/accounting/events` (ADR-0023, ADR-0025 §6b).
 *
 * Verify → write Inbox_Events → commit → ACK 202. The ACK is strictly after the row commits, so it
 * means "we will not lose this". A separate drain applies the effect.
 *
 * Status mapping, per the plan:
 *   - verification failure → 401, NOTHING written (an unauthenticated caller must not fill tables).
 *   - authenticated but structurally invalid body → dead-letter + 202 (recording a permanently
 *     malformed instruction once beats an EMR retrying it forever).
 *   - duplicate idempotency key → 202, no new row (a duplicate is success, not an error).
 */
export class InboxController {
  static async receive(req: Request, res: Response): Promise<Response> {
    if (!isInboxEnabled()) {
      return res.status(503).json({ status: 'error', message: 'Reverse inbox is disabled.' });
    }

    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!Buffer.isBuffer(rawBody)) {
      // The route-scoped raw parser did not run — a wiring bug, loud rather than a silent 401.
      logger.error('Reverse inbox: req.rawBody is not a Buffer; raw-body parser not mounted.');
      return res.status(500).json({ status: 'error', message: 'Raw body unavailable.' });
    }

    const outcome = await verifyAndWrite(rawBody, req.headers, readVerifierConfig());

    if (outcome.result === 'REJECTED') {
      if (outcome.reason === 'MALFORMED_BODY') {
        // Authenticated (the verifier only returns MALFORMED_BODY after headers/window/key pass on
        // a parse failure) but unusable — dead-letter with the raw payload and ACK.
        await InboxController.deadLetterRaw(rawBody, outcome.reason);
        return res.status(202).json({ status: 'accepted' });
      }
      logger.warn(`Reverse inbox rejected an instruction: ${outcome.reason}`);
      return res.status(401).json({ status: 'error', message: 'Signature verification failed.' });
    }

    // ACCEPTED or DUPLICATE both ACK 202: the instruction is durably recorded (or already was).
    return res.status(202).json({ status: 'accepted' });
  }

  private static async deadLetterRaw(rawBody: Buffer, reason: string): Promise<void> {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody.toString('utf8')) as Record<string, unknown>;
    } catch {
      payload = { raw: rawBody.toString('utf8').slice(0, 4000) };
    }
    await InboxDeadLetter.create({
      event_id: typeof payload.event_id === 'string' ? payload.event_id : null,
      event_type: typeof payload.event_type === 'string' ? payload.event_type : null,
      idempotency_key: typeof payload.idempotency_key === 'string' ? payload.idempotency_key : null,
      reason,
      detail: 'Authenticated but structurally invalid reverse instruction.',
      payload,
      inbox_event_id: null,
    } as never);
  }
}
