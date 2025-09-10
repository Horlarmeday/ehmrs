import state from './moduleGeneralStoreState.js';
import mutations from './moduleGeneralStoreMutations.js';
import actions from './moduleGeneralStoreActions.js';
import getters from './moduleGeneralStoreGetters.js';
import optimizedActions from './optimizedActions.js';
import { cacheMutations } from './cacheHelpers.js';

// Merge original mutations with cache mutations
const enhancedMutations = {
  ...mutations,
  ...cacheMutations
};

// Merge original actions with optimized actions
const enhancedActions = {
  ...actions,
  ...optimizedActions
};

export default {
  namespaced: true,
  state,
  mutations: enhancedMutations,
  actions: enhancedActions,
  getters,
};