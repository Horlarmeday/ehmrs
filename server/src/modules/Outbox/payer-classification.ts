import { ChargeCapturedPayer } from './event-builder';

/**
 * Pure payer classification for `charge.captured` (ADR-0028) — no DB, no Sequelize models, so it
 * stays unit-testable in isolation. The `PayerResolver` (payer-derivation.ts) loads the row and
 * feeds these facts in.
 *
 * Classification (insurance `name` is the discriminator, matching the EMR's existing coverage
 * semantics in `EXCLUDED_INSURANCE` / `getDrugType`):
 *  - no coverage facts                          → cash (payer omitted)
 *  - insurance name is `Retainership`           → retainership, retainership_id = hmo_id
 *  - any other insurance (NHIS / FHSS / PHIS …) → scheme_hmo, scheme_id + hmo_id
 *
 * The EMR has no `retainership_id`: retainer companies are HMO rows under a `Retainership`
 * insurance, so the company `hmo_id` identifies the agreement on the wire (Accounting #138 seeds
 * `RetainershipAgreement.retainership_id` to those same ids).
 */

export interface CoverageFacts {
  readonly insurance_id: number;
  readonly hmo_id: number;
  readonly insuranceName: string | null | undefined;
}

const RETAINERSHIP_INSURANCE_NAME = 'Retainership';

export function classifyPayer(facts: CoverageFacts | null): ChargeCapturedPayer | undefined {
  if (!facts) {
    return undefined;
  }

  if (facts.insuranceName === RETAINERSHIP_INSURANCE_NAME) {
    return {
      payer_type: 'retainership',
      retainership_id: String(facts.hmo_id),
    };
  }

  return {
    payer_type: 'scheme_hmo',
    scheme_id: String(facts.insurance_id),
    hmo_id: String(facts.hmo_id),
  };
}
