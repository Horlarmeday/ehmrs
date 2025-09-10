// Integration file for normalized General Store module
// Provides seamless integration between old and new state structures

const normalizedState = require('./moduleGeneralStoreNormalizedState.js');
const normalizedMutations = require('./moduleGeneralStoreNormalizedMutations.js');
const normalizedActions = require('./moduleGeneralStoreNormalizedActions.js');
const normalizedGetters = require('./moduleGeneralStoreNormalizedGetters.js');
const {
  migrateToNormalizedState,
  createBackwardCompatibleState,
  validateNormalizedState,
  performanceMonitor,
  devUtils,
} = require('./moduleGeneralStoreMigrationUtils.js');

// Configuration for migration
const MIGRATION_CONFIG = {
  enabled: true,
  useBackwardCompatibility: true,
  performanceMonitoring: process.env.NODE_ENV === 'development',
  validateState: process.env.NODE_ENV === 'development',
  logMigration: process.env.NODE_ENV === 'development',
};

/**
 * Enhanced state that combines normalized structure with backward compatibility
 */
const enhancedState = () => {
  const baseState = normalizedState();

  if (MIGRATION_CONFIG.useBackwardCompatibility) {
    // Add backward compatible properties
    const compatibleState = createBackwardCompatibleState(baseState);
    return {
      ...baseState,
      ...compatibleState,
      // Migration metadata
      _migration: {
        isNormalized: true,
        version: '2.0.0',
        migratedAt: new Date().toISOString(),
        backwardCompatible: true,
      },
    };
  }

  return baseState;
};

/**
 * Enhanced mutations that handle both normalized and legacy operations
 */
