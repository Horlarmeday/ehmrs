/**
 * Presentation rules for Accounting's resolved charge split (ADR-0096/0097).
 *
 * The EMR never computes a share locally. There are three states:
 *   split     — `charge.split.updated` has arrived; show Total / Patient pays / Payer covers.
 *   cash      — no insurance and no split; the patient pays the stored total.
 *   awaiting  — insured but no split yet; do not invent a figure.
 *
 * `Total` after a split is Accounting's resolved gross (`split_amount`), not the amount the EMR
 * sent, so the three figures always conserve even when a payer tariff applies.
 */
/**
 * Mirror of the server's `COVERAGE_TYPE_FIELD_BY_TYPE` (Outbox/prescribed-line-types.ts).
 *
 * The five billable line types map to four columns because `drug` and `additional_item` share
 * `drug_type`. Keep the full five-type map here so `additional_item` is explicit rather than
 * silently assumed, then derive the distinct fields for the coverage lookup.
 */
export const COVERAGE_TYPE_FIELD_BY_TYPE = {
  drug: 'drug_type',
  additional_item: 'drug_type',
  test: 'test_type',
  investigation: 'investigation_type',
  service: 'service_type',
};

const COVERAGE_TYPE_FIELDS = Array.from(new Set(Object.values(COVERAGE_TYPE_FIELD_BY_TYPE)));

/**
 * The line's coverage marker (`Cash`, `NHIS`, `Private`, …), whichever of the four columns its
 * table uses. This is intentionally NOT a table-type inference: the display only needs the
 * coverage fact, and the coverage field is the authoritative one.
 */
export function coverageTypeOf(line) {
  if (!line) return null;
  for (const field of COVERAGE_TYPE_FIELDS) {
    const value = line[field];
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

export function hasChargeSplit(line) {
  return !!line && line.coverage_outcome !== null && line.coverage_outcome !== undefined;
}

/**
 * A Cash-typed line is a cash line even when the patient happens to have an insurance record.
 * Accounting sends no split for a cash-payer line, so requiring `patient_insurance_id` to be
 * absent would leave those lines stuck on “Awaiting split” forever.
 */
export function isCashChargeLine(line) {
  return !!line && coverageTypeOf(line) === 'Cash';
}

export function chargeSplitState(line) {
  if (hasChargeSplit(line)) return 'split';
  if (isCashChargeLine(line)) return 'cash';
  return 'awaiting';
}

function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function storedTotal(line) {
  if (!line) return 0;
  return num(line.total_price !== undefined ? line.total_price : line.price);
}

export function chargeTotal(line) {
  return hasChargeSplit(line) ? num(line.split_amount) : storedTotal(line);
}

export function chargePatient(line) {
  if (hasChargeSplit(line)) return num(line.patient_net);
  if (isCashChargeLine(line)) return storedTotal(line);
  return null;
}

export function chargePatientShare(line) {
  return hasChargeSplit(line) ? num(line.patient_share) : null;
}

export function chargePayerParts(line) {
  if (!hasChargeSplit(line)) {
    return isCashChargeLine(line) ? [] : null;
  }
  if (line.coverage_outcome === 'capitated') {
    return [{ label: 'Covered by capitation', amount: 0, captured: null }];
  }

  const parts = [];
  const insurerNet = num(line.insurer_net);
  const insurerAmount = num(line.insurer_amount);
  if (insurerNet > 0 || insurerAmount > 0) {
    parts.push({ label: 'HMO covers', amount: insurerNet, captured: insurerAmount });
  }

  const corporateNet = num(line.corporate_net);
  const corporateAmount = num(line.corporate_amount);
  if (corporateNet > 0 || corporateAmount > 0) {
    parts.push({ label: 'Company covers', amount: corporateNet, captured: corporateAmount });
  }

  return parts;
}

export function chargePayerTotal(line) {
  const parts = chargePayerParts(line);
  if (parts === null) return null;
  return parts.reduce((total, part) => total + part.amount, 0);
}

/** Combined figures for a prescription-level summary. Awaiting lines count in `total` only. */
export function summarizeChargeLines(lines) {
  const summary = { total: 0, patient: 0, payer: 0, awaiting: 0 };
  (lines || []).forEach((line) => {
    summary.total += chargeTotal(line);
    const patient = chargePatient(line);
    if (patient === null) {
      summary.awaiting += 1;
    } else {
      summary.patient += patient;
    }
    const payer = chargePayerTotal(line);
    if (payer !== null) {
      summary.payer += payer;
    }
  });
  return summary;
}

export function formatNaira(value) {
  return num(value).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Vue 2 mixin: every screen that prints a prescribed-line total uses the same rules. */
export default {
  methods: {
    coverageTypeOf,
    hasChargeSplit,
    isCashChargeLine,
    chargeSplitState,
    chargeTotal,
    chargePatient,
    chargePatientShare,
    chargePayerParts,
    chargePayerTotal,
    summarizeChargeLines,
    formatNaira,
  },
};
