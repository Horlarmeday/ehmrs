import axios from '../../../../axios';

// Standardized error handling
const handleError = (error, entityName, operation = 'fetch') => {
  let errorMessage = `Failed to ${operation} ${entityName}`;
  let errorDetails = null;

  if (error.response) {
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
    errorMessage = 'Network error - please check your connection';
  } else {
    errorMessage = error.message || `Failed to ${operation} ${entityName}`;
  }

  return { errorMessage, errorDetails };
};

// Standardized fetch action helper
const createFetchAction = (entityName, endpoint, commitMutations) => {
  return ({ commit }, payload = {}) => {
    commit('SET_LOADING', true);
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
        .then((response) => {
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

          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
          const { errorMessage, errorDetails } = handleError(error, entityName, 'fetch');
          commit('SET_ERROR', errorMessage);
          if (errorDetails) {
            commit('SET_ERROR_DETAILS', errorDetails);
          }
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  };
};

// Standardized CRUD action helper
const createCRUDAction = (entityName, endpoint, operation, commitMutation) => {
  return ({ commit }, payload) => {
    commit('SET_LOADING', true);
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
        .then((response) => {
          if (commitMutation) {
            commit(commitMutation, response.data.data || payload);
          }
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
          const { errorMessage, errorDetails } = handleError(error, entityName, operation);
          commit('SET_ERROR', errorMessage);
          if (errorDetails) {
            commit('SET_ERROR_DETAILS', errorDetails);
          }
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  };
};

export default {
  // Categories
  fetchCategories: createFetchAction('categories', '/general-store/categories', {
    setItems: 'SET_CATEGORIES',
    setTotal: 'SET_CATEGORIES_TOTAL',
    setPages: 'SET_CATEGORIES_PAGES',
  }),

  fetchCategoryById({ commit }, categoryId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get(`/general-store/categories/${categoryId}`)
        .then((response) => {
          commit('SET_CURRENT_CATEGORY', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
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

  // Subcategories
  fetchSubcategories: createFetchAction('subcategories', '/general-store/subcategories', {
    setItems: 'SET_SUBCATEGORIES',
    setTotal: 'SET_SUBCATEGORIES_TOTAL',
    setPages: 'SET_SUBCATEGORIES_PAGES',
  }),

  fetchSubcategoryById({ commit }, subcategoryId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get(`/general-store/subcategories/${subcategoryId}`)
        .then((response) => {
          commit('SET_CURRENT_SUBCATEGORY', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
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
        .then((response) => {
          commit('ADD_SUBCATEGORY', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
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
        .then((response) => {
          commit('UPDATE_SUBCATEGORY', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
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
        .then((response) => {
          commit('DELETE_SUBCATEGORY', subcategoryId);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to delete subcategory');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  // Items
  fetchItems: createFetchAction('items', '/general-store/items', {
    setItems: 'SET_ITEMS',
    setTotal: 'SET_ITEMS_TOTAL',
    setPages: 'SET_ITEMS_PAGES',
  }),

  fetchItemById({ commit }, itemId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get(`/general-store/items/${itemId}`)
        .then((response) => {
          commit('SET_CURRENT_ITEM', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch item details');
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
        .then((response) => {
          commit('ADD_ITEM', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
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
        .then((response) => {
          commit('UPDATE_ITEM', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
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
        .then((response) => {
          commit('DELETE_ITEM', itemId);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
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
        .then((response) => {
          commit('SET_LOW_STOCK_ITEMS', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
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
        .then((response) => {
          commit('SET_EXPIRING_ITEMS', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch expiring items');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  // Stock Movements
  fetchMovements: createFetchAction('movements', '/general-store/movements', {
    setItems: 'SET_MOVEMENTS',
    setTotal: 'SET_MOVEMENTS_TOTAL',
    setPages: 'SET_MOVEMENTS_PAGES',
  }),

  createMovement({ commit }, movementData) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .post('/general-store/movements', movementData)
        .then((response) => {
          commit('ADD_MOVEMENT', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to create movement');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  // Requests
  fetchRequests: createFetchAction('requests', '/general-store/requests', {
    setItems: 'SET_REQUESTS',
    setTotal: 'SET_REQUESTS_TOTAL',
    setPages: 'SET_REQUESTS_PAGES',
  }),

  fetchRequestById({ commit }, requestId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get(`/general-store/requests/${requestId}`)
        .then((response) => {
          commit('SET_CURRENT_REQUEST', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch request details');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  createRequest({ commit }, requestData) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .post('/general-store/requests', requestData)
        .then((response) => {
          commit('ADD_REQUEST', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
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
        .then((response) => {
          commit('UPDATE_REQUEST', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to update request');
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
        .then((response) => {
          commit('UPDATE_REQUEST', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
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
        .then((response) => {
          commit('UPDATE_REQUEST', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
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
        .then((response) => {
          commit('UPDATE_REQUEST', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fulfill request');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  // Dispensaries
  fetchDispensaries: createFetchAction('dispensaries', '/general-store/dispensaries', {
    setItems: 'SET_DISPENSARIES',
    setTotal: 'SET_DISPENSARIES_TOTAL',
    setPages: 'SET_DISPENSARIES_PAGES',
  }),

  fetchDispensaryById({ commit }, dispensaryId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .get(`/general-store/dispensaries/${dispensaryId}`)
        .then((response) => {
          commit('SET_CURRENT_DISPENSARY', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
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
        .then((response) => {
          commit('ADD_DISPENSARY', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
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
        .then((response) => {
          commit('UPDATE_DISPENSARY', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
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
        .then((response) => {
          commit('DELETE_DISPENSARY', dispensaryId);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch((error) => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to delete dispensary');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  // Utility actions
  clearError({ commit }) {
    commit('CLEAR_ERROR');
  },

  // Dashboard Stats
  async fetchDashboardStats({ commit }) {
    try {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      const response = await axios.get('/general-store/dashboard/stats');
      commit('SET_DASHBOARD_STATS', response.data.data);

      return response.data.data;
    } catch (error) {
      return handleError(error, 'dashboard statistics', 'fetch');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Recent Reports
  async fetchRecentReports({ commit }) {
    try {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      const response = await axios.get('/general-store/reports/recent');
      commit('SET_RECENT_REPORTS', response.data.data);

      return response.data.data;
    } catch (error) {
      return handleError(error, 'recent reports', 'fetch');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Stock Report Generation
  async generateStockReport({ commit }, params) {
    try {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      const response = await axios.get('/general-store/reports/stock', { params });
      commit('SET_STOCK_REPORT', response.data.data);

      return response.data.data;
    } catch (error) {
      return handleError(error, 'stock report', 'generate');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Movement Report Generation
  async generateMovementReport({ commit }, params) {
    try {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      const response = await axios.get('/general-store/reports/movements', { params });
      commit('SET_MOVEMENT_REPORT', response.data.data);

      return response.data.data;
    } catch (error) {
      return handleError(error, 'movement report', 'generate');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Usage Report Generation
  async generateUsageReport({ commit }, params) {
    try {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      const response = await axios.get('/general-store/reports/usage', { params });
      commit('SET_USAGE_REPORT', response.data.data);

      return response.data.data;
    } catch (error) {
      return handleError(error, 'usage report', 'generate');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Cost Report Generation
  async generateCostReport({ commit }, params) {
    try {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      const response = await axios.get('/general-store/reports/cost', { params });
      commit('SET_COST_REPORT', response.data.data);

      return response.data.data;
    } catch (error) {
      return handleError(error, 'cost report', 'generate');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Item Movements
  async fetchItemMovements({ commit }, params) {
    try {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      const response = await axios.get(`/general-store/movements/item/${params.itemId}`, {
        params,
      });
      commit('SET_ITEM_MOVEMENTS', response.data.data);

      return response.data.data;
    } catch (error) {
      return handleError(error, 'item movements', 'fetch');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Export Movement Report
  async exportMovementReport({ commit }, params) {
    try {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      const response = await axios.get('/general-store/reports/movements/export', {
        params,
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `movement-report-${new Date().toISOString().split('T')[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error) {
      return handleError(error, 'movement report export', 'export');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Export Usage Report
  async exportUsageReport({ commit }, params) {
    try {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      const response = await axios.get('/general-store/reports/usage/export', {
        params,
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `usage-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error) {
      return handleError(error, 'usage report export', 'export');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Export Cost Report
  async exportCostReport({ commit }, params) {
    try {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      const response = await axios.get('/general-store/reports/cost/export', {
        params,
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cost-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error) {
      return handleError(error, 'cost report export', 'export');
    } finally {
      commit('SET_LOADING', false);
    }
  },
};
