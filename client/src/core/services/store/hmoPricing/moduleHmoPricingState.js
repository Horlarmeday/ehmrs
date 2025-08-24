export default {
  drugPricing: [],
  testPricing: [],
  servicePricing: [],
  investigationPricing: [],
  // Individual pricing items for editing
  drugPricingItem: null,
  testPricingItem: null,
  servicePricingItem: null,
  investigationPricingItem: null,
  // Pricing calculations
  drugPricingCalculation: null,
  testPricingCalculation: null,
  servicePricingCalculation: null,
  investigationPricingCalculation: null,
  // Pagination state
  drugPricingPagination: {
    total: 0,
    pages: 0,
    currentPage: 1,
    perPage: 10,
  },
  testPricingPagination: {
    total: 0,
    pages: 0,
    currentPage: 1,
    perPage: 10,
  },
  servicePricingPagination: {
    total: 0,
    pages: 0,
    currentPage: 1,
    perPage: 10,
  },
  investigationPricingPagination: {
    total: 0,
    pages: 0,
    currentPage: 1,
    perPage: 10,
  },
  insurancePricing: null,
  pricingSummary: null,
  bulkPricingResult: null,
  csvPricingResult: null,
  loading: false,
  error: null,
};