const enhancedMutations = {
  ...normalizedMutations,

  // Migration-specific mutations
  MIGRATE_TO_NORMALIZED(state, oldState) {
    if (MIGRATION_CONFIG.logMigration) {
      console.log('[GeneralStore] Starting migration to normalized state');
    }

    const migratedState = performanceMonitor.measure('migration', () =>
      migrateToNormalizedState(oldState)
    );

    // Validate migrated state
    if (MIGRATION_CONFIG.validateState) {
      const validation = validateNormalizedState(migratedState);
      if (!validation.isValid) {
        console.error('[GeneralStore] Migration validation failed:', validation.errors);
        return;
      }
    }

    // Apply migrated state
    Object.keys(migratedState).forEach((key) => {
      state[key] = migratedState[key];
    });

    // Add backward compatibility if enabled
    if (MIGRATION_CONFIG.useBackwardCompatibility) {
      const compatibleState = createBackwardCompatibleState(state);
      Object.keys(compatibleState).forEach((key) => {
        if (!key.startsWith('_') && !state.hasOwnProperty(key)) {
          state[key] = compatibleState[key];
        }
      });
    }

    // Set migration metadata
    state._migration = {
      isNormalized: true,
      version: '2.0.0',
      migratedAt: new Date().toISOString(),
      backwardCompatible: MIGRATION_CONFIG.useBackwardCompatibility,
    };

    if (MIGRATION_CONFIG.logMigration) {
      console.log('[GeneralStore] Migration completed successfully');
      performanceMonitor.logStateSize(state);
    }
  },

  // Enhanced mutations that maintain backward compatibility
  SET_CATEGORIES(state, categories) {
    // Use normalized mutation
    normalizedMutations.SET_CATEGORIES(state, categories);

    // Update backward compatible array if enabled
    if (MIGRATION_CONFIG.useBackwardCompatibility && state.entities) {
      state.categories = state.entities.categories.allIds.map(
        (id) => state.entities.categories.byId[id]
      );
    }
  },

  SET_SUBCATEGORIES(state, subcategories) {
    normalizedMutations.SET_SUBCATEGORIES(state, subcategories);

    if (MIGRATION_CONFIG.useBackwardCompatibility && state.entities) {
      state.subcategories = state.entities.subcategories.allIds.map(
        (id) => state.entities.subcategories.byId[id]
      );
    }
  },

  SET_ITEMS(state, items) {
    normalizedMutations.SET_ITEMS(state, items);

    if (MIGRATION_CONFIG.useBackwardCompatibility && state.entities) {
      state.items = state.entities.items.allIds.map((id) => state.entities.items.byId[id]);
    }
  },

  SET_MOVEMENTS(state, movements) {
    normalizedMutations.SET_MOVEMENTS(state, movements);

    if (MIGRATION_CONFIG.useBackwardCompatibility && state.entities) {
      state.movements = state.entities.movements.allIds.map(
        (id) => state.entities.movements.byId[id]
      );
    }
  },

  SET_REQUESTS(state, requests) {
    normalizedMutations.SET_REQUESTS(state, requests);

    if (MIGRATION_CONFIG.useBackwardCompatibility && state.entities) {
      state.requests = state.entities.requests.allIds.map((id) => state.entities.requests.byId[id]);
    }
  },

  SET_DISPENSARIES(state, dispensaries) {
    normalizedMutations.SET_DISPENSARIES(state, dispensaries);

    if (MIGRATION_CONFIG.useBackwardCompatibility && state.entities) {
      state.dispensaries = state.entities.dispensaries.allIds.map(
        (id) => state.entities.dispensaries.byId[id]
      );
    }
  },

  // Current selection mutations with backward compatibility
  SET_CURRENT_CATEGORY(state, category) {
    normalizedMutations.SET_CURRENT_CATEGORY(state, category);

    if (MIGRATION_CONFIG.useBackwardCompatibility && state.entities && category) {
      state.currentCategory =
        typeof category === 'object' ? category : state.entities.categories.byId[category];
    }
  },

  SET_CURRENT_SUBCATEGORY(state, subcategory) {
    normalizedMutations.SET_CURRENT_SUBCATEGORY(state, subcategory);

    if (MIGRATION_CONFIG.useBackwardCompatibility && state.entities && subcategory) {
      state.currentSubcategory =
        typeof subcategory === 'object'
          ? subcategory
          : state.entities.subcategories.byId[subcategory];
    }
  },

  SET_CURRENT_ITEM(state, item) {
    normalizedMutations.SET_CURRENT_ITEM(state, item);

    if (MIGRATION_CONFIG.useBackwardCompatibility && state.entities && item) {
      state.currentItem = typeof item === 'object' ? item : state.entities.items.byId[item];
    }
  },

  SET_CURRENT_REQUEST(state, request) {
    normalizedMutations.SET_CURRENT_REQUEST(state, request);

    if (MIGRATION_CONFIG.useBackwardCompatibility && state.entities && request) {
      state.currentRequest =
        typeof request === 'object' ? request : state.entities.requests.byId[request];
    }
  },

  // Performance monitoring mutations
  PERFORMANCE_LOG(state, { operation, duration, details }) {
    if (MIGRATION_CONFIG.performanceMonitoring) {
      console.debug(`[GeneralStore] ${operation}: ${duration}ms`, details);
    }
  },

  // Development utilities
  DEV_EXPORT_STATE(state) {
    if (process.env.NODE_ENV === 'development') {
      const exported = devUtils.exportState(state);
      console.log('[GeneralStore] State exported:', exported);
    }
  },

  DEV_VALIDATE_STATE(state) {
    if (process.env.NODE_ENV === 'development') {
      const validation = validateNormalizedState(state);
      if (!validation.isValid) {
        console.error('[GeneralStore] State validation failed:', validation.errors);
      } else {
        console.log('[GeneralStore] State validation passed');
      }
    }
  },

  DEV_CHECK_MEMORY_LEAKS(state) {
    if (process.env.NODE_ENV === 'development') {
      const issues = performanceMonitor.checkMemoryLeaks(state);
      if (issues.length > 0) {
        console.warn('[GeneralStore] Potential memory leaks detected:', issues);
      }
    }
  },
};

/**
 * Enhanced actions that provide both normalized and legacy interfaces
 */
