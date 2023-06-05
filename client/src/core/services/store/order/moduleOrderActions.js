import axios from '../../../../axios';

export default {
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
};
