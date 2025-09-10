/**
 * Optimized actions with caching and request deduplication
 */
import axios from '../../../../axios';
import {
  createCachedAction,
  generateCacheKey,
  isCacheValid,
  isRequestInFlight,
  getInFlightRequest,
  invalidateCache,
  cacheMutations,
} from './cacheHelpers';

// Add cache mutations to be merged with existing mutations
export { cacheMutations };

/**
 * Original action implementations (to be wrapped with caching)
 */
const originalActions = {
  async fetchCategories({ commit }, payload = {}) {
    commit('SET_LOADING_STATE', { operation: 'categories', loading: true });
    try {
      const response = await axios.get('/api/general-store/categories', { params: payload });
      const { docs, total, pages } = response.data.data;

      commit('SET_CATEGORIES', docs);
      commit('SET_CATEGORIES_TOTAL', total);
      commit('SET_CATEGORIES_PAGES', pages);

      return response;
    } finally {
      commit('SET_LOADING_STATE', { operation: 'categories', loading: false });
    }
  },

  async fetchSubcategories({ commit }, payload = {}) {
    commit('SET_LOADING_STATE', { operation: 'subcategories', loading: true });
    try {
      const response = await axios.get('/api/general-store/subcategories', { params: payload });
      const { docs, total, pages } = response.data.data;

      commit('SET_SUBCATEGORIES', docs);
      commit('SET_SUBCATEGORIES_TOTAL', total);
      commit('SET_SUBCATEGORIES_PAGES', pages);

      return response;
    } finally {
      commit('SET_LOADING_STATE', { operation: 'subcategories', loading: false });
    }
  },

  async fetchItems({ commit }, payload = {}) {
    commit('SET_LOADING_STATE', { operation: 'items', loading: true });
    try {
      const response = await axios.get('/api/general-store/items', { params: payload });
      const { docs, total, pages } = response.data.data;

      commit('SET_ITEMS', docs);
      commit('SET_ITEMS_TOTAL', total);
      commit('SET_ITEMS_PAGES', pages);

      return response;
    } finally {
      commit('SET_LOADING_STATE', { operation: 'items', loading: false });
    }
  },

  async fetchMovements({ commit }, payload = {}) {
    commit('SET_LOADING_STATE', { operation: 'movements', loading: true });
    try {
      const response = await axios.get('/api/general-store/movements', { params: payload });
      const { docs, total, pages } = response.data.data;

      commit('SET_MOVEMENTS', docs);
      commit('SET_MOVEMENTS_TOTAL', total);
      commit('SET_MOVEMENTS_PAGES', pages);

      return response;
    } finally {
      commit('SET_LOADING_STATE', { operation: 'movements', loading: false });
    }
  },

  async fetchRequests({ commit }, payload = {}) {
    commit('SET_LOADING_STATE', { operation: 'requests', loading: true });
    try {
      const response = await axios.get('/api/general-store/requests', { params: payload });
      const { docs, total, pages } = response.data.data;

      commit('SET_REQUESTS', docs);
      commit('SET_REQUESTS_TOTAL', total);
      commit('SET_REQUESTS_PAGES', pages);

      return response;
    } finally {
      commit('SET_LOADING_STATE', { operation: 'requests', loading: false });
    }
  },

  async fetchDispensaries({ commit }, payload = {}) {
    commit('SET_LOADING_STATE', { operation: 'dispensaries', loading: true });
    try {
      const response = await axios.get('/api/general-store/dispensaries', { params: payload });
      const { docs, total, pages } = response.data.data;

      commit('SET_DISPENSARIES', docs);
      commit('SET_DISPENSARIES_TOTAL', total);
      commit('SET_DISPENSARIES_PAGES', pages);

      return response;
    } finally {
      commit('SET_LOADING_STATE', { operation: 'dispensaries', loading: false });
    }
  },
};

/**
 * Create cached versions of actions
 */
