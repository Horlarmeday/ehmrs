import axios from '../../../../axios';
import { createCachedAction } from './cacheHelpers.js';

// Standardized error handling
const handleError = (error, entityName, operation = 'fetch') => {
  let errorMessage = `Failed to ${operation} ${entityName}`;
  let errorDetails = null;

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    if (data?.message) {
      errorMessage = data.message;
    } else if (data?.errors) {
      errorMessage = 'Validation failed';
      errorDetails = data.errors;
    } else {
      switch (status) {
        case 400:
          errorMessage = 'Invalid request data';
          break;
        case 401:
          errorMessage = 'Authentication required';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = `${entityName} not found`;
          break;
        case 422:
          errorMessage = 'Validation failed';
          errorDetails = data?.errors;
          break;
        case 500:
          errorMessage = 'Server error occurred';
          break;
        default:
          errorMessage = `Request failed with status ${status}`;
      }
    }
  } else if (error.request) {
    // Network error
    errorMessage = 'Network error - please check your connection';
  } else {
    // Other error
    errorMessage = error.message || `Failed to ${operation} ${entityName}`;
  }

  return { errorMessage, errorDetails };
};

// Standardized action helpers
const createStandardizedAction = (entityName, endpoint, commitMutations) => {
  return ({ commit }, payload = {}) => {
    commit('SET_LOADING_STATE', { operation: entityName, loading: true });
    commit('CLEAR_ERROR');

    return new Promise((resolve, reject) => {
      const params = {
        currentPage: payload.currentPage || payload.page || 1,
        pageLimit: payload.pageLimit || payload.limit || 20,
      };

      // Add filters
      if (payload.search) params.search = payload.search;
      if (payload.category_id) params.category_id = payload.category_id;
      if (payload.subcategory_id) params.subcategory_id = payload.subcategory_id;
      if (payload.status) params.status = payload.status;
      if (payload.start_date) params.start_date = payload.start_date;
      if (payload.end_date) params.end_date = payload.end_date;
      if (payload.start) params.start_date = payload.start;
      if (payload.end) params.end_date = payload.end;

      axios
        .get(endpoint, { params })
        .then(response => {
          const data = response.data.data;
          const pagination = response.data.pagination || {};

          // Commit entity-specific mutations
          if (commitMutations.setItems) commit(commitMutations.setItems, data.rows || data);
          if (commitMutations.setTotal)
            commit(commitMutations.setTotal, pagination.total_items || data.count || 0);
          if (commitMutations.setPages)
            commit(
              commitMutations.setPages,
              pagination.total_pages ||
                Math.ceil((pagination.total_items || data.count || 0) / params.pageLimit)
            );

          // Update standardized pagination
          commit('UPDATE_PAGINATION', {
            currentPage: params.currentPage,
            pageLimit: params.pageLimit,
            totalItems: pagination.total_items || data.count || 0,
            totalPages:
              pagination.total_pages ||
              Math.ceil((pagination.total_items || data.count || 0) / params.pageLimit),
          });

          commit('SET_LOADING_STATE', { operation: entityName, loading: false });
          resolve(response);
        })
        .catch(error => {
          const { errorMessage, errorDetails } = handleError(error, entityName, 'fetch');
          commit('SET_ERROR', errorMessage);
          if (errorDetails) {
            commit('SET_ERROR_DETAILS', errorDetails);
          }
          commit('SET_LOADING_STATE', { operation: entityName, loading: false });
          reject(error);
        });
    });
  };
};

// Standardized CRUD action helper
const createCRUDAction = (entityName, endpoint, operation, commitMutation) => {
  return ({ commit }, payload) => {
    commit('SET_LOADING_STATE', { operation: entityName, loading: true });
    commit('CLEAR_ERROR');

    return new Promise((resolve, reject) => {
      let request;

      switch (operation) {
        case 'create':
          request = axios.post(endpoint, payload);
          break;
        case 'update':
          request = axios.put(`${endpoint}/${payload.id}`, payload.data);
          break;
        case 'delete':
          request = axios.delete(`${endpoint}/${payload}`);
          break;
        default:
          reject(new Error(`Unknown operation: ${operation}`));
          return;
      }

      request
        .then(response => {
          if (commitMutation) {
            commit(commitMutation, response.data.data || payload);
          }
          commit('SET_LOADING_STATE', { operation: entityName, loading: false });
          resolve(response);
        })
        .catch(error => {
          const { errorMessage, errorDetails } = handleError(error, entityName, operation);
          commit('SET_ERROR', errorMessage);
          if (errorDetails) {
            commit('SET_ERROR_DETAILS', errorDetails);
          }
          commit('SET_LOADING_STATE', { operation: entityName, loading: false });
          reject(error);
        });
    });
  };
};

