import express, { NextFunction, Request, Response, Router } from 'express';
import { ReconciliationController } from './reconciliation.controller';

/**
 * Accounting's reconciliation reads (#109). Like the reverse inbox, these verify an HMAC over the
 * raw bytes, so the route-scoped raw parser must run before the global JSON parser.
 */
const router = Router();

const rawJson = express.raw({ type: 'application/json', limit: '1mb' });

function stashRawBody(req: Request, _res: Response, next: NextFunction): void {
  if (Buffer.isBuffer(req.body)) {
    (req as Request & { rawBody?: Buffer }).rawBody = req.body;
  }
  next();
}

router.post('/charges', rawJson, stashRawBody, ReconciliationController.charges);
router.post('/charges/lines', rawJson, stashRawBody, ReconciliationController.chargeLines);
router.post('/stock', rawJson, stashRawBody, ReconciliationController.stock);
router.post('/outbox', rawJson, stashRawBody, ReconciliationController.outbox);

export default router;
