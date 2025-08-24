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
    const index = state.categories.findIndex(cat => cat.id === updatedCategory.id);
    if (index !== -1) {
      state.categories.splice(index, 1, updatedCategory);
    }
  },
  DELETE_CATEGORY(state, categoryId) {
    state.categories = state.categories.filter(cat => cat.id !== categoryId);
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
    const index = state.subcategories.findIndex(sub => sub.id === updatedSubcategory.id);
    if (index !== -1) {
      state.subcategories.splice(index, 1, updatedSubcategory);
    }
  },
  DELETE_SUBCATEGORY(state, subcategoryId) {
    state.subcategories = state.subcategories.filter(sub => sub.id !== subcategoryId);
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
    const index = state.items.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      state.items.splice(index, 1, updatedItem);
    }
  },
  DELETE_ITEM(state, itemId) {
    state.items = state.items.filter(item => item.id !== itemId);
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
    const index = state.requests.findIndex(req => req.id === updatedRequest.id);
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

  // UI State
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters };
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination };
  },
  CLEAR_ERROR(state) {
    state.error = null;
  },
};
