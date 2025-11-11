import state from './moduleAccountingState';
import mutations from './moduleAccountingMutations';
import actions from './moduleAccountingActions';
import getters from './moduleAccountingGetters';
import quickbooks from './quickbooks';

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
  modules: {
    quickbooks,
  },
};
