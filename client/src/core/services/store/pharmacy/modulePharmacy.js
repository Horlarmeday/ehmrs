import state from "./modulePharmacyState.js";
import mutations from "./modulePharmacyMutations.js";
import actions from "./modulePharmacyActions.js";
import getters from "./modulePharmacyGetters.js";

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
