export default {
  /***
   * IMAGING
   */
  ADD_IMAGING(state, imaging) {
    state.imagings.unshift(imaging);
  },

  SET_IMAGINGS(state, imagings) {
    state.imagings = imagings;
  },

  SET_IMAGINGS_TOTAL(state, total) {
    state.total = total;
  },

  SET_NUMB_PAGES(state, pages) {
    state.pages = pages;
  },

  SET_IMAGING(state, imaging) {
    state.imaging = imaging;
  },

  UPDATE_IMAGING(state, imaging) {
    const imagingIndex = state.imagings.findIndex(p => p.id === imaging.id);
    Object.assign(state.imagings[imagingIndex], imaging);
  },

  /***
   * INVESTIGATIONS
   */
  ADD_INVESTIGATION(state, investigation) {
    state.investigations.unshift(investigation);
  },

  SET_INVESTIGATIONS(state, investigations) {
    state.investigations = investigations;
  },

  SET_INVESTIGATIONS_TOTAL(state, total) {
    state.totalInvestigation = total;
  },

  SET_INVESTIGATION_NUMB_PAGES(state, pages) {
    state.investigationPages = pages;
  },

  SET_INVESTIGATION(state, investigation) {
    state.investigation = investigation;
  },

  UPDATE_INVESTIGATION(state, investigation) {
    const investigationIndex = state.investigations.findIndex(p => p.id === investigation.id);
    Object.assign(state.investigations[investigationIndex], investigation);
  },

  /***
   * REQUESTED INVESTIGATIONS
   */
  SET_REQUESTED_INVESTIGATION(state, investigation) {
    state.reqInvestigation = investigation;
  },

  SET_REQUESTED_INVESTIGATIONS(state, investigations) {
    state.reqInvestigations = investigations;
  },

  SET_REQUESTED_INVESTIGATIONS_TOTAL(state, total) {
    state.totalReqInvestigation = total;
  },

  SET_REQUESTED_INVESTIGATIONS_PAGES(state, pages) {
    state.totalReqInvestigationPages = pages;
  },

  /***
   * INVESTIGATIONS RESULT
   */
  UPLOAD_RESULT_IMAGES(state, images) {
    state.resultImages = images;
  },

  SET_INVESTIGATION_RESULT(state, result) {
    state.result = result;
  },

  SET_INVESTIGATIONS_RESULTS(state, results) {
    state.results = results;
  },

  SET_INVESTIGATIONS_RESULTS_TOTAL(state, total) {
    state.totalInvestigationResults = total;
  },

  SET_INVESTIGATIONS_RESULTS_PAGES(state, pages) {
    state.totalInvestigationResultsPages = pages;
  },

  /***
   * INVESTIGATIONS APPROVAL
   */
  SET_INVESTIGATIONS_APPROVAL(state, investigations) {
    state.investigationsApprovals = investigations;
  },

  SET_INVESTIGATIONS_APPROVAL_TOTAL(state, total) {
    state.totalInvestigationsApproval = total;
  },

  SET_INVESTIGATIONS_APPROVAL_PAGES(state, pages) {
    state.totalInvestigationsApprovalPages = pages;
  },

  /**
   * INVESTIGATION PRESCRIPTION
   */
  SET_INVESTIGATION_PRESCRIPTION(state, investigation) {
    state.investigationPrescription = investigation;
  },
};
