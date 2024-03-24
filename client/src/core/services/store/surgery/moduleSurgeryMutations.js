export default {
  REQUEST_SURGERY(state, surgery) {
    state.surgery = surgery;
  },

  SET_SURGERIES(state, surgeries) {
    state.surgeries = surgeries;
  },

  SET_SURGERIES_TOTAL(state, total) {
    state.total = total;
  },

  SET_SURGERIES_NUMB_PAGES(state, pages) {
    state.pages = pages;
  },

  SET_SURGERY(state, surgery) {
    state.surgery = surgery;
  },

  // Operation Note
  CREATE_OPERATION_NOTE(state, note) {
    state.operationNote = note;
  },

  SET_OPERATION_NOTES(state, notes) {
    state.operationNotes = notes;
  },
};
