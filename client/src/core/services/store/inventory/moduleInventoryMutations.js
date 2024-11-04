export default {
  /**
   * INVENTORY
   */
  ADD_INVENTORY(state, inventory) {
    state.inventories.push(inventory);
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

  // eslint-disable-next-line no-unused-vars
  UPDATE_ITEM(state, item) {
    // const itemIndex = state.items.findIndex(p => p.id === item.id);
    // Object.assign(state.items[itemIndex], item);
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

  /***
   * SELECTED ITEMS
   */

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
   * INVENTORY ITEMS RETURNS REQUESTS
   */

  SET_RETURN_REQUESTS(state, items) {
    state.returnRequests = items;
  },

  SET_RETURN_REQUESTS_TOTAL(state, total) {
    state.totalReturnRequests = total;
  },

  SET_RETURN_REQUESTS_PAGES(state, pages) {
    state.returnRequestsPages = pages;
  },
};
