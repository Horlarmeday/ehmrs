import { ModelStatic, Model, Transaction } from 'sequelize';
import { HistoryType, PaymentStatus, Status } from '../../database/enums';
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
/**
 * The payer classes a receipt may name. Wider than the `PharmacyDrugType` enum, which omits
 * `Plaschema` — production holds a Plaschema store row and a Plaschema dispensary, so refusing that
 * class here would dead-letter a legitimate receipt on a gap in our own enum.
 */
const RECEIVABLE_DRUG_TYPES = ['Cash', 'NHIS', 'Private', 'Retainership', 'Plaschema'];

async function applyStockReceived(
  body: Record<string, unknown>,
  transaction: Transaction
): Promise<ApplyResult> {
  const externalBatchId = body.external_batch_id;
  const itemCode = body.item_code;
  const drugType = body.drug_type;

  if (typeof externalBatchId !== 'string' || externalBatchId.length === 0) {
    throw new ApplyError('stock.received carries no external_batch_id');
  }
  if (typeof itemCode !== 'string' || itemCode.length === 0) {
    throw new ApplyError(
      `stock.received ${externalBatchId} carries no item_code, so the batch cannot be placed`
    );
  }
  if (typeof drugType !== 'string' || !RECEIVABLE_DRUG_TYPES.includes(drugType)) {
    throw new ApplyError(
      `stock.received ${externalBatchId} names drug_type "${String(drugType)}", which is not one ` +
        `of ${RECEIVABLE_DRUG_TYPES.join(', ')}. The class cannot be guessed: each is a separate ` +
        'dispensary, and defaulting would file the stock where the goods never went.'
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

  const unitPrice = parseOptionalKobo(body.unit_cost_kobo, 'unit_cost_kobo', externalBatchId);
  const sellingPrice = parseOptionalKobo(
    body.selling_price_kobo,
    'selling_price_kobo',
    externalBatchId
  );
  const vendorId = typeof body.vendor_id === 'number' ? body.vendor_id : null;

  // Redelivery check FIRST. An additive event may arrive more than once, and this branch runs
  // before the inbox's sequence guard, so the second delivery must find its own earlier write and
  // stop — not create a second row or increment a second time, either of which would silently
  // double the stock the batch names.
  const alreadyApplied = await PharmacyStoreHistory.findOne({
    where: { external_batch_id: externalBatchId },
    transaction,
  });
  if (alreadyApplied) {
    return { outcome: 'APPLIED' };
  }

  // ATTACH first, for the EMR-originated path: the store clerk entered the receipt here and
  // Accounting is echoing back the batch id it minted. The delivery is selected directly rather
  // than via its bin — a bin holds several deliveries, some already claimed, so finding the bin
  // first would fail on a claimed delivery even when another bin's is free.
  //
  // Matched on drug AND quantity AND class. Quantity narrows two pending receipts of one drug to
  // the one Accounting actually describes; class keeps a Cash receipt off the NHIS shelf.
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
        where: { drug_id: drug.id, drug_type: drugType, status: Status.ACTIVE },
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

  // An unclaimed delivery EXISTS for this drug and class but disagrees about the quantity. Both
  // systems think they know what arrived, and they differ — incrementing would file the difference
  // as new stock and hide the divergence behind a row that looks correctly linked. Exact agreement
  // is the bar (#304 Q8): stock is discrete, so a gap is missing units, not a rounding artefact.
  const disagreeing = await PharmacyStoreHistory.findOne({
    where: { history_type: HistoryType.SUPPLIED, external_batch_id: null },
    include: [
      {
        model: PharmacyStore,
        as: 'store',
        required: true,
        where: { drug_id: drug.id, drug_type: drugType, status: Status.ACTIVE },
      },
    ],
    order: [['createdAt', 'DESC']],
    transaction,
  });

  if (disagreeing) {
    throw new ApplyError(
      `stock.received ${externalBatchId} records ${quantity} units of "${itemCode}" (${drugType}), ` +
        `but the newest unclaimed delivery on store row ${disagreeing.pharmacy_store_id} supplied ` +
        `${disagreeing.quantity_supplied}. Accounting and the EMR disagree about what arrived; ` +
        'attaching the batch id would hide the divergence.'
    );
  }

  // No unclaimed delivery at all. Either this bin exists and every delivery it has is already
  // accounted for — Accounting is adding stock to it (a reorder) — or the EMR has never stocked
  // this drug in this class (a first receipt).
  //
  // C3c: a (drug, class) SHOULD have at most one bin — `pharmacyStoreValidations` enforces it on
  // the create path — but the rule is application-level with no unique index behind it, and 12
  // pairs on production violate it. The applier must not pick among them, and "newest" is
  // measurably the wrong guess: in 5 of those 12 the newest row holds ZERO stock while the older
  // holds it all, so incrementing the newest would file the delivery into an abandoned row. In 4
  // more, both hold stock and no rule is right. Refuse, name both rows, and let a human merge them.
  const bins = await PharmacyStore.findAll({
    where: { drug_id: drug.id, drug_type: drugType, status: Status.ACTIVE },
    order: [['createdAt', 'DESC']],
    transaction,
  });

  if (bins.length > 1) {
    throw new ApplyError(
      `stock.received ${externalBatchId} names "${itemCode}" (${drugType}), but this EMR holds ` +
        `${bins.length} active store rows for that drug and class (ids ${bins
          .map(row => row.id)
          .join(
            ', '
          )}). Only one may receive the stock, and choosing between them here would put ` +
        'the delivery in an arbitrary row — often an emptied one. Merge the duplicates first.'
    );
  }

  const bin = bins[0] ?? null;

  if (bin) {
    // C2b — the REORDER path, and the common case: 493 of 504 drugs on production already have a
    // store row. Increment the bin and record the delivery, exactly as `reorderPharmacyItems` does
    // for a clerk-entered restock. The bin is NOT replaced: `quantity_remaining` accumulates, and
    // `quantity_received` restates what THIS delivery brought, matching the reorder screen.
    //
    // Price and cost are written only when the event carried them. An omitted price leaves whatever
    // the bin already had — it does not blank a working price — and an omitted cost likewise.
    const nextRemaining = Number(bin.quantity_remaining) + quantity;
    await PharmacyStore.update(
      {
        quantity_received: quantity,
        quantity_remaining: nextRemaining,
        ...(unitPrice !== null ? { unit_price: unitPrice, total_price: unitPrice * quantity } : {}),
        ...(sellingPrice !== null ? { selling_price: sellingPrice } : {}),
        ...(vendorId !== null ? { vendor_id: vendorId } : {}),
      },
      { where: { id: bin.id }, transaction }
    );

    await PharmacyStoreHistory.create(
      {
        pharmacy_store_id: bin.id,
        quantity_supplied: quantity,
        quantity_remaining: nextRemaining,
        unit_id: bin.unit_id,
        item_receiver: bin.staff_id,
        history_date: Date.now(),
        history_type: HistoryType.SUPPLIED,
        external_batch_id: externalBatchId,
        vendor_id: vendorId ?? bin.vendor_id,
        selling_price: sellingPrice ?? bin.selling_price,
        unit_price: unitPrice ?? bin.unit_price,
      },
      { transaction }
    );

    return { outcome: 'APPLIED' };
  }

  // C2a — the CREATE path, closing the gap #26 specified and #297 could not serve. It is honest now
  // because the event carries what the row needs: `unit_cost_kobo` for the cost the EMR reports on,
  // and `selling_price_kobo` where the clerk supplied one. Nothing is invented.
  //
  // `selling_price` may legitimately be null — the row is then born unpriced and is not dispensable
  // until a human prices it (C5). That is the whole reason C1 made the column nullable: a
  // fabricated patient-facing price is the silently-wrong failure ADR-0001 and ADR-0009 prevent.
  if (unitPrice === null) {
    throw new ApplyError(
      `stock.received ${externalBatchId} would CREATE a store row for "${itemCode}" (${drugType}) ` +
        'but carries no unit_cost_kobo. The row requires a cost, and inventing one would corrupt ' +
        "the EMR's inventory valuation. Send the cost, or record the receipt in the EMR first."
    );
  }

  // `unit_id` is NOT NULL and the event does not carry a unit — deliberately, since a unit is EMR
  // catalogue vocabulary ("Packs" vs "Tablets"), not something Accounting knows. A SIBLING bin for
  // the same drug in another payer class is the honest source: 486 of 504 drugs on production use
  // one unit across all their classes. Where the classes disagree (18 drugs do), there is no safe
  // pick and the receipt fails rather than guessing a unit that would misstate every quantity.
  const siblingUnits = await PharmacyStore.findAll({
    where: { drug_id: drug.id, status: Status.ACTIVE },
    attributes: ['unit_id'],
    group: ['unit_id'],
    transaction,
  });

  if (siblingUnits.length !== 1) {
    throw new ApplyError(
      `stock.received ${externalBatchId} would CREATE the first "${itemCode}" (${drugType}) row, ` +
        `but this EMR ${
          siblingUnits.length === 0
            ? 'has no other stock of that drug to take a unit of measure from'
            : 'stocks that drug in more than one unit of measure, so the unit cannot be inferred'
        }. A wrong unit misstates every quantity that follows. Record the first receipt of this ` +
        'drug in the EMR, where the unit is chosen explicitly.'
    );
  }

  const created = await PharmacyStore.create(
    {
      drug_id: drug.id,
      drug_type: drugType,
      unit_id: siblingUnits[0].unit_id,
      // Supplier packaging data the clerk reads off the carton. NOT NULL with no default, and it
      // matches `Drugs.code` on 0 of 1,664 production rows, so it cannot be derived — born blank,
      // which is already the norm there (#304 R6/A7).
      product_code: '',
      quantity_received: quantity,
      quantity_remaining: quantity,
      unit_price: unitPrice,
      total_price: unitPrice * quantity,
      selling_price: sellingPrice,
      expiration: typeof body.expiry_date === 'string' ? new Date(body.expiry_date) : null,
      drug_form: drug.type,
      vendor_id: vendorId,
      status: Status.ACTIVE,
      date_received: new Date(),
    },
    { transaction }
  );

  await PharmacyStoreHistory.create(
    {
      pharmacy_store_id: created.id,
      quantity_supplied: quantity,
      quantity_remaining: quantity,
      unit_id: created.unit_id,
      history_date: Date.now(),
      history_type: HistoryType.SUPPLIED,
      external_batch_id: externalBatchId,
      vendor_id: vendorId,
      selling_price: sellingPrice,
      unit_price: unitPrice,
    },
    { transaction }
  );

  return { outcome: 'APPLIED' };
}

/**
 * Money arrives as a STRING of integer kobo (CONVENTIONS §1) and the EMR stores naira decimals, so
 * the conversion happens once, here. A malformed value THROWS rather than defaulting: a silently
 * dropped cost would corrupt the margin reports this field exists to keep working.
 */
function parseOptionalKobo(raw: unknown, field: string, externalBatchId: string): number | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) {
    throw new ApplyError(
      `stock.received ${externalBatchId} carries a malformed ${field} (${String(raw)}); money ` +
        'crosses as a string of integer kobo.'
    );
  }
  return Number(BigInt(raw)) / 100;
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
