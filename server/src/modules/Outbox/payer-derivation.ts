import { Transaction } from 'sequelize';
import { PatientInsurance } from '../../database/models/patientInsurance';
import { Insurance } from '../../database/models/insurance';
import { ChargeCapturedPayer } from './event-builder';
import { classifyPayer } from './payer-classification';

/**
 * Derives the `payer` a prescribed line was raised under (ADR-0028), from the line's own
 * `patient_insurance_id` — NOT the patient's default insurance, because a patient may hold more
 * than one and the line records which applied. The classification itself is pure
 * (`payer-classification.ts`); this loads the row and feeds it in.
 *
 * A `patient_insurance_id` that resolves to no row falls back to cash rather than throwing: a stale
 * FK must never roll back a clinical write, and unverified coverage is never granted (owner
 * decision). Cash is the safe default the receiver already assumes for an absent payer.
 */

/** True when the row's own coverage marker says it is a cash line, regardless of any insurance. */
function isCashLine(patientInsuranceId: unknown, lineType: unknown): boolean {
  if (patientInsuranceId === null || patientInsuranceId === undefined) {
    return true;
  }
  return typeof lineType === 'string' && lineType.toLowerCase() === 'cash';
}

/**
 * Loads the `PatientInsurance` for a line and classifies it, caching per id so a bulk prescribe
 * that shares one `patient_insurance_id` across many rows issues a single lookup. Runs on the
 * caller's transaction — never opens its own.
 */
export class PayerResolver {
  private readonly cache = new Map<number, ChargeCapturedPayer | undefined>();

  constructor(private readonly transaction: Transaction) {}

  async resolve(
    patientInsuranceId: unknown,
    lineType: unknown
  ): Promise<ChargeCapturedPayer | undefined> {
    if (isCashLine(patientInsuranceId, lineType)) {
      return undefined;
    }

    const id = Number(patientInsuranceId);
    if (!Number.isInteger(id)) {
      return undefined;
    }

    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    const insurance = await PatientInsurance.findOne({
      where: { id },
      attributes: ['id', 'insurance_id', 'hmo_id'],
      include: [{ model: Insurance, attributes: ['name'] }],
      transaction: this.transaction,
    });

    const payer = classifyPayer(
      insurance
        ? {
            insurance_id: insurance.insurance_id,
            hmo_id: insurance.hmo_id,
            insuranceName: insurance.insurance?.name,
          }
        : null
    );
    this.cache.set(id, payer);
    return payer;
  }
}
