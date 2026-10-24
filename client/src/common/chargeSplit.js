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
const typeFields = ['drug_type', 'test_type', 'investigation_type', 'service_type'];

export function lineTypeOf(line) {
  if (!line) return null;
  for (const field of typeFields) {
    if (line[field] !== undefined && line[field] !== null) return line[field];
  }
  return null;
}

export function hasChargeSplit(line) {
  return !!line && line.coverage_outcome !== null && line.coverage_outcome !== undefined;
}

export function isCashChargeLine(line) {
  if (!line) return false;
  return !line.patient_insurance_id && lineTypeOf(line) === 'Cash';
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
