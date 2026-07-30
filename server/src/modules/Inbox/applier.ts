import { ModelStatic, Model, Transaction } from 'sequelize';
import { PaymentStatus } from '../../database/enums';
import { PrescribedDrug } from '../../database/models/prescribedDrug';
import { PrescribedInvestigation } from '../../database/models/prescribedInvestigation';
import { PrescribedService } from '../../database/models/prescribedService';
import { PrescribedTest } from '../../database/models/prescribedTest';
import { PrescribedAdditionalItem } from '../../database/models/prescribedAdditionalItem';
import { InboxSequence } from '../../database/models/inboxSequence';
import { isPrescribedLineType, PrescribedLineType } from '../Outbox/prescribed-line-types';
import { emitPatientDemographicsChanged } from '../Outbox/outbox-writer';

/**
 * Applies a verified reverse instruction to the EMR's OWN rows (ADR-0023, ADR-0025 §6b).
 *
 * THE LOAD-BEARING INVARIANT: the EMR writes; Accounting never writes this column. There is
 * deliberately no "Accounting UPDATEs the EMR's MySQL" path — that is ADR-0011's lethal shortcut in
 * mirror image, made tempting by co-location. Everything money-facing about a prescribed line's
 * payment state is set HERE, off a verified instruction, and nowhere else.
 *
 * DECISION 9 — NO automated dispense side-effect. Applying `payment.settled` flips `payment_status`
 * and NOTHING else. The physical dispense is a human clinical action a pharmacist takes after
 * SEEING the gate open; an event must never hand out drugs. A refund likewise never un-dispenses
 * (Q6b.4): it changes `payment_status` only, even for an already-dispensed line.
 */

const MODEL_BY_TYPE: Record<PrescribedLineType, ModelStatic<Model>> = {
  drug: (PrescribedDrug as unknown) as ModelStatic<Model>,
  investigation: (PrescribedInvestigation as unknown) as ModelStatic<Model>,
  service: (PrescribedService as unknown) as ModelStatic<Model>,
  test: (PrescribedTest as unknown) as ModelStatic<Model>,
  additional_item: (PrescribedAdditionalItem as unknown) as ModelStatic<Model>,
};

export type ApplyResult =
  | { readonly outcome: 'APPLIED' }
  | { readonly outcome: 'DISCARDED_STALE' }
  | { readonly outcome: 'UNHANDLED' };

export class ApplyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApplyError';
  }
}

interface ExternalLineRef {
  readonly type: unknown;
  readonly id: unknown;
}

function readLineRef(body: Record<string, unknown>): { type: PrescribedLineType; id: number } {
  const ref = body.external_line_ref as ExternalLineRef | undefined;
  if (ref === undefined || typeof ref !== 'object' || ref === null) {
    throw new ApplyError('instruction body is missing external_line_ref.');
  }
  if (!isPrescribedLineType(ref.type)) {
    throw new ApplyError(
      `unknown external_line_ref.type "${String(ref.type)}"; not one of the five prescribed types.`
    );
  }
  const id = Number(ref.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApplyError(
      `external_line_ref.id must be a positive integer, got "${String(ref.id)}".`
    );
  }
  return { type: ref.type, id };
}

/**
 * Discards an overwrite instruction whose sequence is not higher than the one already applied for
 * its aggregate. The high-water row is locked FOR UPDATE and advanced in the same transaction as
 * the effect, so two concurrent instructions for one encounter cannot both apply out of order.
 *
 * Returns true if this instruction should proceed (it advanced the mark), false if it is stale.
 */
async function claimSequence(
  aggregateId: string,
  sequence: number,
  transaction: Transaction
): Promise<boolean> {
  const [row] = await InboxSequence.findOrCreate({
    where: { aggregate_id: aggregateId },
    defaults: { aggregate_id: aggregateId, last_applied_sequence: 0 } as never,
    lock: transaction.LOCK.UPDATE,
    transaction,
  });

  const applied = Number(
    ((row as unknown) as { last_applied_sequence: number }).last_applied_sequence
  );
  if (sequence <= applied) {
    return false;
  }

  await InboxSequence.update({ last_applied_sequence: sequence } as never, {
    where: { aggregate_id: aggregateId },
    transaction,
  });
  return true;
}

/**
 * Applies one instruction on the caller's transaction. The dedup (inbox idempotency key) and the
 * status flip commit together, so a crash never leaves one without the other.
 */
export async function applyInstruction(
  eventType: string,
  aggregateId: string,
  sequence: number,
  body: Record<string, unknown>,
  transaction: Transaction
): Promise<ApplyResult> {
  if (eventType === 'patient.demographics.requested') {
    return applyDemographicsRequest(body, transaction);
  }

  const nextStatus = statusFor(eventType);
  if (nextStatus === undefined) {
    // A valid reverse event whose handling has not landed (authorisation.rejected, stock.received).
    // Not a failure and not applied — recorded UNHANDLED, exactly as Accounting does inbound.
    return { outcome: 'UNHANDLED' };
  }

  // Overwrite semantics: discard a stale sequence rather than clobbering a fresher state.
  const fresh = await claimSequence(aggregateId, sequence, transaction);
  if (!fresh) {
    return { outcome: 'DISCARDED_STALE' };
  }

  const { type, id } = readLineRef(body);
  const model = MODEL_BY_TYPE[type];

  // Existence is checked by a read, NOT by the UPDATE's affected-row count: MySQL reports 0 rows
  // affected when the new value equals the current one (settling an already-Paid line), which would
  // otherwise be misread as "the line does not exist" and wrongly dead-letter a valid instruction.
  const existing = await model.findByPk(id, { transaction });
  if (existing === null) {
    throw new ApplyError(
      `no ${type} row with id ${id} to apply ${eventType} to — the line the instruction names does not exist.`
    );
  }

  // ONLY payment_status. No dispense field, no quantity, no returned-flag — decision 9. A refund
  // reverts to Pending and still never touches dispense state (Q6b.4).
  await model.update({ payment_status: nextStatus } as never, {
    where: { id },
    transaction,
  });

  return { outcome: 'APPLIED' };
}

/**
 * `patient.demographics.requested` — an OPERATOR asked Accounting to refresh one patient's cached
 * demographics, and Accounting relayed the request here (Accounting #43).
 *
 * Deliberately NOT sequence-guarded: a resync is a request to send current state, not a state
 * change, so there is nothing to be stale against. Discarding one as "old" would defeat the whole
 * point — it is the manual remedy when an earlier event was lost.
 *
 * A missing or unparseable patient id is UNHANDLED rather than an error: a resync that cannot be
 * satisfied must never poison the reverse inbox for the payment instructions behind it.
 */
async function applyDemographicsRequest(
  body: Record<string, unknown>,
  transaction: Transaction
): Promise<ApplyResult> {
  const raw = body.patient_id;
  if (typeof raw !== 'string' && typeof raw !== 'number') {
    return { outcome: 'UNHANDLED' };
  }

  const emitted = await emitPatientDemographicsChanged(raw, transaction);
  return emitted === undefined ? { outcome: 'UNHANDLED' } : { outcome: 'APPLIED' };
}

/** The status a reverse event sets, or undefined for a valid-but-unhandled reverse type. */
function statusFor(eventType: string): PaymentStatus | undefined {
  switch (eventType) {
    case 'payment.settled':
      return PaymentStatus.PAID;
    case 'payment.refunded':
      return PaymentStatus.PENDING;
    default:
      return undefined;
  }
}
