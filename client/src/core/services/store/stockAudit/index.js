import state from './moduleStockAuditState';
import * as getters from './moduleStockAuditGetters';
import * as mutations from './moduleStockAuditMutations';
import * as actions from './moduleStockAuditActions';

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
