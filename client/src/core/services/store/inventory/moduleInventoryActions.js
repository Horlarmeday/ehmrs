import axios from '../../../../axios';
// Cache helpers removed - using standard actions

// Create original actions for caching
const originalFetchInventories = ({ commit }) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/inventory/get`)
      .then((response) => {
        commit('SET_INVENTORIES', response.data.data);
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const originalFetchInventoryItems = ({ commit }, payload) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/inventory/get/${payload.inventory}/items`, {
        params: {
          currentPage: payload.currentPage,
          pageLimit: payload.itemsPerPage,
          search: payload.search,
          filter: payload?.filter,
        },
      })
      .then((response) => {
        commit('SET_ITEMS', response.data.data.docs);
        commit('SET_ITEMS_TOTAL', response.data.data.total);
        commit('SET_NUMB_PAGES', response.data.data.pages);
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export default {
  addInventory({ commit }, inventory) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/inventory/create`, inventory)
        .then((response) => {
          commit('ADD_INVENTORY', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // Standard version of fetchInventories
  fetchInventories({ commit }) {
    return originalFetchInventories({ commit });
  },

  updateInventory({ commit }, inventory) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/inventory/update`, inventory)
        .then((response) => {
          commit('UPDATE_INVENTORY', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // Standard version of fetchInventoryItems
  fetchInventoryItems({ commit }, payload) {
    return originalFetchInventoryItems({ commit }, payload);
  },

  fetchInventoryItem({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/inventory/get/items/${payload.id}`)
        .then((response) => {
          commit('SET_ITEM', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  fetchInventoryItemHistory({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/inventory/get/${payload.id}/history`, {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            filter: payload.filter,
          },
        })
        .then((response) => {
          commit('SET_ITEM_HISTORY', response.data.data.docs);
          commit('SET_ITEM_HISTORY_TOTAL', response.data.data.total);
          commit('SET_ITEM_HISTORY_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  updateInventoryItem({ commit }, inventory) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/inventory/item/update/`, inventory)
        .then((response) => {
          commit('UPDATE_ITEM', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  createInventoryItemsReturnRequest({ commit }, items) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/inventory/request-return`, items)
        .then((response) => {
          commit('UPDATE_ITEM', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  updateItemsReturnRequest({ commit }, items) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/inventory/request-return/update`, items)
        .then((response) => {
          commit('UPDATE_ITEM', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  fetchReturnRequests({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`inventory/request-return/get`, {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then((response) => {
          commit('SET_RETURN_REQUESTS', response.data.data.docs);
          commit('SET_RETURN_REQUESTS_TOTAL', response.data.data.total);
          commit('SET_RETURN_REQUESTS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /***
   * SELECTED ITEMS
   */
  addSelectedItem({ commit }, item) {
    commit('ADD_SELECTED_ITEM', item);
  },

  addAllAsSelectedItems({ commit }, items) {
    commit('ADD_ALL_SELECTED_ITEMS', items);
  },

  removeSelectedItem({ commit }, item) {
    commit('REMOVE_SELECTED_ITEM', item);
  },

  removeAllSelectedItems({ commit }) {
    commit('REMOVE_ALL_SELECTED_ITEMS', []);
  },

  /**
   * INVENTORY SUMMARY
   */
  fetchInventorySummary({ commit }, inventoryId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_SUMMARY', true);
      axios
        .get(`/inventory/get/${inventoryId}/summary`)
        .then((response) => {
          commit('SET_SUMMARY', response.data.data);
          commit('SET_LOADING_SUMMARY', false);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_LOADING_SUMMARY', false);
          reject(error);
        });
    });
  },

  /**
   * PENDING PRESCRIPTIONS
   */
  fetchPendingPrescriptions({ commit }, { inventoryItemId, currentPage = 1, pageLimit = 10 }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_PENDING_PRESCRIPTIONS', true);
      axios
        .get(`/inventory/get/items/${inventoryItemId}/pending-prescriptions`, {
          params: { currentPage, pageLimit },
        })
        .then((response) => {
          commit('SET_PENDING_PRESCRIPTIONS', response.data.data);
          commit('SET_LOADING_PENDING_PRESCRIPTIONS', false);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_LOADING_PENDING_PRESCRIPTIONS', false);
          reject(error);
        });
    });
  },

  /**
   * TRANSFER ITEM BETWEEN INVENTORIES
   */
  transferItemBetweenInventories({ commit }, transferData) {
    return new Promise((resolve, reject) => {
      commit('SET_TRANSFER_LOADING', true);
      axios
        .post('/inventory/transfer', transferData)
        .then((response) => {
          commit('SET_TRANSFER_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_TRANSFER_LOADING', false);
          reject(error);
        });
    });
  },

  /**
   * BULK TRANSFER ITEMS BETWEEN INVENTORIES
   */
  bulkTransferItemsBetweenInventories({ commit }, transferData) {
    return new Promise((resolve, reject) => {
      commit('SET_TRANSFER_LOADING', true);
      axios
        .post('/inventory/transfer/bulk', transferData)
        .then((response) => {
          commit('SET_TRANSFER_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_TRANSFER_LOADING', false);
          reject(error);
        });
    });
  },
};
