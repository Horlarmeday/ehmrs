export default {
  ADD_PAYMENT(state, payment) {
    state.payment = payment;
  },

  SET_PAYMENTS(state, payments) {
    state.payments = payments;
  },

  SET_PAYMENTS_TOTAL(state, total) {
    state.total = total;
  },

  SET_PAYMENTS_PAGES(state, pages) {
    state.pages = pages;
  },
};
