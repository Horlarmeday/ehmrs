export default {
  ADD_OBSERVATION(state, observation) {
    state.observations.unshift(observation);
  },

  ADD_DIAGNOSIS(state, diagnosis) {
    state.observations = [...diagnosis];
  },

  CHANGE_TEST_TYPE(state, type) {
    state.testType = type;
  },

  CHANGE_SAMPLE_ID(state, id) {
    state.sampleId = id;
  },

  /**
   * CONSULTATION HISTORY
   */
  SET_VISITS_HISTORY(state, history) {
    state.histories = history;
  },

  SET_VISITS_HISTORY_TOTAL(state, total) {
    state.totalHistories = total;
  },

  SET_VISITS_HISTORY_PAGES(state, pages) {
    state.totalHistoryPages = pages;
  },
};
