// Normalized mutations for entity-based state management
// Maintains lookup tables and relationships between entities

// Helper functions for normalization
const normalizeArray = (array, idField = 'id') => {
  const byId = {};
  const allIds = [];

  array.forEach((item) => {
    const id = item[idField];
    byId[id] = item;
    allIds.push(id);
  });

  return { byId, allIds };
};

const addToLookup = (lookup, key, value) => {
  if (!lookup[key]) {
    lookup[key] = [];
  }
  if (!lookup[key].includes(value)) {
    lookup[key].push(value);
  }
};

const removeFromLookup = (lookup, key, value) => {
  if (lookup[key]) {
    lookup[key] = lookup[key].filter((id) => id !== value);
    if (lookup[key].length === 0) {
      delete lookup[key];
    }
  }
};

const normalizedMutations = {
  // Categories mutations
  SET_CATEGORIES(state, categories) {
    const normalized = normalizeArray(categories);
    state.entities.categories.byId = normalized.byId;
    state.entities.categories.allIds = normalized.allIds;
    state.metadata.categories.lastFetch = Date.now();
    state.metadata.categories.isStale = false;
  },

  ADD_CATEGORY(state, category) {
    state.entities.categories.byId[category.id] = category;
    if (!state.entities.categories.allIds.includes(category.id)) {
      state.entities.categories.allIds.unshift(category.id);
    }
  },

  UPDATE_CATEGORY(state, category) {
    if (state.entities.categories.byId[category.id]) {
      state.entities.categories.byId[category.id] = {
        ...state.entities.categories.byId[category.id],
        ...category,
      };
    }
  },

  DELETE_CATEGORY(state, categoryId) {
    delete state.entities.categories.byId[categoryId];
    state.entities.categories.allIds = state.entities.categories.allIds.filter(
      (id) => id !== categoryId
    );

    // Clean up related subcategories and items
    if (state.entities.subcategories.byCategory[categoryId]) {
      state.entities.subcategories.byCategory[categoryId].forEach((subcategoryId) => {
        delete state.entities.subcategories.byId[subcategoryId];
        state.entities.subcategories.allIds = state.entities.subcategories.allIds.filter(
          (id) => id !== subcategoryId
        );
      });
      delete state.entities.subcategories.byCategory[categoryId];
    }

    if (state.entities.items.byCategory[categoryId]) {
      state.entities.items.byCategory[categoryId].forEach((itemId) => {
        delete state.entities.items.byId[itemId];
        state.entities.items.allIds = state.entities.items.allIds.filter((id) => id !== itemId);
      });
      delete state.entities.items.byCategory[categoryId];
    }
  },

  // Subcategories mutations
  SET_SUBCATEGORIES(state, subcategories) {
    const normalized = normalizeArray(subcategories);
    state.entities.subcategories.byId = normalized.byId;
    state.entities.subcategories.allIds = normalized.allIds;

    // Build category lookup
    state.entities.subcategories.byCategory = {};
    subcategories.forEach((subcategory) => {
      if (subcategory.category_id) {
        addToLookup(
          state.entities.subcategories.byCategory,
          subcategory.category_id,
          subcategory.id
        );
      }
    });

    state.metadata.subcategories.lastFetch = Date.now();
    state.metadata.subcategories.isStale = false;
  },

  ADD_SUBCATEGORY(state, subcategory) {
    state.entities.subcategories.byId[subcategory.id] = subcategory;
    if (!state.entities.subcategories.allIds.includes(subcategory.id)) {
      state.entities.subcategories.allIds.unshift(subcategory.id);
    }

    if (subcategory.category_id) {
      addToLookup(state.entities.subcategories.byCategory, subcategory.category_id, subcategory.id);
    }
  },

  UPDATE_SUBCATEGORY(state, subcategory) {
    const existing = state.entities.subcategories.byId[subcategory.id];
    if (existing) {
      // Handle category change
      if (existing.category_id !== subcategory.category_id) {
        removeFromLookup(
          state.entities.subcategories.byCategory,
          existing.category_id,
          subcategory.id
        );
        if (subcategory.category_id) {
          addToLookup(
            state.entities.subcategories.byCategory,
            subcategory.category_id,
            subcategory.id
          );
        }
      }

      state.entities.subcategories.byId[subcategory.id] = { ...existing, ...subcategory };
    }
  },

  DELETE_SUBCATEGORY(state, subcategoryId) {
    const subcategory = state.entities.subcategories.byId[subcategoryId];
    if (subcategory) {
      delete state.entities.subcategories.byId[subcategoryId];
      state.entities.subcategories.allIds = state.entities.subcategories.allIds.filter(
        (id) => id !== subcategoryId
      );

      if (subcategory.category_id) {
        removeFromLookup(
          state.entities.subcategories.byCategory,
          subcategory.category_id,
          subcategoryId
        );
      }

      // Clean up related items
      if (state.entities.items.bySubcategory[subcategoryId]) {
        state.entities.items.bySubcategory[subcategoryId].forEach((itemId) => {
          delete state.entities.items.byId[itemId];
          state.entities.items.allIds = state.entities.items.allIds.filter((id) => id !== itemId);
        });
        delete state.entities.items.bySubcategory[subcategoryId];
      }
    }
  },

  // Items mutations
  SET_ITEMS(state, items) {
    const normalized = normalizeArray(items);
    state.entities.items.byId = normalized.byId;
    state.entities.items.allIds = normalized.allIds;

    // Build lookup tables
    state.entities.items.byCategory = {};
    state.entities.items.bySubcategory = {};
    state.entities.items.lowStock = [];
    state.entities.items.expiring = [];

    items.forEach((item) => {
      if (item.category_id) {
        addToLookup(state.entities.items.byCategory, item.category_id, item.id);
      }
      if (item.subcategory_id) {
        addToLookup(state.entities.items.bySubcategory, item.subcategory_id, item.id);
      }
      if (item.is_low_stock) {
        state.entities.items.lowStock.push(item.id);
      }
      if (item.is_expiring) {
        state.entities.items.expiring.push(item.id);
      }
    });

    state.metadata.items.lastFetch = Date.now();
    state.metadata.items.isStale = false;
  },

  ADD_ITEM(state, item) {
    state.entities.items.byId[item.id] = item;
    if (!state.entities.items.allIds.includes(item.id)) {
      state.entities.items.allIds.unshift(item.id);
    }

    if (item.category_id) {
      addToLookup(state.entities.items.byCategory, item.category_id, item.id);
    }
    if (item.subcategory_id) {
      addToLookup(state.entities.items.bySubcategory, item.subcategory_id, item.id);
    }
    if (item.is_low_stock) {
      state.entities.items.lowStock.push(item.id);
    }
    if (item.is_expiring) {
      state.entities.items.expiring.push(item.id);
    }
  },

  UPDATE_ITEM(state, item) {
    const existing = state.entities.items.byId[item.id];
    if (existing) {
      // Handle category/subcategory changes
      if (existing.category_id !== item.category_id) {
        removeFromLookup(state.entities.items.byCategory, existing.category_id, item.id);
        if (item.category_id) {
          addToLookup(state.entities.items.byCategory, item.category_id, item.id);
        }
      }

      if (existing.subcategory_id !== item.subcategory_id) {
        removeFromLookup(state.entities.items.bySubcategory, existing.subcategory_id, item.id);
        if (item.subcategory_id) {
          addToLookup(state.entities.items.bySubcategory, item.subcategory_id, item.id);
        }
      }

      // Handle stock status changes
      const wasLowStock = state.entities.items.lowStock.includes(item.id);
      const isLowStock = item.is_low_stock;
      if (wasLowStock !== isLowStock) {
        if (isLowStock) {
          state.entities.items.lowStock.push(item.id);
        } else {
          state.entities.items.lowStock = state.entities.items.lowStock.filter(
            (id) => id !== item.id
          );
        }
      }

      const wasExpiring = state.entities.items.expiring.includes(item.id);
      const isExpiring = item.is_expiring;
      if (wasExpiring !== isExpiring) {
        if (isExpiring) {
          state.entities.items.expiring.push(item.id);
        } else {
          state.entities.items.expiring = state.entities.items.expiring.filter(
            (id) => id !== item.id
          );
        }
      }

      state.entities.items.byId[item.id] = { ...existing, ...item };
    }
  },

  DELETE_ITEM(state, itemId) {
    const item = state.entities.items.byId[itemId];
    if (item) {
      delete state.entities.items.byId[itemId];
      state.entities.items.allIds = state.entities.items.allIds.filter((id) => id !== itemId);

      if (item.category_id) {
        removeFromLookup(state.entities.items.byCategory, item.category_id, itemId);
      }
      if (item.subcategory_id) {
        removeFromLookup(state.entities.items.bySubcategory, item.subcategory_id, itemId);
      }

      state.entities.items.lowStock = state.entities.items.lowStock.filter((id) => id !== itemId);
      state.entities.items.expiring = state.entities.items.expiring.filter((id) => id !== itemId);
    }
  },

  // Movements mutations
  SET_MOVEMENTS(state, movements) {
    const normalized = normalizeArray(movements);
    state.entities.movements.byId = normalized.byId;
    state.entities.movements.allIds = normalized.allIds;

    // Build lookup tables
    state.entities.movements.byItem = {};
    state.entities.movements.byDate = {};

    movements.forEach((movement) => {
      if (movement.item_id) {
        addToLookup(state.entities.movements.byItem, movement.item_id, movement.id);
      }
      if (movement.created_at) {
        const date = movement.created_at.split('T')[0]; // Extract date part
        addToLookup(state.entities.movements.byDate, date, movement.id);
      }
    });

    state.metadata.movements.lastFetch = Date.now();
    state.metadata.movements.isStale = false;
  },

  ADD_MOVEMENT(state, movement) {
    state.entities.movements.byId[movement.id] = movement;
    if (!state.entities.movements.allIds.includes(movement.id)) {
      state.entities.movements.allIds.unshift(movement.id);
    }

    if (movement.item_id) {
      addToLookup(state.entities.movements.byItem, movement.item_id, movement.id);
    }
    if (movement.created_at) {
      const date = movement.created_at.split('T')[0];
      addToLookup(state.entities.movements.byDate, date, movement.id);
    }
  },

  // Requests mutations
  SET_REQUESTS(state, requests) {
    const normalized = normalizeArray(requests);
    state.entities.requests.byId = normalized.byId;
    state.entities.requests.allIds = normalized.allIds;

    // Build lookup tables
    state.entities.requests.byStatus = {};
    state.entities.requests.byUser = {};
    state.entities.requests.myRequests = [];
    state.entities.requests.pendingApproval = [];

    requests.forEach((request) => {
      if (request.status) {
        addToLookup(state.entities.requests.byStatus, request.status, request.id);
        if (request.status === 'pending') {
          state.entities.requests.pendingApproval.push(request.id);
        }
      }
      if (request.user_id) {
        addToLookup(state.entities.requests.byUser, request.user_id, request.id);
      }
      if (request.is_my_request) {
        state.entities.requests.myRequests.push(request.id);
      }
    });

    state.metadata.requests.lastFetch = Date.now();
    state.metadata.requests.isStale = false;
  },

  ADD_REQUEST(state, request) {
    state.entities.requests.byId[request.id] = request;
    if (!state.entities.requests.allIds.includes(request.id)) {
      state.entities.requests.allIds.unshift(request.id);
    }

    if (request.status) {
      addToLookup(state.entities.requests.byStatus, request.status, request.id);
      if (request.status === 'pending') {
        state.entities.requests.pendingApproval.push(request.id);
      }
    }
    if (request.user_id) {
      addToLookup(state.entities.requests.byUser, request.user_id, request.id);
    }
    if (request.is_my_request) {
      state.entities.requests.myRequests.push(request.id);
    }
  },

  UPDATE_REQUEST(state, request) {
    const existing = state.entities.requests.byId[request.id];
    if (existing) {
      // Handle status changes
      if (existing.status !== request.status) {
        removeFromLookup(state.entities.requests.byStatus, existing.status, request.id);
        if (request.status) {
          addToLookup(state.entities.requests.byStatus, request.status, request.id);
        }

        // Update pending approval list
        if (existing.status === 'pending') {
          state.entities.requests.pendingApproval = state.entities.requests.pendingApproval.filter(
            (id) => id !== request.id
          );
        }
        if (request.status === 'pending') {
          state.entities.requests.pendingApproval.push(request.id);
        }
      }

      state.entities.requests.byId[request.id] = { ...existing, ...request };
    }
  },

  // Dispensaries mutations
  SET_DISPENSARIES(state, dispensaries) {
    const normalized = normalizeArray(dispensaries);
    state.entities.dispensaries.byId = normalized.byId;
    state.entities.dispensaries.allIds = normalized.allIds;
    state.metadata.dispensaries.lastFetch = Date.now();
    state.metadata.dispensaries.isStale = false;
  },

  SET_DISPENSARY_STOCK(state, { dispensaryId, stock }) {
    if (!state.entities.dispensaries.stockByDispensary[dispensaryId]) {
      state.entities.dispensaries.stockByDispensary[dispensaryId] = {};
    }

    stock.forEach((item) => {
      state.entities.dispensaries.stockByDispensary[dispensaryId][item.item_id] = item;
    });
  },

  // Current selections
  SET_CURRENT_CATEGORY(state, categoryId) {
    state.currentSelections.categoryId = categoryId;
  },

  SET_CURRENT_SUBCATEGORY(state, subcategoryId) {
    state.currentSelections.subcategoryId = subcategoryId;
  },

  SET_CURRENT_ITEM(state, itemId) {
    state.currentSelections.itemId = itemId;
  },

  SET_CURRENT_REQUEST(state, requestId) {
    state.currentSelections.requestId = requestId;
  },

  SET_CURRENT_DISPENSARY(state, dispensaryId) {
    state.currentSelections.dispensaryId = dispensaryId;
  },

  // Metadata mutations
  SET_METADATA(state, { entity, metadata }) {
    if (state.metadata[entity]) {
      state.metadata[entity] = { ...state.metadata[entity], ...metadata };
    }
  },

  MARK_STALE(state, entity) {
    if (state.metadata[entity]) {
      state.metadata[entity].isStale = true;
    }
  },

  // Reports mutations (non-normalized)
  SET_STOCK_REPORT(state, report) {
    state.reports.stock = report;
  },

  SET_MOVEMENT_REPORT(state, report) {
    state.reports.movement = report;
  },

  SET_USAGE_REPORT(state, report) {
    state.reports.usage = report;
  },

  SET_COST_REPORT(state, report) {
    state.reports.cost = report;
  },

  SET_RECENT_REPORTS(state, reports) {
    state.reports.recent = reports;
  },

  // Dashboard mutations
  SET_DASHBOARD_STATS(state, stats) {
    state.dashboard.stats = stats;
    state.dashboard.lastUpdated = Date.now();
  },

  SET_DASHBOARD_METRICS(state, metrics) {
    state.dashboard.metrics = metrics;
  },

  // Settings mutations
  SET_SETTINGS(state, settings) {
    state.settings.data = settings;
    state.settings.lastUpdated = Date.now();
  },

  // UI State mutations
  SET_LOADING(state, loading) {
    state.ui.loading = loading;
  },

  SET_ERROR(state, error) {
    state.ui.error = error;
  },

  SET_ERROR_DETAILS(state, errorDetails) {
    state.ui.errorDetails = errorDetails;
  },

  SET_PAGINATION(state, pagination) {
    state.ui.pagination = { ...state.ui.pagination, ...pagination };
  },

  SET_FILTERS(state, filters) {
    state.ui.filters = { ...state.ui.filters, ...filters };
  },

  SET_LOADING_STATE(state, { entity, loading }) {
    if (state.ui.loadingStates.hasOwnProperty(entity)) {
      state.ui.loadingStates[entity] = loading;
    }
  },

  // Cache mutations
  INVALIDATE_CACHE(state, entity) {
    state.cache.invalidation[entity] = Date.now();
    if (state.metadata[entity]) {
      state.metadata[entity].isStale = true;
    }
  },

  SET_CACHE_CONFIG(state, config) {
    state.cache.config = { ...state.cache.config, ...config };
  },

  // Clear mutations
  CLEAR_ENTITY(state, entity) {
    if (state.entities[entity]) {
      state.entities[entity] = {
        byId: {},
        allIds: [],
        ...Object.keys(state.entities[entity]).reduce((acc, key) => {
          if (!['byId', 'allIds'].includes(key)) {
            acc[key] = Array.isArray(state.entities[entity][key]) ? [] : {};
          }
          return acc;
        }, {}),
      };
    }
  },

  CLEAR_ALL_ENTITIES(state) {
    Object.keys(state.entities).forEach((entity) => {
      state.entities[entity] = {
        byId: {},
        allIds: [],
        ...Object.keys(state.entities[entity]).reduce((acc, key) => {
          if (!['byId', 'allIds'].includes(key)) {
            acc[key] = Array.isArray(state.entities[entity][key]) ? [] : {};
          }
          return acc;
        }, {}),
      };
    });

    // Clear current selections
    Object.keys(state.currentSelections).forEach((key) => {
      state.currentSelections[key] = null;
    });

    // Reset metadata
    Object.keys(state.metadata).forEach((entity) => {
      state.metadata[entity] = {
        total: 0,
        pages: 0,
        lastFetch: null,
        isStale: false,
      };
    });
  },
};

module.exports = normalizedMutations;
