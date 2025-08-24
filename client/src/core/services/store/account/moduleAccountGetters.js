export default {
  accounts: state => state.accounts,
  journalEntries: state => state.journalEntries,
  financialStatements: state => state.financialStatements,
  costCenters: state => state.costCenters,
  departments: state => state.departments,
  trialBalance: state => state.trialBalance,
  trendAnalysis: state => state.trendAnalysis,
  savedReports: state => state.savedReports,
  loading: state => state.loading,
  totalItems: state => state.totalItems,
  totalPages: state => state.totalPages,
  error: state => state.error,

  // ===== NEW ACCOUNTING MODULE GETTERS =====

  // Dashboard getters
  getDashboardData: state => state.dashboardData,

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
};
