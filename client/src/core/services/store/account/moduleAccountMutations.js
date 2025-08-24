export default {
  ADD_PAYMENT(state, payment) {
    state.payment = payment;
  },

  SET_PAYMENTS(state, payments) {
    state.payments = payments;
  },

  // SET_PAYMENTS_TOTAL(state, total) {
  //   state.total = total;
  // },

  // SET_PAYMENTS_PAGES(state, pages) {
  //   state.pages = pages;
  // },

  SET_ACCOUNTS(state, accounts) {
    state.accounts = accounts.docs;
    state.accountsTotal = accounts.total;
    state.accountsPages = accounts.pages;
  },

  SET_JOURNAL_ENTRIES(state, entries) {
    state.journalEntries = entries.docs;
    state.journalEntriesTotal = entries.total;
    state.journalEntriesPages = entries.pages;
  },

  SET_FINANCIAL_STATEMENTS(state, statements) {
    state.financialStatements = statements;
  },

  SET_COST_CENTERS(state, centers) {
    state.costCenters = centers.docs;
    state.costCentersTotal = centers.total;
    state.costCentersPages = centers.pages;
  },

  SET_DEPARTMENTS(state, departments) {
    state.departments = departments;
  },
  SET_TRIAL_BALANCE(state, trialBalance) {
    state.trialBalance = trialBalance;
  },
  SET_TREND_ANALYSIS(state, data) {
    state.trendAnalysis = data;
  },
  SET_SAVED_REPORTS(state, reports) {
    state.savedReports = reports;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_TOTAL_PAGES(state, pages) {
    state.totalPages = pages;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  // eslint-disable-next-line no-unused-vars
  DOWNLOAD_RECEIPT(state, error) {},

  // ===== NEW ACCOUNTING MODULE MUTATIONS =====

  // Dashboard mutations
  SET_DASHBOARD_DATA(state, data) {
    state.dashboardData = data;
  },

  // Bills mutations
  SET_BILLS(state, bills) {
    state.bills = bills;
  },
  SET_BILLS_TOTAL(state, total) {
    state.billsTotal = total;
  },
  SET_BILLS_PAGES(state, pages) {
    state.billsPages = pages;
  },

  // Payments mutations
  SET_PAYMENTS_TOTAL(state, total) {
    state.paymentsTotal = total;
  },
  SET_PAYMENTS_PAGES(state, pages) {
    state.paymentsPages = pages;
  },

  // Deposits mutations
  SET_DEPOSITS(state, deposits) {
    state.deposits = deposits;
  },
  SET_DEPOSITS_TOTAL(state, total) {
    state.depositsTotal = total;
  },
  SET_DEPOSITS_PAGES(state, pages) {
    state.depositsPages = pages;
  },

  // Deposits summary mutation
  SET_DEPOSITS_SUMMARY(state, summary) {
    state.depositsSummary = summary;
  },

  // Financial reports mutations
  SET_FINANCIAL_REPORTS(state, data) {
    state.financialReports = { ...state.financialReports, ...data };
  },

  // Error handling
  CLEAR_ERROR(state) {
    state.error = null;
  },
};
