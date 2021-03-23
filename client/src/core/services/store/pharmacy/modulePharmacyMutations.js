export default {
  ADD_GENERIC_DRUG(state, drug) {
    state.drugs.unshift(drug);
  },

  SET_GENERIC_DRUGS(state, drugs) {
    state.drugs = drugs;
  },

  SET_GENERIC_DRUGS_TOTAL(state, total) {
    state.total = total;
  },

  SET_NUMB_PAGES(state, pages) {
    state.pages = pages;
  },

  SET_GENERIC_DRUG(state, drug) {
    state.drug = drug;
  },

  UPDATE_GENERIC_DRUG(state, drug) {
    const drugIndex = state.drugs.findIndex(p => p.id === drug.id);
    Object.assign(state.drugs[drugIndex], drug);
  }
};
