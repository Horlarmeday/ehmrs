import { ModelStatic, Model, Transaction } from 'sequelize';
import { HistoryType, PaymentStatus } from '../../database/enums';
import { PrescribedDrug } from '../../database/models/prescribedDrug';
import { PrescribedInvestigation } from '../../database/models/prescribedInvestigation';
import { PrescribedService } from '../../database/models/prescribedService';
import { PrescribedTest } from '../../database/models/prescribedTest';
import { PrescribedAdditionalItem } from '../../database/models/prescribedAdditionalItem';
import { InboxSequence } from '../../database/models/inboxSequence';
import { Drug } from '../../database/models/drug';
import { PharmacyStore } from '../../database/models/pharmacyStore';
import { PharmacyStoreHistory } from '../../database/models/pharmacyStoreHistory';
import { isPrescribedLineType, PrescribedLineType } from '../Outbox/prescribed-line-types';
import { emitPatientDemographicsChanged } from '../Outbox/outbox-writer';

/**
 * Applies a verified reverse instruction to the EMR's OWN rows (ADR-0023, ADR-0025 §6b).
 *
 * THE INSURER LIFECYCLE (Accounting #286, ADR-0039). `authorisation.granted` sets `Permitted` —
 * the HMO authorised the line, so it may be fulfilled without the patient paying at the counter.
 * It arrives on ANY approval, full or partial: a partial approval has already moved its shortfall
 * onto the patient's portion in Accounting, and that residue is chased by the encounter-scoped
 * discharge gate rather than by holding this line. `authorisation.rejected` returns the line to
 * `Pending`, which HOLDS — the EMR has no `Declined` status, so "the HMO refused" and "nobody has
 * asked yet" are the same row state here. They gate identically; only the wording of the chase
 * differs, and that lives in Accounting.
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

  if (eventType === 'stock.received') {
    return applyStockReceived(body, transaction);
  }

  const nextStatus = statusFor(eventType);
  if (nextStatus === undefined) {
    // A valid reverse event whose handling has not landed. Not a failure and not applied —
    // recorded UNHANDLED, exactly as Accounting does inbound.
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

/**
 * `stock.received` — Accounting recorded a stock receipt and is telling the EMR which batch id it
 * minted for it (Accounting #297, ADR-0040).
 *
 * Persisting it is the second hop of the join #295 designed: `Inventory_Items.pharmacy_store_id` →
 * `Pharmacy_Store_Histories.external_batch_id` → Accounting's `stock_batch`. Without it the EMR cannot
 * echo a batch back on `dispense.recorded` and Accounting's COGS slice has nothing to cost.
 *
 * NEVER CHANGES QUANTITY, and that is the whole posture of the reverse contract: a reverse event
 * updates state the EMR owns and produces no side effects of its own (ADR-0025 decision 9 — they
 * "never carry money as a side effect and never hand out drugs"). The store row's
 * `quantity_received` was written when the stock physically arrived. Adding the event's `quantity`
 * on top would count the same receipt twice. The field is carried so the EMR can VERIFY agreement,
 * which is what the mismatch check below does.
 *
 * TWO ENTRY PATHS, and the EMR currently uses the older one. Accounting issue #26 makes goods
 * receipt an accounting-module action: Accounting mints the batch and the EMR "references only
 * batches it was told about, never invents one". But `createCashItem`
 * (`Store/store.repository.ts`) still creates store rows directly, and that path is in daily use.
 * So this applier ATTACHES to an existing unclaimed row when it finds one (the legacy path) and
 * would CREATE the row when it does not (the #26 path).
 *
 * The create path is BLOCKED, deliberately and visibly, by the final `ApplyError` below.
 * `Pharmacy_Store_Items` requires `unit_price` and `selling_price` NOT NULL, and `stock.received`
 * deliberately carries NO cost (ADR-0009). Creating the row would mean inventing both — a
 * fabricated acquisition cost and, worse, a fabricated patient-facing selling price. That is
 * precisely the "silently wrong" failure ADR-0009 exists to prevent, so the receipt fails loudly
 * instead. Closing it needs a contract decision, not a default value.
 *
 * NOT sequence-guarded, and that is correct rather than an oversight: `stock.received` is an
 * ADDITIVE event, so a late one is still true. Note this branch returns BEFORE the `claimSequence`
 * staleness check below — idempotency rests entirely on the inbox key plus the fact that writing
 * the same id twice is a no-op. This is why the column is deliberately non-unique.
 *
 * A receipt this EMR cannot place THROWS rather than returning UNHANDLED: Accounting minted a batch
 * against stock this EMR has no row for, and that divergence must be visible as a FAILED row rather
 * than silently swallowed. The reverse — the EMR quietly forgetting a batch id — is exactly the gap
 * issue #297 exists to close.
 */
