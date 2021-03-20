export default {
  ADD_INSURANCE(state, insurance) {
    state.insurances.unshift(insurance);
  },

  SET_INSURANCES(state, insurances) {
    state.insurances = insurances;
  },

  SET_INSURANCES_TOTAL(state, total) {
    state.total = total;
  },

  SET_NUMB_PAGES(state, pages) {
    state.pages = pages;
  },

  SET_INSURANCE(state, insurance) {
    state.insurance = insurance;
  },

  UPDATE_INSURANCE(state, insurance) {
    const insuranceIndex = state.insurances.findIndex(
      p => p.id === insurance.id
    );
    Object.assign(state.insurances[insuranceIndex], insurance);
  },

  /**
   * HMO
   */

  ADD_HMO(state, hmo) {
    state.hmos.unshift(hmo);
  },

  SET_HMOS(state, hmos) {
    state.hmos = hmos;
  },

  SET_HMOS_TOTAL(state, total) {
    state.totalHmo = total;
  },

  SET_HMO_NUMB_PAGES(state, pages) {
    state.hmopages = pages;
  },

  SET_HMO(state, hmo) {
    state.hmo = hmo;
  },

  UPDATE_HMO(state, hmo) {
    const hmoIndex = state.hmos.findIndex(d => d.id === hmo.id);
    Object.assign(state.hmos[hmoIndex], hmo);
  }
};
