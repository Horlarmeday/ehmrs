export default {
  ADD_OBSERVATION(state, observation) {
    state.observations.unshift(observation);
  }
};
