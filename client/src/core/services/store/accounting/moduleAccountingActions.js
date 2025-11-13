import axios from 'axios';

export default {
  // ===== PHASE 1: CORE FINANCIAL FOUNDATION ACTIONS =====

  // Bank Account actions
  async getBankAccounts({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/bank-accounts', { params });
      commit('SET_BANK_ACCOUNTS', response.data.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch bank accounts:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createBankAccount({ commit, dispatch }, accountData) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.post('/accounting/bank-accounts', accountData);
      // Refresh accounts list
      dispatch('getBankAccounts');
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to create bank account:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateBankAccount({ commit, dispatch }, { id, data }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.put(`/accounting/bank-accounts/${id}`, data);
      // Refresh accounts list
      dispatch('getBankAccounts');
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to update bank account:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteBankAccount({ commit, dispatch }, id) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.delete(`/accounting/bank-accounts/${id}`);
      // Refresh accounts list
      dispatch('getBankAccounts');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to delete bank account:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async toggleBankAccountStatus({ commit, dispatch }, id) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.post(`/accounting/bank-accounts/${id}/toggle-status`);
      // Refresh accounts list
      dispatch('getBankAccounts');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to toggle bank account status:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async getBankAccountById({ commit }, id) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get(`/accounting/bank-accounts/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch bank account:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateBankAccountBalance({ commit, dispatch }, { id, newBalance, currentBalance, reason }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      // Validate parameters
      if (newBalance === null || newBalance === undefined || isNaN(newBalance)) {
        throw new Error('Invalid new balance value');
      }
      if (currentBalance === null || currentBalance === undefined || isNaN(currentBalance)) {
        throw new Error('Invalid current balance value');
      }
      if (!reason || reason.trim().length === 0) {
        throw new Error('Reason is required for balance update');
      }

      // Calculate the difference and determine operation
      const amount = Math.abs(newBalance - currentBalance);
      const operation = newBalance > currentBalance ? 'add' : 'subtract';

      // Don't allow zero amount updates
      if (amount === 0) {
        throw new Error('New balance must be different from current balance');
      }

      const response = await axios.post(`/accounting/bank-accounts/${id}/balance`, {
        amount: amount,
        operation: operation,
        reason: reason,
      });
      // Refresh accounts list
      dispatch('getBankAccounts');
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to update bank account balance:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Chart of Accounts actions
  async fetchChartOfAccounts({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/chart-of-accounts', { params });
      commit('SET_CHART_OF_ACCOUNTS', response.data.data);
      if (response.data.summary) {
        commit('SET_CHART_OF_ACCOUNTS_SUMMARY', response.data.summary);
      }
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch chart of accounts:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createChartOfAccount({ commit, dispatch }, accountData) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.post('/accounting/chart-of-accounts', accountData);
      // Refresh accounts list
      dispatch('fetchChartOfAccounts');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to create chart of account:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateChartOfAccount({ commit, dispatch }, { id, data }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.put(`/accounting/chart-of-accounts/${id}`, data);
      // Refresh accounts list
      dispatch('fetchChartOfAccounts');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to update chart of account:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteChartOfAccount({ commit, dispatch }, id) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.delete(`/accounting/chart-of-accounts/${id}`);
      // Refresh accounts list
      dispatch('fetchChartOfAccounts');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to delete chart of account:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Account Validation and Conflict Resolution actions
  async validateChartOfAccount({ commit }, accountData) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.post('/accounting/chart-of-accounts/validate', accountData);
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to validate chart of account:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async getAccountConflictSuggestions({ commit }, { accountData, existingAccountId }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const url = existingAccountId
        ? `/accounting/chart-of-accounts/${existingAccountId}/conflict-suggestions`
        : '/accounting/chart-of-accounts/conflict-suggestions';

      const response = await axios.post(url, accountData);
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to get conflict suggestions:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async validateAllChartOfAccounts({ commit }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/chart-of-accounts/validation/all');
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to validate all chart of accounts:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async quickValidationCheck({ commit }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/chart-of-accounts/validation/quick');
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to perform quick validation check:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async getValidationStatistics({ commit }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/chart-of-accounts/validation/statistics');
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to get validation statistics:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async validateAccountType({ commit }, accountType) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get(
        `/accounting/chart-of-accounts/validation/type/${accountType}`
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to validate account type:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Journal Entries actions
  async fetchJournalEntries({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/journal-entries', { params });
      commit('SET_JOURNAL_ENTRIES', response.data.data);
      if (response.data.summary) {
        commit('SET_JOURNAL_ENTRIES_SUMMARY', response.data.summary);
      }
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch journal entries:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createJournalEntry({ commit, dispatch }, entryData) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.post('/accounting/journal-entries', entryData);
      // Refresh entries list
      dispatch('fetchJournalEntries');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to create journal entry:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateJournalEntry({ commit, dispatch }, { id, data }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.put(`/accounting/journal-entries/${id}`, data);
      // Refresh entries list
      dispatch('fetchJournalEntries');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to update journal entry:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteJournalEntry({ commit, dispatch }, id) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.delete(`/accounting/journal-entries/${id}`);
      // Refresh entries list
      dispatch('fetchJournalEntries');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to delete journal entry:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Trial Balance actions
  async fetchTrialBalance({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/trial-balance', { params });
      commit('SET_TRIAL_BALANCE', response.data.data);
      if (response.data.summary) {
        commit('SET_TRIAL_BALANCE_SUMMARY', response.data.summary);
      }
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch trial balance:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async exportTrialBalance({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/trial-balance/export', {
        params,
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trial-balance-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to export trial balance:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchTrialBalanceChartData({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/trial-balance/chart-data', { params });
      commit('SET_TRIAL_BALANCE_CHART_DATA', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch trial balance chart data:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchTrialBalanceVarianceAnalysis({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/trial-balance/variance-analysis', { params });
      commit('SET_TRIAL_BALANCE_VARIANCE_ANALYSIS', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch trial balance variance analysis:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchBalanceSheetPreview({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/trial-balance/balance-sheet-preview', {
        params,
      });
      commit('SET_BALANCE_SHEET_PREVIEW', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch balance sheet preview:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Cost Centers actions
  async fetchCostCenters({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/cost-centers', { params });
      commit('SET_COST_CENTERS', response.data.data);
      if (response.data.summary) {
        commit('SET_COST_CENTERS_SUMMARY', response.data.summary);
      }
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch cost centers:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createCostCenter({ commit, dispatch }, centerData) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.post('/accounting/cost-centers', centerData);
      // Refresh centers list
      dispatch('fetchCostCenters');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to create cost center:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateCostCenter({ commit, dispatch }, { id, data }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.put(`/accounting/cost-centers/${id}`, data);
      // Refresh centers list
      dispatch('fetchCostCenters');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to update cost center:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteCostCenter({ commit, dispatch }, id) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.delete(`/accounting/cost-centers/${id}`);
      // Refresh centers list
      dispatch('fetchCostCenters');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to delete cost center:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Financial Periods actions
  async fetchFinancialPeriods({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/financial-periods', { params });
      commit('SET_FINANCIAL_PERIODS', response.data.data);
      if (response.data.summary) {
        commit('SET_FINANCIAL_PERIODS_SUMMARY', response.data.summary);
      }
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch financial periods:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createFinancialPeriod({ commit, dispatch }, periodData) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.post('/accounting/financial-periods', periodData);
      // Refresh periods list
      dispatch('fetchFinancialPeriods');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to create financial period:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateFinancialPeriod({ commit, dispatch }, { id, data }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.put(`/accounting/financial-periods/${id}`, data);
      // Refresh periods list
      dispatch('fetchFinancialPeriods');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to update financial period:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteFinancialPeriod({ commit, dispatch }, id) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.delete(`/accounting/financial-periods/${id}`);
      // Refresh periods list
      dispatch('fetchFinancialPeriods');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to delete financial period:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async openFinancialPeriod({ commit, dispatch }, { id, notes }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.post(`/accounting/financial-periods/${id}/open`, { notes });
      // Refresh periods list
      dispatch('fetchFinancialPeriods');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to open financial period:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async closeFinancialPeriod({ commit, dispatch }, { id, closing_date, notes }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.post(`/accounting/financial-periods/${id}/close`, { closing_date, notes });
      // Refresh periods list
      dispatch('fetchFinancialPeriods');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to close financial period:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // HMO Claims actions
  async fetchHMOClaims({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/hmo-claims', { params });
      commit('SET_HMO_CLAIMS', response.data.data);
      if (response.data.summary) {
        commit('SET_HMO_CLAIMS_SUMMARY', response.data.summary);
      }
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch HMO claims:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createHMOClaim({ commit, dispatch }, claimData) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.post('/accounting/hmo-claims', claimData);
      // Refresh claims list
      dispatch('fetchHMOClaims');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to create HMO claim:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateHMOClaim({ commit, dispatch }, { id, data }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.put(`/accounting/hmo-claims/${id}`, data);
      // Refresh claims list
      dispatch('fetchHMOClaims');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to update HMO claim:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteHMOClaim({ commit, dispatch }, id) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.delete(`/accounting/hmo-claims/${id}`);
      // Refresh claims list
      dispatch('fetchHMOClaims');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to delete HMO claim:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async approveHMOClaim({ commit, dispatch }, { id, notes }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.post(`/accounting/hmo-claims/${id}/approve`, { notes });
      // Refresh claims list
      dispatch('fetchHMOClaims');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to approve HMO claim:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async rejectHMOClaim({ commit, dispatch }, { id, reason }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.post(`/accounting/hmo-claims/${id}/reject`, { reason });
      // Refresh claims list
      dispatch('fetchHMOClaims');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to reject HMO claim:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async processHMOClaimPayment({ commit, dispatch }, { id, amount, notes }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.post(`/accounting/hmo-claims/${id}/payment`, { amount, notes });
      // Refresh claims list
      dispatch('fetchHMOClaims');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to process HMO claim payment:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // ===== EXISTING ACCOUNTING MODULES ACTIONS =====

  // Dashboard actions
  async fetchDashboardData({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/summary', { params });
      commit('SET_DASHBOARD_DATA', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Bills actions
  async fetchBills({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/bills', { params });
      commit('SET_BILLS', response.data.data);
      commit('SET_BILLS_TOTAL', response.data.total);
      commit('SET_BILLS_PAGES', response.data.pages || 0);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch bills:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createBill({ commit, dispatch }, billData) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.post('/accounting/bills', billData);
      // Refresh bills list
      dispatch('fetchBills');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to create bill:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateBill({ commit, dispatch }, { id, billData }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.put(`/accounting/bills/${id}`, billData);
      // Refresh bills list
      dispatch('fetchBills');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to update bill:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async getBillById({ commit }, billId) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get(`/accounting/bills/${billId}`);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch bill:', error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Payments actions
  async fetchPayments({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/payments', { params });
      commit('SET_PAYMENTS', response.data.data);
      commit('SET_PAYMENTS_TOTAL', response.data.total);
      commit('SET_PAYMENTS_PAGES', response.data.pages || 0);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch payments:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createPayment({ commit, dispatch }, paymentData) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.post('/accounting/payments', paymentData);
      // Refresh payments list
      dispatch('fetchPayments');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to create payment:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Deposits actions
  async fetchDeposits({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/deposits', { params });
      commit('SET_DEPOSITS', response.data.data.docs);
      commit('SET_DEPOSITS_TOTAL', response.data.data.total);
      commit('SET_DEPOSITS_PAGES', response.data.data.pages || 0);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch deposits:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchDepositsSummary({ commit }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/reports/deposits/summary');
      if (response.data.success) {
        commit('SET_DEPOSITS_SUMMARY', response.data.data);
      }
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch deposits summary:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async consolidateDeposits({ commit }, { patientId = null, dryRun = false } = {}) {
    commit('SET_DEPOSIT_CONSOLIDATION_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const payload = {};
      if (patientId !== null && patientId !== undefined && patientId !== '') {
        payload.patient_id = patientId;
      }
      payload.dry_run = !!dryRun;

      const response = await axios.post('/accounting/deposits/consolidate', payload);
      const data = response?.data?.data || {};

      commit('SET_DEPOSIT_CONSOLIDATION_RESULTS', {
        results: data.results || [],
        summary: data.summary || null,
      });

      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      commit('SET_DEPOSIT_CONSOLIDATION_RESULTS', { results: [], summary: null });
      console.error('Failed to consolidate deposits:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_DEPOSIT_CONSOLIDATION_LOADING', false);
    }
  },

  async fetchDepositConsolidationReport({ commit }) {
    commit('SET_DEPOSIT_CONSOLIDATION_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/deposits/consolidation-report');
      commit('SET_DEPOSIT_CONSOLIDATION_REPORT', response?.data?.data || null);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch deposit consolidation report:', error);
      throw error;
    } finally {
      commit('SET_DEPOSIT_CONSOLIDATION_LOADING', false);
    }
  },

  async createDeposit({ commit, dispatch }, depositData) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.post('/accounting/deposits', depositData);
      // Refresh deposits list
      dispatch('fetchDeposits');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to create deposit:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateDeposit({ commit, dispatch }, { id, depositData }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.put(`/accounting/deposits/${id}`, depositData);
      // Refresh deposits list
      dispatch('fetchDeposits');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to update deposit:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async getDepositById({ commit }, depositId) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get(`/accounting/deposits/${depositId}`);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch deposit:', error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Financial reports actions
  async fetchFinancialReports({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/reports/financial', { params });
      commit('SET_FINANCIAL_REPORTS', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch financial reports:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // ===== PHASE 6: REPORTING & ANALYTICS ACTIONS =====

  // Financial Reporting Actions
  async fetchComprehensiveFinancialReport({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/reports/financial/comprehensive', { params });
      commit('SET_COMPREHENSIVE_FINANCIAL_REPORT', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch comprehensive financial report:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchProfitLossStatement({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/reports/financial/pl', { params });
      commit('SET_PROFIT_LOSS_STATEMENT', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch profit & loss statement:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchBalanceSheet({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/reports/financial/balance-sheet', { params });
      commit('SET_BALANCE_SHEET', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch balance sheet:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchCashFlowStatement({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/reports/financial/cash-flow', { params });
      commit('SET_CASH_FLOW_STATEMENT', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch cash flow statement:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Operational Reporting Actions
  async fetchOperationalPerformanceReport({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/reports/operational/performance', { params });
      commit('SET_OPERATIONAL_PERFORMANCE_REPORT', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch operational performance report:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchPaymentMethodUtilization({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/reports/operational/utilization', { params });
      commit('SET_PAYMENT_METHOD_UTILIZATION', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch payment method utilization:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchReconciliationStatus({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/reports/operational/reconciliation', {
        params,
      });
      commit('SET_RECONCILIATION_STATUS', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch reconciliation status:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchSettlementTracking({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/reports/operational/settlement', { params });
      commit('SET_SETTLEMENT_TRACKING', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch settlement tracking:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Business Intelligence Actions
  async fetchComprehensiveBIReport({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/reports/business-intelligence/comprehensive', {
        params,
      });
      commit('SET_COMPREHENSIVE_BI_REPORT', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch comprehensive BI report:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchPaymentTrendAnalysis({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/reports/business-intelligence/trends', {
        params,
      });
      commit('SET_PAYMENT_TREND_ANALYSIS', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch payment trend analysis:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchPredictiveAnalytics({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/reports/business-intelligence/predictive', {
        params,
      });
      commit('SET_PREDICTIVE_ANALYTICS', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch predictive analytics:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchKPIMonitoring({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/reports/business-intelligence/kpi', { params });
      commit('SET_KPI_MONITORING', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch KPI monitoring:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchRealTimeMonitoring({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/reports/business-intelligence/real-time', {
        params,
      });
      commit('SET_REAL_TIME_MONITORING', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch real-time monitoring:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Dashboard actions
  async fetchAccountingSummary({ commit }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/summary');
      commit('SET_ACCOUNTING_SUMMARY', response.data.data);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch accounting summary:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Clinical Bills actions
  async fetchClinicalBills({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/bills', { params });
      commit('SET_CLINICAL_BILLS', response.data.data.docs);
      commit('SET_CLINICAL_BILLS_TOTAL', response.data.data.total);
      commit('SET_CLINICAL_BILLS_PAGES', response.data.data.pages || 0);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch clinical bills:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Clinical Payments actions
  async fetchClinicalPayments({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/payments', { params });
      commit('SET_CLINICAL_PAYMENTS', response.data.data.docs);
      commit('SET_CLINICAL_PAYMENTS_TOTAL', response.data.total);
      commit('SET_CLINICAL_PAYMENTS_PAGES', response.data.pages || 0);
      return response.data.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch clinical payments:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Get single clinical payment by ID
  async getClinicalPaymentById(_, paymentId) {
    try {
      const response = await axios.get(`/accounting/payments/${paymentId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Failed to get clinical payment by ID:', error);
      return { success: false, error: error.message };
    }
  },

  // Get clinical bill by ID
  async getClinicalBillById(_, billId) {
    try {
      const response = await axios.get(`/accounting/bills/${billId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Failed to get clinical bill by ID:', error);
      return { success: false, error: error.message };
    }
  },

  // Get clinical bill with items
  async getClinicalBillWithItems(_, billId) {
    try {
      const response = await axios.get(`/accounting/bills/${billId}/with-items`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Failed to get clinical bill with items:', error);
      return { success: false, error: error.message };
    }
  },

  // Create clinical payment
  async createClinicalPayment(_, paymentData) {
    try {
      const response = await axios.post('/accounting/payments/process', paymentData);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Failed to create clinical payment:', error);
      return { success: false, error: error.message };
    }
  },

  // Patient Deposit actions
  async getPatientDepositByPatientId(_, patientId) {
    try {
      const response = await axios.get(`/accounting/deposits/patient/${patientId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Failed to get patient deposit by patient ID:', error);
      return { success: false, error: error.message };
    }
  },

  async getPatientDepositById(_, depositId) {
    try {
      const response = await axios.get(`/accounting/deposits/${depositId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Failed to get patient deposit by ID:', error);
      return { success: false, error: error.message };
    }
  },

  async downloadDepositReceipt(_, depositId) {
    try {
      const response = await axios.get(`/accounting/deposits/${depositId}/receipt/download`, {
        responseType: 'arraybuffer',
      });

      const contentType = response.headers['content-type'] || 'application/pdf';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `deposit-receipt-${depositId}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Failed to download deposit receipt:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  async printDepositReceipt(_, depositId) {
    try {
      const response = await axios.get(`/accounting/deposits/${depositId}/receipt/download`, {
        responseType: 'arraybuffer',
      });

      // Create blob for printing
      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      // Open in a new tab or iframe for printing
      const printWindow = window.open(blobUrl, '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Give the browser a moment to load the PDF, then trigger print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };

      return { success: true };
    } catch (error) {
      console.error('Failed to print deposit receipt:', error);
      return { success: false, error: error.message };
    }
  },

  async useDeposit(_, usageData) {
    try {
      const response = await axios.post(
        `/accounting/deposits/${usageData.deposit_id}/use`,
        usageData
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Failed to use deposit:', error);
      return { success: false, error: error.message };
    }
  },

  async getDepositUsageHistory(_, depositId) {
    try {
      const response = await axios.get(`/accounting/deposits/${depositId}/usage-history`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get deposit usage history:', error);
      return [];
    }
  },

  // Bank Account actions
  async getActiveBankAccounts() {
    try {
      const response = await axios.get('/accounting/bank-accounts/active');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Failed to get active bank accounts:', error);
      return { success: false, error: error.message };
    }
  },

  // POS Terminal actions
  async getPOSTerminals({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/pos-terminals', { params });
      commit('SET_POS_TERMINALS', response.data.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch POS terminals:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async getPOSTerminalById({ commit }, id) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get(`/accounting/pos-terminals/${id}`);
      commit('SET_POS_TERMINAL', response.data.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to get POS terminal by ID:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createPOSTerminal({ commit, dispatch }, terminalData) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.post('/accounting/pos-terminals', terminalData);
      // Refresh terminals list
      dispatch('getPOSTerminals');
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to create POS terminal:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updatePOSTerminal({ commit, dispatch }, { id, data }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.put(`/accounting/pos-terminals/${id}`, data);
      // Refresh terminals list
      dispatch('getPOSTerminals');
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to update POS terminal:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deletePOSTerminal({ commit, dispatch }, id) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.delete(`/accounting/pos-terminals/${id}`);
      // Refresh terminals list
      dispatch('getPOSTerminals');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to delete POS terminal:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async togglePOSTerminalStatus({ commit, dispatch }, id) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      await axios.post(`/accounting/pos-terminals/${id}/toggle-status`);
      // Refresh terminals list
      dispatch('getPOSTerminals');
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to toggle POS terminal status:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updatePOSTerminalLastUsed({ commit, dispatch }, { id, lastUsedAt, reason }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.patch(`/accounting/pos-terminals/${id}/last-used`, {
        last_used_at: lastUsedAt,
        reason,
      });
      // Refresh terminals list
      dispatch('getPOSTerminals');
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to update POS terminal last used:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async getActivePOSTerminals() {
    try {
      const response = await axios.get('/accounting/pos-terminals/active');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Failed to get active POS terminals:', error);
      return { success: false, error: error.message };
    }
  },

  // Payment Processing actions
  async getPaymentOptions(_, { billId, patientId }) {
    try {
      const response = await axios.get('/accounting/payments/processing/options', {
        params: { billId, patientId },
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Failed to get payment options:', error);
      return { success: false, error: error.message };
    }
  },

  async getPaymentStatus(_, paymentId) {
    try {
      const response = await axios.get(`/accounting/payments/${paymentId}/status`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Failed to get payment status:', error);
      return { success: false, error: error.message };
    }
  },

  async getPaymentReceipt(_, paymentId) {
    try {
      const response = await axios.get(`/accounting/payments/${paymentId}/receipt`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Failed to get payment receipt:', error);
      return { success: false, error: error.message };
    }
  },

  async downloadPaymentReceipt(_, paymentId) {
    try {
      const response = await axios.get(`/accounting/payments/${paymentId}/receipt/download`, {
        responseType: 'arraybuffer',
      });

      // Create blob and download
      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${paymentId}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Failed to download payment receipt:', error);
      return { success: false, error: error.message };
    }
  },

  async printPaymentReceipt(_, paymentId) {
    try {
      const response = await axios.get(`/accounting/payments/${paymentId}/receipt/download`, {
        responseType: 'arraybuffer',
      });

      // Create blob for printing
      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      // Open in a new tab or iframe for printing
      const printWindow = window.open(blobUrl, '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Give the browser a moment to load the PDF, then trigger print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };

      return { success: true };
    } catch (error) {
      console.error('Failed to print payment receipt:', error);
      return { success: false, error: error.message };
    }
  },

  async validatePaymentData(_, paymentData) {
    try {
      const response = await axios.post('/accounting/payments/validate', paymentData);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Failed to validate payment data:', error);
      return { success: false, error: error.message };
    }
  },

  // Export deposits
  async exportDeposits(_, params = {}) {
    try {
      const response = await axios.get('/accounting/deposits/export', { params });

      if (response.data.success) {
        // Handle different export formats
        if (params.format === 'CSV') {
          this.downloadCSV(response.data.data, 'deposits-export.csv');
        } else if (params.format === 'Excel') {
          this.downloadExcel(response.data.data, 'deposits-export.xlsx');
        } else if (params.format === 'PDF') {
          this.downloadPDF(response.data.data, 'deposits-export.pdf');
        }

        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.error || 'Export failed' };
      }
    } catch (error) {
      console.error('Export deposits error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Export failed',
      };
    }
  },

  // Helper methods for downloads
  downloadCSV(data, filename) {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  },

  downloadExcel(data, filename) {
    // For Excel, we'll use a simple CSV download for now
    // In production, you might want to use a library like xlsx
    this.downloadCSV(data, filename.replace('.xlsx', '.csv'));
  },

  downloadPDF(data, filename) {
    // For PDF, we'll use a simple CSV download for now
    // In production, you might want to use a library like jsPDF
    this.downloadCSV(data, filename.replace('.pdf', '.csv'));
  },

  convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  },

  // =============================================================================
  // CASH REGISTER MANAGEMENT ACTIONS
  // =============================================================================

  async getCashRegisters({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/accounting/cash-registers', { params });
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch cash registers:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async getCashRegisterById({ commit }, id) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get(`/accounting/cash-registers/${id}`);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch cash register:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createCashRegister({ commit, dispatch }, registerData) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.post('/accounting/cash-registers', registerData);
      // Refresh registers list
      dispatch('getCashRegisters');
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to create cash register:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateCashRegister({ commit, dispatch }, { id, data }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.put(`/accounting/cash-registers/${id}`, data);
      // Refresh registers list
      dispatch('getCashRegisters');
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to update cash register:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async openCashRegister({ commit, dispatch }, { id, opening_amount }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.post(`/accounting/cash-registers/${id}/open`, {
        opening_amount,
      });
      // Refresh registers list
      dispatch('getCashRegisters');
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to open cash register:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async closeCashRegister({ commit, dispatch }, { id, closing_amount }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.post(`/accounting/cash-registers/${id}/close`, {
        closing_amount,
      });
      // Refresh registers list
      dispatch('getCashRegisters');
      return { success: true, data: response.data.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to close cash register:', error);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async getCashRegisterSummary({ commit }, id) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get(`/accounting/cash-registers/${id}/summary`);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch cash register summary:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // =============================================================================
  // PATIENT FINANCIAL LOOKUP ACTIONS
  // =============================================================================

  /**
   * Get all bills for a specific patient
   * @param {number} patientId - The patient ID
   * @returns {Promise<Object>} Bills data
   */
  async getPatientBills(_, patientId) {
    try {
      const response = await axios.get(`/accounting/bills/patient/${patientId}`);
      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Failed to get patient bills:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Get all payments for a specific patient
   * @param {number} patientId - The patient ID
   * @returns {Promise<Object>} Payments data
   */
  async getPatientPayments(_, patientId) {
    try {
      // Use the general payments endpoint with patient_id filter
      const response = await axios.get('/accounting/payments', {
        params: { patient_id: patientId, limit: 100 }, // High limit to get all
      });
      return { success: true, data: response.data.data?.docs || response.data.data || [] };
    } catch (error) {
      console.error('Failed to get patient payments:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Get deposit transaction history for a specific patient
   * @param {number} patientId - The patient ID
   * @returns {Promise<Object>} Deposit history data
   */
  async getPatientDepositHistory(_, patientId) {
    try {
      const response = await axios.get(`/accounting/deposits/patient/${patientId}/history`);
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error('Failed to get patient deposit history:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Get patient's default insurance information
   * @param {Object} context - Vuex action context
   * @param {number} patientId - The patient ID
   * @returns {Promise<Object>} Patient default insurance data
   */
  async getPatientDefaultInsurance({ commit }, patientId) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await axios.get('/insurances/health-insurances/get/default', {
        params: { patientId },
      });

      if (response.data && response.data.data) {
        commit('SET_PATIENT_DEFAULT_INSURANCE', response.data.data);
        return { success: true, data: response.data.data };
      }

      return { success: false, error: 'No default insurance found for patient', data: null };
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Failed to fetch patient default insurance:', error);
      return { success: false, error: error.message || 'Failed to fetch insurance', data: null };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Generate patient financial statement
   * Downloads statement in specified format (PDF, CSV, or Excel)
   * @param {Object} params - Statement parameters
   * @param {number} params.patientId - Patient ID
   * @param {string} params.startDate - Start date (YYYY-MM-DD)
   * @param {string} params.endDate - End date (YYYY-MM-DD)
   * @param {string} params.format - Export format (pdf, csv, xlsx)
   * @param {boolean} params.includeDeposits - Include deposits in statement
   * @param {boolean} params.includeDetails - Include detailed bill items
   * @returns {Promise<void>} Downloads file directly to browser
   */
  async generatePatientFinancialStatement({ commit }, params) {
    try {
      commit('SET_LOADING', true);

      const { patientId, startDate, endDate, format, includeDeposits, includeDetails } = params;

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      queryParams.append('format', format);
      queryParams.append('includeDeposits', includeDeposits.toString());
      queryParams.append('includeDetails', includeDetails.toString());

      // Make request with blob response type
      const response = await axios.get(
        `/accounting/patients/${patientId}/financial-statement?${queryParams.toString()}`,
        {
          responseType: 'blob',
        }
      );

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = `patient_statement_${patientId}.${format}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Create blob and download
      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'Financial statement generated successfully',
      };
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Failed to generate financial statement');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Get comprehensive financial summary for a patient
   * Fetches bills, payments, deposits, and history in parallel
   * @param {number} patientId - The patient ID
   * @returns {Promise<Object>} Complete financial summary
   */
  async getPatientFinancialSummary({ dispatch }, patientId) {
    try {
      // Fetch all data in parallel for better performance
      const [billsResult, paymentsResult, depositsResult, historyResult] = await Promise.all([
        dispatch('getPatientBills', patientId),
        dispatch('getPatientPayments', patientId),
        dispatch('getPatientDepositByPatientId', patientId),
        dispatch('getPatientDepositHistory', patientId),
      ]);

      console.log({
        billsResult,
        paymentsResult,
        depositsResult,
        historyResult,
      });

      const bills = billsResult.data || [];
      const payments = paymentsResult.data || [];
      const deposits = depositsResult.data || [];
      const history = historyResult.data || [];

      // Calculate summary statistics
      const totalBills = bills.length;
      const totalBillsAmount = bills.reduce(
        (sum, bill) => sum + (parseFloat(bill.final_amount) || 0),
        0
      );

      const totalPayments = payments.length;
      const totalPaymentsAmount = payments.reduce(
        (sum, payment) => sum + (parseFloat(payment.amount) || 0),
        0
      );

      const activeDeposits = Array.isArray(deposits)
        ? deposits.filter((d) => d.status === 'ACTIVE')
        : deposits && deposits.status === 'ACTIVE'
        ? [deposits]
        : [];
      const totalDeposits = activeDeposits.length;
      const totalDepositsAmount = activeDeposits.reduce(
        (sum, deposit) => sum + (parseFloat(deposit.amount) || 0),
        0
      );

      // Calculate outstanding balance (bills - payments)
      const outstandingBalance = totalBillsAmount - totalPaymentsAmount;

      return {
        success: true,
        data: {
          bills,
          payments,
          deposits: Array.isArray(deposits) ? deposits : deposits ? [deposits] : [],
          history,
          summary: {
            totalBills,
            totalBillsAmount,
            totalPayments,
            totalPaymentsAmount,
            totalDeposits,
            totalDepositsAmount,
            outstandingBalance,
          },
        },
      };
    } catch (error) {
      console.error('Failed to get patient financial summary:', error);
      return {
        success: false,
        error: error.message,
        data: {
          bills: [],
          payments: [],
          deposits: [],
          history: [],
          summary: {
            totalBills: 0,
            totalBillsAmount: 0,
            totalPayments: 0,
            totalPaymentsAmount: 0,
            totalDeposits: 0,
            totalDepositsAmount: 0,
            outstandingBalance: 0,
          },
        },
      };
    }
  },
};
