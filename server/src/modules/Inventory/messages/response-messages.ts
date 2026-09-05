export const INVALID_INVENTORY_PARAMS = 'Invalid params';
export const INVALID_QUANTITY = `The quantity of drug to be dispensed is more than available store quantity`;
export const INVALID_INVENTORY = 'drug cannot be dispensed to inventory';
export const UNPRICED_ITEM =
  'drug has no selling price yet and cannot be dispensed. It was received from Accounting ' +
  'without one — set its price in the store before dispensing.';
export const ITEM_EXISTS_CASH = 'Item already exists in the store for Cash';
export const ITEM_EXISTS_NHIS = 'Item already exists in the store for NHIS';
export const ITEM_EXISTS_PRIVATE = 'Item already exists in the store for Private';
export const BATCH_NOT_FOUND = 'the selected batch no longer exists in the store';
export const BATCH_DRUG_MISMATCH =
  'the selected batch holds a different drug than the one requested';
