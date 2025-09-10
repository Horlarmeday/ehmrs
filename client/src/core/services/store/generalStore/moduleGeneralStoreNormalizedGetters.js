// Normalized getters for entity-based state management
// Provides efficient data access patterns with memoization

const normalizedGetters = {
  // Categories getters
  allCategories: (state) => {
    return state.entities.categories.allIds.map((id) => state.entities.categories.byId[id]);
  },

  getCategoryById: (state) => (id) => {
    return state.entities.categories.byId[id] || null;
  },

  currentCategory: (state, getters) => {
    return state.currentSelections.categoryId
      ? getters.getCategoryById(state.currentSelections.categoryId)
      : null;
  },

  categoriesCount: (state) => {
    return state.entities.categories.allIds.length;
  },

  categoriesMetadata: (state) => {
    return state.metadata.categories;
  },

  // Subcategories getters
  allSubcategories: (state) => {
    return state.entities.subcategories.allIds.map((id) => state.entities.subcategories.byId[id]);
  },

  getSubcategoryById: (state) => (id) => {
    return state.entities.subcategories.byId[id] || null;
  },

  subcategoriesByCategory: (state) => (categoryId) => {
    const subcategoryIds = state.entities.subcategories.byCategory[categoryId] || [];
    return subcategoryIds.map((id) => state.entities.subcategories.byId[id]).filter(Boolean);
  },

  currentSubcategory: (state, getters) => {
    return state.currentSelections.subcategoryId
      ? getters.getSubcategoryById(state.currentSelections.subcategoryId)
      : null;
  },

  subcategoriesCount: (state) => {
    return state.entities.subcategories.allIds.length;
  },

  subcategoriesMetadata: (state) => {
    return state.metadata.subcategories;
  },

  // Items getters
  allItems: (state) => {
    return state.entities.items.allIds.map((id) => state.entities.items.byId[id]);
  },

  getItemById: (state) => (id) => {
    return state.entities.items.byId[id] || null;
  },

  itemsByCategory: (state) => (categoryId) => {
    const itemIds = state.entities.items.byCategory[categoryId] || [];
    return itemIds.map((id) => state.entities.items.byId[id]).filter(Boolean);
  },

  itemsBySubcategory: (state) => (subcategoryId) => {
    const itemIds = state.entities.items.bySubcategory[subcategoryId] || [];
    return itemIds.map((id) => state.entities.items.byId[id]).filter(Boolean);
  },

  lowStockItems: (state) => {
    return state.entities.items.lowStock.map((id) => state.entities.items.byId[id]).filter(Boolean);
  },

  expiringItems: (state) => {
    return state.entities.items.expiring.map((id) => state.entities.items.byId[id]).filter(Boolean);
  },

  currentItem: (state, getters) => {
    return state.currentSelections.itemId
      ? getters.getItemById(state.currentSelections.itemId)
      : null;
  },

  itemsCount: (state) => {
    return state.entities.items.allIds.length;
  },

  lowStockCount: (state) => {
    return state.entities.items.lowStock.length;
  },

  expiringCount: (state) => {
    return state.entities.items.expiring.length;
  },

  itemsMetadata: (state) => {
    return state.metadata.items;
  },

  // Filtered items with search and category filters
  filteredItems: (state, getters) => {
    let items = getters.allItems;
    const filters = state.ui.filters;

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchTerm) ||
          item.description?.toLowerCase().includes(searchTerm) ||
          item.code?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.category_id) {
      items = items.filter((item) => item.category_id === filters.category_id);
    }

    // Apply subcategory filter
    if (filters.subcategory_id) {
      items = items.filter((item) => item.subcategory_id === filters.subcategory_id);
    }

    // Apply status filter
    if (filters.status) {
      switch (filters.status) {
        case 'low_stock':
          items = items.filter((item) => item.is_low_stock);
          break;
        case 'expiring':
          items = items.filter((item) => item.is_expiring);
          break;
        case 'active':
          items = items.filter((item) => item.status === 'active');
          break;
        case 'inactive':
          items = items.filter((item) => item.status === 'inactive');
          break;
      }
    }

    return items;
  },

  // Movements getters
  allMovements: (state) => {
    return state.entities.movements.allIds.map((id) => state.entities.movements.byId[id]);
  },

  getMovementById: (state) => (id) => {
    return state.entities.movements.byId[id] || null;
  },

  movementsByItem: (state) => (itemId) => {
    const movementIds = state.entities.movements.byItem[itemId] || [];
    return movementIds.map((id) => state.entities.movements.byId[id]).filter(Boolean);
  },

  movementsByDate: (state) => (date) => {
    const movementIds = state.entities.movements.byDate[date] || [];
    return movementIds.map((id) => state.entities.movements.byId[id]).filter(Boolean);
  },

  movementsCount: (state) => {
    return state.entities.movements.allIds.length;
  },

  movementsMetadata: (state) => {
    return state.metadata.movements;
  },

  // Recent movements (last 10)
  recentMovements: (state, getters) => {
    return getters.allMovements
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);
  },

  // Requests getters
  allRequests: (state) => {
    return state.entities.requests.allIds.map((id) => state.entities.requests.byId[id]);
  },

  getRequestById: (state) => (id) => {
    return state.entities.requests.byId[id] || null;
  },

  requestsByStatus: (state) => (status) => {
    const requestIds = state.entities.requests.byStatus[status] || [];
    return requestIds.map((id) => state.entities.requests.byId[id]).filter(Boolean);
  },

  requestsByUser: (state) => (userId) => {
    const requestIds = state.entities.requests.byUser[userId] || [];
    return requestIds.map((id) => state.entities.requests.byId[id]).filter(Boolean);
  },

  myRequests: (state) => {
    return state.entities.requests.myRequests
      .map((id) => state.entities.requests.byId[id])
      .filter(Boolean);
  },

  pendingApprovalRequests: (state) => {
    return state.entities.requests.pendingApproval
      .map((id) => state.entities.requests.byId[id])
      .filter(Boolean);
  },

  currentRequest: (state, getters) => {
    return state.currentSelections.requestId
      ? getters.getRequestById(state.currentSelections.requestId)
      : null;
  },

  requestsCount: (state) => {
    return state.entities.requests.allIds.length;
  },

  pendingRequestsCount: (state) => {
    return state.entities.requests.pendingApproval.length;
  },

  myRequestsCount: (state) => {
    return state.entities.requests.myRequests.length;
  },

  requestsMetadata: (state) => {
    return state.metadata.requests;
  },

  // Filtered requests
  filteredRequests: (state, getters) => {
    let requests = getters.allRequests;
    const filters = state.ui.filters;

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      requests = requests.filter(
        (request) =>
          request.title?.toLowerCase().includes(searchTerm) ||
          request.description?.toLowerCase().includes(searchTerm) ||
          request.request_number?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (filters.status) {
      requests = requests.filter((request) => request.status === filters.status);
    }

    // Apply date range filter
    if (filters.start_date && filters.end_date) {
      requests = requests.filter((request) => {
        const requestDate = new Date(request.created_at);
        const startDate = new Date(filters.start_date);
        const endDate = new Date(filters.end_date);
        return requestDate >= startDate && requestDate <= endDate;
      });
    }

    return requests;
  },

  // Dispensaries getters
  allDispensaries: (state) => {
    return state.entities.dispensaries.allIds.map((id) => state.entities.dispensaries.byId[id]);
  },

  getDispensaryById: (state) => (id) => {
    return state.entities.dispensaries.byId[id] || null;
  },

  dispensaryStock: (state) => (dispensaryId) => {
    return state.entities.dispensaries.stockByDispensary[dispensaryId] || {};
  },

  dispensaryStockItems: (state, getters) => (dispensaryId) => {
    const stock = getters.dispensaryStock(dispensaryId);
    return Object.values(stock);
  },

  currentDispensary: (state, getters) => {
    return state.currentSelections.dispensaryId
      ? getters.getDispensaryById(state.currentSelections.dispensaryId)
      : null;
  },

  dispensariesCount: (state) => {
    return state.entities.dispensaries.allIds.length;
  },

  dispensariesMetadata: (state) => {
    return state.metadata.dispensaries;
  },

  // Reports getters (non-normalized)
  stockReport: (state) => {
    return state.reports.stock;
  },

  movementReport: (state) => {
    return state.reports.movement;
  },

  usageReport: (state) => {
    return state.reports.usage;
  },

  costReport: (state) => {
    return state.reports.cost;
  },

  recentReports: (state) => {
    return state.reports.recent;
  },

  // Dashboard getters
  dashboardStats: (state) => {
    return state.dashboard.stats;
  },

  dashboardMetrics: (state) => {
    return state.dashboard.metrics;
  },

  dashboardLastUpdated: (state) => {
    return state.dashboard.lastUpdated;
  },

  // Settings getters
  settings: (state) => {
    return state.settings.data;
  },

  settingsLastUpdated: (state) => {
    return state.settings.lastUpdated;
  },

  // UI State getters
  isLoading: (state) => {
    return state.ui.loading;
  },

  error: (state) => {
    return state.ui.error;
  },

  errorDetails: (state) => {
    return state.ui.errorDetails;
  },

  pagination: (state) => {
    return state.ui.pagination;
  },

  filters: (state) => {
    return state.ui.filters;
  },

  loadingStates: (state) => {
    return state.ui.loadingStates;
  },

  isLoadingEntity: (state) => (entity) => {
    return state.ui.loadingStates[entity] || false;
  },

  // Cache getters
  cacheConfig: (state) => {
    return state.cache.config;
  },

  isCacheStale: (state) => (entity) => {
    const metadata = state.metadata[entity];
    if (!metadata || !metadata.lastFetch) return true;

    const now = Date.now();
    const age = now - metadata.lastFetch;
    return age > state.cache.config.ttl || metadata.isStale;
  },

  cacheAge: (state) => (entity) => {
    const metadata = state.metadata[entity];
    if (!metadata || !metadata.lastFetch) return null;

    return Date.now() - metadata.lastFetch;
  },

  // Derived statistics
  totalItemsValue: (state, getters) => {
    return getters.allItems.reduce((total, item) => {
      return total + (item.unit_price * item.quantity || 0);
    }, 0);
  },

  averageItemPrice: (state, getters) => {
    const items = getters.allItems;
    if (items.length === 0) return 0;

    const totalPrice = items.reduce((total, item) => total + (item.unit_price || 0), 0);
    return totalPrice / items.length;
  },

  categoryDistribution: (state, getters) => {
    const distribution = {};
    getters.allItems.forEach((item) => {
      const categoryId = item.category_id;
      if (categoryId) {
        const category = getters.getCategoryById(categoryId);
        const categoryName = category ? category.name : 'Unknown';
        distribution[categoryName] = (distribution[categoryName] || 0) + 1;
      }
    });
    return distribution;
  },

  requestStatusDistribution: (state, getters) => {
    const distribution = {};
    getters.allRequests.forEach((request) => {
      const status = request.status || 'unknown';
      distribution[status] = (distribution[status] || 0) + 1;
    });
    return distribution;
  },

  // Search and filter helpers
  hasActiveFilters: (state) => {
    const filters = state.ui.filters;
    return !!(
      filters.search ||
      filters.category_id ||
      filters.subcategory_id ||
      filters.status ||
      filters.start_date ||
      filters.end_date
    );
  },

  activeFiltersCount: (state, getters) => {
    if (!getters.hasActiveFilters) return 0;

    const filters = state.ui.filters;
    let count = 0;
    if (filters.search) count++;
    if (filters.category_id) count++;
    if (filters.subcategory_id) count++;
    if (filters.status) count++;
    if (filters.start_date && filters.end_date) count++;
    return count;
  },

  // Entity relationship helpers
  getItemWithRelations: (state, getters) => (itemId) => {
    const item = getters.getItemById(itemId);
    if (!item) return null;

    return {
      ...item,
      category: item.category_id ? getters.getCategoryById(item.category_id) : null,
      subcategory: item.subcategory_id ? getters.getSubcategoryById(item.subcategory_id) : null,
      movements: getters.movementsByItem(itemId),
    };
  },

  getRequestWithRelations: (state, getters) => (requestId) => {
    const request = getters.getRequestById(requestId);
    if (!request) return null;

    return {
      ...request,
      items: request.items
        ? request.items.map((item) => ({
            ...item,
            itemDetails: getters.getItemById(item.item_id),
          }))
        : [],
    };
  },

  // Performance monitoring
  entityCacheStatus: (state, getters) => {
    const entities = Object.keys(state.entities);
    return entities.reduce((status, entity) => {
      status[entity] = {
        count: state.entities[entity].allIds.length,
        isStale: getters.isCacheStale(entity),
        age: getters.cacheAge(entity),
        lastFetch: state.metadata[entity]?.lastFetch,
      };
      return status;
    }, {});
  },
};

module.exports = normalizedGetters;
