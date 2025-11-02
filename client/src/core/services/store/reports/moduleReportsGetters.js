export default {
  /**
   * Get statistics for a report type
   */
  getStatsByReportType: (state) => (reportType) => {
    return state.stats[reportType] || null;
  },

  /**
   * Get details for a report type
   */
  getDetailsByReportType: (state) => (reportType) => {
    return state.details[reportType] || null;
  },

  /**
   * Get current report type
   */
  currentReportType: (state) => {
    return state.currentReportType;
  },

  /**
   * Get saved reports
   */
  savedReports: (state) => {
    return state.savedReports;
  },

  /**
   * Get current saved report
   */
  currentSavedReport: (state) => {
    return state.currentSavedReport;
  },

  /**
   * Check if statistics are loading
   */
  isLoadingStats: (state) => {
    return state.loadingStats;
  },

  /**
   * Check if details are loading
   */
  isLoadingDetails: (state) => {
    return state.loadingDetails;
  },

  /**
   * Check if saved reports are loading
   */
  isLoadingSavedReports: (state) => {
    return state.loadingSavedReports;
  },

  /**
   * Check if exporting
   */
  isExporting: (state) => {
    return state.exporting;
  },

  /**
   * Check if saving
   */
  isSaving: (state) => {
    return state.saving;
  },
};
