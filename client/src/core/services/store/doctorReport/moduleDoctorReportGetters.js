export default {
  getReportsByVisit: (state) => (visitId) => {
    return state.reports.filter((report) => report.visit_id === visitId);
  },

  isLoading: (state) => {
    return state.loading;
  },

  hasError: (state) => {
    return state.error !== null;
  },

  getError: (state) => {
    return state.error;
  },

  getCurrentReport: (state) => {
    return state.currentReport;
  },
};
