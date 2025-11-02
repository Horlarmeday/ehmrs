import Vue from 'vue';

export default {
  /**
   * SET STATISTICS
   */
  SET_MEDICAL_RECORDS_STATS(state, { reportType, stats }) {
    Vue.set(state.stats, reportType, stats);
  },

  /**
   * SET DETAILS
   */
  SET_MEDICAL_RECORDS_DETAILS(state, { reportType, details }) {
    Vue.set(state.details, reportType, details);
  },

  /**
   * SET CURRENT REPORT TYPE
   */
  SET_CURRENT_REPORT_TYPE(state, reportType) {
    state.currentReportType = reportType;
  },

  /**
   * SET SAVED REPORTS
   */
  SET_SAVED_REPORTS(state, savedReports) {
    state.savedReports = savedReports;
  },

  /**
   * ADD SAVED REPORT
   */
  ADD_SAVED_REPORT(state, report) {
    state.savedReports.rows.unshift(report);
    state.savedReports.count += 1;
  },

  /**
   * SET CURRENT SAVED REPORT
   */
  SET_SAVED_REPORT(state, report) {
    state.currentSavedReport = report;
  },

  /**
   * REMOVE SAVED REPORT
   */
  REMOVE_SAVED_REPORT(state, reportId) {
    state.savedReports.rows = state.savedReports.rows.filter((report) => report.id !== reportId);
    state.savedReports.count -= 1;
  },

  /**
   * SET LOADING STATES
   */
  SET_LOADING_STATS(state, loading) {
    state.loadingStats = loading;
  },

  SET_LOADING_DETAILS(state, loading) {
    state.loadingDetails = loading;
  },

  SET_LOADING_SAVED_REPORTS(state, loading) {
    state.loadingSavedReports = loading;
  },

  SET_EXPORTING(state, exporting) {
    state.exporting = exporting;
  },

  SET_SAVING(state, saving) {
    state.saving = saving;
  },
};
