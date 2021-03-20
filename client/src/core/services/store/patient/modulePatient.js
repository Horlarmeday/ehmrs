import state from "./modulePatientState.js";
import mutations from "./modulePatientMutations.js";
import actions from "./modulePatientActions.js";
import getters from "./modulePatientGetters.js";

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
