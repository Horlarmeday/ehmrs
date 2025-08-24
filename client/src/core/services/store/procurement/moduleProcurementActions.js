import axios from 'axios';

// Procurement Orders
export const createProcurementOrder = async ({ commit }, orderData) => {
  try {
    const response = await axios.post('/api/procurement/orders', orderData);
    if (response.data.success) {
      commit('SET_PROCUREMENT_ORDER', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create procurement order');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create procurement order'
    );
  }
};

export const updateProcurementOrder = async ({ commit }, { id, ...orderData }) => {
  try {
    const response = await axios.put(`/api/procurement/orders/${id}`, orderData);
    if (response.data.success) {
      commit('UPDATE_PROCUREMENT_ORDER', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update procurement order');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update procurement order'
    );
  }
};

export const getProcurementOrders = async ({ commit }, params = {}) => {
  try {
    const response = await axios.get('/api/procurement/orders', { params });
    if (response.data.success) {
      commit('SET_PROCUREMENT_ORDERS', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch procurement orders');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch procurement orders'
    );
  }
};

export const getProcurementOrder = async ({ commit }, id) => {
  try {
    const response = await axios.get(`/api/procurement/orders/${id}`);
    if (response.data.success) {
      commit('SET_PROCUREMENT_ORDER', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch procurement order');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch procurement order'
    );
  }
};

export const approveProcurementOrder = async ({ commit }, { id, approvalData }) => {
  try {
    const response = await axios.post(`/api/procurement/orders/${id}/approve`, approvalData);
    if (response.data.success) {
      commit('UPDATE_PROCUREMENT_ORDER', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to approve procurement order');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to approve procurement order'
    );
  }
};

export const sendProcurementOrder = async ({ commit }, { id, sendData }) => {
  try {
    const response = await axios.post(`/api/procurement/orders/${id}/send`, sendData);
    if (response.data.success) {
      commit('UPDATE_PROCUREMENT_ORDER', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to send procurement order');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to send procurement order'
    );
  }
};

export const receiveProcurementOrderItems = async ({ commit }, { id, receiveData }) => {
  try {
    const response = await axios.post(`/api/procurement/orders/${id}/receive`, receiveData);
    if (response.data.success) {
      commit('UPDATE_PROCUREMENT_ORDER', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to receive procurement order items');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to receive procurement order items'
    );
  }
};

export const cancelProcurementOrder = async ({ commit }, { id, cancelData }) => {
  try {
    const response = await axios.post(`/api/procurement/orders/${id}/cancel`, cancelData);
    if (response.data.success) {
      commit('UPDATE_PROCUREMENT_ORDER', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to cancel procurement order');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to cancel procurement order'
    );
  }
};

// Procurement Reports
export const generateProcurementReport = async (_, params = {}) => {
  try {
    const response = await axios.get('/api/procurement/reports', { params });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to generate procurement report');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to generate procurement report'
    );
  }
};

export const exportProcurementReport = async (_, params = {}) => {
  try {
    const response = await axios.get('/api/procurement/export', {
      params,
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `procurement-report-${new Date().toISOString().split('T')[0]}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'Procurement report exported successfully' };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to export procurement report'
    );
  }
};
