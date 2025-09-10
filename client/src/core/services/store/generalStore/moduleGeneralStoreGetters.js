export default {
  // Categories getters
  getCategoryById: (state) => (id) => {
    return state.categories.find((category) => category.id === id);
  },

  getActiveCategoriesCount: (state) => {
    return state.categories.filter((category) => category.status === 'active').length;
  },

  getCategoriesByStatus: (state) => (status) => {
    return state.categories.filter((category) => category.status === status);
  },

  // Subcategories getters
  getSubcategoryById: (state) => (id) => {
    return state.subcategories.find((subcategory) => subcategory.id === id);
  },

  getSubcategoriesByCategory: (state) => (categoryId) => {
    return state.subcategories.filter((subcategory) => subcategory.category_id === categoryId);
  },

  getActiveSubcategoriesCount: (state) => {
    return state.subcategories.filter((subcategory) => subcategory.status === 'active').length;
  },

  // Items getters
  getItemById: (state) => (id) => {
    return state.items.find((item) => item.id === id);
  },

  getItemsByCategory: (state) => (categoryId) => {
    return state.items.filter((item) => item.category_id === categoryId);
  },

  getItemsBySubcategory: (state) => (subcategoryId) => {
    return state.items.filter((item) => item.subcategory_id === subcategoryId);
  },

  getItemsByStatus: (state) => (status) => {
    return state.items.filter((item) => item.status === status);
  },

  getActiveItemsCount: (state) => {
    return state.items.filter((item) => item.status === 'active').length;
  },

  getLowStockItemsCount: (state) => {
    return state.lowStockItems.length;
  },

  getExpiringItemsCount: (state) => {
    return state.expiringItems.length;
  },

  getFilteredItems: (state) => {
    let filteredItems = state.items;

    if (state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase();
      filteredItems = filteredItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.description?.toLowerCase().includes(searchTerm) ||
          item.code?.toLowerCase().includes(searchTerm)
      );
    }

    if (state.filters.category_id) {
      filteredItems = filteredItems.filter(
        (item) => item.category_id === state.filters.category_id
      );
    }

    if (state.filters.subcategory_id) {
      filteredItems = filteredItems.filter(
        (item) => item.subcategory_id === state.filters.subcategory_id
      );
    }

    if (state.filters.status) {
      filteredItems = filteredItems.filter((item) => item.status === state.filters.status);
    }

    return filteredItems;
  },

  // Filtered collections for test component compatibility
  filteredCategories: (state) => {
    let filteredCategories = state.categories;

    if (state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase();
      filteredCategories = filteredCategories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm) ||
          category.description?.toLowerCase().includes(searchTerm)
      );
    }

    if (state.filters.status) {
      filteredCategories = filteredCategories.filter(
        (category) => category.status === state.filters.status
      );
    }

    return filteredCategories;
  },

  filteredSubcategories: (state) => {
    let filteredSubcategories = state.subcategories;

    if (state.filters.category_id) {
      filteredSubcategories = filteredSubcategories.filter(
        (subcategory) => subcategory.category_id === state.filters.category_id
      );
    }

    if (state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase();
      filteredSubcategories = filteredSubcategories.filter(
        (subcategory) =>
          subcategory.name.toLowerCase().includes(searchTerm) ||
          subcategory.description?.toLowerCase().includes(searchTerm)
      );
    }

    if (state.filters.status) {
      filteredSubcategories = filteredSubcategories.filter(
        (subcategory) => subcategory.status === state.filters.status
      );
    }

    return filteredSubcategories;
  },

  // Stock Movements getters
  getMovementById: (state) => (id) => {
    return state.movements.find((movement) => movement.id === id);
  },

  getMovementsByType: (state) => (type) => {
    return state.movements.filter((movement) => movement.type === type);
  },

  getMovementsByItem: (state) => (itemId) => {
    return state.movements.filter((movement) => movement.item_id === itemId);
  },

  getRecentMovements:
    (state) =>
    (limit = 10) => {
      return state.movements
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
    },

  // Requests getters
  getRequestById: (state) => (id) => {
    return state.requests.find((request) => request.id === id);
  },

  getRequestsByStatus: (state) => (status) => {
    return state.requests.filter((request) => request.status === status);
  },

  getPendingRequestsCount: (state) => {
    return state.requests.filter((request) => request.status === 'pending').length;
  },

  getApprovedRequestsCount: (state) => {
    return state.requests.filter((request) => request.status === 'approved').length;
  },

  getRejectedRequestsCount: (state) => {
    return state.requests.filter((request) => request.status === 'rejected').length;
  },

  getMyRequestsCount: (state) => {
    return state.myRequests.length;
  },

  getPendingApprovalRequestsCount: (state) => {
    return state.pendingApprovalRequests.length;
  },

  // Dispensaries getters
  getDispensaryById: (state) => (id) => {
    return state.dispensaries.find((dispensary) => dispensary.id === id);
  },

  getActiveDispensariesCount: (state) => {
    return state.dispensaries.filter((dispensary) => dispensary.status === 'active').length;
  },

  getDispensariesByType: (state) => (type) => {
    return state.dispensaries.filter((dispensary) => dispensary.type === type);
  },

  // Loading states getters
  isLoading: (state) => (operation) => {
    return state.loadingStates[operation] || false;
  },

  isAnyLoading: (state) => {
    return Object.values(state.loadingStates).some((loading) => loading);
  },

  getLoadingOperations: (state) => {
    return Object.keys(state.loadingStates).filter((operation) => state.loadingStates[operation]);
  },

  // General loading state
  isGeneralLoading: (state) => {
    return state.loading;
  },

  // Specific loading state getters for test component compatibility
  isCategoriesLoading: (state) => {
    return state.loadingStates.categories || false;
  },

  isSubcategoriesLoading: (state) => {
    return state.loadingStates.subcategories || false;
  },

  isItemsLoading: (state) => {
    return state.loadingStates.items || false;
  },

  isMovementsLoading: (state) => {
    return state.loadingStates.movements || false;
  },

  isRequestsLoading: (state) => {
    return state.loadingStates.requests || false;
  },

  // Error state getters
  hasError: (state) => {
    return !!state.error;
  },

  getErrorMessage: (state) => {
    return state.error;
  },

  getErrorDetails: (state) => {
    return state.errorDetails;
  },

  // Pagination getters
  getCurrentPage: (state) => {
    return state.pagination.currentPage;
  },

  getTotalPages: (state) => {
    return state.pagination.totalPages;
  },

  getTotalItems: (state) => {
    return state.pagination.totalItems;
  },

  hasNextPage: (state) => {
    return state.pagination.hasNextPage;
  },

  hasPrevPage: (state) => {
    return state.pagination.hasPrevPage;
  },

  // Filters getters
  getActiveFilters: (state) => {
    const activeFilters = {};
    Object.keys(state.filters).forEach((key) => {
      if (state.filters[key] !== null && state.filters[key] !== '') {
        activeFilters[key] = state.filters[key];
      }
    });
    return activeFilters;
  },

  hasActiveFilters: (state) => {
    return Object.values(state.filters).some((filter) => filter !== null && filter !== '');
  },

  getSearchTerm: (state) => {
    return state.filters.search;
  },

  getSelectedCategory: (state) => {
    return state.filters.category_id;
  },

  getSelectedSubcategory: (state) => {
    return state.filters.subcategory_id;
  },

  getSelectedStatus: (state) => {
    return state.filters.status;
  },

  // Dashboard getters
  getDashboardStats: (state) => {
    return state.dashboardStats;
  },

  getTotalItemsCount: (state) => {
    return state.dashboardStats?.totalItems || 0;
  },

  getTotalCategoriesCount: (state) => {
    return state.dashboardStats?.totalCategories || 0;
  },

  getTotalMovementsCount: (state) => {
    return state.dashboardStats?.totalMovements || 0;
  },

  getTotalRequestsCount: (state) => {
    return state.dashboardStats?.totalRequests || 0;
  },

  // Total count getters for test component compatibility
  totalCategories: (state) => {
    return state.categories.length;
  },

  totalSubcategories: (state) => {
    return state.subcategories.length;
  },

  totalItems: (state) => {
    return state.items.length;
  },

  totalMovements: (state) => {
    return state.movements.length;
  },

  totalRequests: (state) => {
    return state.requests.length;
  },

  // Reports getters
  getStockReport: (state) => {
    return state.stockReport;
  },

  getMovementReport: (state) => {
    return state.movementReport;
  },

  getUsageReport: (state) => {
    return state.usageReport;
  },

  getCostReport: (state) => {
    return state.costReport;
  },

  getRecentReports: (state) => {
    return state.recentReports;
  },

  getRecentReportsCount: (state) => {
    return state.recentReports.length;
  },

  // Settings getters
  getSettings: (state) => {
    return state.settings;
  },

  getSetting: (state) => (key) => {
    return state.settings[key];
  },

  getNotificationSettings: (state) => {
    return state.settings.notifications || {};
  },

  getDisplaySettings: (state) => {
    return state.settings.display || {};
  },

  // Derived calculation getters for test component compatibility
  averageItemsPerCategory: (state) => {
    if (state.categories.length === 0) return 0;
    return Math.round((state.items.length / state.categories.length) * 100) / 100;
  },

  averageSubcategoriesPerCategory: (state) => {
    if (state.categories.length === 0) return 0;
    return Math.round((state.subcategories.length / state.categories.length) * 100) / 100;
  },

  totalStockValue: (state) => {
    return state.items.reduce((total, item) => {
      const quantity = item.current_stock || 0;
      const price = item.unit_price || 0;
      return total + quantity * price;
    }, 0);
  },

  lowStockItemsCount: (state) => {
    return state.items.filter((item) => {
      const currentStock = item.current_stock || 0;
      const minStock = item.minimum_stock || 0;
      return currentStock <= minStock;
    }).length;
  },

  outOfStockItemsCount: (state) => {
    return state.items.filter((item) => (item.current_stock || 0) === 0).length;
  },

  pendingRequestsCount: (state) => {
    return state.requests.filter((request) => request.status === 'pending').length;
  },

  approvedRequestsCount: (state) => {
    return state.requests.filter((request) => request.status === 'approved').length;
  },

  rejectedRequestsCount: (state) => {
    return state.requests.filter((request) => request.status === 'rejected').length;
  },

  // Utility getters
  isEmpty: (state) => (collection) => {
    return !state[collection] || state[collection].length === 0;
  },

  getCollectionCount: (state) => (collection) => {
    return state[collection] ? state[collection].length : 0;
  },
};
