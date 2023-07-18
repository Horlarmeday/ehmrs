import axios from '../../../../axios';

export default {
  /**************
   LAB ORDERS
   *************/
  orderLabTest({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/orders/lab/create/${payload.id}`, { tests: payload.tests })
        .then(response => {
          commit('ORDER_LAB_TEST', payload.tests);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  addSelectedTest({ commit }, test) {
    commit('ADD_SELECTED_TEST', test);
  },
  removeSelectedTest({ commit }, test) {
    commit('REMOVE_SELECTED_TEST', test);
  },
  emptySelectedTest({ commit }) {
    commit('EMPTY_SELECTED_TEST', []);
  },
  addSelectedButton({ commit }, button) {
    commit('ADD_SELECTED_BUTTON', button);
  },
  removeSelectedButton({ commit }, buttonId) {
    commit('REMOVE_SELECTED_BUTTON', buttonId);
  },
  emptySelectedButtons({ commit }) {
    commit('EMPTY_SELECTED_BUTTONS');
  },
  toggleTestUrgent({ commit }, testId) {
    commit('TOGGLE_TEST_URGENT', testId);
  },

  /**************
   RADIOLOGY ORDERS
   *************/
  orderInvestigationTest({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/orders/radiology/create/${payload.id}`, { investigations: payload.investigations })
        .then(response => {
          commit('ORDER_INVESTIGATION_TEST', payload.investigations);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**************
   DRUG ORDERS
   *************/
  orderDrug({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/orders/pharmacy/create/${payload.id}`, payload.drug)
        .then(response => {
          commit('ORDER_DRUG', payload.drug);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  addSelectedInvestigation({ commit }, investigation) {
    commit('ADD_SELECTED_INVESTIGATION', investigation);
  },
  removeSelectedInvestigation({ commit }, investigation) {
    commit('REMOVE_SELECTED_INVESTIGATION', investigation);
  },
  emptySelectedInvestigations({ commit }) {
    commit('EMPTY_SELECTED_INVESTIGATION', []);
  },
  addSelectedInvestigationButton({ commit }, button) {
    commit('ADD_SELECTED_INVESTIGATION_BUTTON', button);
  },
  removeSelectedInvestigationButton({ commit }, buttonId) {
    commit('REMOVE_SELECTED_INVESTIGATION_BUTTON', buttonId);
  },
  emptySelectedInvestigationButtons({ commit }) {
    commit('EMPTY_SELECTED_INVESTIGATION_BUTTONS');
  },
  toggleInvestigationUrgency({ commit }, investigationId) {
    commit('TOGGLE_INVESTIGATION_URGENCY', investigationId);
  },
};
