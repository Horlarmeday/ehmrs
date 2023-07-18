export default {
  /**
   * INVENTORY
   */
  ADD_INVENTORY(state, inventory) {
    state.inventories.unshift(inventory);
  },

  SET_INVENTORIES(state, inventories) {
    state.inventories = inventories;
  },

  UPDATE_INVENTORY(state, inventory) {
    const inventoryIndex = state.inventories.findIndex(p => p.id === inventory.id);
    Object.assign(state.inventories[inventoryIndex], inventory);
  },

  /**
   * INVENTORY ITEMS
   */
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
  },

  SET_ITEM(state, item) {
    state.item = item;
  },

  /**
   * INVENTORY ITEM HISTORY
   */
  SET_ITEM_HISTORY(state, items) {
    state.itemHistories = items;
  },

  SET_ITEM_HISTORY_TOTAL(state, total) {
    state.totalItemHistory = total;
  },

  SET_ITEM_HISTORY_PAGES(state, pages) {
    state.itemHistoryPages = pages;
  },
};
