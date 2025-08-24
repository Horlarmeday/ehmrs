import state from './moduleHmoPricingState';
import * as getters from './moduleHmoPricingGetters';
import * as mutations from './moduleHmoPricingMutations';
import * as actions from './moduleHmoPricingActions';

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
