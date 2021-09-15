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
  }
};
