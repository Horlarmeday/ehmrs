import axios from '../../../../axios';
import { getExtensions } from '@/common/common';

export default {
  /**
   * PHARMACY ITEMS
   */
  addPharmacyItem({ commit }, item) {
    return new Promise((resolve, reject) => {
      axios
        .post('/store/pharmacy/items/create', item)
        .then(response => {
          commit(
            'ADD_PHARM_ITEM',
            Object.assign(item, {
              id: response.data.data.id,
              createdAt: response.data.data.createdAt,
            })
          );
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchPharmacyItems({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/store/pharmacy/items/get', {
          params: {
            currentPage: payload?.currentPage,
            pageLimit: payload?.itemsPerPage,
            sort: payload?.sort,
            search: payload?.search,
            filter: payload?.filter,
          },
        })
        .then(response => {
          commit('SET_PHARM_ITEMS', response.data.data.docs);
          commit('SET_PHARM_ITEMS_TOTAL', response.data.data.total);
          commit('SET_PHARM_ITEM_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  dispensePharmacyItems({ commit }, items) {
    return new Promise((resolve, reject) => {
      axios
        .post('/store/pharmacy/items/dispense', { items })
        .then(response => {
          commit('REMOVE_ALL_SELECTED_ITEMS', []);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchPharmacyItem({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/store/pharmacy/items/${payload.id}`)
        .then(response => {
          commit('SET_PHARM_ITEM', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  reorderPharmacyItems({ commit }, items) {
    return new Promise((resolve, reject) => {
      axios
        .post('/store/pharmacy/items/reorder', { items })
        .then(response => {
          commit('REMOVE_ALL_SELECTED_ITEMS', []);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  exportData({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post('/store/pharmacy/items/export', payload, {
          responseType: 'arraybuffer', // Important to receive binary data
        })
        .then(response => {
          const contentType = response.headers['content-type'].split(';')[0];
          const blob = new Blob([response.data], {
            type: contentType,
          });
          const url = window.URL.createObjectURL(blob);
          // Create an anchor element with download attribute and trigger click event
          const a = document.createElement('a');
          const extension = getExtensions();
          a.href = url;
          a.download = `exported_data.${extension[contentType]}`;
          a.click();

          // Clean up resources
          window.URL.revokeObjectURL(url);
          commit('REMOVE_ALL_SELECTED_ITEMS', []);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchSelectedPharmacyItems({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/store/pharmacy/selected-items', {
          params: {
            itemIds: payload.itemIds,
          },
        })
        .then(response => {
          commit('SET_PHARM_ITEMS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updatePharmacyItems({ commit }, items) {
    return new Promise((resolve, reject) => {
      axios
        .put('/store/pharmacy/items/update', items)
        .then(response => {
          commit('UPDATE_PHARM_ITEMS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  deactivatePharmacyItems({ commit }, items) {
    return new Promise((resolve, reject) => {
      axios
        .put('/store/pharmacy/items/deactivate', { items })
        .then(response => {
          commit('UPDATE_PHARM_ITEMS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /***
   * PHARMACY ITEM HISTORY
   */
  fetchPharmacyItemHistory({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/store/pharmacy/items/history/${payload.id}`, {
          params: {
            currentPage: payload?.currentPage,
            pageLimit: payload?.itemsPerPage,
            filter: payload?.filter,
          },
        })
        .then(response => {
          commit('SET_PHARM_ITEM_HISTORY', response.data.data.docs);
          commit('SET_PHARM_ITEM_HISTORY_TOTAL', response.data.data.total);
          commit('SET_PHARM_ITEM_HISTORY_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /***
   * PHARMACY ITEM LOGS
   */
  fetchPharmacyItemLog({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/store/pharmacy/items/logs/${payload.id}`, {
          params: {
            currentPage: payload?.currentPage,
            pageLimit: payload?.itemsPerPage,
          },
        })
        .then(response => {
          commit('SET_PHARM_ITEM_LOGS', response.data.data.docs);
          commit('SET_PHARM_ITEM_LOGS_TOTAL', response.data.data.total);
          commit('SET_PHARM_ITEM_LOGS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
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
   * LABORATORY ITEMS
   */
  addLaboratoryItem({ commit }, item) {
    return new Promise((resolve, reject) => {
      axios
        .post('/store/laboratory/items/create', item)
        .then(response => {
          commit('ADD_LAB_ITEM', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchLaboratoryItems({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/store/laboratory/items/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then(response => {
          commit('SET_LAB_ITEMS', response.data.data.docs);
          commit('SET_LAB_ITEMS_TOTAL', response.data.data.total);
          commit('SET_LAB_ITEM_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
