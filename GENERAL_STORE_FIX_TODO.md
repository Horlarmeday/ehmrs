# General Store Module Fix TODO

## Overview
This document outlines the comprehensive plan to fix all identified issues in the General Store module based on the analysis conducted. The issues are prioritized by severity and impact on functionality.

## 🚨 Critical Issues (Must Fix First)

### 1. Backend Server Startup Crash
**Priority:** CRITICAL  
**Status:** 🔴 Not Started  
**Estimated Time:** 2-4 hours

**Problem:**
- Backend server crashes during startup
- MongoDB agenda configuration causing issues
- Server fails to start properly despite successful database connection

**Solution Steps:**
1. **Investigate Agenda Configuration**
   - [ ] Check MongoDB connection string in `.env` file
   - [ ] Verify `DB_MONGO` environment variable is properly set
   - [ ] Review agenda.ts configuration for potential issues
   - [ ] Test MongoDB connection independently

2. **Debug Server Startup**
   - [ ] Add more detailed logging to startup process
   - [ ] Wrap agenda initialization in try-catch blocks
   - [ ] Check if MongoDB service is running
   - [ ] Verify database permissions and access

3. **Fix Implementation**
   - [ ] Update agenda configuration with proper error handling
   - [ ] Add fallback mechanisms for agenda initialization
   - [ ] Implement graceful degradation if agenda fails
   - [ ] Test server startup with fixed configuration

**Files to Modify:**
- `server/src/core/startup/agenda.ts`
- `server/.env`
- `server/src/app.ts`

---

### 2. Missing API Endpoints
**Priority:** HIGH  
**Status:** 🔴 Not Started  
**Estimated Time:** 3-5 hours

#### 2.1 Settings Endpoints
**Problem:** Client calls `/api/general-store/settings` but endpoints don't exist

**Solution Steps:**
1. **Create Settings Routes**
   - [ ] Add GET `/settings` route to `generalStore.routes.ts`
   - [ ] Add PUT `/settings` route to `generalStore.routes.ts`
   - [ ] Apply proper middleware (verify, authorize if needed)

2. **Implement Controller Methods**
   - [ ] Add `getSettings` method to `GeneralStoreController`
   - [ ] Add `updateSettings` method to `GeneralStoreController`
   - [ ] Implement proper validation schemas

3. **Create Service Layer**
   - [ ] Add settings methods to `GeneralStoreService`
   - [ ] Implement business logic for settings management

4. **Database Integration**
   - [ ] Create settings table/model if needed
   - [ ] Add repository methods for settings CRUD
   - [ ] Implement proper data validation

**Files to Create/Modify:**
- `server/src/modules/GeneralStore/generalStore.routes.ts`
- `server/src/modules/GeneralStore/generalStore.controller.ts`
- `server/src/modules/GeneralStore/generalStore.service.ts`
- `server/src/modules/GeneralStore/generalStore.repository.ts`
- `server/src/database/models/generalStore/settings.ts` (if needed)

#### 2.2 Missing Vuex Action
**Problem:** `fetchRequestById` action is called but not implemented

**Solution Steps:**
1. **Implement Missing Action**
   - [ ] Add `fetchRequestById` action to `moduleGeneralStoreActions.js`
   - [ ] Implement API call to `/general-store/requests/:id`
   - [ ] Add proper error handling and loading states

2. **Update Mutations**
   - [ ] Verify `SET_CURRENT_REQUEST` mutation exists
   - [ ] Add mutation if missing

3. **Test Integration**
   - [ ] Test action from RequestDetails.vue component
   - [ ] Verify data flow and state updates

**Files to Modify:**
- `client/src/core/services/store/generalStore/moduleGeneralStoreActions.js`
- `client/src/core/services/store/generalStore/moduleGeneralStoreMutations.js`

---

## 🔶 High Priority Issues

### 3. API Base URL Inconsistencies
**Priority:** HIGH  
**Status:** 🔴 Not Started  
**Estimated Time:** 2-3 hours

**Problem:**
- Client API calls use `/general-store/*` paths
- Server expects `/api/general-store/*` paths
- Missing `/api` prefix in client calls

**Solution Steps:**
1. **Audit All API Calls**
   - [ ] Review all axios calls in Vuex actions
   - [ ] Check direct API calls in Vue components
   - [ ] Remove direct API calls from Vue components and make all API calls from the Vuex store
   - [ ] Identify inconsistent base URLs

