export default {
  // Loading and error states
  loading: false,
  error: null,

  // ===== PHASE 1: CORE FINANCIAL FOUNDATION STATE =====

  // Bank Account data
  bankAccounts: [],
  bankAccountsTotal: 0,
  bankAccountsPages: 0,
  bankAccount: null,

  // POS Terminal data
  posTerminals: [],
  posTerminalsTotal: 0,
  posTerminalsPages: 0,
  posTerminal: null,

  // Chart of Accounts data
  chartOfAccounts: [],
  chartOfAccountsTotal: 0,
  chartOfAccountsPages: 0,
  chartOfAccountsSummary: {
    totalAccounts: 0,
    activeAccounts: 0,
    inactiveAccounts: 0,
    totalBalance: 0,
  },

  // Account Validation and Conflict Resolution data
  accountValidationResult: null,
  accountConflictSuggestions: null,
  validationStatistics: null,
  quickValidationResult: null,

  // Journal Entries data
  journalEntries: [],
  journalEntriesTotal: 0,
  journalEntriesPages: 0,
  journalEntriesSummary: {
    totalEntries: 0,
    pendingEntries: 0,
    approvedEntries: 0,
    totalAmount: 0,
  },

  // Trial Balance data
  trialBalance: [],
  trialBalanceSummary: {
    totalDebits: 0,
    totalCredits: 0,
    totalOpeningBalance: 0,
    totalClosingBalance: 0,
    balancedAccounts: 0,
    difference: 0,
    periodInfo: null,
  },
  trialBalanceChartData: null,
  trialBalanceVarianceAnalysis: null,
  balanceSheetPreview: null,

  // Cost Centers data
  costCenters: [],
  costCentersTotal: 0,
  costCentersPages: 0,
  costCentersSummary: {
    totalCostCenters: 0,
    totalBudget: 0,
    totalExpenses: 0,
    budgetUtilization: 0,
  },

  // Financial Periods data
  financialPeriods: [],
  financialPeriodsTotal: 0,
  financialPeriodsPages: 0,
  financialPeriodsSummary: {
    totalPeriods: 0,
    openPeriods: 0,
    closedPeriods: 0,
    currentPeriod: null,
  },

  // HMO Claims data
  hmoClaims: [],
  hmoClaimsTotal: 0,
  hmoClaimsPages: 0,
  hmoClaimsSummary: {
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    totalAmount: 0,
  },

  // ===== EXISTING ACCOUNTING MODULES STATE =====

  // Dashboard data
  dashboardData: {
    totalBills: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalDeposits: 0,
    billsChange: 0,
    revenueChange: 0,
    pendingCount: 0,
    activeDeposits: 0,
  },

  // Accounting Summary data
  accountingSummary: {
    totalBills: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalDeposits: 0,
    billsChange: 0,
    revenueChange: 0,
    pendingCount: 0,
    activeDeposits: 0,
  },

  // Clinical Bills data
  clinicalBills: [],
  clinicalBillsTotal: 0,
  clinicalBillsPages: 0,

  // Clinical Payments data
  clinicalPayments: [],
  clinicalPaymentsTotal: 0,
  clinicalPaymentsPages: 0,

  // Bills data
  bills: [],
  billsTotal: 0,
  billsPages: 0,

  // Payments data
  payments: [],
  paymentsTotal: 0,
  paymentsPages: 0,

  // Deposits data
  deposits: [],
  depositsTotal: 0,
  depositsPages: 0,
  depositsSummary: {
    totalDeposits: 0,
    activeDeposits: 0,
    usedDeposits: 0,
    expiredDeposits: 0,
    totalCount: 0,
    activeCount: 0,
    usedCount: 0,
    expiredCount: 0,
  },
  depositConsolidationResults: [],
  depositConsolidationSummary: null,
  depositConsolidationReport: null,
  depositConsolidationLoading: false,

  // Deposit Transactions data
  depositTransactions: [],
  depositTransactionsTotal: 0,
  depositTransactionsPages: 0,
  depositTransactionsSummary: {
    totalTransactions: 0,
    totalAmount: 0,
    createdCount: 0,
    createdAmount: 0,
    topUpCount: 0,
    topUpAmount: 0,
    todayCount: 0,
    todayAmount: 0,
  },

  // Financial reports data
  financialReports: {
    totalRevenue: 0,
    totalPayments: 0,
    pendingAmount: 0,
    collectionRate: 0,
    revenueChange: 0,
    paymentCount: 0,
    pendingBills: 0,
    topRevenueItems: [],
    paymentPerformance: [],
    revenueBreakdown: [],
    revenueTrend: [],
    paymentMethods: [],
    departmentRevenue: [],
    paymentStatus: [],
  },

  // ===== CLINICAL BILL SEARCH STATE =====

  // Clinical bill by number
  clinicalBillByNumber: null,

  // Patient clinical bills
  patientClinicalBills: [],

  // ===== DEPOSIT USAGE HISTORY STATE =====

  // Deposit usage history
  depositUsageHistory: null,

  // ===== BILLING POINTS STATE =====

  // Billing points
  billingPoints: [],

  // ===== PHASE 6: REPORTING & ANALYTICS STATE =====

  // Financial Reporting State
  comprehensiveFinancialReport: null,
  profitLossStatement: null,
  balanceSheet: null,
  cashFlowStatement: null,

  // Operational Reporting State
  operationalPerformanceReport: null,
  paymentMethodUtilization: null,
  reconciliationStatus: null,
  settlementTracking: null,

  // Business Intelligence State
  comprehensiveBIReport: null,
  paymentTrendAnalysis: null,
  predictiveAnalytics: null,
  kpiMonitoring: null,
  realTimeMonitoring: null,

  // ===== END PHASE 6 STATE =====

  // ===== PATIENT INSURANCE STATE =====

  // Patient default insurance
  patientDefaultInsurance: null,

  // ===== PATIENT FINANCIAL LOOKUP STATE =====

  // Patient financial lookup state for persistence
  patientFinancialLookup: {
    selectedPatient: null,
    financialSummary: null,
    searchQuery: '',
  },
};
