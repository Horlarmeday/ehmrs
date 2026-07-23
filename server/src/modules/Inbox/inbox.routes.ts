import express, { NextFunction, Request, Response, Router } from 'express';
import { InboxController } from './inbox.controller';

/**
 * The reverse-inbox route. Authenticated by HMAC (ADR-0025 §5), NOT by the staff JWT `verify`
 * middleware — the caller is the co-deployed Accounting service, not a logged-in user.
 *
 * A ROUTE-SCOPED raw body parser captures the exact bytes for HMAC verification, isolated from the
 * global `bodyParser.json()`: the signature covers the raw body, so a re-serialisation by the JSON
 * parser would change the hash. This router is mounted BEFORE the global json() in the route table,
 * so these bytes reach the verifier untouched.
 */
const router = Router();

const rawJson = express.raw({ type: 'application/json', limit: '5mb' });

function stashRawBody(req: Request, _res: Response, next: NextFunction): void {
  if (Buffer.isBuffer(req.body)) {
    (req as Request & { rawBody?: Buffer }).rawBody = req.body;
  }
  next();
}

router.post('/events', rawJson, stashRawBody, InboxController.receive);

export default router;