async function applyStockReceived(
  body: Record<string, unknown>,
  transaction: Transaction
): Promise<ApplyResult> {
  const externalBatchId = body.external_batch_id;
  const itemCode = body.item_code;

  if (typeof externalBatchId !== 'string' || externalBatchId.length === 0) {
    throw new ApplyError('stock.received carries no external_batch_id');
  }
  if (typeof itemCode !== 'string' || itemCode.length === 0) {
    throw new ApplyError(
      `stock.received ${externalBatchId} carries no item_code, so the batch cannot be placed`
    );
  }

  const drug = await Drug.findOne({ where: { code: itemCode }, transaction });
  if (!drug) {
    throw new ApplyError(
      `stock.received ${externalBatchId} names item_code "${itemCode}", which matches no drug in ` +
        'this EMR. Accounting minted a batch this EMR cannot place.'
    );
  }

  const quantity = body.quantity;
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) {
    throw new ApplyError(
      `stock.received ${externalBatchId} carries no positive integer quantity, so the receipt ` +
        'cannot be matched to a store row'
    );
  }

  // Redelivery check FIRST. An additive event may arrive more than once, and this branch runs
  // before the inbox's sequence guard, so the second delivery must find its own earlier write and
  // stop — not consume a second store row, which would attribute one Accounting batch to two EMR
  // rows and silently double the stock it names.
  const alreadyApplied = await PharmacyStoreHistory.findOne({
    where: { external_batch_id: externalBatchId },
    transaction,
  });
  if (alreadyApplied) {
    return { outcome: 'APPLIED' };
  }

  // Matched on drug AND quantity, not drug alone. "Newest unclaimed row for this drug" is a
  // heuristic, and it misattributes as soon as two receipts of the same drug are entered before
  // either event drains: both rows are unclaimed, and the events would attach in whatever order
  // they arrive. Requiring the quantity to agree narrows the candidates to rows that actually
  // match what Accounting recorded, and turns a disagreement into a visible failure below.
  // Select the DELIVERY directly, not the bin. Since ADR-0041 the batch id lands on an unclaimed
  // SUPPLIED history row, and a bin may hold several deliveries — some already claimed. Finding the
  // bin first and then looking for an unclaimed delivery inside it picks the newest bin whose
  // QUANTITY matches and then fails if that particular bin's delivery is already claimed, even
  // though another bin's is free. Matching the delivery in one query cannot make that mistake.
  const delivery = await PharmacyStoreHistory.findOne({
    where: {
      history_type: HistoryType.SUPPLIED,
      external_batch_id: null,
      quantity_supplied: quantity,
    },
    include: [
      {
        model: PharmacyStore,
        as: 'store',
        required: true,
        where: { drug_id: drug.id },
      },
    ],
    order: [['createdAt', 'DESC']],
    transaction,
  });

  if (delivery) {
    await PharmacyStoreHistory.update(
      { external_batch_id: externalBatchId },
      { where: { id: delivery.id }, transaction }
    );
    return { outcome: 'APPLIED' };
  }

  // No quantity match. Distinguish "the EMR has an unclaimed row that DISAGREES" from "the EMR has
  // no row at all" — the first is a divergence between two systems that both think they know what
  // arrived, the second is the #26 path this EMR cannot yet serve.
  // "Unclaimed" now means the BIN has a SUPPLIED delivery with no batch id yet (ADR-0041), so the
  // probe joins through history rather than reading a column the bin no longer carries.
  const unclaimedDelivery = await PharmacyStoreHistory.findOne({
    where: { history_type: HistoryType.SUPPLIED, external_batch_id: null },
    include: [
      {
        model: PharmacyStore,
        as: 'store',
        required: true,
        where: { drug_id: drug.id },
      },
    ],
    order: [['createdAt', 'DESC']],
    transaction,
  });
  const quantityMismatch = unclaimedDelivery?.store ?? null;

  if (quantityMismatch) {
    throw new ApplyError(
      `stock.received ${externalBatchId} records ${quantity} units of "${itemCode}", but the ` +
        `newest unclaimed store row (id ${quantityMismatch.id}) received ` +
        `${quantityMismatch.quantity_received}. Accounting and the EMR disagree about what ` +
        'arrived; attaching the batch id would hide the divergence.'
    );
  }

  throw new ApplyError(
    `stock.received ${externalBatchId} names ${quantity} units of "${itemCode}" but this EMR has ` +
      'no unclaimed store row for it. Accounting-originated goods receipt (Accounting #26) would ' +
      'require CREATING the store row here, which this EMR cannot do honestly: ' +
      'Pharmacy_Store_Items requires unit_price and selling_price NOT NULL, and stock.received ' +
      'deliberately carries no cost (ADR-0009). Creating the row would mean inventing an ' +
      'acquisition cost and a patient-facing selling price. Record the receipt in the EMR first, ' +
      'or resolve the contract gap.'
  );
}

/** The status a reverse event sets, or undefined for a valid-but-unhandled reverse type. */
function statusFor(eventType: string): PaymentStatus | undefined {
  switch (eventType) {
    case 'payment.settled':
      return PaymentStatus.PAID;
    case 'payment.refunded':
      return PaymentStatus.PENDING;
    case 'authorisation.granted':
      return PaymentStatus.PERMITTED;
    case 'authorisation.rejected':
      return PaymentStatus.PENDING;
    default:
      return undefined;
  }
}
