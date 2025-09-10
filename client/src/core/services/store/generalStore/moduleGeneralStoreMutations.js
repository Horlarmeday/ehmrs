export default {
  // Categories
  SET_CATEGORIES(state, categories) {
    state.categories = categories;
  },
  SET_CATEGORIES_TOTAL(state, total) {
    state.categoriesTotal = total;
  },
  SET_CATEGORIES_PAGES(state, pages) {
    state.categoriesPages = pages;
  },
  SET_CURRENT_CATEGORY(state, category) {
    state.currentCategory = category;
  },
  ADD_CATEGORY(state, category) {
    state.categories.unshift(category);
  },
  UPDATE_CATEGORY(state, updatedCategory) {
    const index = state.categories.findIndex((cat) => cat.id === updatedCategory.id);
    if (index !== -1) {
      state.categories.splice(index, 1, updatedCategory);
    }
  },
  DELETE_CATEGORY(state, categoryId) {
    state.categories = state.categories.filter((cat) => cat.id !== categoryId);
  },

  // Subcategories
  SET_SUBCATEGORIES(state, subcategories) {
    state.subcategories = subcategories;
  },
  SET_SUBCATEGORIES_TOTAL(state, total) {
    state.subcategoriesTotal = total;
  },
  SET_SUBCATEGORIES_PAGES(state, pages) {
    state.subcategoriesPages = pages;
  },
  SET_CURRENT_SUBCATEGORY(state, subcategory) {
    state.currentSubcategory = subcategory;
  },
  ADD_SUBCATEGORY(state, subcategory) {
    state.subcategories.unshift(subcategory);
  },
  UPDATE_SUBCATEGORY(state, updatedSubcategory) {
    const index = state.subcategories.findIndex((sub) => sub.id === updatedSubcategory.id);
    if (index !== -1) {
      state.subcategories.splice(index, 1, updatedSubcategory);
    }
  },
  DELETE_SUBCATEGORY(state, subcategoryId) {
    state.subcategories = state.subcategories.filter((sub) => sub.id !== subcategoryId);
  },

  // Items
  SET_ITEMS(state, items) {
    state.items = items;
  },
  SET_ITEMS_TOTAL(state, total) {
    state.itemsTotal = total;
  },
  SET_ITEMS_PAGES(state, pages) {
    state.itemsPages = pages;
  },
  SET_CURRENT_ITEM(state, item) {
    state.currentItem = item;
  },
  ADD_ITEM(state, item) {
    state.items.unshift(item);
  },
  UPDATE_ITEM(state, updatedItem) {
    const index = state.items.findIndex((item) => item.id === updatedItem.id);
    if (index !== -1) {
      state.items.splice(index, 1, updatedItem);
    }
  },
  DELETE_ITEM(state, itemId) {
    state.items = state.items.filter((item) => item.id !== itemId);
  },
  SET_LOW_STOCK_ITEMS(state, items) {
    state.lowStockItems = items;
  },
  SET_EXPIRING_ITEMS(state, items) {
    state.expiringItems = items;
  },

  // Stock Movements
  SET_MOVEMENTS(state, movements) {
    state.movements = movements;
  },
  SET_MOVEMENTS_TOTAL(state, total) {
    state.movementsTotal = total;
  },
  SET_MOVEMENTS_PAGES(state, pages) {
    state.movementsPages = pages;
  },
  SET_ITEM_MOVEMENTS(state, movements) {
    state.itemMovements = movements;
  },
  ADD_MOVEMENT(state, movement) {
    state.movements.unshift(movement);
  },

  // Requests
  SET_REQUESTS(state, requests) {
    state.requests = requests;
  },
  SET_REQUESTS_TOTAL(state, total) {
    state.requestsTotal = total;
  },
  SET_REQUESTS_PAGES(state, pages) {
    state.requestsPages = pages;
  },
  SET_CURRENT_REQUEST(state, request) {
    state.currentRequest = request;
  },
  ADD_REQUEST(state, request) {
    state.requests.unshift(request);
  },
  UPDATE_REQUEST(state, updatedRequest) {
    const index = state.requests.findIndex((req) => req.id === updatedRequest.id);
    if (index !== -1) {
      state.requests.splice(index, 1, updatedRequest);
    }
  },
  SET_MY_REQUESTS(state, requests) {
    state.myRequests = requests;
  },
  SET_PENDING_APPROVAL_REQUESTS(state, requests) {
    state.pendingApprovalRequests = requests;
  },

  // Dispensaries
  SET_DISPENSARIES(state, dispensaries) {
    state.dispensaries = dispensaries;
  },
  SET_DISPENSARIES_TOTAL(state, total) {
    state.dispensariesTotal = total;
  },
  SET_DISPENSARIES_PAGES(state, pages) {
    state.dispensariesPages = pages;
  },
  SET_CURRENT_DISPENSARY(state, dispensary) {
    state.currentDispensary = dispensary;
  },
  ADD_DISPENSARY(state, dispensary) {
    state.dispensaries.unshift(dispensary);
  },
  UPDATE_DISPENSARY(state, updatedDispensary) {
    const index = state.dispensaries.findIndex((disp) => disp.id === updatedDispensary.id);
    if (index !== -1) {
      state.dispensaries.splice(index, 1, updatedDispensary);
    }
  },
  DELETE_DISPENSARY(state, dispensaryId) {
    state.dispensaries = state.dispensaries.filter((disp) => disp.id !== dispensaryId);
  },
  SET_DISPENSARY_STOCK(state, stock) {
    state.dispensaryStock = stock;
  },
  SET_DISPENSARY_METRICS(state, metrics) {
    state.dispensaryMetrics = metrics;
  },

  // Reports
  SET_STOCK_REPORT(state, report) {
    state.stockReport = report;
  },
  SET_MOVEMENT_REPORT(state, report) {
    state.movementReport = report;
  },
  SET_USAGE_REPORT(state, report) {
    state.usageReport = report;
  },
  SET_COST_REPORT(state, report) {
    state.costReport = report;
  },
  SET_RECENT_REPORTS(state, reports) {
    state.recentReports = reports;
  },

  // Dashboard
  SET_DASHBOARD_STATS(state, stats) {
    state.dashboardStats = stats;
  },

  // UI State
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  SET_ERROR_DETAILS(state, errorDetails) {
    state.errorDetails = errorDetails;
  },
  CLEAR_ERROR(state) {
    state.error = null;
    state.errorDetails = null;
  },

  // Standardized pagination mutations
  UPDATE_PAGINATION(state, { currentPage, pageLimit, totalItems, totalPages }) {
    state.pagination.currentPage = currentPage || state.pagination.currentPage;
    state.pagination.pageLimit = pageLimit || state.pagination.pageLimit;
    state.pagination.totalItems = totalItems || state.pagination.totalItems;
    state.pagination.totalPages = totalPages || state.pagination.totalPages;
    state.pagination.hasNextPage = state.pagination.currentPage < state.pagination.totalPages;
    state.pagination.hasPrevPage = state.pagination.currentPage > 1;
  },
  RESET_PAGINATION(state) {
    state.pagination = {
      currentPage: 1,
      pageLimit: 20,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  },

  // Standardized filter mutations
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters };
  },
  CLEAR_FILTERS(state) {
    state.filters = {
      search: '',
      category_id: null,
      subcategory_id: null,
      status: null,
      dateRange: null,
      start_date: null,
      end_date: null,
    };
  },
  SET_FILTER(state, { key, value }) {
    state.filters[key] = value;
  },
  CLEAR_FILTER(state, key) {
    state.filters[key] = null;
  },

  // Standardized loading state mutations
  SET_LOADING_STATE(state, { operation, loading }) {
    state.loadingStates[operation] = loading;
  },
  SET_MULTIPLE_LOADING_STATES(state, loadingStates) {
    Object.keys(loadingStates).forEach((operation) => {
      state.loadingStates[operation] = loadingStates[operation];
    });
  },
  CLEAR_ALL_LOADING_STATES(state) {
    Object.keys(state.loadingStates).forEach((operation) => {
      state.loadingStates[operation] = false;
    });
  },

  // State cleanup mutations
  CLEAR_CATEGORIES_STATE(state) {
    state.categories = [];
    state.categoriesTotal = 0;
    state.categoriesPages = 0;
    state.currentCategory = null;
  },

  CLEAR_SUBCATEGORIES_STATE(state) {
    state.subcategories = [];
    state.subcategoriesTotal = 0;
    state.subcategoriesPages = 0;
    state.currentSubcategory = null;
  },

  CLEAR_ITEMS_STATE(state) {
    state.items = [];
    state.itemsTotal = 0;
    state.itemsPages = 0;
    state.currentItem = null;
    state.lowStockItems = [];
    state.expiringItems = [];
  },

  CLEAR_MOVEMENTS_STATE(state) {
    state.movements = [];
    state.movementsTotal = 0;
    state.movementsPages = 0;
    state.itemMovements = [];
  },

  CLEAR_REQUESTS_STATE(state) {
    state.requests = [];
    state.requestsTotal = 0;
    state.requestsPages = 0;
    state.currentRequest = null;
    state.myRequests = [];
    state.pendingApprovalRequests = [];
  },

  CLEAR_DISPENSARIES_STATE(state) {
    state.dispensaries = [];
    state.dispensariesTotal = 0;
    state.dispensariesPages = 0;
    state.currentDispensary = null;
    state.dispensaryStock = [];
    state.dispensaryMetrics = null;
  },

  CLEAR_REPORTS_STATE(state) {
    state.stockReport = null;
    state.movementReport = null;
    state.usageReport = null;
    state.costReport = null;
    state.recentReports = [];
  },

  CLEAR_DASHBOARD_STATE(state) {
    state.dashboardStats = null;
  },

  CLEAR_ALL_STATE(state) {
    // Clear all entity states
    state.categories = [];
    state.categoriesTotal = 0;
    state.categoriesPages = 0;
    state.currentCategory = null;

    state.subcategories = [];
    state.subcategoriesTotal = 0;
    state.subcategoriesPages = 0;
    state.currentSubcategory = null;

    state.items = [];
    state.itemsTotal = 0;
    state.itemsPages = 0;
    state.currentItem = null;
    state.lowStockItems = [];
    state.expiringItems = [];

    state.movements = [];
    state.movementsTotal = 0;
    state.movementsPages = 0;
    state.itemMovements = [];

    state.requests = [];
    state.requestsTotal = 0;
    state.requestsPages = 0;
    state.currentRequest = null;
    state.myRequests = [];
    state.pendingApprovalRequests = [];

    state.dispensaries = [];
    state.dispensariesTotal = 0;
    state.dispensariesPages = 0;
    state.currentDispensary = null;
    state.dispensaryStock = [];
    state.dispensaryMetrics = null;

    state.stockReport = null;
    state.movementReport = null;
    state.usageReport = null;
    state.costReport = null;
    state.recentReports = [];

    state.dashboardStats = null;

    // Clear UI state
    state.loading = false;
    state.error = null;
    state.errorDetails = null;

    // Clear pagination
    state.pagination = {
      currentPage: 1,
      pageLimit: 20,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };

    // Clear filters
    state.filters = {
      search: '',
      category_id: null,
      subcategory_id: null,
      status: null,
      dateRange: null,
      start_date: null,
      end_date: null,
    };

    // Clear loading states
    Object.keys(state.loadingStates).forEach((operation) => {
      state.loadingStates[operation] = false;
    });
  },

  // Settings
  SET_SETTINGS(state, payload) {
    state.settings = payload;
  },

  // Update individual items
  // UPDATE_REQUEST(state, request) {
  //   const index = state.requests.findIndex((r) => r.id === request.id);
  //   if (index !== -1) {
  //     state.requests.splice(index, 1, request);
  //   }
  // },

  UPDATE_MOVEMENT(state, movement) {
    const index = state.movements.findIndex((m) => m.id === movement.id);
    if (index !== -1) {
      state.movements.splice(index, 1, movement);
    }
  },

  // UPDATE_ITEM(state, item) {
  //   const index = state.items.findIndex((i) => i.id === item.id);
  //   if (index !== -1) {
  //     state.items.splice(index, 1, item);
  //   }
  // },

  // UPDATE_CATEGORY(state, category) {
  //   const index = state.categories.findIndex((c) => c.id === category.id);
  //   if (index !== -1) {
  //     state.categories.splice(index, 1, category);
  //   }
  // },

  // UPDATE_SUBCATEGORY(state, subcategory) {
  //   const index = state.subcategories.findIndex((s) => s.id === subcategory.id);
  //   if (index !== -1) {
  //     state.subcategories.splice(index, 1, subcategory);
  //   }
  // },

  // UPDATE_DISPENSARY(state, dispensary) {
  //   const index = state.dispensaries.findIndex((d) => d.id === dispensary.id);
  //   if (index !== -1) {
  //     state.dispensaries.splice(index, 1, dispensary);
  //   }
  // },
};
