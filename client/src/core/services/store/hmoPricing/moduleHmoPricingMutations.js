export const SET_DRUG_PRICING = (state, pricing) => {
  const index = state.drugPricing.findIndex(p => p.id === pricing.id);
  if (index !== -1) {
    state.drugPricing.splice(index, 1, pricing);
  } else {
    state.drugPricing.push(pricing);
  }
};

export const SET_DRUG_PRICING_LIST = (state, pricingList) => {
  state.drugPricing = pricingList;
};

export const SET_TEST_PRICING = (state, pricing) => {
  const index = state.testPricing.findIndex(p => p.id === pricing.id);
  if (index !== -1) {
    state.testPricing.splice(index, 1, pricing);
  } else {
    state.testPricing.push(pricing);
  }
};

export const SET_TEST_PRICING_LIST = (state, pricingList) => {
  state.testPricing = pricingList;
};

export const SET_SERVICE_PRICING = (state, pricing) => {
  const index = state.servicePricing.findIndex(p => p.id === pricing.id);
  if (index !== -1) {
    state.servicePricing.splice(index, 1, pricing);
  } else {
    state.servicePricing.push(pricing);
  }
};

export const SET_SERVICE_PRICING_LIST = (state, pricingList) => {
  state.servicePricing = pricingList;
};

export const SET_INVESTIGATION_PRICING = (state, pricing) => {
  const index = state.investigationPricing.findIndex(p => p.id === pricing.id);
  if (index !== -1) {
    state.investigationPricing.splice(index, 1, pricing);
  } else {
    state.investigationPricing.push(pricing);
  }
};

export const SET_INVESTIGATION_PRICING_LIST = (state, pricingList) => {
  state.investigationPricing = pricingList;
};

export const SET_INSURANCE_PRICING = (state, pricing) => {
  state.insurancePricing = pricing;
};

export const SET_PRICING_SUMMARY = (state, summary) => {
  state.pricingSummary = summary;
};

export const SET_BULK_PRICING_RESULT = (state, result) => {
  state.bulkPricingResult = result;
};

export const SET_CSV_PRICING_RESULT = (state, result) => {
  state.csvPricingResult = result;
};

export const SET_LOADING = (state, loading) => {
  state.loading = loading;
};

export const SET_ERROR = (state, error) => {
  state.error = error;
};

export const SET_DRUG_PRICING_CALCULATION = (state, pricing) => {
  state.drugPricingCalculation = pricing;
};

export const SET_TEST_PRICING_CALCULATION = (state, pricing) => {
  state.testPricingCalculation = pricing;
};

export const SET_SERVICE_PRICING_CALCULATION = (state, pricing) => {
  state.servicePricingCalculation = pricing;
};

export const SET_INVESTIGATION_PRICING_CALCULATION = (state, pricing) => {
  state.investigationPricingCalculation = pricing;
};

// Get pricing by ID mutations
export const SET_DRUG_PRICING_ITEM = (state, pricing) => {
  state.drugPricingItem = pricing;
};

export const SET_TEST_PRICING_ITEM = (state, pricing) => {
  state.testPricingItem = pricing;
};

export const SET_SERVICE_PRICING_ITEM = (state, pricing) => {
  state.servicePricingItem = pricing;
};

export const SET_INVESTIGATION_PRICING_ITEM = (state, pricing) => {
  state.investigationPricingItem = pricing;
};

// Update pricing mutations
export const UPDATE_DRUG_PRICING = (state, { id, data }) => {
  const index = state.drugPricing.findIndex(p => p.id === id);
  if (index !== -1) {
    state.drugPricing.splice(index, 1, data);
  }
};

export const UPDATE_TEST_PRICING = (state, { id, data }) => {
  const index = state.testPricing.findIndex(p => p.id === id);
  if (index !== -1) {
    state.testPricing.splice(index, 1, data);
  }
};

export const UPDATE_SERVICE_PRICING = (state, { id, data }) => {
  const index = state.servicePricing.findIndex(p => p.id === id);
  if (index !== -1) {
    state.servicePricing.splice(index, 1, data);
  }
};

export const UPDATE_INVESTIGATION_PRICING = (state, { id, data }) => {
  const index = state.investigationPricing.findIndex(p => p.id === id);
  if (index !== -1) {
    state.investigationPricing.splice(index, 1, data);
  }
};

// Delete pricing mutations
export const DELETE_DRUG_PRICING = (state, id) => {
  state.drugPricing = state.drugPricing.filter(p => p.id !== id);
};

export const DELETE_TEST_PRICING = (state, id) => {
  state.testPricing = state.testPricing.filter(p => p.id !== id);
};

export const DELETE_SERVICE_PRICING = (state, id) => {
  state.servicePricing = state.servicePricing.filter(p => p.id !== id);
};

export const DELETE_INVESTIGATION_PRICING = (state, id) => {
  state.investigationPricing = state.investigationPricing.filter(p => p.id !== id);
};

// Pagination mutations
export const SET_DRUG_PRICING_PAGINATION = (state, pagination) => {
  state.drugPricingPagination = pagination;
};

export const SET_TEST_PRICING_PAGINATION = (state, pagination) => {
  state.testPricingPagination = pagination;
};

export const SET_SERVICE_PRICING_PAGINATION = (state, pagination) => {
  state.servicePricingPagination = pagination;
};

export const SET_INVESTIGATION_PRICING_PAGINATION = (state, pagination) => {
  state.investigationPricingPagination = pagination;
};

export const CLEAR_PRICING_DATA = state => {
  state.drugPricing = [];
  state.testPricing = [];
  state.servicePricing = [];
  state.investigationPricing = [];
  state.insurancePricing = null;
  state.pricingSummary = null;
  state.bulkPricingResult = null;
  state.csvPricingResult = null;
};

// export default {
//   SET_DRUG_PRICING,
//   SET_DRUG_PRICING_LIST,
//   SET_TEST_PRICING,
//   SET_TEST_PRICING_LIST,
//   SET_SERVICE_PRICING,
//   SET_SERVICE_PRICING_LIST,
//   SET_INVESTIGATION_PRICING,
//   SET_INVESTIGATION_PRICING_LIST,
//   SET_INSURANCE_PRICING,
//   SET_PRICING_SUMMARY,
//   SET_BULK_PRICING_RESULT,
//   SET_CSV_PRICING_RESULT,
//   SET_LOADING,
//   SET_ERROR,
//   CLEAR_PRICING_DATA,
//   SET_DRUG_PRICING_CALCULATION,
//   SET_TEST_PRICING_CALCULATION,
//   SET_SERVICE_PRICING_CALCULATION,
//   SET_INVESTIGATION_PRICING_CALCULATION,
// };
