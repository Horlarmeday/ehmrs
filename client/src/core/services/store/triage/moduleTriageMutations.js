export default {
  ADD_TRIAGE(state, triage) {
    state.triages.unshift(triage);
  },

  SET_TRIAGE(state, triage) {
    state.triage = triage;
  },

  SET_TRIAGES(state, triages) {
    state.triages = triages;
  },

  SET_TRIAGES_TOTAL(state, total) {
    state.total = total;
  },

  SET_TRIAGES_PAGES(state, pages) {
    state.pages = pages;
  },
};
