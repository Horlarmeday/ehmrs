export default {
  ENROL_IMMUNIZATION_PATIENT(state, immunization) {
    state.immunization = immunization;
  },

  SET_ONE_IMMUNIZATION_ACCOUNT(state, immunization) {
    state.immunization = immunization;
  },

  SET_IMMUNIZATION_ACCOUNTS(state, immunizations) {
    state.immunizations = immunizations;
  },

  SET_IMMUNIZATION_ACCOUNTS_TOTAL(state, total) {
    state.total = total;
  },

  SET_IMMUNIZATION_NUMB_PAGES(state, pages) {
    state.pages = pages;
  },
};
