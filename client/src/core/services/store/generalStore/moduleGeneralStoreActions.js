import axios from '../../../../axios';

export default {
  // Categories
  fetchCategories({ commit }, payload = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      const params = {
        page: payload.page || 1,
        limit: payload.limit || 20,
      };

      if (payload.parent_id) params.parent_id = payload.parent_id;
      if (payload.is_active !== undefined) params.is_active = payload.is_active;

      axios
        .get('/general-store/categories', { params })
        .then(response => {
          commit('SET_CATEGORIES', response.data.data);
          commit('SET_CATEGORIES_TOTAL', response.data.pagination.total_items);
          commit('SET_CATEGORIES_PAGES', response.data.pagination.total_pages);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch categories');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

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

  createCategory({ commit }, categoryData) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .post('/general-store/categories', categoryData)
        .then(response => {
          commit('ADD_CATEGORY', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to create category');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  updateCategory({ commit }, { id, data }) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .put(`/general-store/categories/${id}`, data)
        .then(response => {
          commit('UPDATE_CATEGORY', response.data.data);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to update category');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  deleteCategory({ commit }, categoryId) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      axios
        .delete(`/general-store/categories/${categoryId}`)
        .then(response => {
          commit('DELETE_CATEGORY', categoryId);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to delete category');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

  // Subcategories
  fetchSubcategories({ commit }, payload = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      const params = {
        page: payload.page || 1,
        limit: payload.limit || 20,
      };

      if (payload.category_id) params.category_id = payload.category_id;
      if (payload.is_active !== undefined) params.is_active = payload.is_active;

      axios
        .get('/general-store/subcategories', { params })
        .then(response => {
          commit('SET_SUBCATEGORIES', response.data.data);
          commit('SET_SUBCATEGORIES_TOTAL', response.data.pagination.total_items);
          commit('SET_SUBCATEGORIES_PAGES', response.data.pagination.total_pages);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch subcategories');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

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

  // Items
  fetchItems({ commit }, payload = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      const params = {
        page: payload.page || 1,
        limit: payload.limit || 20,
      };

      if (payload.category_id) params.category_id = payload.category_id;
      if (payload.subcategory_id) params.subcategory_id = payload.subcategory_id;
      if (payload.status) params.status = payload.status;
      if (payload.supplier_id) params.supplier_id = payload.supplier_id;

      axios
        .get('/general-store/items', { params })
        .then(response => {
          commit('SET_ITEMS', response.data.data);
          commit('SET_ITEMS_TOTAL', response.data.pagination.total_items);
          commit('SET_ITEMS_PAGES', response.data.pagination.total_pages);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch items');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

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
  fetchMovements({ commit }, payload = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      const params = {
        page: payload.page || 1,
        limit: payload.limit || 20,
      };

      if (payload.item_id) params.item_id = payload.item_id;
      if (payload.movement_type) params.movement_type = payload.movement_type;
      if (payload.start_date) params.start_date = payload.start_date;
      if (payload.end_date) params.end_date = payload.end_date;
      if (payload.staff_id) params.staff_id = payload.staff_id;

      axios
        .get('/general-store/movements', { params })
        .then(response => {
          commit('SET_MOVEMENTS', response.data.data);
          commit('SET_MOVEMENTS_TOTAL', response.data.pagination.total_items);
          commit('SET_MOVEMENTS_PAGES', response.data.pagination.total_pages);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch movements');
          commit('SET_LOADING', false);
          reject(error);
        });
    });
  },

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
  fetchRequests({ commit }, payload = {}) {
    commit('SET_LOADING', true);
    return new Promise((resolve, reject) => {
      const params = {
        page: payload.page || 1,
        limit: payload.limit || 20,
      };

      if (payload.status) params.status = payload.status;
      if (payload.priority) params.priority = payload.priority;
      if (payload.requesting_department)
        params.requesting_department = payload.requesting_department;
      if (payload.start_date) params.start_date = payload.start_date;
      if (payload.end_date) params.end_date = payload.end_date;

      axios
        .get('/general-store/requests', { params })
        .then(response => {
          commit('SET_REQUESTS', response.data.data);
          commit('SET_REQUESTS_TOTAL', response.data.pagination.total_items);
          commit('SET_REQUESTS_PAGES', response.data.pagination.total_pages);
          commit('SET_LOADING', false);
          resolve(response);
        })
        .catch(error => {
          commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch requests');
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
          responseType: 'blob'
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
          responseType: 'blob'
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
          responseType: 'blob'
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
          responseType: 'blob'
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
};
