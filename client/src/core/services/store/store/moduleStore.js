import state from "./moduleStoreState.js";
import mutations from "./moduleStoreMutations.js";
import actions from "./moduleStoreActions.js";
import getters from "./moduleStoreGetters.js";

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
