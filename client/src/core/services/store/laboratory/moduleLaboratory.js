import state from "./moduleLaboratoryState.js";
import mutations from "./moduleLaboratoryMutations.js";
import actions from "./moduleLaboratoryActions.js";
import getters from "./moduleLaboratoryGetters.js";

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
