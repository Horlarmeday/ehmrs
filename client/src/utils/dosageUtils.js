/**
 * Extract quantity from text input
 * Handles various formats like "4 tablets", "administered 4", "4x", "4.5", etc.
 * @param {string} text - The text input from the nurse
 * @returns {number|null} - The extracted quantity or null if not found
 */
export function extractQuantityFromText(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Remove leading/trailing whitespace
  const trimmedText = text.trim();

  if (!trimmedText) {
    return null;
  }

  // Pattern to match numbers (integers or decimals)
  // This will match:
  // - "4" in "4 tablets"
  // - "4" in "administered 4"
  // - "4.5" in "4.5 tablets"
  // - "4" in "4x"
  // - First number found in text
  const numberPattern = /(\d+\.?\d*)/;

  const match = trimmedText.match(numberPattern);

  if (!match || match.length === 0) {
    return null;
  }

  // Extract the first number found
  const quantity = parseFloat(match[1]);

  // Validate it's a valid positive number
  if (isNaN(quantity) || quantity < 0) {
    return null;
  }

  // Return as integer if it's a whole number, otherwise return decimal
  return quantity % 1 === 0 ? parseInt(quantity, 10) : quantity;
}
