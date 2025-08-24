import state from './moduleEmergencyState';
import * as getters from './moduleEmergencyGetters';
import * as mutations from './moduleEmergencyMutations';
import * as actions from './moduleEmergencyActions';

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
