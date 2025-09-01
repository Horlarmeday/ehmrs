export default {
  // ===== LOADING AND ERROR MUTATIONS =====
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  CLEAR_ERROR(state) {
    state.error = null;
  },

  // ===== PHASE 1: CORE FINANCIAL FOUNDATION MUTATIONS =====

  // Bank Account mutations
  SET_BANK_ACCOUNTS(state, accounts) {
    state.bankAccounts = accounts.docs || accounts;
    state.bankAccountsTotal = accounts.total || 0;
    state.bankAccountsPages = accounts.pages || 0;
  },
  SET_BANK_ACCOUNT(state, account) {
    state.bankAccount = account;
  },
  CLEAR_BANK_ACCOUNT(state) {
    state.bankAccount = null;
  },

  // POS Terminal mutations
  SET_POS_TERMINALS(state, terminals) {
    state.posTerminals = terminals.docs || terminals;
    state.posTerminalsTotal = terminals.total || 0;
    state.posTerminalsPages = terminals.pages || 0;
  },
  SET_POS_TERMINAL(state, terminal) {
    state.posTerminal = terminal;
  },
  CLEAR_POS_TERMINAL(state) {
    state.posTerminal = null;
  },

  // Chart of Accounts mutations
  SET_CHART_OF_ACCOUNTS(state, accounts) {
    state.chartOfAccounts = accounts.docs || accounts;
    state.chartOfAccountsTotal = accounts.total || 0;
    state.chartOfAccountsPages = accounts.pages || 0;
  },
  SET_CHART_OF_ACCOUNTS_SUMMARY(state, summary) {
    state.chartOfAccountsSummary = { ...state.chartOfAccountsSummary, ...summary };
  },

  // Account Validation and Conflict Resolution mutations
  SET_ACCOUNT_VALIDATION_RESULT(state, result) {
    state.accountValidationResult = result;
  },
  SET_ACCOUNT_CONFLICT_SUGGESTIONS(state, suggestions) {
    state.accountConflictSuggestions = suggestions;
  },
  SET_VALIDATION_STATISTICS(state, statistics) {
    state.validationStatistics = statistics;
  },
  SET_QUICK_VALIDATION_RESULT(state, result) {
    state.quickValidationResult = result;
  },
  CLEAR_ACCOUNT_VALIDATION_DATA(state) {
    state.accountValidationResult = null;
    state.accountConflictSuggestions = null;
    state.validationStatistics = null;
    state.quickValidationResult = null;
  },

  // Journal Entries mutations
  SET_JOURNAL_ENTRIES(state, entries) {
    state.journalEntries = entries.docs || entries;
    state.journalEntriesTotal = entries.total || 0;
    state.journalEntriesPages = entries.pages || 0;
  },
  SET_JOURNAL_ENTRIES_SUMMARY(state, summary) {
    state.journalEntriesSummary = { ...state.journalEntriesSummary, ...summary };
  },

  // Trial Balance mutations
  SET_TRIAL_BALANCE: (state, data) => {
    state.trialBalance = data;
  },
  SET_TRIAL_BALANCE_SUMMARY: (state, data) => {
    state.trialBalanceSummary = data;
  },
  SET_TRIAL_BALANCE_CHART_DATA: (state, data) => {
    state.trialBalanceChartData = data;
  },
  SET_TRIAL_BALANCE_VARIANCE_ANALYSIS: (state, data) => {
    state.trialBalanceVarianceAnalysis = data;
  },
  SET_BALANCE_SHEET_PREVIEW: (state, data) => {
    state.balanceSheetPreview = data;
  },

  // Cost Centers mutations
  SET_COST_CENTERS(state, centers) {
    state.costCenters = centers.docs || centers;
    state.costCentersTotal = centers.total || 0;
    state.costCentersPages = centers.pages || 0;
  },
  SET_COST_CENTERS_SUMMARY(state, summary) {
    state.costCentersSummary = { ...state.costCentersSummary, ...summary };
  },

  // Financial Periods mutations
  SET_FINANCIAL_PERIODS(state, periods) {
    state.financialPeriods = periods.docs || periods;
    state.financialPeriodsTotal = periods.total || 0;
    state.financialPeriodsPages = periods.pages || 0;
  },
  SET_FINANCIAL_PERIODS_SUMMARY(state, summary) {
    state.financialPeriodsSummary = { ...state.financialPeriodsSummary, ...summary };
  },

  // HMO Claims mutations
  SET_HMO_CLAIMS(state, claims) {
    state.hmoClaims = claims.docs || claims;
    state.hmoClaimsTotal = claims.total || 0;
    state.hmoClaimsPages = claims.pages || 0;
  },
  SET_HMO_CLAIMS_SUMMARY(state, summary) {
    state.hmoClaimsSummary = { ...state.hmoClaimsSummary, ...summary };
  },

  // ===== DEPOSIT MANAGEMENT MUTATIONS =====
  SET_DEPOSITS_SUMMARY(state, summary) {
    state.depositsSummary = summary;
  },

  // ===== EXISTING ACCOUNTING MODULES MUTATIONS =====

  // Dashboard mutations
  SET_DASHBOARD_DATA(state, data) {
    state.dashboardData = data;
  },

  // Accounting Summary mutations
  SET_ACCOUNTING_SUMMARY(state, summary) {
    state.accountingSummary = summary;
  },

  // Clinical Bills mutations
  SET_CLINICAL_BILLS(state, bills) {
    state.clinicalBills = bills;
  },
  SET_CLINICAL_BILLS_TOTAL(state, total) {
    state.clinicalBillsTotal = total;
  },
  SET_CLINICAL_BILLS_PAGES(state, pages) {
    state.clinicalBillsPages = pages;
  },

  // Clinical Payments mutations
  SET_CLINICAL_PAYMENTS(state, payments) {
    state.clinicalPayments = payments;
  },
  SET_CLINICAL_PAYMENTS_TOTAL(state, total) {
    state.clinicalPaymentsTotal = total;
  },
  SET_CLINICAL_PAYMENTS_PAGES(state, pages) {
    state.clinicalPaymentsPages = pages;
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
  SET_PAYMENTS(state, payments) {
    state.payments = payments;
  },
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

  // Financial reports mutations
  SET_FINANCIAL_REPORTS(state, data) {
    state.financialReports = { ...state.financialReports, ...data };
  },

  // ===== CLINICAL BILL SEARCH MUTATIONS =====

  // Set clinical bill by number
  SET_CLINICAL_BILL_BY_NUMBER(state, bill) {
    state.clinicalBillByNumber = bill;
  },

  // Set patient clinical bills
  SET_PATIENT_CLINICAL_BILLS(state, bills) {
    state.patientClinicalBills = bills;
  },

  // ===== DEPOSIT USAGE HISTORY MUTATIONS =====

  // Set deposit usage history
  SET_DEPOSIT_USAGE_HISTORY(state, history) {
    state.depositUsageHistory = history;
  },

  // ===== BILLING POINTS MUTATIONS =====

  // Set billing points
  SET_BILLING_POINTS(state, points) {
    state.billingPoints = points;
  },

  // ===== PHASE 6: REPORTING & ANALYTICS MUTATIONS =====

  // Financial Reporting Mutations
  SET_COMPREHENSIVE_FINANCIAL_REPORT(state, report) {
    state.comprehensiveFinancialReport = report;
  },

  SET_PROFIT_LOSS_STATEMENT(state, statement) {
    state.profitLossStatement = statement;
  },

  SET_BALANCE_SHEET(state, sheet) {
    state.balanceSheet = sheet;
  },

  SET_CASH_FLOW_STATEMENT(state, statement) {
    state.cashFlowStatement = statement;
  },

  // Operational Reporting Mutations
  SET_OPERATIONAL_PERFORMANCE_REPORT(state, report) {
    state.operationalPerformanceReport = report;
  },

  SET_PAYMENT_METHOD_UTILIZATION(state, utilization) {
    state.paymentMethodUtilization = utilization;
  },

  SET_RECONCILIATION_STATUS(state, status) {
    state.reconciliationStatus = status;
  },

  SET_SETTLEMENT_TRACKING(state, tracking) {
    state.settlementTracking = tracking;
  },

  // Business Intelligence Mutations
  SET_COMPREHENSIVE_BI_REPORT(state, report) {
    state.comprehensiveBIReport = report;
  },

  SET_PAYMENT_TREND_ANALYSIS(state, analysis) {
    state.paymentTrendAnalysis = analysis;
  },

  SET_PREDICTIVE_ANALYTICS(state, analytics) {
    state.predictiveAnalytics = analytics;
  },

  SET_KPI_MONITORING(state, monitoring) {
    state.kpiMonitoring = monitoring;
  },

  SET_REAL_TIME_MONITORING(state, monitoring) {
    state.realTimeMonitoring = monitoring;
  },

  // ===== END PHASE 6 MUTATIONS =====
};
