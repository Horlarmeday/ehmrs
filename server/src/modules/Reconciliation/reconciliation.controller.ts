import { Request, Response } from 'express';
import { logger } from '../../core/helpers/logger';
import { isInboxEnabled, readVerifierConfig } from '../Inbox/config';
import { verifyReverseSignature } from '../Inbox/verifier';
import { chargeCounts, chargeLines } from './charges';
import { outboxDepth } from './outbox-depth';
import { Parsed, parseChargeLinesRequest, parseChargesRequest, parseStockRequest } from './request';
import { stockTotals } from './stock';

/**
 * Accounting's signed reconciliation reads (#109, ehmrs_accounting#747). Authenticated exactly like
 * the reverse inbox and by the same key, because the caller is the same provisioned sender. Reads
 * only: a replay inside the signature window can learn counts, never change anything.
 */

type RawBodyRequest = Request & { rawBody?: Buffer };

async function answer<T>(
  req: Request,
  res: Response,
  parse: (body: Record<string, unknown>) => Parsed<T>,
  read: (request: T) => Promise<unknown>
): Promise<Response> {
  if (!isInboxEnabled()) {
    return res
      .status(503)
      .json({ status: 'error', message: 'Accounting integration is disabled.' });
  }

  const rawBody = (req as RawBodyRequest).rawBody;
  if (!Buffer.isBuffer(rawBody)) {
    logger.error('Reconciliation read: req.rawBody is not a Buffer; raw-body parser not mounted.');
    return res.status(500).json({ status: 'error', message: 'Raw body unavailable.' });
  }

  let config: ReturnType<typeof readVerifierConfig>;
  try {
    config = readVerifierConfig();
  } catch (error) {
    logger.error(`Reconciliation read: ${error instanceof Error ? error.message : String(error)}`);
    return res
      .status(503)
      .json({ status: 'error', message: 'Accounting integration is not configured.' });
  }

  const verification = verifyReverseSignature(rawBody, req.headers, config);
  if (!verification.ok) {
    logger.warn(`Reconciliation read rejected: ${verification.reason}`);
    return res.status(401).json({ status: 'error', message: 'Signature verification failed.' });
  }

  const parsed = parse(verification.parsedBody);
  if (!parsed.ok) {
    return res.status(400).json({ status: 'error', message: parsed.error });
  }

  try {
    return res.status(200).json(await read(parsed.value));
  } catch (error) {
    logger.error(
      `Reconciliation read failed: ${error instanceof Error ? error.message : String(error)}`
    );
    return res.status(500).json({ status: 'error', message: 'Reconciliation read failed.' });
  }
}

export class ReconciliationController {
  static charges(req: Request, res: Response): Promise<Response> {
    return answer(req, res, parseChargesRequest, chargeCounts);
  }

  static chargeLines(req: Request, res: Response): Promise<Response> {
    return answer(req, res, parseChargeLinesRequest, chargeLines);
  }

  static stock(req: Request, res: Response): Promise<Response> {
    return answer(req, res, parseStockRequest, stockTotals);
  }

  static outbox(req: Request, res: Response): Promise<Response> {
    return answer(
      req,
      res,
      () => ({ ok: true, value: null }),
      () => outboxDepth()
    );
  }
}
