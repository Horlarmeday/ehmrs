import state from "./moduleEmployeeState.js";
import mutations from "./moduleEmployeeMutations.js";
import actions from "./moduleEmployeeActions.js";
import getters from "./moduleEmployeeGetters.js";

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
