export default {
  payment: null,
  payments: [],
  total: null,
  pages: 0,

  accounts: [],
  accountsTotal: 0,
  accountsPages: 0,
  journalEntries: [],
  journalEntriesTotal: 0,
  journalEntriesPages: 0,
  financialStatements: null,
  costCenters: [],
  costCentersTotal: 0,
  costCentersPages: 0,
  departments: [],
  trialBalance: [],
  trendAnalysis: null,
  savedReports: [],
  loading: false,
  totalItems: 0,
  totalPages: 0,
  error: null,

  // ===== NEW ACCOUNTING MODULE STATE =====

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

  // Bills data
  bills: [],
  billsTotal: 0,
  billsPages: 0,

  // Payments data
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
};
