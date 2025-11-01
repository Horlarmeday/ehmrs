import axios from '../../../../axios';

export default {
  /**
   * Fetch all doctor reports for a visit
   * @param {Object} context - Vuex context
   * @param {number} visitId - Visit ID
   */
  async fetchVisitDoctorReports({ commit }, visitId) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      const response = await axios.get(`/doctor-reports/visit/${visitId}`);
      const reports = response.data.data;
      commit('SET_REPORTS', reports);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch doctor reports';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Create a new doctor report
   * @param {Object} context - Vuex context
   * @param {Object} data - Report data
   */
  async createDoctorReport({ commit }, data) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      const response = await axios.post('/doctor-reports', data);
      const report = response.data.data;
      commit('ADD_REPORT', report);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create doctor report';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Update a doctor report
   * @param {Object} context - Vuex context
   * @param {Object} payload - Update data
   * @param {number} payload.id - Report ID
   * @param {Object} payload.data - Report data
   */
  async updateDoctorReport({ commit }, { id, data }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      const response = await axios.put(`/doctor-reports/${id}`, data);
      const report = response.data.data;
      commit('UPDATE_REPORT', report);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update doctor report';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Delete a doctor report
   * @param {Object} context - Vuex context
   * @param {number} id - Report ID
   */
  async deleteDoctorReport({ commit }, id) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      const response = await axios.delete(`/doctor-reports/${id}`);
      commit('REMOVE_REPORT', id);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete doctor report';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Fetch all doctor reports for a visit
   * @param {Object} context - Vuex context
   * @param payload
   */
  async fetchDoctorReports({ commit }, payload) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      const response = await axios.get(`/doctor-reports`, {
        params: {
          currentPage: payload.currentPage,
          pageLimit: payload.itemsPerPage,
          filter: payload.filter,
        },
      });
      commit('SET_DOCTOR_REPORTS', response.data.data.docs);
      commit('SET_DOCTOR_REPORTS_TOTAL', response.data.data.total);
      commit('SET_DOCTOR_REPORTS_PAGES', response.data.data.pages);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch doctor reports';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
};
