import state from './moduleGeneralStoreState.js';
import mutations from './moduleGeneralStoreMutations.js';
import actions from './moduleGeneralStoreActions.js';
import getters from './moduleGeneralStoreGetters.js';

// General Store module
export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
