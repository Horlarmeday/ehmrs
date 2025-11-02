import axios from '@/axios';

export default {
  /**
   * Get medical records statistics
   */
  fetchMedicalRecordsStats({ commit }, payload) {
    commit('SET_LOADING_STATS', true);
    return new Promise((resolve, reject) => {
      axios
        .get(`/reports/medical-records/stats/${payload.reportType}`, {
          params: {
            start: payload.start,
            end: payload.end,
            patient_type: payload.patient_type,
            gender: payload.gender,
            category: payload.category,
            department: payload.department,
            status: payload.status,
            ward_id: payload.ward_id,
            cause_of_death: payload.cause_of_death,
            age_group: payload.age_group,
          },
        })
        .then((response) => {
          commit('SET_MEDICAL_RECORDS_STATS', {
            reportType: payload.reportType,
            stats: response.data.data,
          });
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        })
        .finally(() => {
          commit('SET_LOADING_STATS', false);
        });
    });
  },

  /**
   * Get medical records details
   */
  fetchMedicalRecordsDetails({ commit }, payload) {
    commit('SET_LOADING_DETAILS', true);
    return new Promise((resolve, reject) => {
      axios
        .get(`/reports/medical-records/details/${payload.reportType}`, {
          params: {
            start: payload.start,
            end: payload.end,
            patient_type: payload.patient_type,
            gender: payload.gender,
            category: payload.category,
            department: payload.department,
            status: payload.status,
            ward_id: payload.ward_id,
            cause_of_death: payload.cause_of_death,
            age_group: payload.age_group,
            currentPage: payload.currentPage || 1,
            pageLimit: payload.pageLimit || 10,
          },
        })
        .then((response) => {
          commit('SET_MEDICAL_RECORDS_DETAILS', {
            reportType: payload.reportType,
            details: response.data.data,
          });
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        })
        .finally(() => {
          commit('SET_LOADING_DETAILS', false);
        });
    });
  },

  /**
   * Export report
   */
  exportReport(context, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(
          '/reports/export',
          {
            domain: payload.domain,
            reportType: payload.reportType,
            format: payload.format,
            filters: payload.filters,
          },
          {
            responseType: 'blob',
          }
        )
        .then((response) => {
          // Create blob from response
          const blob = new Blob([response.data], {
            type:
              payload.format === 'csv'
                ? 'text/csv'
                : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;

          // Generate filename from response headers or use default
          const contentDisposition = response.headers['content-disposition'];
          let filename = `report_${Date.now()}.${payload.format}`;
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
              filename = filenameMatch[1];
            }
          }

          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Save a report
   */
  saveReport({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post('/reports/save', payload)
        .then((response) => {
          commit('ADD_SAVED_REPORT', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Get saved reports
   */
  fetchSavedReports({ commit }, payload = {}) {
    return new Promise((resolve, reject) => {
      axios
        .get('/reports/saved', {
          params: {
            domain: payload.domain,
            report_type: payload.report_type,
            created_by: payload.created_by,
            currentPage: payload.currentPage || 1,
            pageLimit: payload.pageLimit || 10,
          },
        })
        .then((response) => {
          commit('SET_SAVED_REPORTS', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Get a specific saved report
   */
  fetchSavedReportById({ commit }, reportId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/reports/${reportId}`)
        .then((response) => {
          commit('SET_SAVED_REPORT', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Delete a saved report
   */
  deleteSavedReport({ commit }, reportId) {
    return new Promise((resolve, reject) => {
      axios
        .delete(`/reports/${reportId}`)
        .then((response) => {
          commit('REMOVE_SAVED_REPORT', reportId);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
};
