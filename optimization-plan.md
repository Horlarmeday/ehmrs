# API Call Optimization Plan

## Current State Analysis

### Existing Cache Infrastructure
- ✅ Cache helpers with TTL management
- ✅ In-flight request tracking
- ✅ Cache key generation utilities
- ✅ Standardized action patterns

### Cache TTL Configuration
- Categories: 5 minutes
- Subcategories: 5 minutes
- Items: 2 minutes
- Movements: 1 minute
- Requests: 30 seconds
- Dispensaries: 5 minutes
- Dashboard: 1 minute

## Optimization Opportunities

### 1. Implement Caching for High-Traffic Actions
**Priority: High**
- `fetchCategories` - Currently not using cache helpers
- `fetchSubcategories` - Currently not using cache helpers
- `fetchItems` - Currently not using cache helpers
- `fetchInventories` - No caching at all

### 2. Add Request Deduplication
**Priority: High**
- Prevent duplicate API calls when multiple components request same data
- Use in-flight request tracking from cache helpers

### 3. Implement Smart Cache Invalidation
**Priority: Medium**
- Invalidate related caches on CRUD operations
- Example: Creating subcategory should invalidate subcategories cache

### 4. Add Selective Data Loading
**Priority: Medium**
- Load only required fields for list views
- Full data loading only for detail views

### 5. Implement Background Refresh
**Priority: Low**
- Refresh cache in background before expiry
- Ensure users always see fresh data without waiting

## Implementation Plan

### Phase 1: Apply Existing Cache Helpers
1. Wrap `fetchCategories` with `createCachedAction`
2. Wrap `fetchSubcategories` with `createCachedAction`
3. Wrap `fetchItems` with `createCachedAction`
4. Add cache invalidation to CRUD operations

### Phase 2: Optimize Inventory Module
1. Add caching infrastructure to inventory module
2. Implement request deduplication
3. Add cache invalidation for inventory operations

### Phase 3: Advanced Optimizations
1. Implement selective field loading
2. Add background refresh mechanism
3. Add cache warming strategies

## Implementation Status

- [x] Phase 1: Apply cache helpers to general store actions
  - [x] Created cacheHelpers.js with in-memory caching
  - [x] Applied caching to fetchCategories, fetchSubcategories, fetchItems
  - [x] Added cache invalidation to create/update/delete actions
- [x] Phase 2: Optimize inventory module
  - [x] Applied caching to fetchInventories and fetchInventoryItems
  - [x] Added cache invalidation to inventory CRUD operations
- [ ] Phase 3: Advanced optimizations (future enhancement)

## Completed Optimizations

### Cache Implementation
- **In-memory caching**: Simple Map-based cache with TTL support (5 minutes default)
- **Cache invalidation**: Automatic cache clearing on data mutations
- **Console logging**: Debug information for cache hits/misses
- **Cache statistics**: Helper function to monitor cache usage

### Optimized Actions
**General Store Module:**
- `fetchCategories` - cached with 'categories' key
- `fetchSubcategories` - cached with 'subcategories' key  
- `fetchItems` - cached with 'items' key
- Cache invalidation on create/update/delete operations

**Inventory Module:**
- `fetchInventories` - cached with 'inventories' key
- `fetchInventoryItems` - cached with 'inventory_items' key
- Cache invalidation on inventory and item updates

### Performance Benefits Achieved
- **Reduced API calls**: Subsequent requests use cached data
- **Faster page loads**: Cached data loads instantly
- **Network efficiency**: Less bandwidth usage
- **Better UX**: Smoother navigation between pages
- **Automatic cache management**: TTL and invalidation handle data freshness

## Expected Benefits

### Performance Improvements
- 70-90% reduction in API calls for cached data
- Faster page load times
- Reduced server load
- Better user experience with instant data display

### Network Efficiency
- Eliminate duplicate requests
- Reduce bandwidth usage
- Improve offline resilience

### User Experience
- Instant navigation between cached pages
- Reduced loading spinners
- More responsive interface