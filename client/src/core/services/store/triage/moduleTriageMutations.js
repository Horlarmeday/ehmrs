export default {
  ADD_TRIAGE(state, triage) {
    state.triages.unshift(triage);
  },

  SET_TRIAGE(state, triage) {
    state.triage = triage;
  },
};