const enhancedActions = {
  ...normalizedActions,

  // Migration action
  async migrateToNormalized({ commit, state }) {
    if (state._migration && state._migration.isNormalized) {
      console.log('[GeneralStore] Already using normalized state');
      return;
    }

    commit('MIGRATE_TO_NORMALIZED', state);
  },

  // Enhanced fetch actions with performance monitoring
  async fetchCategories({ commit, dispatch }, payload) {
    if (MIGRATION_CONFIG.performanceMonitoring) {
      return performanceMonitor.measure('fetchCategories', async () => {
        return await normalizedActions.fetchCategories({ commit, dispatch }, payload);
      });
    }

    return await normalizedActions.fetchCategories({ commit, dispatch }, payload);
  },

  async fetchSubcategories({ commit, dispatch }, payload) {
    if (MIGRATION_CONFIG.performanceMonitoring) {
      return performanceMonitor.measure('fetchSubcategories', async () => {
        return await normalizedActions.fetchSubcategories({ commit, dispatch }, payload);
      });
    }

    return await normalizedActions.fetchSubcategories({ commit, dispatch }, payload);
  },

  async fetchItems({ commit, dispatch }, payload) {
    if (MIGRATION_CONFIG.performanceMonitoring) {
      return performanceMonitor.measure('fetchItems', async () => {
        return await normalizedActions.fetchItems({ commit, dispatch }, payload);
      });
    }

    return await normalizedActions.fetchItems({ commit, dispatch }, payload);
  },

  async fetchMovements({ commit, dispatch }, payload) {
    if (MIGRATION_CONFIG.performanceMonitoring) {
      return performanceMonitor.measure('fetchMovements', async () => {
        return await normalizedActions.fetchMovements({ commit, dispatch }, payload);
      });
    }

    return await normalizedActions.fetchMovements({ commit, dispatch }, payload);
  },

  async fetchRequests({ commit, dispatch }, payload) {
    if (MIGRATION_CONFIG.performanceMonitoring) {
      return performanceMonitor.measure('fetchRequests', async () => {
        return await normalizedActions.fetchRequests({ commit, dispatch }, payload);
      });
    }

    return await normalizedActions.fetchRequests({ commit, dispatch }, payload);
  },

  async fetchDispensaries({ commit, dispatch }, payload) {
    if (MIGRATION_CONFIG.performanceMonitoring) {
      return performanceMonitor.measure('fetchDispensaries', async () => {
        return await normalizedActions.fetchDispensaries({ commit, dispatch }, payload);
      });
    }

    return await normalizedActions.fetchDispensaries({ commit, dispatch }, payload);
  },

  // Development actions
  async devExportState({ commit, state }) {
    if (process.env.NODE_ENV === 'development') {
      commit('DEV_EXPORT_STATE');
    }
  },

  async devValidateState({ commit, state }) {
    if (process.env.NODE_ENV === 'development') {
      commit('DEV_VALIDATE_STATE');
    }
  },

  async devCheckMemoryLeaks({ commit, state }) {
    if (process.env.NODE_ENV === 'development') {
      commit('DEV_CHECK_MEMORY_LEAKS');
    }
  },
};

/**
 * Enhanced getters that provide both normalized and legacy access patterns
 */
const enhancedGetters = {
  ...normalizedGetters,

  // Backward compatibility getters
  categories: (state) => {
    if (state.entities && state.entities.categories) {
      return state.entities.categories.allIds.map((id) => state.entities.categories.byId[id]);
    }
    return state.categories || [];
  },

  subcategories: (state) => {
    if (state.entities && state.entities.subcategories) {
      return state.entities.subcategories.allIds.map((id) => state.entities.subcategories.byId[id]);
    }
    return state.subcategories || [];
  },

  items: (state) => {
    if (state.entities && state.entities.items) {
      return state.entities.items.allIds.map((id) => state.entities.items.byId[id]);
    }
    return state.items || [];
  },

  movements: (state) => {
    if (state.entities && state.entities.movements) {
      return state.entities.movements.allIds.map((id) => state.entities.movements.byId[id]);
    }
    return state.movements || [];
  },

  requests: (state) => {
    if (state.entities && state.entities.requests) {
      return state.entities.requests.allIds.map((id) => state.entities.requests.byId[id]);
    }
    return state.requests || [];
  },

  dispensaries: (state) => {
    if (state.entities && state.entities.dispensaries) {
      return state.entities.dispensaries.allIds.map((id) => state.entities.dispensaries.byId[id]);
    }
    return state.dispensaries || [];
  },

  // Migration status getters
  isNormalized: (state) => {
    return state._migration && state._migration.isNormalized;
  },

  migrationInfo: (state) => {
    return state._migration || null;
  },

  // Performance getters
  stateSize: (state) => {
    if (!state.entities) return 0;

    return Object.keys(state.entities).reduce((total, entity) => {
      return total + (state.entities[entity].allIds ? state.entities[entity].allIds.length : 0);
    }, 0);
  },

  entityCounts: (state) => {
    if (!state.entities) return {};

    const counts = {};
    Object.keys(state.entities).forEach((entity) => {
      counts[entity] = state.entities[entity].allIds ? state.entities[entity].allIds.length : 0;
    });
    return counts;
  },
};

/**
 * Export utilities for external use
 */
module.exports = {
  normalizedModule: {
    namespaced: true,
    state: enhancedState,
    mutations: enhancedMutations,
    actions: enhancedActions,
    getters: enhancedGetters,
  },
  migrationUtils: {
    MIGRATION_CONFIG,
    migrateToNormalizedState,
    createBackwardCompatibleState,
    validateNormalizedState,
  },
  performanceMon: performanceMonitor,
  devTools: devUtils,
};

// Migration helper removed - was unused
