export default {
  ADD_ALERT(state, alert) {
    state.alert = alert;
  },

  SET_ALERTS(state, alerts) {
    state.alerts = alerts;
  },

  SET_ALERTS_TOTAL(state, total) {
    state.total = total;
  },

  SET_ALERTS_PAGES(state, pages) {
    state.pages = pages;
  },
};
