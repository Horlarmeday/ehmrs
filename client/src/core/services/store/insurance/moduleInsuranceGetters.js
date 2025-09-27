export default {
  // Insurance Getters
  getInsurance: (state) => state.insurance,
  getInsurances: (state) => state.insurances,
  getInsurancesTotal: (state) => state.total,
  getInsurancesPages: (state) => state.pages,
  getPatientInsurances: (state) => state.patientInsurances,
  getPatientInsurance: (state) => state.patientInsurance,

  // HMO Getters
  getHMO: (state) => state.hmo,
  getHMOs: (state) => state.hmos,
  getHMOTotal: (state) => state.totalHmo,
  getHMOPages: (state) => state.hmopages,

  // HMO Pricing Getters
  getDrugPricing: (state) => state.drugPricing,
  getTestPricing: (state) => state.testPricing,
  getServicePricing: (state) => state.servicePricing,
  getInvestigationPricing: (state) => state.investigationPricing,
};