2. **Fix Base URL Configuration**
   - [ ] Update axios base URL configuration
   - [ ] Ensure all API calls include `/api` prefix
   - [ ] Test API calls after changes

3. **Verify Route Matching**
   - [ ] Confirm server routes match client expectations
   - [ ] Test all endpoints for proper routing

**Files to Modify:**
- `client/src/axios.js`
- `client/src/core/services/store/generalStore/moduleGeneralStoreActions.js`
- Any Vue components with direct API calls

---

## 🔷 Medium Priority Issues

### 4. Comprehensive Testing
**Priority:** MEDIUM  
**Status:** 🔴 Not Started  
**Estimated Time:** 4-6 hours

**Solution Steps:**
1. **Backend API Testing**
   - [ ] Test all CRUD operations for categories
   - [ ] Test all CRUD operations for subcategories
   - [ ] Test all CRUD operations for items
   - [ ] Test stock movement operations
   - [ ] Test request management workflow
   - [ ] Test all report generation endpoints
   - [ ] Test audit log functionality

2. **Frontend Integration Testing**
   - [ ] Test all Vuex actions and mutations
   - [ ] Verify component-store integration
   - [ ] Test form submissions and validations
   - [ ] Test data loading and error handling

3. **End-to-End Testing**
   - [ ] Test complete user workflows
   - [ ] Verify data consistency across operations
   - [ ] Test error scenarios and edge cases

### 5. Error Handling Improvements
**Priority:** MEDIUM  
**Status:** 🔴 Not Started  
**Estimated Time:** 2-3 hours

**Solution Steps:**
1. **Backend Error Handling**
   - [ ] Review and improve error messages
   - [ ] Add proper HTTP status codes
   - [ ] Implement consistent error response format

2. **Frontend Error Handling**
   - [ ] Improve error display in UI
   - [ ] Add proper loading states
   - [ ] Implement retry mechanisms where appropriate

---

## 🔹 Low Priority Enhancements

### 6. Code Quality Improvements
**Priority:** LOW  
**Status:** 🔴 Not Started  
**Estimated Time:** 3-4 hours

**Solution Steps:**
1. **Code Review and Refactoring**
   - [ ] Review code for consistency
   - [ ] Improve code documentation
   - [ ] Optimize database queries
   - [ ] Remove unused code and imports

2. **Performance Optimization**
   - [ ] Implement pagination where missing
   - [ ] Add caching for frequently accessed data
   - [ ] Optimize API response sizes

---

## 📋 Implementation Order

### Phase 1: Critical Infrastructure (Week 1)
1. Fix backend server startup crash
2. Implement missing settings endpoints
3. Add missing Vuex action
4. Fix API base URL inconsistencies

### Phase 2: Testing and Validation (Week 2)
1. Comprehensive API testing
2. Frontend integration testing
3. End-to-end workflow testing

### Phase 3: Quality and Performance (Week 3)
1. Error handling improvements
2. Code quality enhancements
3. Performance optimizations

---

## 🧪 Testing Checklist

### Backend Testing
- [ ] Server starts without crashes
- [ ] All API endpoints respond correctly
- [ ] Database operations work properly
- [ ] Authentication and authorization work
- [ ] Error handling is consistent

### Frontend Testing
- [ ] All pages load without errors
- [ ] Vuex store operations work correctly
- [ ] API calls succeed and handle errors
- [ ] UI components display data properly
- [ ] Form submissions work correctly

### Integration Testing
- [ ] Complete CRUD workflows function
- [ ] Request approval workflow works
- [ ] Report generation functions
- [ ] Settings management works
- [ ] Audit logging captures events

---

## 📝 Notes

### Dependencies
- MongoDB service must be running
- All environment variables must be properly configured
- Database migrations must be up to date

### Risk Factors
- MongoDB connection issues could block progress
- Missing database tables/models may require schema updates
- Authentication/authorization changes may affect other modules

### Success Criteria
- Backend server starts and runs stably
- All API endpoints function correctly
- Frontend components load and operate without errors
- Complete user workflows work end-to-end
- No console errors or warnings

---

## 🔄 Progress Tracking

**Overall Progress:** 0% Complete

- **Critical Issues:** 0/2 Complete
- **High Priority:** 0/1 Complete
- **Medium Priority:** 0/2 Complete
- **Low Priority:** 0/1 Complete

**Last Updated:** [Current Date]
**Next Review:** [Date + 1 week]

---

*This document should be updated as progress is made and new issues are discovered.*