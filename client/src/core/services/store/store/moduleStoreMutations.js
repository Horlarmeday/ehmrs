export default {
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
