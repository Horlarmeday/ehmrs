import state from './moduleProcurementState';
import * as getters from './moduleProcurementGetters';
import * as mutations from './moduleProcurementMutations';
import * as actions from './moduleProcurementActions';

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
