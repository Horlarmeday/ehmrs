export const getDrugPricing = (state) => state.drugPricing;

export const getDrugPricingById = (state) => (id) => {
  return state.drugPricing.find((pricing) => pricing.id === id);
};

export const getTestPricing = (state) => state.testPricing;

export const getTestPricingById = (state) => (id) => {
  return state.testPricing.find((pricing) => pricing.id === id);
};

export const getServicePricing = (state) => state.servicePricing;

export const getServicePricingById = (state) => (id) => {
  return state.servicePricing.find((pricing) => pricing.id === id);
};

export const getInvestigationPricing = (state) => state.investigationPricing;

export const getInvestigationPricingById = (state) => (id) => {
  return state.investigationPricing.find((pricing) => pricing.id === id);
};

export const getInsurancePricing = (state) => state.insurancePricing;

export const getPricingSummary = (state) => state.pricingSummary;

export const getBulkPricingResult = (state) => state.bulkPricingResult;

export const getCSVPricingResult = (state) => state.csvPricingResult;

export const isLoading = (state) => state.loading;

export const getError = (state) => state.error;

// Individual pricing items for editing
export const getDrugPricingItem = (state) => state.drugPricingItem;
export const getTestPricingItem = (state) => state.testPricingItem;
export const getServicePricingItem = (state) => state.servicePricingItem;
export const getInvestigationPricingItem = (state) => state.investigationPricingItem;

// Pricing calculations
export const getDrugPricingCalculation = (state) => state.drugPricingCalculation;
export const getTestPricingCalculation = (state) => state.testPricingCalculation;
export const getServicePricingCalculation = (state) => state.servicePricingCalculation;
export const getInvestigationPricingCalculation = (state) => state.investigationPricingCalculation;

// Pagination getters
export const getDrugPricingPagination = (state) => state.drugPricingPagination;
export const getTestPricingPagination = (state) => state.testPricingPagination;
export const getServicePricingPagination = (state) => state.servicePricingPagination;
export const getInvestigationPricingPagination = (state) => state.investigationPricingPagination;

// Filter pricing by insurance
export const getPricingByInsurance = (state) => (insuranceId) => {
  return {
    drugs: state.drugPricing.filter((p) => p.insurance_id === insuranceId),
    tests: state.testPricing.filter((p) => p.insurance_id === insuranceId),
    services: state.servicePricing.filter((p) => p.insurance_id === insuranceId),
    investigations: state.investigationPricing.filter((p) => p.insurance_id === insuranceId),
  };
};

// Filter pricing by status
export const getPricingByStatus = (state) => (status) => {
  return {
    drugs: state.drugPricing.filter((p) => p.status === status),
    tests: state.testPricing.filter((p) => p.status === status),
    services: state.servicePricing.filter((p) => p.status === status),
    investigations: state.investigationPricing.filter((p) => p.status === status),
  };
};

// Get active pricing only
export const getActivePricing = (state) => {
  return {
    drugs: state.drugPricing.filter((p) => p.status === 'Active'),
    tests: state.testPricing.filter((p) => p.status === 'Active'),
    services: state.servicePricing.filter((p) => p.status === 'Active'),
    investigations: state.investigationPricing.filter((p) => p.status === 'Active'),
  };
};

// Get pricing within date range
export const getPricingByDateRange = (state) => (startDate, endDate) => {
  const filterByDate = (pricing) => {
    const effectiveFrom = new Date(pricing.effective_from);
    const effectiveTo = new Date(pricing.effective_to);
    const start = new Date(startDate);
    const end = new Date(endDate);

    return effectiveFrom <= end && effectiveTo >= start;
  };

  return {
    drugs: state.drugPricing.filter(filterByDate),
    tests: state.testPricing.filter(filterByDate),
    services: state.servicePricing.filter(filterByDate),
    investigations: state.investigationPricing.filter(filterByDate),
  };
};
