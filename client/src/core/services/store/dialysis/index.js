import state from './moduleDialysisState';
import * as getters from './moduleDialysisGetters';
import * as mutations from './moduleDialysisMutations';
import * as actions from './moduleDialysisActions';

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
