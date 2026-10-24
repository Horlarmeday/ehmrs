export const INJECTION_SYRINGES_NOT_FOUND =
  'Injection was successfully prescribed but syringes was not added';

export const ERROR_UPDATING_DRUG = 'An error occurred while updating medications';
export const ERROR_UPDATING_ITEM = 'An error occurred while updating additional items';
export const EMPTY_REQUEST_BODY = 'The request body cannot be empty';
export const CANNOT_DELETE_DRUG = 'Payment made, You cannot delete this drug';
export const INVALID_QUANTITY = `The quantity of drug you are trying to prescribe is low compared to the quantity in dispensary`;
export const NHIS_DRUG_QUOTA =
  'Sum of drugs prescribed today and ones you are trying to prescribe is more than the NHIS daily price quota';
export const DRUG_QUANTITY_UNAVAILABLE =
  'The quantity of drug you are trying to prescribe is more than the available quantity in the dispensary';
export const CAPTURED_LINE_CHANGE_NOT_ALLOWED =
  'This line has already been billed. Price and quantity can no longer be changed; create a new line instead.';
export const CAPTURED_LINE_INTERNAL_FIELD =
  'Charge split fields are managed by the accounting integration.';
