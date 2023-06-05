export default {
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

  // Investigations
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
};
