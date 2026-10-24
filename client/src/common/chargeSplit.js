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
 * The client mirror of `server/src/modules/Outbox/prescribed-line-types.ts`.
 *
 * The server's five billable line types are `drug`, `additional_item`, `test`, `investigation`
 * and `service`. `additional_item` shares `drug_type` with `drug`, so the field names are NOT the
 * type names: always resolve the type first, then look up its coverage field.
 */
export const PRESCRIBED_LINE_TYPES = [
  'drug',
  'additional_item',
  'test',
  'investigation',
  'service',
];

export const COVERAGE_TYPE_FIELD_BY_TYPE = {
  drug: 'drug_type',
  additional_item: 'drug_type',
  test: 'test_type',
  investigation: 'investigation_type',
  service: 'service_type',
};

/**
 * Resolve which `Prescribed_*` table a raw row came from. Tests/investigations/services have
 * unique columns; the two pharmacy tables are distinguished by `drug_form`/`prescribed_drug_id`,
 * which only an additional item carries.
 */
export function lineTypeOf(line) {
  if (!line) return null;
  if (line.test_type !== undefined && line.test_type !== null) return 'test';
  if (line.investigation_type !== undefined && line.investigation_type !== null) {
    return 'investigation';
  }
  if (line.service_type !== undefined && line.service_type !== null) return 'service';
  if (line.drug_type !== undefined && line.drug_type !== null) {
    if (line.drug_form !== undefined && line.drug_form !== null) return 'additional_item';
    if (line.prescribed_drug_id !== undefined && line.prescribed_drug_id !== null) {
      return 'additional_item';
    }
    return 'drug';
  }
  return null;
}

export function coverageTypeFieldOf(line) {
  const type = lineTypeOf(line);
  return type ? COVERAGE_TYPE_FIELD_BY_TYPE[type] : null;
}

export function coverageTypeOf(line) {
  const field = coverageTypeFieldOf(line);
  return field ? line[field] : null;
}

export function hasChargeSplit(line) {
  return !!line && line.coverage_outcome !== null && line.coverage_outcome !== undefined;
}

export function isCashChargeLine(line) {
  if (!line) return false;
  return !line.patient_insurance_id && coverageTypeOf(line) === 'Cash';
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
    lineTypeOf,
    coverageTypeFieldOf,
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
