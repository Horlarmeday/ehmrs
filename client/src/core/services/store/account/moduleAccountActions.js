import axios from '@/axios';

export default {
  addPayment({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/account/payment/create`, payload)
        .then(response => {
          commit('ADD_PAYMENT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchPatientPayments({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/account/payment-history/${payload.id}`, {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
          },
        })
        .then(response => {
          commit('SET_ACCOUNTS', response.data.data.docs);
          commit('SET_ACCOUNTS_TOTAL', response.data.data.total);
          commit('SET_ACCOUNTS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
