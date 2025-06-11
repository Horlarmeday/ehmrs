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
};
