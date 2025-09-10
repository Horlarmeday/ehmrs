# General Store Module - Critical Issues Fix Plan

## Overview
This document outlines the implementation plan to fix critical issues identified in the General Store module analysis. Tasks are prioritized by impact and complexity, following the Always Works™️ approach.

## Phase 1: Critical Fixes (High Priority)

### 1.1 Fix Missing Vuex Actions (CRITICAL)
**Impact:** High - Components are currently broken
**Files:** `client/store/modules/moduleGeneralStoreActions.js`

#### Task 1.1.1: Implement fetchItemById Action
- [ ] Add fetchItemById action to moduleGeneralStoreActions.js
- [ ] Create corresponding mutation in moduleGeneralStoreMutations.js
- [ ] Add state property for currentItem in moduleGeneralStoreState.js
- [ ] Test action in ItemDetails.vue and EditItem.vue components
- [ ] Write unit tests for the action

```javascript
// Implementation template:
fetchItemById: async ({ commit }, id) => {
  try {
    commit('SET_LOADING', true);
    const response = await ApiService.get(`/general-store/items/${id}`);
    commit('SET_CURRENT_ITEM', response.data);
    return response.data;
  } catch (error) {
    commit('SET_ERROR', error.message);
    throw error;
  } finally {
    commit('SET_LOADING', false);
  }
}
```

#### Task 1.1.2: Implement fetchDashboardStats Action
- [ ] Add fetchDashboardStats action to moduleGeneralStoreActions.js
- [ ] Create corresponding mutation for dashboard stats
- [ ] Add dashboardStats state property
- [ ] Update Home.vue to use the action
- [ ] Write unit tests for dashboard stats

#### Task 1.1.3: Implement fetchRecentReports Action
- [ ] Add fetchRecentReports action to moduleGeneralStoreActions.js
- [ ] Create corresponding mutation for recent reports
- [ ] Add recentReports state property
- [ ] Update ReportsDashboard.vue to use the action
- [ ] Write unit tests for recent reports

### 1.2 Fix Route Duplications (CRITICAL)
**Impact:** High - API inconsistency causing client errors
**Files:** `server/routes/generalStore.routes.ts`

#### Task 1.2.1: Remove Duplicate Approval Routes
- [ ] Review lines 49 vs 78-82 in generalStore.routes.ts
- [ ] Remove POST method duplicate: `router.post('/requests/:id/approve')`
- [ ] Keep PUT method: `router.put('/requests/:id/approve')`
- [ ] Update client-side API calls to use PUT method consistently
- [ ] Test all approval workflows

#### Task 1.2.2: Standardize HTTP Methods
- [ ] Audit all routes for HTTP method consistency
- [ ] Use GET for data retrieval
- [ ] Use POST for creation
- [ ] Use PUT for updates
- [ ] Use DELETE for deletion
- [ ] Update API documentation

### 1.3 Implement Missing Controller Methods (CRITICAL)
**Impact:** High - Routes exist but methods are missing/commented
**Files:** `server/controllers/generalStore.controller.ts`

#### Task 1.3.1: Implement Export Report Methods
- [ ] Uncomment and implement exportStockReport method (line ~65)
- [ ] Uncomment and implement exportMovementReport method (line ~66)
- [ ] Uncomment and implement exportCostReport method (line ~67)
- [ ] Add proper CSV/Excel export functionality
- [ ] Test export functionality

#### Task 1.3.2: Implement Update Request Method
- [ ] Uncomment updateRequest method (line 48)
- [ ] Add proper validation for request updates
- [ ] Implement business logic for request modifications
- [ ] Add audit logging for request changes
- [ ] Test request update workflow

### 1.4 Standardize API Response Format (CRITICAL)
**Impact:** High - Client-server communication inconsistencies
**Files:** Multiple controller files

#### Task 1.4.1: Create Standard Response Format
- [ ] Create ResponseFormatter utility class
- [ ] Define standard success response format:
```typescript
{
  success: true,
  data: any,
  pagination?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  },
  message?: string
}
```
- [ ] Define standard error response format:
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

#### Task 1.4.2: Update All Controller Methods
- [ ] Update getItems method to use standard format
- [ ] Update getCategories method to use standard format
- [ ] Update getSubcategories method to use standard format
- [ ] Update all other GET endpoints
- [ ] Update all POST/PUT/DELETE endpoints
- [ ] Test all API endpoints

## Phase 2: Medium Priority Fixes

### 2.1 Remove Placeholder Implementations
**Impact:** Medium - User experience and functionality
**Files:** 23+ Vue components

#### Task 2.1.1: Fix Form Components
- [ ] EditCategory.vue - Remove placeholder attributes, add validation
- [ ] CreateCategory.vue - Remove placeholder attributes, add validation
- [ ] EditItem.vue - Remove placeholder attributes, add validation
- [ ] CreateItem.vue - Remove placeholder attributes, add validation
- [ ] CreateRequest.vue - Remove placeholder attributes, add validation

#### Task 2.1.2: Fix List Components
- [ ] CategoriesList.vue - Remove placeholders, implement proper data display
- [ ] SubcategoriesList.vue - Remove placeholders, implement proper data display
- [ ] ItemsList.vue - Remove placeholders, implement proper filtering
- [ ] RequestsList.vue - Remove placeholders, implement proper status display
- [ ] MovementsList.vue - Remove placeholders, implement proper tracking

