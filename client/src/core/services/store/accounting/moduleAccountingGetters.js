export default {
  // ===== LOADING AND ERROR GETTERS =====
  loading: state => state.loading,
  error: state => state.error,

  // ===== PHASE 1: CORE FINANCIAL FOUNDATION GETTERS =====

  // Bank Account getters
  getBankAccounts: state => state.bankAccounts,
  getBankAccountsTotal: state => state.bankAccountsTotal,
  getBankAccountsPages: state => state.bankAccountsPages,
  getBankAccount: state => state.bankAccount,

  // POS Terminal getters
  getPOSTerminals: state => state.posTerminals,
  getPOSTerminalsTotal: state => state.posTerminalsTotal,
  getPOSTerminalsPages: state => state.posTerminalsPages,
  getPOSTerminal: state => state.posTerminal,

  // Chart of Accounts getters
  getChartOfAccounts: state => state.chartOfAccounts,
  getChartOfAccountsTotal: state => state.chartOfAccountsTotal,
  getChartOfAccountsPages: state => state.chartOfAccountsPages,
  getChartOfAccountsSummary: state => state.chartOfAccountsSummary,

  // Account Validation and Conflict Resolution getters
  getAccountValidationResult: state => state.accountValidationResult,
  getAccountConflictSuggestions: state => state.accountConflictSuggestions,
  getValidationStatistics: state => state.validationStatistics,
  getQuickValidationResult: state => state.quickValidationResult,

  // Journal Entries getters
  getJournalEntries: state => state.journalEntries,
  getJournalEntriesTotal: state => state.journalEntriesTotal,
  getJournalEntriesPages: state => state.journalEntriesPages,
  getJournalEntriesSummary: state => state.journalEntriesSummary,

  // Trial Balance getters
  getTrialBalance: state => state.trialBalance,
  getTrialBalanceSummary: state => state.trialBalanceSummary,
  getTrialBalanceChartData: state => state.trialBalanceChartData,
  getTrialBalanceVarianceAnalysis: state => state.trialBalanceVarianceAnalysis,
  getBalanceSheetPreview: state => state.balanceSheetPreview,

  // Cost Centers getters
  getCostCenters: state => state.costCenters,
  getCostCentersTotal: state => state.costCentersTotal,
  getCostCentersPages: state => state.costCentersPages,
  getCostCentersSummary: state => state.costCentersSummary,

  // Financial Periods getters
  getFinancialPeriods: state => state.financialPeriods,
  getFinancialPeriodsTotal: state => state.financialPeriodsTotal,
  getFinancialPeriodsPages: state => state.financialPeriodsPages,
  getFinancialPeriodsSummary: state => state.financialPeriodsSummary,

  // HMO Claims getters
  getHMOClaims: state => state.hmoClaims,
  getHMOClaimsTotal: state => state.hmoClaimsTotal,
  getHMOClaimsPages: state => state.hmoClaimsPages,
  getHMOClaimsSummary: state => state.hmoClaimsSummary,

  // ===== EXISTING ACCOUNTING MODULES GETTERS =====

  // Dashboard getters
  getDashboardData: state => state.dashboardData,

  // Accounting Summary getters
  getAccountingSummary: state => state.accountingSummary,

  // Clinical Bills getters
  getClinicalBills: state => state.clinicalBills || [],

  // Clinical Payments getters
  getClinicalPayments: state => state.clinicalPayments || [],

  // Bills getters
  getBills: state => state.bills,
  getBillsTotal: state => state.billsTotal,
  getBillsPages: state => state.billsPages,

  // Payments getters
  getPayments: state => state.payments,
  getPaymentsTotal: state => state.paymentsTotal,
  getPaymentsPages: state => state.paymentsPages,

  // Deposits getters
  getDeposits: state => state.deposits,
  getDepositsTotal: state => state.depositsTotal,
  getDepositsPages: state => state.depositsPages,
  getDepositsSummary: state => state.depositsSummary,

  // Reports getters
  getFinancialReports: state => state.financialReports,

  // ===== CLINICAL BILL SEARCH GETTERS =====

  // Get clinical bill by bill number
  getClinicalBillByNumber: state => state.clinicalBillByNumber,

  // Get patient clinical bills
  getPatientClinicalBills: state => state.patientClinicalBills,

  // ===== DEPOSIT USAGE HISTORY GETTERS =====

  // Get deposit usage history for a specific deposit
  getDepositUsageHistory: state => state.depositUsageHistory,

  // ===== BILLING POINTS GETTERS =====

  // Get billing points
  getBillingPoints: state => {
    return state.billingPoints || [];
  },

  // ===== PHASE 6: REPORTING & ANALYTICS GETTERS =====

  // Financial Reporting Getters
  getComprehensiveFinancialReport: state => state.comprehensiveFinancialReport,
  getProfitLossStatement: state => state.profitLossStatement,
  getBalanceSheet: state => state.balanceSheet,
  getCashFlowStatement: state => state.cashFlowStatement,

  // Operational Reporting Getters
  getOperationalPerformanceReport: state => state.operationalPerformanceReport,
  getPaymentMethodUtilization: state => state.paymentMethodUtilization,
  getReconciliationStatus: state => state.reconciliationStatus,
  getSettlementTracking: state => state.settlementTracking,

  // Business Intelligence Getters
  getComprehensiveBIReport: state => state.comprehensiveBIReport,
  getPaymentTrendAnalysis: state => state.paymentTrendAnalysis,
  getPredictiveAnalytics: state => state.predictiveAnalytics,
  getKPIMonitoring: state => state.kpiMonitoring,
  getRealTimeMonitoring: state => state.realTimeMonitoring,

  // ===== END PHASE 6 GETTERS =====
};
