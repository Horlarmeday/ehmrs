import axios from '../../../../axios';

// HMO Drug Pricing
export const createDrugPricing = async ({ commit }, pricingData) => {
  try {
    const response = await axios.post('/hmo-pricing/drugs', pricingData);
    if (response.data.success) {
      commit('SET_DRUG_PRICING', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create drug pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create drug pricing'
    );
  }
};

export const createTestPricing = async ({ commit }, pricingData) => {
  try {
    const response = await axios.post('/hmo-pricing/tests', pricingData);
    if (response.data.success) {
      commit('SET_TEST_PRICING', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create test pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create test pricing'
    );
  }
};

export const createServicePricing = async ({ commit }, pricingData) => {
  try {
    const response = await axios.post('/hmo-pricing/services', pricingData);
    if (response.data.success) {
      commit('SET_SERVICE_PRICING', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create service pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create service pricing'
    );
  }
};

export const createInvestigationPricing = async ({ commit }, pricingData) => {
  try {
    const response = await axios.post('/hmo-pricing/investigations', pricingData);
    if (response.data.success) {
      commit('SET_INVESTIGATION_PRICING', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create investigation pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create investigation pricing'
    );
  }
};

// HMO Pricing Calculations
export const calculateDrugPricing = async ({ commit }, { drug_id, insurance_id, quantity = 1 }) => {
  try {
    const response = await axios.post('/hmo-pricing/calculate/drugs', {
      drug_id,
      insurance_id,
      quantity,
    });
    if (response.data.success) {
      commit('SET_DRUG_PRICING', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to calculate drug pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to calculate drug pricing'
    );
  }
};

export const calculateTestPricing = async ({ commit }, { test_id, insurance_id }) => {
  try {
    const response = await axios.post('/hmo-pricing/calculate/tests', {
      test_id,
      insurance_id,
    });
    if (response.data.success) {
      commit('SET_TEST_PRICING_CALCULATION', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to calculate test pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to calculate test pricing'
    );
  }
};

export const calculateServicePricing = async ({ commit }, { service_id, insurance_id }) => {
  try {
    const response = await axios.post('/hmo-pricing/calculate/services', {
      service_id,
      insurance_id,
    });
    if (response.data.success) {
      commit('SET_SERVICE_PRICING_CALCULATION', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to calculate service pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to calculate service pricing'
    );
  }
};

export const calculateInvestigationPricing = async (
  { commit },
  { investigation_id, insurance_id }
) => {
  try {
    const response = await axios.post('/hmo-pricing/calculate/investigations', {
      investigation_id,
      insurance_id,
    });
    if (response.data.success) {
      commit('SET_INVESTIGATION_PRICING_CALCULATION', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to calculate investigation pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to calculate investigation pricing'
    );
  }
};

// Bulk Operations
export const bulkCreatePricing = async ({ commit }, bulkData) => {
  try {
    const response = await axios.post('/hmo-pricing/bulk', bulkData);
    if (response.data.success) {
      commit('SET_BULK_PRICING_RESULT', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to bulk create pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to bulk create pricing'
    );
  }
};

export const processCSVPricing = async ({ commit }, csvData) => {
  try {
    const response = await axios.post('/hmo-pricing/csv-upload', { csvData });
    if (response.data.success) {
      commit('SET_CSV_PRICING_RESULT', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to process CSV pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to process CSV pricing'
    );
  }
};

// Query and Export
export const getInsurancePricing = async ({ commit }, insuranceId) => {
  try {
    const response = await axios.get(`/hmo-pricing/insurance/${insuranceId}`);
    if (response.data.success) {
      commit('SET_INSURANCE_PRICING', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch insurance pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch insurance pricing'
    );
  }
};

export const exportPricingToCSV = async ({ commit }, { insurance_id } = {}) => {
  try {
    const response = await axios.get('/hmo-pricing/export', {
      params: { insurance_id },
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hmo-pricing-${insurance_id || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    commit('SET_CSV_PRICING_RESULT', response.data.data);

    return { success: true, message: 'Pricing exported successfully' };
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to export pricing');
  }
};

export const getPricingSummary = async ({ commit }, insuranceId) => {
  try {
    const response = await axios.get('/hmo-pricing/summary', {
      params: { insurance_id: insuranceId },
    });
    if (response.data.success) {
      commit('SET_PRICING_SUMMARY', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch pricing summary');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch pricing summary'
    );
  }
};

// Fetch all pricing data for a specific type with pagination
export const fetchDrugPricing = async ({ commit }, params = {}) => {
  try {
    const response = await axios.get('/hmo-pricing/drugs', { params });
    if (response.data.success) {
      commit('SET_DRUG_PRICING_LIST', response.data.data.items);
      commit('SET_DRUG_PRICING_PAGINATION', {
        total: response.data.data.total,
        pages: response.data.data.pages,
        currentPage: response.data.data.currentPage,
        perPage: response.data.data.perPage,
      });
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch drug pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch drug pricing'
    );
  }
};

export const fetchTestPricing = async ({ commit }, params = {}) => {
  try {
    const response = await axios.get('/hmo-pricing/tests', { params });
    if (response.data.success) {
      commit('SET_TEST_PRICING_LIST', response.data.data.items);
      commit('SET_TEST_PRICING_PAGINATION', {
        total: response.data.data.total,
        pages: response.data.data.pages,
        currentPage: response.data.data.currentPage,
        perPage: response.data.data.perPage,
      });
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch test pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch test pricing'
    );
  }
};

export const fetchServicePricing = async ({ commit }, params = {}) => {
  try {
    const response = await axios.get('/hmo-pricing/services', { params });
    if (response.data.success) {
      commit('SET_SERVICE_PRICING_LIST', response.data.data.items);
      commit('SET_SERVICE_PRICING_PAGINATION', {
        total: response.data.data.total,
        pages: response.data.data.pages,
        currentPage: response.data.data.currentPage,
        perPage: response.data.data.perPage,
      });
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch service pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch service pricing'
    );
  }
};

export const fetchInvestigationPricing = async ({ commit }, params = {}) => {
  try {
    const response = await axios.get('/hmo-pricing/investigations', { params });
    if (response.data.success) {
      commit('SET_INVESTIGATION_PRICING_LIST', response.data.data.items);
      commit('SET_INVESTIGATION_PRICING_PAGINATION', {
        total: response.data.data.total,
        pages: response.data.data.pages,
        currentPage: response.data.data.currentPage,
        perPage: response.data.data.perPage,
      });
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch investigation pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch investigation pricing'
    );
  }
};

// Get pricing by ID for editing
export const getDrugPricingById = async ({ commit }, id) => {
  try {
    const response = await axios.get(`/hmo-pricing/drugs/${id}`);
    if (response.data.success) {
      commit('SET_DRUG_PRICING_ITEM', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch drug pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch drug pricing'
    );
  }
};

export const getTestPricingById = async ({ commit }, id) => {
  try {
    const response = await axios.get(`/hmo-pricing/tests/${id}`);
    if (response.data.success) {
      commit('SET_TEST_PRICING_ITEM', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch test pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch test pricing'
    );
  }
};

export const getServicePricingById = async ({ commit }, id) => {
  try {
    const response = await axios.get(`/hmo-pricing/services/${id}`);
    if (response.data.success) {
      commit('SET_SERVICE_PRICING_ITEM', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch service pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch service pricing'
    );
  }
};

export const getInvestigationPricingById = async ({ commit }, id) => {
  try {
    const response = await axios.get(`/hmo-pricing/investigations/${id}`);
    if (response.data.success) {
      commit('SET_INVESTIGATION_PRICING_ITEM', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch investigation pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch investigation pricing'
    );
  }
};

// Update pricing
export const updateDrugPricing = async ({ commit }, { id, data }) => {
  try {
    const response = await axios.put(`/hmo-pricing/drugs/${id}`, data);
    if (response.data.success) {
      commit('UPDATE_DRUG_PRICING', { id, data: response.data.data });
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update drug pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update drug pricing'
    );
  }
};

export const updateTestPricing = async ({ commit }, { id, data }) => {
  try {
    const response = await axios.put(`/hmo-pricing/tests/${id}`, data);
    if (response.data.success) {
      commit('UPDATE_TEST_PRICING', { id, data: response.data.data });
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update test pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update test pricing'
    );
  }
};

export const updateServicePricing = async ({ commit }, { id, data }) => {
  try {
    const response = await axios.put(`/hmo-pricing/services/${id}`, data);
    if (response.data.success) {
      commit('UPDATE_SERVICE_PRICING', { id, data: response.data.data });
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update service pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update service pricing'
    );
  }
};

export const updateInvestigationPricing = async ({ commit }, { id, data }) => {
  try {
    const response = await axios.put(`/hmo-pricing/investigations/${id}`, data);
    if (response.data.success) {
      commit('UPDATE_INVESTIGATION_PRICING', { id, data: response.data.data });
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update investigation pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update investigation pricing'
    );
  }
};

// Delete pricing
export const deleteDrugPricing = async ({ commit }, id) => {
  try {
    const response = await axios.delete(`/hmo-pricing/drugs/${id}`);
    if (response.data.success) {
      commit('DELETE_DRUG_PRICING', id);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to delete drug pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to delete drug pricing'
    );
  }
};

export const deleteTestPricing = async ({ commit }, id) => {
  try {
    const response = await axios.delete(`/hmo-pricing/tests/${id}`);
    if (response.data.success) {
      commit('DELETE_TEST_PRICING', id);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to delete test pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to delete test pricing'
    );
  }
};

export const deleteServicePricing = async ({ commit }, id) => {
  try {
    const response = await axios.delete(`/hmo-pricing/services/${id}`);
    if (response.data.success) {
      commit('DELETE_SERVICE_PRICING', id);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to delete service pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to delete service pricing'
    );
  }
};

export const deleteInvestigationPricing = async ({ commit }, id) => {
  try {
    const response = await axios.delete(`/hmo-pricing/investigations/${id}`);
    if (response.data.success) {
      commit('DELETE_INVESTIGATION_PRICING', id);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to delete investigation pricing');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to delete investigation pricing'
    );
  }
};
