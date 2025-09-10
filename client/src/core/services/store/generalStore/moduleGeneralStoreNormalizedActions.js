// Normalized actions for entity-based state management
// Handles API calls and state updates with proper normalization

import axios from '../../../../axios';

// Helper function to normalize entity data
const normalizeEntity = (entity, id = 'id') => {
  if (Array.isArray(entity)) {
    const byId = {};
    const allIds = [];

    entity.forEach(item => {
      const itemId = item[id];
      byId[itemId] = item;
      allIds.push(itemId);
    });

    return { byId, allIds };
  }

  return {
    byId: { [entity[id]]: entity },
    allIds: [entity[id]],
  };
};

// Helper function to create lookup tables
const createLookupTable = (entities, lookupKey) => {
  const lookup = {};

  entities.forEach(entity => {
    const key = entity[lookupKey];
    if (key) {
      if (!lookup[key]) lookup[key] = [];
      lookup[key].push(entity.id);
    }
  });

  return lookup;
};

export default {
  // Categories actions
  fetchCategories({ commit, state }, payload = {}) {
    return new Promise((resolve, reject) => {
      // Check cache first
      if (
        !state.cache.config.enabled ||
        Date.now() - (state.metadata.categories.lastFetch || 0) > state.cache.config.ttl
      ) {
        commit('SET_LOADING_STATE', { entity: 'categories', loading: true });

        axios
          .get('/general-store/categories', { params: payload })
          .then(response => {
            const categories = response.data.data.docs || response.data.data;
            const normalized = normalizeEntity(categories);

            commit('SET_CATEGORIES', {
              byId: normalized.byId,
              allIds: normalized.allIds,
            });

            commit('SET_METADATA', {
              entity: 'categories',
              metadata: {
                total: response.data.data.total || categories.length,
                pages: response.data.data.pages || 1,
                currentPage: response.data.data.page || 1,
                lastFetch: Date.now(),
                isStale: false,
              },
            });

            commit('SET_LOADING_STATE', { entity: 'categories', loading: false });
            resolve(response);
          })
          .catch(error => {
            commit('SET_ERROR', {
              message: 'Failed to fetch categories',
              details: error.response?.data || error.message,
            });
            commit('SET_LOADING_STATE', { entity: 'categories', loading: false });
            reject(error);
          });
      } else {
        // Return cached data
        resolve({ data: { cached: true } });
      }
    });
  },

  createCategory({ commit }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'categories', loading: true });

      axios
        .post('/general-store/categories', payload)
        .then(response => {
          const category = response.data.data;
          commit('ADD_CATEGORY', category);
          commit('SET_LOADING_STATE', { entity: 'categories', loading: false });

          // Invalidate cache
          commit('INVALIDATE_CACHE', 'categories');

          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to create category',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'categories', loading: false });
          reject(error);
        });
    });
  },

  updateCategory({ commit }, { id, ...payload }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'categories', loading: true });

      axios
        .put(`/general-store/categories/${id}`, payload)
        .then(response => {
          const category = response.data.data;
          commit('UPDATE_CATEGORY', category);
          commit('SET_LOADING_STATE', { entity: 'categories', loading: false });

          // Invalidate cache
          commit('INVALIDATE_CACHE', 'categories');

          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to update category',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'categories', loading: false });
          reject(error);
        });
    });
  },

  deleteCategory({ commit }, id) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'categories', loading: true });

      axios
        .delete(`/general-store/categories/${id}`)
        .then(response => {
          commit('REMOVE_CATEGORY', id);
          commit('SET_LOADING_STATE', { entity: 'categories', loading: false });

          // Invalidate cache
          commit('INVALIDATE_CACHE', 'categories');

          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to delete category',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'categories', loading: false });
          reject(error);
        });
    });
  },

  // Subcategories actions
  fetchSubcategories({ commit, state }, payload = {}) {
    return new Promise((resolve, reject) => {
      if (
        !state.cache.config.enabled ||
        Date.now() - (state.metadata.subcategories.lastFetch || 0) > state.cache.config.ttl
      ) {
        commit('SET_LOADING_STATE', { entity: 'subcategories', loading: true });

        axios
          .get('/general-store/subcategories', { params: payload })
          .then(response => {
            const subcategories = response.data.data.docs || response.data.data;
            const normalized = normalizeEntity(subcategories);
            const byCategory = createLookupTable(subcategories, 'category_id');

            commit('SET_SUBCATEGORIES', {
              byId: normalized.byId,
              allIds: normalized.allIds,
              byCategory,
            });

            commit('SET_METADATA', {
              entity: 'subcategories',
              metadata: {
                total: response.data.data.total || subcategories.length,
                pages: response.data.data.pages || 1,
                currentPage: response.data.data.page || 1,
                lastFetch: Date.now(),
                isStale: false,
              },
            });

            commit('SET_LOADING_STATE', { entity: 'subcategories', loading: false });
            resolve(response);
          })
          .catch(error => {
            commit('SET_ERROR', {
              message: 'Failed to fetch subcategories',
              details: error.response?.data || error.message,
            });
            commit('SET_LOADING_STATE', { entity: 'subcategories', loading: false });
            reject(error);
          });
      } else {
        resolve({ data: { cached: true } });
      }
    });
  },

  createSubcategory({ commit }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'subcategories', loading: true });

      axios
        .post('/general-store/subcategories', payload)
        .then(response => {
          const subcategory = response.data.data;
          commit('ADD_SUBCATEGORY', subcategory);
          commit('SET_LOADING_STATE', { entity: 'subcategories', loading: false });

          commit('INVALIDATE_CACHE', 'subcategories');
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to create subcategory',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'subcategories', loading: false });
          reject(error);
        });
    });
  },

  updateSubcategory({ commit }, { id, ...payload }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'subcategories', loading: true });

      axios
        .put(`/general-store/subcategories/${id}`, payload)
        .then(response => {
          const subcategory = response.data.data;
          commit('UPDATE_SUBCATEGORY', subcategory);
          commit('SET_LOADING_STATE', { entity: 'subcategories', loading: false });

          commit('INVALIDATE_CACHE', 'subcategories');
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to update subcategory',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'subcategories', loading: false });
          reject(error);
        });
    });
  },

  deleteSubcategory({ commit }, id) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'subcategories', loading: true });

      axios
        .delete(`/general-store/subcategories/${id}`)
        .then(response => {
          commit('REMOVE_SUBCATEGORY', id);
          commit('SET_LOADING_STATE', { entity: 'subcategories', loading: false });

          commit('INVALIDATE_CACHE', 'subcategories');
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to delete subcategory',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'subcategories', loading: false });
          reject(error);
        });
    });
  },

  // Items actions
  fetchItems({ commit, state }, payload = {}) {
    return new Promise((resolve, reject) => {
      if (
        !state.cache.config.enabled ||
        Date.now() - (state.metadata.items.lastFetch || 0) > state.cache.config.ttl
      ) {
        commit('SET_LOADING_STATE', { entity: 'items', loading: true });

        axios
          .get('/general-store/items', { params: payload })
          .then(response => {
            const items = response.data.data.docs || response.data.data;
            const normalized = normalizeEntity(items);
            const byCategory = createLookupTable(items, 'category_id');
            const bySubcategory = createLookupTable(items, 'subcategory_id');

            // Identify low stock and expiring items
            const lowStock = items.filter(item => item.is_low_stock).map(item => item.id);
            const expiring = items.filter(item => item.is_expiring).map(item => item.id);

            commit('SET_ITEMS', {
              byId: normalized.byId,
              allIds: normalized.allIds,
              byCategory,
              bySubcategory,
              lowStock,
              expiring,
            });

            commit('SET_METADATA', {
              entity: 'items',
              metadata: {
                total: response.data.data.total || items.length,
                pages: response.data.data.pages || 1,
                currentPage: response.data.data.page || 1,
                lastFetch: Date.now(),
                isStale: false,
              },
            });

            commit('SET_LOADING_STATE', { entity: 'items', loading: false });
            resolve(response);
          })
          .catch(error => {
            commit('SET_ERROR', {
              message: 'Failed to fetch items',
              details: error.response?.data || error.message,
            });
            commit('SET_LOADING_STATE', { entity: 'items', loading: false });
            reject(error);
          });
      } else {
        resolve({ data: { cached: true } });
      }
    });
  },

  fetchItemById({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      // Check if item exists in cache
      if (state.entities.items.byId[id] && !state.metadata.items.isStale) {
        resolve({ data: { data: state.entities.items.byId[id], cached: true } });
        return;
      }

      commit('SET_LOADING_STATE', { entity: 'items', loading: true });

      axios
        .get(`/general-store/items/${id}`)
        .then(response => {
          const item = response.data.data;
          commit('ADD_ITEM', item);
          commit('SET_CURRENT_SELECTION', { entity: 'item', id });
          commit('SET_LOADING_STATE', { entity: 'items', loading: false });
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to fetch item',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'items', loading: false });
          reject(error);
        });
    });
  },

  createItem({ commit }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'items', loading: true });

      axios
        .post('/general-store/items', payload)
        .then(response => {
          const item = response.data.data;
          commit('ADD_ITEM', item);
          commit('SET_LOADING_STATE', { entity: 'items', loading: false });

          commit('INVALIDATE_CACHE', 'items');
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to create item',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'items', loading: false });
          reject(error);
        });
    });
  },

  updateItem({ commit }, { id, ...payload }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'items', loading: true });

      axios
        .put(`/general-store/items/${id}`, payload)
        .then(response => {
          const item = response.data.data;
          commit('UPDATE_ITEM', item);
          commit('SET_LOADING_STATE', { entity: 'items', loading: false });

          commit('INVALIDATE_CACHE', 'items');
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to update item',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'items', loading: false });
          reject(error);
        });
    });
  },

  deleteItem({ commit }, id) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'items', loading: true });

      axios
        .delete(`/general-store/items/${id}`)
        .then(response => {
          commit('REMOVE_ITEM', id);
          commit('SET_LOADING_STATE', { entity: 'items', loading: false });

          commit('INVALIDATE_CACHE', 'items');
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to delete item',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'items', loading: false });
          reject(error);
        });
    });
  },

  // Stock movements actions
  fetchMovements({ commit, state }, payload = {}) {
    return new Promise((resolve, reject) => {
      if (
        !state.cache.config.enabled ||
        Date.now() - (state.metadata.movements.lastFetch || 0) > state.cache.config.ttl
      ) {
        commit('SET_LOADING_STATE', { entity: 'movements', loading: true });

        axios
          .get('/general-store/movements', { params: payload })
          .then(response => {
            const movements = response.data.data.docs || response.data.data;
            const normalized = normalizeEntity(movements);
            const byItem = createLookupTable(movements, 'item_id');
            const byDate = createLookupTable(movements, 'movement_date');

            commit('SET_MOVEMENTS', {
              byId: normalized.byId,
              allIds: normalized.allIds,
              byItem,
              byDate,
            });

            commit('SET_METADATA', {
              entity: 'movements',
              metadata: {
                total: response.data.data.total || movements.length,
                pages: response.data.data.pages || 1,
                currentPage: response.data.data.page || 1,
                lastFetch: Date.now(),
                isStale: false,
              },
            });

            commit('SET_LOADING_STATE', { entity: 'movements', loading: false });
            resolve(response);
          })
          .catch(error => {
            commit('SET_ERROR', {
              message: 'Failed to fetch movements',
              details: error.response?.data || error.message,
            });
            commit('SET_LOADING_STATE', { entity: 'movements', loading: false });
            reject(error);
          });
      } else {
        resolve({ data: { cached: true } });
      }
    });
  },

  createMovement({ commit }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'movements', loading: true });

      axios
        .post('/general-store/movements', payload)
        .then(response => {
          const movement = response.data.data;
          commit('ADD_MOVEMENT', movement);
          commit('SET_LOADING_STATE', { entity: 'movements', loading: false });

          // Invalidate related caches
          commit('INVALIDATE_CACHE', 'movements');
          commit('INVALIDATE_CACHE', 'items'); // Items stock may have changed

          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to create movement',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'movements', loading: false });
          reject(error);
        });
    });
  },

  // Requests actions
  fetchRequests({ commit, state }, payload = {}) {
    return new Promise((resolve, reject) => {
      if (
        !state.cache.config.enabled ||
        Date.now() - (state.metadata.requests.lastFetch || 0) > state.cache.config.ttl
      ) {
        commit('SET_LOADING_STATE', { entity: 'requests', loading: true });

        axios
          .get('/general-store/requests', { params: payload })
          .then(response => {
            const requests = response.data.data.docs || response.data.data;
            const normalized = normalizeEntity(requests);
            const byStatus = createLookupTable(requests, 'status');
            const byUser = createLookupTable(requests, 'user_id');

            // Identify special request collections
            const myRequests = requests.filter(req => req.is_my_request).map(req => req.id);
            const pendingApproval = requests
              .filter(req => req.status === 'pending_approval')
              .map(req => req.id);

            commit('SET_REQUESTS', {
              byId: normalized.byId,
              allIds: normalized.allIds,
              byStatus,
              byUser,
              myRequests,
              pendingApproval,
            });

            commit('SET_METADATA', {
              entity: 'requests',
              metadata: {
                total: response.data.data.total || requests.length,
                pages: response.data.data.pages || 1,
                currentPage: response.data.data.page || 1,
                lastFetch: Date.now(),
                isStale: false,
              },
            });

            commit('SET_LOADING_STATE', { entity: 'requests', loading: false });
            resolve(response);
          })
          .catch(error => {
            commit('SET_ERROR', {
              message: 'Failed to fetch requests',
              details: error.response?.data || error.message,
            });
            commit('SET_LOADING_STATE', { entity: 'requests', loading: false });
            reject(error);
          });
      } else {
        resolve({ data: { cached: true } });
      }
    });
  },

  fetchRequestById({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      if (state.entities.requests.byId[id] && !state.metadata.requests.isStale) {
        resolve({ data: { data: state.entities.requests.byId[id], cached: true } });
        return;
      }

      commit('SET_LOADING_STATE', { entity: 'requests', loading: true });

      axios
        .get(`/general-store/requests/${id}`)
        .then(response => {
          const request = response.data.data;
          commit('ADD_REQUEST', request);
          commit('SET_CURRENT_SELECTION', { entity: 'request', id });
          commit('SET_LOADING_STATE', { entity: 'requests', loading: false });
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to fetch request',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'requests', loading: false });
          reject(error);
        });
    });
  },

  createRequest({ commit }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'requests', loading: true });

      axios
        .post('/general-store/requests', payload)
        .then(response => {
          const request = response.data.data;
          commit('ADD_REQUEST', request);
          commit('SET_LOADING_STATE', { entity: 'requests', loading: false });

          commit('INVALIDATE_CACHE', 'requests');
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to create request',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'requests', loading: false });
          reject(error);
        });
    });
  },

  updateRequest({ commit }, { id, ...payload }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'requests', loading: true });

      axios
        .put(`/general-store/requests/${id}`, payload)
        .then(response => {
          const request = response.data.data;
          commit('UPDATE_REQUEST', request);
          commit('SET_LOADING_STATE', { entity: 'requests', loading: false });

          commit('INVALIDATE_CACHE', 'requests');
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to update request',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'requests', loading: false });
          reject(error);
        });
    });
  },

  approveRequest({ commit }, { id, ...payload }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'requests', loading: true });

      axios
        .put(`/general-store/requests/${id}/approve`, payload)
        .then(response => {
          const request = response.data.data;
          commit('UPDATE_REQUEST', request);
          commit('SET_LOADING_STATE', { entity: 'requests', loading: false });

          commit('INVALIDATE_CACHE', 'requests');
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to approve request',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'requests', loading: false });
          reject(error);
        });
    });
  },

  fulfillRequest({ commit }, { id, ...payload }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'requests', loading: true });

      axios
        .put(`/general-store/requests/${id}/fulfill`, payload)
        .then(response => {
          const request = response.data.data;
          commit('UPDATE_REQUEST', request);
          commit('SET_LOADING_STATE', { entity: 'requests', loading: false });

          // Invalidate related caches
          commit('INVALIDATE_CACHE', 'requests');
          commit('INVALIDATE_CACHE', 'items'); // Stock may have changed
          commit('INVALIDATE_CACHE', 'movements'); // New movements created

          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to fulfill request',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'requests', loading: false });
          reject(error);
        });
    });
  },

  // Dispensaries actions
  fetchDispensaries({ commit, state }, payload = {}) {
    return new Promise((resolve, reject) => {
      if (
        !state.cache.config.enabled ||
        Date.now() - (state.metadata.dispensaries.lastFetch || 0) > state.cache.config.ttl
      ) {
        commit('SET_LOADING_STATE', { entity: 'dispensaries', loading: true });

        axios
          .get('/general-store/dispensaries', { params: payload })
          .then(response => {
            const dispensaries = response.data.data.docs || response.data.data;
            const normalized = normalizeEntity(dispensaries);

            commit('SET_DISPENSARIES', {
              byId: normalized.byId,
              allIds: normalized.allIds,
            });

            commit('SET_METADATA', {
              entity: 'dispensaries',
              metadata: {
                total: response.data.data.total || dispensaries.length,
                pages: response.data.data.pages || 1,
                currentPage: response.data.data.page || 1,
                lastFetch: Date.now(),
                isStale: false,
              },
            });

            commit('SET_LOADING_STATE', { entity: 'dispensaries', loading: false });
            resolve(response);
          })
          .catch(error => {
            commit('SET_ERROR', {
              message: 'Failed to fetch dispensaries',
              details: error.response?.data || error.message,
            });
            commit('SET_LOADING_STATE', { entity: 'dispensaries', loading: false });
            reject(error);
          });
      } else {
        resolve({ data: { cached: true } });
      }
    });
  },

  fetchDispensaryStock({ commit }, dispensaryId) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'dispensaries', loading: true });

      axios
        .get(`/general-store/dispensaries/${dispensaryId}/stock`)
        .then(response => {
          const stock = response.data.data;
          commit('SET_DISPENSARY_STOCK', { dispensaryId, stock });
          commit('SET_LOADING_STATE', { entity: 'dispensaries', loading: false });
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to fetch dispensary stock',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'dispensaries', loading: false });
          reject(error);
        });
    });
  },

  // Dashboard actions
  fetchDashboardStats({ commit }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'dashboard', loading: true });

      axios
        .get('/general-store/dashboard/stats')
        .then(response => {
          commit('SET_DASHBOARD_STATS', response.data.data);
          commit('SET_LOADING_STATE', { entity: 'dashboard', loading: false });
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to fetch dashboard stats',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'dashboard', loading: false });
          reject(error);
        });
    });
  },

  // Reports actions
  fetchStockReport({ commit }, payload = {}) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'reports', loading: true });

      axios
        .get('/general-store/reports/stock', { params: payload })
        .then(response => {
          commit('SET_STOCK_REPORT', response.data.data);
          commit('SET_LOADING_STATE', { entity: 'reports', loading: false });
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to fetch stock report',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'reports', loading: false });
          reject(error);
        });
    });
  },

  fetchMovementReport({ commit }, payload = {}) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'reports', loading: true });

      axios
        .get('/general-store/reports/movement', { params: payload })
        .then(response => {
          commit('SET_MOVEMENT_REPORT', response.data.data);
          commit('SET_LOADING_STATE', { entity: 'reports', loading: false });
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to fetch movement report',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'reports', loading: false });
          reject(error);
        });
    });
  },

  fetchRecentReports({ commit }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'reports', loading: true });

      axios
        .get('/general-store/reports/recent')
        .then(response => {
          commit('SET_RECENT_REPORTS', response.data.data);
          commit('SET_LOADING_STATE', { entity: 'reports', loading: false });
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to fetch recent reports',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'reports', loading: false });
          reject(error);
        });
    });
  },

  // Settings actions
  fetchSettings({ commit }) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'settings', loading: true });

      axios
        .get('/general-store/settings')
        .then(response => {
          commit('SET_SETTINGS', response.data.data);
          commit('SET_LOADING_STATE', { entity: 'settings', loading: false });
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to fetch settings',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'settings', loading: false });
          reject(error);
        });
    });
  },

  updateSettings({ commit }, payload) {
    return new Promise((resolve, reject) => {
      commit('SET_LOADING_STATE', { entity: 'settings', loading: true });

      axios
        .put('/general-store/settings', payload)
        .then(response => {
          commit('SET_SETTINGS', response.data.data);
          commit('SET_LOADING_STATE', { entity: 'settings', loading: false });
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', {
            message: 'Failed to update settings',
            details: error.response?.data || error.message,
          });
          commit('SET_LOADING_STATE', { entity: 'settings', loading: false });
          reject(error);
        });
    });
  },

  // UI actions
  setFilters({ commit }, filters) {
    commit('SET_FILTERS', filters);
  },

  clearFilters({ commit }) {
    commit('CLEAR_FILTERS');
  },

  setPagination({ commit }, pagination) {
    commit('SET_PAGINATION', pagination);
  },

  setCurrentSelection({ commit }, { entity, id }) {
    commit('SET_CURRENT_SELECTION', { entity, id });
  },

  clearCurrentSelection({ commit }, entity) {
    commit('CLEAR_CURRENT_SELECTION', entity);
  },

  clearError({ commit }) {
    commit('CLEAR_ERROR');
  },

  // Cache management actions
  invalidateCache({ commit }, entity) {
    commit('INVALIDATE_CACHE', entity);
  },

  invalidateAllCaches({ commit }) {
    commit('INVALIDATE_ALL_CACHES');
  },

  enableCache({ commit }) {
    commit('SET_CACHE_CONFIG', { enabled: true });
  },

  disableCache({ commit }) {
    commit('SET_CACHE_CONFIG', { enabled: false });
  },

  setCacheTTL({ commit }, ttl) {
    commit('SET_CACHE_CONFIG', { ttl });
  },

  // Bulk operations
  refreshAllData({ dispatch }) {
    return Promise.all([
      dispatch('fetchCategories'),
      dispatch('fetchSubcategories'),
      dispatch('fetchItems'),
      dispatch('fetchRequests'),
      dispatch('fetchDispensaries'),
      dispatch('fetchDashboardStats'),
    ]);
  },

  // Clear all state
  clearAllState({ commit }) {
    commit('CLEAR_ALL_STATE');
  },
};
