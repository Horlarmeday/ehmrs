export default {
  /**
   * Statistics by report type
   */
  stats: {},

  /**
   * Details by report type
   */
  details: {},

  /**
   * Current report type being viewed
   */
  currentReportType: null,

  /**
   * Saved reports
   */
  savedReports: {
    rows: [],
    count: 0,
    pages: 0,
    currentPage: 1,
    pageLimit: 10,
  },

  /**
   * Current saved report being viewed
   */
  currentSavedReport: null,

  /**
   * Loading states
   */
  loadingStats: false,
  loadingDetails: false,
  loadingSavedReports: false,
  exporting: false,
  saving: false,
};
