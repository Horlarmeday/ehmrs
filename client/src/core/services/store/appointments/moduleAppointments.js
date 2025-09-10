import state from './moduleAppointmentsState.js';
import mutations from './moduleAppointmentsMutations.js';
import actions from './moduleAppointmentsActions.js';
import getters from './moduleAppointmentsGetters.js';

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
