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
      const response = await axios.get(`/accounting/chart-of-accounts/validation/type/${accountType}`);
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
      commit('SET_DEPOSITS', response.data.data);
      commit('SET_DEPOSITS_TOTAL', response.data.total);
      commit('SET_DEPOSITS_PAGES', response.data.pages || 0);
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
      commit('SET_CLINICAL_BILLS', response.data.data.bills);
      commit('SET_CLINICAL_BILLS_TOTAL', response.data.total);
      commit('SET_CLINICAL_BILLS_PAGES', response.data.pages || 0);
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
      commit('SET_CLINICAL_PAYMENTS', response.data.data);
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
      const response = await axios.post('/accounting/payments', paymentData);
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

  async useDeposit(_, usageData) {
    try {
      const response = await axios.post(`/accounting/deposits/${usageData.deposit_id}/use`, usageData);
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
};
