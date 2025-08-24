import axios from 'axios';

// Stock Audit Management
export const createStockAudit = async ({ commit }, auditData) => {
  try {
    const response = await axios.post('/api/stock-audit', auditData);
    if (response.data.success) {
      commit('SET_STOCK_AUDIT', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create stock audit');
  } catch (error) {
    commit(
      'SET_ERROR',
      error.response?.data?.message || error.message || 'Failed to create stock audit'
    );
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create stock audit'
    );
  }
};

export const updateStockAudit = async ({ commit }, { id, ...auditData }) => {
  try {
    const response = await axios.put(`/api/stock-audit/${id}`, auditData);
    if (response.data.success) {
      commit('UPDATE_STOCK_AUDIT', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update stock audit');
  } catch (error) {
    commit(
      'SET_ERROR',
      error.response?.data?.message || error.message || 'Failed to update stock audit'
    );
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update stock audit'
    );
  }
};

export const getStockAudits = async ({ commit }, params = {}) => {
  try {
    commit('SET_LOADING', true);
    const response = await axios.get('/api/stock-audit', { params });
    if (response.data.success) {
      commit('SET_STOCK_AUDITS', response.data.data);
      commit('SET_ERROR', null);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch stock audits');
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Failed to fetch stock audits';
    commit('SET_ERROR', errorMessage);
    throw new Error(errorMessage);
  } finally {
    commit('SET_LOADING', false);
  }
};

export const getStockAudit = async ({ commit }, id) => {
  try {
    commit('SET_LOADING', true);
    const response = await axios.get(`/api/stock-audit/${id}`);
    if (response.data.success) {
      commit('SET_STOCK_AUDIT', response.data.data);
      commit('SET_ERROR', null);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch stock audit');
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Failed to fetch stock audit';
    commit('SET_ERROR', errorMessage);
    throw new Error(errorMessage);
  } finally {
    commit('SET_LOADING', false);
  }
};

export const startStockAudit = async ({ commit }, { id, startData }) => {
  try {
    commit('SET_LOADING', true);
    const response = await axios.post(`/api/stock-audit/${id}/start`, startData);
    if (response.data.success) {
      commit('UPDATE_STOCK_AUDIT', response.data.data);
      commit('SET_ERROR', null);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to start stock audit');
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Failed to start stock audit';
    commit('SET_ERROR', errorMessage);
    throw new Error(errorMessage);
  } finally {
    commit('SET_LOADING', false);
  }
};

export const completeStockAudit = async ({ commit }, { id, completeData }) => {
  try {
    commit('SET_LOADING', true);
    const response = await axios.post(`/api/stock-audit/${id}/complete`, completeData);
    if (response.data.success) {
      commit('UPDATE_STOCK_AUDIT', response.data.data);
      commit('SET_ERROR', null);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to complete stock audit');
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Failed to complete stock audit';
    commit('SET_ERROR', errorMessage);
    throw new Error(errorMessage);
  } finally {
    commit('SET_LOADING', false);
  }
};

export const approveStockAudit = async ({ commit }, { id, approvalData }) => {
  try {
    commit('SET_LOADING', true);
    const response = await axios.post(`/api/stock-audit/${id}/approve`, approvalData);
    if (response.data.success) {
      commit('UPDATE_STOCK_AUDIT', response.data.data);
      commit('SET_ERROR', null);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to approve stock audit');
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Failed to approve stock audit';
    commit('SET_ERROR', errorMessage);
    throw new Error(errorMessage);
  } finally {
    commit('SET_LOADING', false);
  }
};

// Stock Audit Reports
export const generateStockAuditReport = async ({ commit }, params = {}) => {
  try {
    commit('SET_LOADING', true);
    const response = await axios.get('/api/stock-audit/reports', { params });
    if (response.data.success) {
      commit('SET_ERROR', null);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to generate stock audit report');
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Failed to generate stock audit report';
    commit('SET_ERROR', errorMessage);
    throw new Error(errorMessage);
  } finally {
    commit('SET_LOADING', false);
  }
};

export const exportStockAuditReport = async ({ commit }, params = {}) => {
  try {
    commit('SET_LOADING', true);
    const response = await axios.get('/api/stock-audit/export', {
      params,
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `stock-audit-report-${new Date().toISOString().split('T')[0]}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    commit('SET_ERROR', null);
    return { success: true, message: 'Stock audit report exported successfully' };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Failed to export stock audit report';
    commit('SET_ERROR', errorMessage);
    throw new Error(errorMessage);
  } finally {
    commit('SET_LOADING', false);
  }
};
