// Cache helpers for API optimization
// Simple in-memory cache with TTL support

const cache = new Map();
const cacheTimestamps = new Map();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Creates a cached version of an action
 * @param {Function} originalAction - The original Vuex action
 * @param {string} cacheKey - Unique cache key
 * @param {Function} stateSelector - Function to get current state data
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Function} Cached action
 */
export const createCachedAction = (originalAction, cacheKey, stateSelector, ttl = DEFAULT_TTL) => {
  return function cachedAction(context, payload) {
    const { commit, state } = context;
    const now = Date.now();
    const cacheTimestamp = cacheTimestamps.get(cacheKey);
    
    // Check if cache is valid
    if (cacheTimestamp && (now - cacheTimestamp) < ttl) {
      const cachedData = cache.get(cacheKey);
      if (cachedData && stateSelector(state)?.length > 0) {
        console.log(`[Cache] Using cached data for ${cacheKey}`);
        return Promise.resolve({ data: { data: cachedData } });
      }
    }
    
    // Cache miss or expired - fetch fresh data
    console.log(`[Cache] Fetching fresh data for ${cacheKey}`);
    return originalAction.call(this, context, payload)
      .then(response => {
        // Store in cache
        const dataToCache = response.data?.data;
        if (dataToCache) {
          cache.set(cacheKey, dataToCache);
          cacheTimestamps.set(cacheKey, now);
          console.log(`[Cache] Cached data for ${cacheKey}`);
        }
        return response;
      })
      .catch(error => {
        console.error(`[Cache] Error fetching ${cacheKey}:`, error);
        throw error;
      });
  };
};

/**
 * Invalidates cache for a specific key
 * @param {string} cacheKey - Cache key to invalidate
 */
export const invalidateCache = (cacheKey) => {
  if (cache.has(cacheKey)) {
    cache.delete(cacheKey);
    cacheTimestamps.delete(cacheKey);
    console.log(`[Cache] Invalidated cache for ${cacheKey}`);
  }
};

/**
 * Clears all cache
 */
export const clearAllCache = () => {
  cache.clear();
  cacheTimestamps.clear();
  console.log('[Cache] Cleared all cache');
};

/**
 * Gets cache statistics
 * @returns {Object} Cache stats
 */
export const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    timestamps: Object.fromEntries(cacheTimestamps)
  };
};