import axios from '@/axios';

export default {
  addPayment({ commit }, payload) {
    const { id, ...rest } = payload;
    return new Promise((resolve, reject) => {
      axios
        .post(`/accounts/payments/create/${id}`, rest)
        .then(response => {
          commit('ADD_PAYMENT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchPatientPayments({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/accounts/payment-history/${payload.id}`, {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
          },
        })
        .then(response => {
          commit('SET_PAYMENTS', response.data.data.docs);
          commit('SET_PAYMENTS_TOTAL', response.data.data.total);
          commit('SET_PAYMENTS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  async fetchCostCenters({ commit }, { currentPage = 1, itemsPerPage = 10, search = null }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/accounts/cost-centers', {
          params: { currentPage, itemsPerPage, search },
        })
        .then(response => {
          commit('SET_COST_CENTERS', {
            data: response.data.data,
            total: response.data.total,
          });
          commit('SET_TOTAL_PAGES', response.data.pages);
          resolve(response);
          commit('SET_LOADING', false);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  async fetchDepartments({ commit }) {
    return new Promise((resolve, reject) => {
      axios
        .get('/departments')
        .then(response => {
          commit('SET_DEPARTMENTS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  async createCostCenter({ dispatch }, costCenter) {
    return new Promise((resolve, reject) => {
      axios
        .post('/accounts/cost-centers', costCenter)
        .then(response => {
          dispatch('fetchCostCenters', { currentPage: 1 });
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  async updateCostCenter({ dispatch }, { id, data }) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/accounts/cost-centers/${id}`, data)
        .then(response => {
          dispatch('fetchCostCenters', { currentPage: 1 });
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  async deleteCostCenter({ dispatch }, id) {
    return new Promise((resolve, reject) => {
      axios
        .delete(`/accounts/cost-centers/${id}`)
        .then(response => {
          dispatch('fetchCostCenters', { currentPage: 1 });
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  async fetchTrialBalance({ commit }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/accounts/trial-balance')
        .then(response => {
          commit('SET_TRIAL_BALANCE', response.data);
          resolve(response);
          commit('SET_LOADING', false);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  async generateFinancialStatement({ commit }, params) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .post('/accounts/financial-statements', params)
        .then(response => {
          commit('SET_FINANCIAL_STATEMENTS', response.data);
          resolve(response);
          commit('SET_LOADING', false);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  async exportReport({ commit }, { data, format, type, startDate, endDate }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .post(
          '/accounts/export-report',
          {
            data,
            format,
            type,
            startDate,
            endDate,
          },
          {
            responseType: 'blob',
          }
        )
        .then(response => {
          commit('SET_LOADING', false);
          resolve(response);
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${type}.${format.toLowerCase()}`);
          document.body.appendChild(link);
          link.click();
          link.remove();

          return response;
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  async fetchTrendAnalysis({ commit }, { startDate, endDate }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/accounts/trend-analysis', {
          params: { startDate, endDate },
        })
        .then(response => {
          commit('SET_TREND_ANALYSIS', response.data);
          resolve(response);
          commit('SET_LOADING', false);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  async fetchSavedReports({ commit }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/accounts/saved-reports')
        .then(response => {
          commit('SET_SAVED_REPORTS', response.data);
          resolve(response);
          commit('SET_LOADING', false);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  async createReport({ dispatch }, reportData) {
    return new Promise((resolve, reject) => {
      axios
        .post('/accounts/reports', reportData)
        .then(response => {
          dispatch('fetchSavedReports');
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  async updateReport({ dispatch }, reportData) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/accounts/reports/${reportData.id}`, reportData)
        .then(response => {
          dispatch('fetchSavedReports');
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  async deleteReport({ dispatch }, reportId) {
    return new Promise((resolve, reject) => {
      axios
        .delete(`/accounts/reports/${reportId}`)
        .then(response => {
          dispatch('fetchSavedReports');
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  async generateReport({ dispatch }, report) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/accounts/reports/${report.id}/generate`, {
          dateRange: report.dateRange,
        })
        .then(response => {
          resolve(response.data);
          dispatch('fetchSavedReports');
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  // Chart of Accounts
  async fetchAccounts({ commit }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/accounts/chart-of-accounts')
        .then(response => {
          commit('SET_ACCOUNTS', response.data.data);
          resolve(response);
          commit('SET_LOADING', false);
        })
        .catch(error => {
          commit('SET_ERROR', error.message);
          reject(error);
        });
    });
  },

  async createAccount({ commit }, account) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .post('/accounts/chart-of-accounts', account)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          commit('SET_ERROR', error.message);
          reject(error);
        })
        .finally(() => {
          commit('SET_LOADING', false);
        });
    });
  },

  async updateAccount({ commit }, { id, account }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .put(`/accounts/chart-of-accounts/${id}`, account)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          commit('SET_ERROR', error.message);
          reject(error);
        })
        .finally(() => {
          commit('SET_LOADING', false);
        });
    });
  },

  async deleteAccount({ commit }, id) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .delete(`/accounts/chart-of-accounts/${id}`)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          commit('SET_ERROR', error.message);
          reject(error);
        })
        .finally(() => {
          commit('SET_LOADING', false);
        });
    });
  },

  // Journal Entries
  async fetchJournalEntries({ commit }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/accounts/journal-entries')
        .then(response => {
          commit('SET_JOURNAL_ENTRIES', response.data.data);
          resolve(response);
          commit('SET_LOADING', false);
        })
        .catch(error => {
          commit('SET_ERROR', error.message);
          reject(error);
        });
    });
  },

  async createJournalEntry({ commit }, entry) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .post('/accounts/journal-entries', entry)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          commit('SET_ERROR', error.message);
          reject(error);
        })
        .finally(() => {
          commit('SET_LOADING', false);
        });
    });
  },

  async updateJournalEntry({ commit }, { id, entry }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .put(`/accounts/journal-entries/${id}`, entry)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          commit('SET_ERROR', error.message);
          reject(error);
        })
        .finally(() => {
          commit('SET_LOADING', false);
        });
    });
  },

  async deleteJournalEntry({ commit }, id) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .delete(`/accounts/journal-entries/${id}`)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          commit('SET_ERROR', error.message);
          reject(error);
        })
        .finally(() => {
          commit('SET_LOADING', false);
        });
    });
  },

  downloadPaymentReceipt({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(
          `/accounts/download-receipt/${payload.id}`,
          {
            serviceName: payload.serviceName,
          },
          {
            responseType: 'arraybuffer', // Important to receive binary data
          }
        )
        .then(response => {
          const contentType = response.headers['content-type'].split(';')[0];
          const blob = new Blob([response.data], {
            type: contentType,
          });
          const url = window.URL.createObjectURL(blob);
          // Create an anchor element with download attribute and trigger click event
          const a = document.createElement('a');
          // const extension = getExtensions();
          const fileName = response.headers['content-disposition'].split(';')[1].split('=')[1];
          a.href = url;
          a.download = fileName;
          a.click();

          // Clean up resources
          window.URL.revokeObjectURL(url);
          commit('DOWNLOAD_RECEIPT', []);
          resolve(response);
        })
        .catch(error => {
          console.log(error, 'error');
          reject(error);
        });
    });
  },
};
