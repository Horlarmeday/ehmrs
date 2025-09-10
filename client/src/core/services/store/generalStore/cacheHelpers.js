/**
 * Cache management utilities for GeneralStore
 */
/* eslint-disable no-unused-vars */

/**
 * Check if cached data is still valid
 * @param {Object} state - Vuex state
 * @param {string} key - Cache key
 * @returns {boolean} - True if cache is valid
 */
export const isCacheValid = (state, key) => {
  const timestamp = state.cache.timestamps[key];
  const ttl = state.cache.ttl[key];
  
  if (!timestamp || !ttl) {
    return false;
  }
  
  return Date.now() - timestamp < ttl;
};

/**
 * Generate cache key for API requests
 * @param {string} endpoint - API endpoint name
 * @param {Object} params - Request parameters
 * @returns {string} - Cache key
 */
export const generateCacheKey = (endpoint, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {});
  
  const paramString = Object.keys(sortedParams).length > 0 
    ? JSON.stringify(sortedParams) 
    : '';
  
  return `${endpoint}${paramString ? `_${btoa(paramString)}` : ''}`;
};

/**
 * Check if request is already in flight
 * @param {Object} state - Vuex state
 * @param {string} key - Request key
 * @returns {boolean} - True if request is in flight
 */
export const isRequestInFlight = (state, key) => {
  return !!state.inFlightRequests[key];
};

/**
 * Get in-flight request promise
 * @param {Object} state - Vuex state
 * @param {string} key - Request key
 * @returns {Promise|null} - In-flight promise or null
 */
export const getInFlightRequest = (state, key) => {
  return state.inFlightRequests[key] || null;
};

/**
 * Cache management mutations
 */
export const cacheMutations = {
  SET_CACHE_TIMESTAMP(state, { key, timestamp }) {
    state.cache.timestamps[key] = timestamp;
  },

  CLEAR_CACHE_TIMESTAMP(state, key) {
    delete state.cache.timestamps[key];
  },

  CLEAR_ALL_CACHE_TIMESTAMPS(state) {
    state.cache.timestamps = {};
  },

  SET_IN_FLIGHT_REQUEST(state, { key, promise }) {
    state.inFlightRequests[key] = promise;
  },

  CLEAR_IN_FLIGHT_REQUEST(state, key) {
    delete state.inFlightRequests[key];
  },

  CLEAR_ALL_IN_FLIGHT_REQUESTS(state) {
    state.inFlightRequests = {};
  },
};

/**
 * Create a cached action wrapper
 * @param {Function} originalAction - Original Vuex action
 * @param {string} cacheKey - Cache key for this action
 * @param {Function} dataSelector - Function to select data from state
 * @returns {Function} - Wrapped action with caching
 */
export const createCachedAction = (originalAction, cacheKey, dataSelector) => {
  // eslint-disable-next-line no-unused-vars
  return async function cachedAction({ state, commit, dispatch }, payload = {}) {
    const requestKey = generateCacheKey(cacheKey, payload);
    
    // Check if data is cached and valid
    if (isCacheValid(state, requestKey) && dataSelector(state).length > 0) {
      return Promise.resolve({ fromCache: true, data: dataSelector(state) });
    }
    
    // Check if request is already in flight
    if (isRequestInFlight(state, requestKey)) {
      return getInFlightRequest(state, requestKey);
    }
    
    // Create new request
    const requestPromise = originalAction.call(this, { state, commit, dispatch }, payload)
      .then(response => {
        // Set cache timestamp on success
        commit('SET_CACHE_TIMESTAMP', { key: requestKey, timestamp: Date.now() });
        commit('CLEAR_IN_FLIGHT_REQUEST', requestKey);
        return response;
      })
      .catch(error => {
        // Clear in-flight request on error
        commit('CLEAR_IN_FLIGHT_REQUEST', requestKey);
        throw error;
      });
    
    // Track in-flight request
    commit('SET_IN_FLIGHT_REQUEST', { key: requestKey, promise: requestPromise });
    
    return requestPromise;
  };
};

/**
 * Invalidate cache for specific keys or patterns
 * @param {Function} commit - Vuex commit function
 * @param {string|Array} keys - Cache key(s) to invalidate
 */
export const invalidateCache = (commit, keys) => {
  if (Array.isArray(keys)) {
    keys.forEach(key => commit('CLEAR_CACHE_TIMESTAMP', key));
  } else {
    commit('CLEAR_CACHE_TIMESTAMP', keys);
  }
};

/**
 * Clear all cache and in-flight requests
 * @param {Function} commit - Vuex commit function
 */
export const clearAllCache = (commit) => {
  commit('CLEAR_ALL_CACHE_TIMESTAMPS');
  commit('CLEAR_ALL_IN_FLIGHT_REQUESTS');
};