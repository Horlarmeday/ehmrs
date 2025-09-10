# API Optimization Plan for EHMRS Frontend

## Current Issues Identified

### 1. Multiple Parallel API Calls on Dashboard
- **Issue**: Home.vue makes 6 parallel API calls on load
- **Impact**: Increased server load and slower page load times
- **Location**: `loadDashboardData()` method

### 2. No Caching Strategy
- **Issue**: Same data fetched repeatedly across components
- **Impact**: Unnecessary network requests and poor performance
- **Examples**: Categories/subcategories fetched multiple times

### 3. Inconsistent Loading States
- **Issue**: Mixed loading state management patterns
- **Impact**: Poor user experience and potential race conditions

### 4. No Request Deduplication
- **Issue**: Multiple components can trigger same API call simultaneously
- **Impact**: Duplicate network requests

## Optimization Strategies

### 1. Implement Smart Caching
- Add timestamp-based cache invalidation
- Cache frequently accessed data (categories, subcategories)
- Implement cache TTL (Time To Live)

### 2. Request Deduplication
- Prevent duplicate API calls for same endpoint
- Use promise caching for in-flight requests

### 3. Optimize Dashboard Loading
- Create single dashboard API endpoint
- Reduce parallel requests
- Implement progressive loading

### 4. Implement Data Prefetching
- Preload commonly needed data
- Background refresh for stale data

### 5. Add Request Batching
- Combine multiple small requests
- Reduce HTTP overhead

## Implementation Plan

### Phase 1: Core Caching Infrastructure
1. Add cache state to Vuex store
2. Implement cache helpers
3. Add cache invalidation logic

### Phase 2: Request Optimization
1. Add request deduplication
2. Optimize dashboard API calls
3. Implement smart loading states

### Phase 3: Advanced Features
1. Add data prefetching
2. Implement background refresh
3. Add request batching where beneficial

## Expected Benefits
- 40-60% reduction in API calls
- Faster page load times
- Better user experience
- Reduced server load
- Improved offline capability