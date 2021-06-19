import state from "./moduleModelState.js";
import mutations from "./moduleModelMutations.js";
import actions from "./moduleModelActions.js";
import getters from "./moduleModelGetters.js";

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
