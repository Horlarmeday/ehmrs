export default {
  SET_REPORTS(state, reports) {
    state.reports = reports;
  },

  SET_LOADING(state, loading) {
    state.loading = loading;
  },

  SET_ERROR(state, error) {
    state.error = error;
  },

  SET_CURRENT_REPORT(state, report) {
    state.currentReport = report;
  },

  ADD_REPORT(state, report) {
    state.reports.unshift(report);
  },

  UPDATE_REPORT(state, updatedReport) {
    const index = state.reports.findIndex((report) => report.id === updatedReport.id);
    if (index !== -1) {
      state.reports.splice(index, 1, updatedReport);
    }
  },

  REMOVE_REPORT(state, reportId) {
    state.reports = state.reports.filter((report) => report.id !== reportId);
  },

  SET_DOCTOR_REPORTS(state, reports) {
    state.doctorReports = reports;
  },

  SET_DOCTOR_REPORTS_TOTAL(state, total) {
    state.doctorReportTotal = total;
  },

  SET_DOCTOR_REPORTS_PAGES(state, pages) {
    state.doctorReportPages = pages;
  },
};
