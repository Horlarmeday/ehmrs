import axios from 'axios';

const BASE_URL = '/integrations/quickbooks';

function extractErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Unable to complete the QuickBooks request'
  );
}

export default {
  async fetchConnectionStatus({ commit }) {
    commit('SET_LOADING', { key: 'status', value: true });
    commit('SET_ERROR', null);

    try {
      const response = await axios.get(`${BASE_URL}/status`);
      const status = response?.data?.data || null;
      commit('SET_CONNECTION_STATUS', status);
      return status;
    } catch (error) {
      const message = extractErrorMessage(error);
      commit('SET_ERROR', message);
      throw error;
    } finally {
      commit('SET_LOADING', { key: 'status', value: false });
    }
  },

  async startAuthorization({ commit }) {
    commit('SET_LOADING', { key: 'authorize', value: true });
    commit('SET_ERROR', null);

    try {
      const response = await axios.get(`${BASE_URL}/authorize`);
      const authorization = response?.data?.data || null;
      commit('SET_AUTHORIZATION_REQUEST', authorization);
      return authorization;
    } catch (error) {
      const message = extractErrorMessage(error);
      commit('SET_ERROR', message);
      throw error;
    } finally {
      commit('SET_LOADING', { key: 'authorize', value: false });
    }
  },

  async disconnectQuickbooks({ commit }) {
    commit('SET_LOADING', { key: 'disconnect', value: true });
    commit('SET_ERROR', null);

    try {
      const response = await axios.post(`${BASE_URL}/disconnect`);
      const status = response?.data?.data || null;
      commit('SET_CONNECTION_STATUS', status);
      commit('CLEAR_AUTHORIZATION_REQUEST');
      return status;
    } catch (error) {
      const message = extractErrorMessage(error);
      commit('SET_ERROR', message);
      throw error;
    } finally {
      commit('SET_LOADING', { key: 'disconnect', value: false });
    }
  },

  async exportQuickbooksSummary({ commit }, payload) {
    commit('SET_LOADING', { key: 'exportSummary', value: true });
    commit('SET_ERROR', null);

    try {
      const response = await axios.post(`${BASE_URL}/export/summary`, payload);
      const result = response?.data?.data || null;
      commit('SET_SUMMARY_EXPORT_RESULT', result);
      return result;
    } catch (error) {
      const message = extractErrorMessage(error);
      commit('SET_ERROR', message);
      throw error;
    } finally {
      commit('SET_LOADING', { key: 'exportSummary', value: false });
    }
  },

  async exportQuickbooksDetailed({ commit }, payload) {
    commit('SET_LOADING', { key: 'exportDetailed', value: true });
    commit('SET_ERROR', null);

    try {
      const response = await axios.post(`${BASE_URL}/export/detailed`, payload);
      const result = response?.data?.data || null;
      commit('SET_DETAILED_EXPORT_RESULT', result);
      return result;
    } catch (error) {
      const message = extractErrorMessage(error);
      commit('SET_ERROR', message);
      throw error;
    } finally {
      commit('SET_LOADING', { key: 'exportDetailed', value: false });
    }
  },

  async fetchQuickbooksCredentials({ commit }) {
    commit('SET_LOADING', { key: 'loadCredentials', value: true });
    commit('SET_ERROR', null);

    try {
      const response = await axios.get(`${BASE_URL}/credentials`);
      const summary = response?.data?.data || null;
      commit('SET_CREDENTIALS', summary);
      return summary;
    } catch (error) {
      const message = extractErrorMessage(error);
      commit('SET_ERROR', message);
      throw error;
    } finally {
      commit('SET_LOADING', { key: 'loadCredentials', value: false });
    }
  },

  async saveQuickbooksCredentials({ commit }, payload) {
    commit('SET_LOADING', { key: 'saveCredentials', value: true });
    commit('SET_ERROR', null);

    try {
      const response = await axios.post(`${BASE_URL}/credentials`, payload);
      const summary = response?.data?.data || null;
      commit('SET_CREDENTIALS', summary);
      return summary;
    } catch (error) {
      const message = extractErrorMessage(error);
      commit('SET_ERROR', message);
      throw error;
    } finally {
      commit('SET_LOADING', { key: 'saveCredentials', value: false });
    }
  },

  applyQuickbooksConnectionStatus({ commit }, status) {
    commit('SET_CONNECTION_STATUS', status || null);
    commit('CLEAR_AUTHORIZATION_REQUEST');
  },

  clearQuickbooksErrors({ commit }) {
    commit('SET_ERROR', null);
  },

  resetQuickbooksModule({ commit }) {
    commit('RESET_STATE');
  },
};