// Create cached versions of frequently used actions
const originalFetchCategories = createStandardizedAction(
  'categories',
  '/general-store/categories',
  {
    setItems: 'SET_CATEGORIES',
    setTotal: 'SET_CATEGORIES_TOTAL',
    setPages: 'SET_CATEGORIES_PAGES',
  }
);

const originalFetchSubcategories = createStandardizedAction(
  'subcategories',
  '/general-store/subcategories',
  {
    setItems: 'SET_SUBCATEGORIES',
    setTotal: 'SET_SUBCATEGORIES_TOTAL',
    setPages: 'SET_SUBCATEGORIES_PAGES',
  }
);

const originalFetchItems = createStandardizedAction('items', '/general-store/items', {
  setItems: 'SET_ITEMS',
  setTotal: 'SET_ITEMS_TOTAL',
  setPages: 'SET_ITEMS_PAGES',
});

export default {
  // Categories - with caching
  fetchCategories: createCachedAction(
    originalFetchCategories,
    'categories',
    state => state.categories
  ),

  fetchCategoryById({ commit }, categoryId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get(`/general-store/categories/${categoryId}`)
        .then(response => {
          commit('SET_CURRENT_CATEGORY', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch category');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  createCategory: createCRUDAction(
    'categories',
    '/general-store/categories',
    'create',
    'ADD_CATEGORY'
  ),

  updateCategory: createCRUDAction(
    'categories',
    '/general-store/categories',
    'update',
    'UPDATE_CATEGORY'
  ),
  deleteCategory: createCRUDAction(
    'categories',
    '/general-store/categories',
    'delete',
    'DELETE_CATEGORY'
  ),

  // Subcategories - with caching
  fetchSubcategories: createCachedAction(
    originalFetchSubcategories,
    'subcategories',
    state => state.subcategories
  ),

  fetchSubcategoryById({ commit }, subcategoryId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get(`/general-store/subcategories/${subcategoryId}`)
        .then(response => {
          commit('SET_CURRENT_SUBCATEGORY', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch subcategory');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  createSubcategory({ commit }, subcategoryData) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .post('/general-store/subcategories', subcategoryData)
        .then(response => {
          commit('ADD_SUBCATEGORY', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to create subcategory');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  updateSubcategory({ commit }, { id, data }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .put(`/general-store/subcategories/${id}`, data)
        .then(response => {
          commit('UPDATE_SUBCATEGORY', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to update subcategory');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  deleteSubcategory({ commit }, subcategoryId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .delete(`/general-store/subcategories/${subcategoryId}`)
        .then(response => {
          commit('DELETE_SUBCATEGORY', subcategoryId);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to delete subcategory');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  // Items - with caching
  fetchItems: createCachedAction(originalFetchItems, 'items', state => state.items),

  searchItems({ commit }, payload = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      const params = {
        q: payload.search,
        page: payload.page || 1,
        limit: payload.limit || 20,
      };

      if (payload.category_id) params.category_id = payload.category_id;
      if (payload.subcategory_id) params.subcategory_id = payload.subcategory_id;
      if (payload.status) params.status = payload.status;

      axios
        .get('/general-store/items/search', { params })
        .then(response => {
          commit('SET_ITEMS', response.data.data);
          commit('SET_ITEMS_TOTAL', response.data.pagination.total_items);
          commit('SET_ITEMS_PAGES', response.data.pagination.total_pages);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to search items');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  createItem({ commit }, itemData) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .post('/general-store/items', itemData)
        .then(response => {
          commit('ADD_ITEM', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to create item');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  updateItem({ commit }, { id, data }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .put(`/general-store/items/${id}`, data)
        .then(response => {
          commit('UPDATE_ITEM', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to update item');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  deleteItem({ commit }, itemId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .delete(`/general-store/items/${itemId}`)
        .then(response => {
          commit('DELETE_ITEM', itemId);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to delete item');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  fetchLowStockItems({ commit }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/general-store/items/low-stock')
        .then(response => {
          commit('SET_LOW_STOCK_ITEMS', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch low stock items');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  fetchExpiringItems({ commit }, days = 30) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/general-store/items/expiring', { params: { days } })
        .then(response => {
          commit('SET_EXPIRING_ITEMS', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch expiring items');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  // Stock Movements
  fetchMovements: createStandardizedAction('movements', '/general-store/movements', {
    setItems: 'SET_MOVEMENTS',
    setTotal: 'SET_MOVEMENTS_TOTAL',
    setPages: 'SET_MOVEMENTS_PAGES',
  }),

  createMovement({ commit }, movementData) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .post('/general-store/movements', movementData)
        .then(response => {
          commit('ADD_MOVEMENT', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to create movement');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  // Requests
  fetchRequests: createStandardizedAction('requests', '/general-store/requests', {
    setItems: 'SET_REQUESTS',
    setTotal: 'SET_REQUESTS_TOTAL',
    setPages: 'SET_REQUESTS_PAGES',
  }),

  createRequest({ commit }, requestData) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .post('/general-store/requests', requestData)
        .then(response => {
          commit('ADD_REQUEST', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to create request');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  updateRequest({ commit }, { id, data }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .put(`/general-store/requests/${id}`, data)
        .then(response => {
          commit('UPDATE_REQUEST', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to update request');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  fetchRequestById({ commit }, requestId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get(`/general-store/requests/${requestId}`)
        .then(response => {
          commit('SET_CURRENT_REQUEST', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch request details');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  approveRequest({ commit }, { id, approvedItems }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .put(`/general-store/requests/${id}/approve`, { approved_items: approvedItems })
        .then(response => {
          commit('UPDATE_REQUEST', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to approve request');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  rejectRequest({ commit }, { id, rejectionReason }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .put(`/general-store/requests/${id}/reject`, { rejection_reason: rejectionReason })
        .then(response => {
          commit('UPDATE_REQUEST', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to reject request');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  fulfillRequest({ commit }, { id, issuedItems }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .put(`/general-store/requests/${id}/fulfill`, { issued_items: issuedItems })
        .then(response => {
          commit('UPDATE_REQUEST', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fulfill request');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  fetchMyRequests({ commit }, payload = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      const params = {
        page: payload.page || 1,
        limit: payload.limit || 20,
      };

      axios
        .get('/general-store/requests/my-requests', { params })
        .then(response => {
          commit('SET_MY_REQUESTS', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch my requests');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  fetchPendingApprovalRequests({ commit }, payload = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      const params = {
        page: payload.page || 1,
        limit: payload.limit || 20,
      };

      axios
        .get('/general-store/requests/pending-approval', { params })
        .then(response => {
          commit('SET_PENDING_APPROVAL_REQUESTS', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit(
            'SET_ERROR',
            error.response?.data?.message || 'Failed to fetch pending approval requests'
          );
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  // Reports
  generateStockReport({ commit }, filters = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/general-store/reports/stock', { params: filters })
        .then(response => {
          commit('SET_STOCK_REPORT', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to generate stock report');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  generateMovementReport({ commit }, filters = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/general-store/reports/movements', { params: filters })
        .then(response => {
          commit('SET_MOVEMENT_REPORT', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit(
            'SET_ERROR',
            error.response?.data?.message || 'Failed to generate movement report'
          );
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  generateUsageReport({ commit }, filters = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/general-store/reports/usage', { params: filters })
        .then(response => {
          commit('SET_USAGE_REPORT', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to generate usage report');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  generateCostReport({ commit }, filters = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/general-store/reports/costs', { params: filters })
        .then(response => {
          commit('SET_COST_REPORT', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to generate cost report');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  // Export Reports
  exportStockReport({ commit }, filters = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/general-store/reports/stock/export', {
          params: filters,
          responseType: 'blob',
        })
        .then(response => {
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to export stock report');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  exportMovementReport({ commit }, filters = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/general-store/reports/movements/export', {
          params: filters,
          responseType: 'blob',
        })
        .then(response => {
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to export movement report');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  exportUsageReport({ commit }, filters = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/general-store/reports/usage/export', {
          params: filters,
          responseType: 'blob',
        })
        .then(response => {
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to export usage report');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  exportCostReport({ commit }, filters = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/general-store/reports/costs/export', {
          params: filters,
          responseType: 'blob',
        })
        .then(response => {
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to export cost report');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  // Dispensaries
  // fetchDispensaries({ commit }, payload = {}) {
  //   commit('SET_LOADING', true);
  //   return new Promise((resolve, reject) => {
  //     const params = {
  //       page: payload.page || 1,
  //       limit: payload.limit || 20,
  //     };
  //
  //     if (payload.is_active !== undefined) params.is_active = payload.is_active;
  //     if (payload.location) params.location = payload.location;
  //
  //     axios
  //       .get('/general-store/dispensaries', { params })
  //       .then(response => {
  //         commit('SET_DISPENSARIES', response.data.data);
  //         commit('SET_DISPENSARIES_TOTAL', response.data.pagination.total_items);
  //         commit('SET_DISPENSARIES_PAGES', response.data.pagination.total_pages);
  //         commit('SET_LOADING', false);
  //         resolve(response);
  //       })
  //       .catch(error => {
  //         commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch dispensaries');
  //         commit('SET_LOADING', false);
  //         reject(error);
  //       });
  //   });
  // },

  fetchDispensaries: createStandardizedAction('dispensaries', '/general-store/dispensaries', {
    setItems: 'SET_DISPENSARIES',
    setTotal: 'SET_DISPENSARIES_TOTAL',
    setPages: 'SET_DISPENSARIES_PAGES',
  }),

  fetchDispensaryById({ commit }, dispensaryId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get(`/general-store/dispensaries/${dispensaryId}`)
        .then(response => {
          commit('SET_CURRENT_DISPENSARY', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch dispensary');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  createDispensary({ commit }, dispensaryData) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .post('/general-store/dispensaries', dispensaryData)
        .then(response => {
          commit('ADD_DISPENSARY', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to create dispensary');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  updateDispensary({ commit }, { id, data }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .put(`/general-store/dispensaries/${id}`, data)
        .then(response => {
          commit('UPDATE_DISPENSARY', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to update dispensary');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  deleteDispensary({ commit }, dispensaryId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .delete(`/general-store/dispensaries/${dispensaryId}`)
        .then(response => {
          commit('DELETE_DISPENSARY', dispensaryId);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to delete dispensary');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  fetchDispensaryStock({ commit }, dispensaryId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get(`/general-store/dispensaries/${dispensaryId}/stock`)
        .then(response => {
          commit('SET_DISPENSARY_STOCK', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch dispensary stock');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  fetchDispensaryMetrics({ commit }, dispensaryId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get(`/general-store/dispensaries/${dispensaryId}/metrics`)
        .then(response => {
          commit('SET_DISPENSARY_METRICS', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit(
            'SET_ERROR',
            error.response?.data?.message || 'Failed to fetch dispensary metrics'
          );
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  transferToDispensary({ commit }, transferData) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .post('/general-store/dispensaries/transfer', transferData)
        .then(response => {
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit(
            'SET_ERROR',
            error.response?.data?.message || 'Failed to transfer items to dispensary'
          );
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  dispenseItem({ commit }, dispenseData) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .post('/general-store/dispensaries/dispense', dispenseData)
        .then(response => {
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to dispense item');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  autoReplenishDispensary({ commit }, { dispensary_id }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .post('/general-store/dispensaries/workflow/auto-replenish', { dispensary_id })
        .then(response => {
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit(
            'SET_ERROR',
            error.response?.data?.message || 'Failed to auto-replenish dispensary'
          );
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  dispenseFromDispensary({ commit }, dispenseData) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .post('/general-store/dispensaries/dispense', dispenseData)
        .then(response => {
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to dispense item');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  fetchDispensaryActivity({ commit }, dispensaryId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get(`/general-store/dispensaries/${dispensaryId}/activity`)
        .then(response => {
          commit('SET_LOADING', false);
          resolve(response.data.data);
        })
        .catch(error => {
          commit(
            'SET_ERROR',
            error.response?.data?.message || 'Failed to fetch dispensary activity'
          );
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  // Settings
  fetchSettings({ commit }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/general-store/settings')
        .then(response => {
          const data = response.data?.data || {};
          commit('SET_SETTINGS', data);
          commit('SET_LOADING', false);
          resolve(data);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch settings');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  updateSettings({ commit }, settings) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .put('/general-store/settings', settings)
        .then(response => {
          const data = response.data?.data || settings;
          commit('SET_SETTINGS', data);
          commit('SET_LOADING', false);
          resolve(data);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to update settings');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  // Missing actions that are referenced in components
  fetchItemById({ commit }, itemId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get(`/general-store/items/${itemId}`)
        .then(response => {
          commit('SET_CURRENT_ITEM', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch item details');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  fetchItemMovements({ commit }, payload = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      const params = {
        page: payload.page || 1,
        limit: payload.limit || 20,
      };

      if (payload.item_id) params.item_id = payload.item_id;
      if (payload.start_date) params.start_date = payload.start_date;
      if (payload.end_date) params.end_date = payload.end_date;

      axios
        .get('/general-store/movements', { params })
        .then(response => {
          commit('SET_ITEM_MOVEMENTS', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch item movements');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  fetchDashboardStats({ commit }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/general-store/dashboard/stats')
        .then(response => {
          commit('SET_DASHBOARD_STATS', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch dashboard stats');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  getDashboardStats({ commit }) {
    return this.fetchDashboardStats({ commit });
  },

  fetchRecentReports({ commit }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get('/general-store/reports/recent')
        .then(response => {
          commit('SET_RECENT_REPORTS', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch recent reports');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  // Utility actions
  clearError({ commit }) {
    commit('CLEAR_ERROR');
  },

  setFilters({ commit }, filters) {
    commit('SET_FILTERS', filters);
  },

  setPagination({ commit }, pagination) {
    commit('SET_PAGINATION', pagination);
  },

  // Request Workflow Actions - Removed duplicate methods

  async cancelRequest({ commit }, { requestId, notes, reason }) {
    try {
      commit('SET_LOADING_STATE', { operation: 'requests', loading: true });
      commit('CLEAR_ERROR');

      const response = await axios.post(`/api/general-store/requests/${requestId}/cancel`, {
        notes,
        reason,
      });

      commit('UPDATE_REQUEST', response.data.data);
      commit('SET_LOADING_STATE', { operation: 'requests', loading: false });

      return response.data.data;
    } catch (error) {
      const { errorMessage, errorDetails } = handleError(error, 'requests', 'cancel');
      commit('SET_ERROR', errorMessage);
      if (errorDetails) {
        commit('SET_ERROR_DETAILS', errorDetails);
      }
      commit('SET_LOADING_STATE', { operation: 'requests', loading: false });
      throw error;
    }
  },

  // Movement Workflow Actions
  async approveMovement({ commit }, { movementId, notes }) {
    try {
      commit('SET_LOADING_STATE', { operation: 'movements', loading: true });
      commit('CLEAR_ERROR');

      const response = await axios.post(`/api/general-store/movements/${movementId}/approve`, {
        notes,
      });

      commit('UPDATE_MOVEMENT', response.data.data);
      commit('SET_LOADING_STATE', { operation: 'movements', loading: false });

      return response.data.data;
    } catch (error) {
      const { errorMessage, errorDetails } = handleError(error, 'movements', 'approve');
      commit('SET_ERROR', errorMessage);
      if (errorDetails) {
        commit('SET_ERROR_DETAILS', errorDetails);
      }
      commit('SET_LOADING_STATE', { operation: 'movements', loading: false });
      throw error;
    }
  },

  async rejectMovement({ commit }, { movementId, notes, reason }) {
    try {
      commit('SET_LOADING_STATE', { operation: 'movements', loading: true });
      commit('CLEAR_ERROR');

      const response = await axios.post(`/api/general-store/movements/${movementId}/reject`, {
        notes,
        reason,
      });

      commit('UPDATE_MOVEMENT', response.data.data);
      commit('SET_LOADING_STATE', { operation: 'movements', loading: false });

      return response.data.data;
    } catch (error) {
      const { errorMessage, errorDetails } = handleError(error, 'movements', 'reject');
      commit('SET_ERROR', errorMessage);
      if (errorDetails) {
        commit('SET_ERROR_DETAILS', errorDetails);
      }
      commit('SET_LOADING_STATE', { operation: 'movements', loading: false });
      throw error;
    }
  },
};
