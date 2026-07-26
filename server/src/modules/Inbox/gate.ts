import { ModelStatic, Model } from 'sequelize';
import { PaymentStatus } from '../../database/enums';
import { PrescribedDrug } from '../../database/models/prescribedDrug';
import { PrescribedInvestigation } from '../../database/models/prescribedInvestigation';
import { PrescribedService } from '../../database/models/prescribedService';
import { PrescribedTest } from '../../database/models/prescribedTest';
import { PrescribedAdditionalItem } from '../../database/models/prescribedAdditionalItem';
import { isPrescribedLineType, PrescribedLineType } from '../Outbox/prescribed-line-types';

/**
 * The pharmacy/discharge GATE reads the RECORDED payment_status and fails safe (ADR-0023).
 *
 * A line releases only on a payment_status the reverse inbox has already applied. While that
 * projection is stale — the reverse channel is paused, an instruction has not drained yet — the
 * gate HOLDS. That is the correct failure direction: holding a paid patient's drugs briefly is
 * recoverable; releasing an unpaid patient's drugs is not.
 *
 * There is deliberately NO synchronous counter→EMR write to "freshen" the status on demand: that
 * would make Accounting's commit wait on a cross-engine HTTP write and let a slow EMR block the
 * cashier from taking money. The gate reads only what has already been durably recorded here.
 *
 * DELIBERATELY UNWIRED (issue #137). No release path calls this. The authoritative gate at the
 * dispense and discharge sites is the synchronous, fail-closed `checkGate` in
 * `Outbox/gate-check.ts`, which folds in emergency-bypass, override, and the recorded-paid check
 * server-side. Composing the two would only create a gate that can DISAGREE with the authoritative
 * one: the local `payment_status` projection is precisely the stale data the remote call exists to
 * see past. Left in place for the reverse-inbox applier's use; do not wire it into a release path.
 */

const MODEL_BY_TYPE: Record<PrescribedLineType, ModelStatic<Model>> = {
  drug: (PrescribedDrug as unknown) as ModelStatic<Model>,
  investigation: (PrescribedInvestigation as unknown) as ModelStatic<Model>,
  service: (PrescribedService as unknown) as ModelStatic<Model>,
  test: (PrescribedTest as unknown) as ModelStatic<Model>,
  additional_item: (PrescribedAdditionalItem as unknown) as ModelStatic<Model>,
};

/** A status that permits fulfilment. Anything else (notably Pending) HOLDS the gate. */
const RELEASING_STATUSES: ReadonlySet<string> = new Set([
  PaymentStatus.PAID,
  PaymentStatus.CLEARED,
  PaymentStatus.PERMITTED,
]);

export interface GateDecision {
  readonly released: boolean;
  readonly status: string | null;
}

/**
 * Whether a prescribed line may be fulfilled, by its recorded payment_status. A line that does not
 * exist, or whose status is not yet a releasing one, HOLDS (released: false) — never releases on
 * missing or stale data.
 */
export async function isReleased(type: unknown, id: unknown): Promise<GateDecision> {
  if (!isPrescribedLineType(type)) {
    return { released: false, status: null };
  }
  const lineId = Number(id);
  if (!Number.isInteger(lineId) || lineId <= 0) {
    return { released: false, status: null };
  }

  const model = MODEL_BY_TYPE[type];
  const row = await model.findByPk(lineId);
  if (row === null) {
    return { released: false, status: null };
  }

  const status = ((row as unknown) as { payment_status: string }).payment_status;
  return { released: RELEASING_STATUSES.has(status), status };
}