#### Task 2.1.3: Fix Management Components
- [ ] StockReport.vue - Remove placeholders, implement actual reporting
- [ ] MovementDetails.vue - Remove placeholders, implement detailed view
- [ ] RequestApproval.vue - Remove placeholders, implement approval workflow
- [ ] RequestFulfillment.vue - Remove placeholders, implement fulfillment process

### 2.2 Replace "Coming Soon" Placeholders
**Impact:** Medium - Core functionality missing
**Files:** Multiple Vue components

#### Task 2.2.1: Implement Stock Audit Manager
- [ ] Replace "Coming Soon" in StockAuditManager.vue (lines 330, 357)
- [ ] Implement audit trail functionality
- [ ] Add stock discrepancy detection
- [ ] Implement audit report generation
- [ ] Add audit approval workflow

#### Task 2.2.2: Implement Emergency Manager
- [ ] Replace "Coming Soon" in EmergencyManager.vue (lines 320, 347, 374, 401)
- [ ] Implement emergency stock protocols
- [ ] Add emergency request processing
- [ ] Implement emergency notification system
- [ ] Add emergency reporting

### 2.3 Implement Error Handling and Loading States
**Impact:** Medium - User experience
**Files:** All Vue components

#### Task 2.3.1: Add Global Error Handling
- [ ] Create ErrorBoundary component
- [ ] Implement global error interceptor
- [ ] Add error notification system
- [ ] Create error logging mechanism

#### Task 2.3.2: Add Loading States
- [ ] Create LoadingSpinner component
- [ ] Add loading states to all data fetching operations
- [ ] Implement skeleton loading for lists
- [ ] Add progress indicators for long operations

#### Task 2.3.3: Add Empty States
- [ ] Create EmptyState component
- [ ] Add empty state handling to all list components
- [ ] Implement "no data" messaging
- [ ] Add call-to-action buttons for empty states

### 2.4 Restructure Vuex State Management
**Impact:** Medium - Code maintainability
**Files:** Vuex store modules

#### Task 2.4.1: Standardize State Structure
- [ ] Update moduleGeneralStoreState.js with consistent structure:
```javascript
state: {
  categories: {
    items: [],
    current: null,
    loading: false,
    error: null,
    pagination: {}
  },
  items: {
    list: [],
    current: null,
    filters: {},
    sorting: {},
    pagination: {},
    loading: false,
    error: null
  },
  // Similar structure for other entities
}
```

#### Task 2.4.2: Update All Mutations
- [ ] Update mutations to work with new state structure
- [ ] Add loading state mutations
- [ ] Add error state mutations
- [ ] Add pagination mutations

#### Task 2.4.3: Update All Actions
- [ ] Update existing actions to use new state structure
- [ ] Add proper error handling to all actions
- [ ] Add loading state management to all actions
- [ ] Implement proper state normalization

## Phase 3: Low Priority Improvements

### 3.1 Complete Workflow Implementations
**Impact:** Low - Advanced functionality
**Files:** Workflow-related components and services

#### Task 3.1.1: Complete Request Approval Workflow
- [ ] Implement multi-level approval process
- [ ] Add approval delegation functionality
- [ ] Implement approval notifications
- [ ] Add approval audit trail

#### Task 3.1.2: Complete Stock Movement Workflow
- [ ] Implement movement approval process
- [ ] Add movement tracking
- [ ] Implement movement notifications
- [ ] Add movement audit trail

### 3.2 Performance Optimization
**Impact:** Low - Performance improvements
**Files:** Repository and service files

#### Task 3.2.1: Optimize Database Queries
- [ ] Add database indexes for search queries
- [ ] Optimize foreign key relationships
- [ ] Fix N+1 query problems
- [ ] Implement query result caching

#### Task 3.2.2: Implement Caching
- [ ] Add Redis caching for frequently accessed data
- [ ] Implement cache invalidation strategies
- [ ] Add cache warming for critical data
- [ ] Monitor cache hit rates

## Testing Requirements (Always Works™️ Approach)

### Unit Testing
- [ ] Write unit tests for all new Vuex actions
- [ ] Write unit tests for all controller methods
- [ ] Write unit tests for all service methods
- [ ] Achieve 80%+ code coverage

### Integration Testing
- [ ] Test API endpoints with Postman/Newman
- [ ] Test component integration with Vue Test Utils
- [ ] Test Vuex store integration
- [ ] Test error handling scenarios

### End-to-End Testing
- [ ] Test complete user workflows
- [ ] Test error scenarios
- [ ] Test performance under load
- [ ] Test cross-browser compatibility

## Success Criteria

- [ ] Zero "Coming Soon" placeholders
- [ ] All Vuex actions implemented and tested
- [ ] Consistent error handling across all components
- [ ] Complete API documentation
- [ ] 100% functional test coverage for critical paths
- [ ] All placeholder attributes removed
- [ ] Standardized API response format
- [ ] No duplicate routes
- [ ] All controller methods implemented

## Risk Mitigation

1. **Data Integrity**: Implement proper validation at all levels
2. **Performance**: Monitor query performance and implement caching
3. **Security**: Ensure proper authorization checks on all endpoints
4. **User Experience**: Implement proper loading and error states

## Implementation Timeline

- **Phase 1 (Critical)**: 1-2 weeks
- **Phase 2 (Medium)**: 2-3 weeks
- **Phase 3 (Low)**: 1-2 weeks
- **Testing**: Ongoing throughout all phases

## Notes

- Follow existing code conventions and patterns
- Ensure backward compatibility where possible
- Document all changes in API documentation
- Coordinate with team for any breaking changes
- Regular code reviews for all implementations