export default {
  ADD_ITEM(state, item) {
    state.items.unshift(item);
  },

  SET_ITEMS(state, items) {
    state.items = items;
  },

  SET_ITEMS_TOTAL(state, total) {
    state.total = total;
  },

  SET_NUMB_PAGES(state, pages) {
    state.pages = pages;
  },

  UPDATE_ITEM(state, item) {
    const itemIndex = state.items.findIndex(p => p.id === item.id);
    Object.assign(state.items[itemIndex], item);
  }
};
