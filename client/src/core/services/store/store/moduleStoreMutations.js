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
  },

  /**
   * PHARMACY ITEMS
   */
  ADD_PHARM_ITEM(state, item) {
    state.items.unshift(item);
  },

  SET_PHARM_ITEMS(state, items) {
    state.items = items;
  },

  SET_PHARM_ITEMS_TOTAL(state, total) {
    state.totalItems = total;
  },

  SET_PHARM_ITEM_NUMB_PAGES(state, pages) {
    state.itemPages = pages;
  },

  SET_PHARM_ITEM(state, item) {
    state.item = item;
  },

  UPDATE_PHARM_ITEM(state, item) {
    const itemIndex = state.items.findIndex(p => p.id === item.id);
    Object.assign(state.items[itemIndex], item);
  }
};
