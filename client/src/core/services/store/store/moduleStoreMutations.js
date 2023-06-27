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
  },

  ADD_SELECTED_ITEM(state, item) {
    state.selectedItems.push(item);
  },

  ADD_ALL_SELECTED_ITEMS(state, items) {
    state.selectedItems.push(...items);
  },

  REMOVE_SELECTED_ITEM(state, item) {
    const itemIndex = state.selectedItems.findIndex(({ id }) => id === item.id);
    state.selectedItems.splice(itemIndex, 1);
  },

  REMOVE_ALL_SELECTED_ITEMS(state, items) {
    state.selectedItems = items;
  },

  /**
   * LABORATORY ITEMS
   */
  ADD_LAB_ITEM(state, item) {
    state.labItems.unshift(item);
  },

  SET_LAB_ITEMS(state, items) {
    state.labItems = items;
  },

  SET_LAB_ITEMS_TOTAL(state, total) {
    state.totalLabItems = total;
  },

  SET_LAB_ITEM_NUMB_PAGES(state, pages) {
    state.labItemPages = pages;
  },

  SET_LAB_ITEM(state, item) {
    state.labItem = item;
  },

  UPDATE_LAB_ITEM(state, item) {
    const itemIndex = state.labItems.findIndex(p => p.id === item.id);
    Object.assign(state.labItems[itemIndex], item);
  },
};
