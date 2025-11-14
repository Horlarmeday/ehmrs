/**
 * Prescription Parser Utility
 * Parses semi-structured medical prescription text into structured data
 *
 * Supported formats:
 * - 250mg TDS x 5 days
 * - 250mg TDS x 5/7
 * - 500mg BD for 7 days
 * - 1g QDS 14/7
 * - 2mg Stat
 */

/**
 * Frequency mappings with their values and labels
 */
const FREQUENCY_MAP = {
  stat: { val: 1, label: 'Stat' },
  od: { val: 1, label: 'OD' },
  bd: { val: 2, label: 'BD' },
  tds: { val: 3, label: 'TDS' },
  qds: { val: 4, label: 'QDS' },
  q4h: { val: 6, label: 'Q4H' },
  q2h: { val: 12, label: 'Q2H' },
  q1h: { val: 24, label: 'Q1H' },
};

/**
 * Duration unit mappings
 */
const DURATION_UNIT_MAP = {
  day: { val: 1, label: 'Days' },
  days: { val: 1, label: 'Days' },
  week: { val: 7, label: 'Weeks' },
  weeks: { val: 7, label: 'Weeks' },
  month: { val: 30, label: 'Months' },
  months: { val: 30, label: 'Months' },
};

/**
 * Parse strength from prescription text
 * Extracts numeric value with unit (mg, g, mcg, ml, units)
 *
 * @param {string} text - Prescription text
 * @returns {number|null} - Numeric strength value or null if not found
 */
export function parseStrength(text) {
  if (!text) return null;

  // Match numeric strength (supports decimals) followed by optional unit
  // Examples: 250mg, 2.5mg, 1g, 500mcg, 2ml
  const strengthRegex = /(\d+\.?\d*)\s*(mg|g|mcg|µg|ml|units?)/i;
  const match = text.match(strengthRegex);

  if (match && match[1]) {
    const value = parseFloat(match[1]);
    return !isNaN(value) ? value : null;
  }

  return null;
}

/**
 * Parse frequency from prescription text
 * Maps medical abbreviations to frequency objects
 *
 * @param {string} text - Prescription text
 * @returns {Object|null} - Frequency object {val, label} or null if not found
 */
export function parseFrequency(text) {
  if (!text) return null;

  const lowerText = text.toLowerCase();

  // Check for each frequency abbreviation
  for (const [key, value] of Object.entries(FREQUENCY_MAP)) {
    // Use word boundary to match whole words
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(lowerText)) {
      return value;
    }
  }

  return null;
}

/**
 * Parse duration from prescription text
 * Supports both explicit format (5 days) and fraction format (5/7, 14/52)
 *
 * @param {string} text - Prescription text
 * @returns {Object|null} - {value, unit} or null if not found
 */
export function parseDuration(text) {
  if (!text) return null;

  const lowerText = text.toLowerCase();

  // Try fraction format first (e.g., 5/7 = 5 days, 14/7 = 2 weeks, 8/52 = 8 weeks)
  const fractionRegex = /(\d+)\s*\/\s*(\d+)/;
  const fractionMatch = text.match(fractionRegex);

  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);

    if (!isNaN(numerator) && !isNaN(denominator)) {
      // 7 denominator = days, 52 denominator = weeks
      if (denominator === 7) {
        return {
          value: numerator,
          unit: DURATION_UNIT_MAP['days'],
        };
      } else if (denominator === 52) {
        return {
          value: numerator,
          unit: DURATION_UNIT_MAP['weeks'],
        };
      } else if (denominator === 12) {
        // months
        return {
          value: numerator,
          unit: DURATION_UNIT_MAP['months'],
        };
      }
    }
  }

  // Try explicit format (e.g., "5 days", "2 weeks", "1 month")
  const explicitRegex = /(\d+)\s*(days?|weeks?|months?)/i;
  const explicitMatch = lowerText.match(explicitRegex);

  if (explicitMatch) {
    const value = parseInt(explicitMatch[1], 10);
    const unitText = explicitMatch[2].toLowerCase();

    if (!isNaN(value)) {
      // Find the matching unit
      const unit = DURATION_UNIT_MAP[unitText];
      if (unit) {
        return { value, unit };
      }
    }
  }

  return null;
}

/**
 * Main prescription parser
 * Parses complete prescription text and extracts strength, frequency, and duration
 *
 * @param {string} text - Full prescription text
 * @returns {Object} - Parsed result with strength, frequency, duration, durationUnit, or error
 */
export function parsePrescription(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      error: 'Prescription text is required',
      strength: null,
      frequency: null,
      duration: null,
      durationUnit: null,
    };
  }

  const trimmedText = text.trim();

  // Parse individual components
  const strength = parseStrength(trimmedText);
  const frequency = parseFrequency(trimmedText);
  const durationResult = parseDuration(trimmedText);

  const hasStrength = typeof strength === 'number' && !Number.isNaN(strength);
  const hasFrequency = Boolean(frequency);
  const hasDurationValue = typeof durationResult?.value === 'number' && !Number.isNaN(durationResult.value);
  const hasDurationUnit = Boolean(durationResult?.unit);
  const hasDuration = hasDurationValue && hasDurationUnit;

  // Build result object
  const result = {
    strength,
    frequency,
    duration: hasDurationValue ? durationResult.value : null,
    durationUnit: hasDurationUnit ? durationResult.unit : null,
    error: null,
  };

  // Validation and error messages
  const missing = [];

  if (!hasStrength) {
    missing.push('strength (e.g., 250mg)');
  }

  if (!hasFrequency) {
    missing.push('frequency (e.g., TDS, BD, OD)');
  }

  if (!hasDuration) {
    missing.push('duration (e.g., 5 days, 7/7)');
  }

  if (missing.length > 0) {
    result.error = `Could not parse: ${missing.join(', ')}. Example format: 250mg TDS x 5 days`;
  }

  // All components parsed only when error remains null
  return result;
}

/**
 * Validate if a prescription text can be parsed successfully
 *
 * @param {string} text - Prescription text to validate
 * @returns {boolean} - True if parseable, false otherwise
 */
export function isPrescriptionValid(text) {
  const result = parsePrescription(text);
  return result.error === null;
}

/**
 * Get suggested corrections for common mistakes
 *
 * @param {string} text - Prescription text
 * @returns {string[]} - Array of suggestions
 */
export function getSuggestions(text) {
  if (!text) return [];

  const suggestions = [];
  const lowerText = text.toLowerCase();

  // Check for strength
  if (!/\d+\.?\d*\s*(mg|g|mcg|µg|ml|units?)?/i.test(text)) {
    suggestions.push('Add strength with unit (e.g., 250mg, 1g)');
  }

  // Check for frequency
  const hasFrequency = Object.keys(FREQUENCY_MAP).some((freq) =>
    new RegExp(`\\b${freq}\\b`, 'i').test(lowerText)
  );
  if (!hasFrequency) {
    suggestions.push('Add frequency (e.g., TDS, BD, OD, QDS)');
  }

  // Check for duration
  if (!/(\d+)\s*(days?|weeks?|months?)/i.test(lowerText) && !/(\d+)\s*\/\s*(\d+)/.test(text)) {
    suggestions.push('Add duration (e.g., 5 days, 7/7, 2 weeks)');
  }

  return suggestions;
}

export default {
  parsePrescription,
  parseStrength,
  parseFrequency,
  parseDuration,
  isPrescriptionValid,
  getSuggestions,
};