export const optimizedActions = {
  // Cached fetch actions
  fetchCategories: createCachedAction(
    originalActions.fetchCategories,
    'categories',
    state => state.categories
  ),

  fetchSubcategories: createCachedAction(
    originalActions.fetchSubcategories,
    'subcategories',
    state => state.subcategories
  ),

  fetchItems: createCachedAction(originalActions.fetchItems, 'items', state => state.items),

  fetchMovements: createCachedAction(
    originalActions.fetchMovements,
    'movements',
    state => state.movements
  ),

  fetchRequests: createCachedAction(
    originalActions.fetchRequests,
    'requests',
    state => state.requests
  ),

  fetchDispensaries: createCachedAction(
    originalActions.fetchDispensaries,
    'dispensaries',
    state => state.dispensaries
  ),

  /**
   * Optimized dashboard data loading
   * Combines multiple requests into a single optimized call
   */
  async fetchDashboardData({ state, commit, dispatch }, payload = {}) {
    const cacheKey = generateCacheKey('dashboard', payload);

    // Check if dashboard data is cached and valid
    if (isCacheValid(state, cacheKey) && state.dashboardStats) {
      return Promise.resolve({ fromCache: true });
    }

    // Check if request is already in flight
    if (isRequestInFlight(state, cacheKey)) {
      return getInFlightRequest(state, cacheKey);
    }

    commit('SET_LOADING_STATE', { operation: 'dashboard', loading: true });

    const requestPromise = (async () => {
      try {
        // Use Promise.allSettled to handle partial failures gracefully
        const results = await Promise.allSettled([
          dispatch('fetchItems', { limit: 10 }),
          dispatch('fetchRequests', { status: 'PENDING', limit: 5 }),
          dispatch('fetchMovements', { limit: 5 }),
          dispatch('fetchCategories', { limit: 1 }),
          dispatch('fetchSubcategories', { limit: 1 }),
          dispatch('fetchDispensaries', { limit: 1 }),
        ]);

        // Check for any failures
        const failures = results.filter(result => result.status === 'rejected');
        if (failures.length > 0) {
          console.warn('Some dashboard requests failed:', failures);
        }

        // Set cache timestamp
        commit('SET_CACHE_TIMESTAMP', { key: cacheKey, timestamp: Date.now() });

        return { success: true, failures: failures.length };
      } catch (error) {
        throw error;
      } finally {
        commit('SET_LOADING_STATE', { operation: 'dashboard', loading: false });
        commit('CLEAR_IN_FLIGHT_REQUEST', cacheKey);
      }
    })();

    // Track in-flight request
    commit('SET_IN_FLIGHT_REQUEST', { key: cacheKey, promise: requestPromise });

    return requestPromise;
  },

  /**
   * Smart refresh - only refresh stale data
   */
  async smartRefresh({ state, commit, dispatch }, options = {}) {
    const { force = false, entities = ['categories', 'subcategories', 'items'] } = options;
    const refreshPromises = [];

    entities.forEach(entity => {
      const cacheKey = generateCacheKey(entity);

      if (force || !isCacheValid(state, cacheKey)) {
        switch (entity) {
          case 'categories':
            refreshPromises.push(dispatch('fetchCategories'));
            break;
          case 'subcategories':
            refreshPromises.push(dispatch('fetchSubcategories'));
            break;
          case 'items':
            refreshPromises.push(dispatch('fetchItems'));
            break;
          case 'movements':
            refreshPromises.push(dispatch('fetchMovements'));
            break;
          case 'requests':
            refreshPromises.push(dispatch('fetchRequests'));
            break;
          case 'dispensaries':
            refreshPromises.push(dispatch('fetchDispensaries'));
            break;
        }
      }
      commit('SET_CACHE_TIMESTAMP', { key: cacheKey, timestamp: Date.now() });
    });

    if (refreshPromises.length > 0) {
      return Promise.allSettled(refreshPromises);
    }

    return Promise.resolve({ message: 'All data is fresh' });
  },

  /**
   * Invalidate specific cache entries
   */
  invalidateCache({ commit }, keys) {
    invalidateCache(commit, keys);
  },

  /**
   * Clear all cache
   */
  clearAllCache({ commit }) {
    commit('CLEAR_ALL_CACHE_TIMESTAMPS');
    commit('CLEAR_ALL_CACHE');
    commit('CLEAR_ALL_IN_FLIGHT_REQUESTS');
  },

  /**
   * Prefetch commonly needed data
   */
  async prefetchCommonData({ dispatch }) {
    // Prefetch categories and subcategories as they're commonly needed
    return Promise.allSettled([
      dispatch('fetchCategories', { limit: 100 }),
      dispatch('fetchSubcategories', { limit: 100 }),
    ]);
  },
};
