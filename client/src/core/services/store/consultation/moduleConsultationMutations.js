export default {
  ADD_OBSERVATION(state, observation) {
    state.observations.unshift(observation);
  },

  ADD_DIAGNOSIS(state, diagnosis) {
    state.observations = [...diagnosis];
  }
};
