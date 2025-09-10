// Test file for normalized General Store module
// Validates state normalization, migration, and backward compatibility

const {
  migrateToNormalizedState,
  createBackwardCompatibleState,
  validateNormalizedState,
  performanceMonitor,
  devUtils,
  createMigrationPlan,
} = require('./moduleGeneralStoreMigrationUtils.js');

const normalizedModule = require('./moduleGeneralStoreNormalizedIntegration.js');
const normalizedState = require('./moduleGeneralStoreNormalizedState.js');
const normalizedMutations = require('./moduleGeneralStoreNormalizedMutations.js');
const normalizedActions = require('./moduleGeneralStoreNormalizedActions.js');
const normalizedGetters = require('./moduleGeneralStoreNormalizedGetters.js');

// Mock data for testing
const mockCategories = [
  { id: 1, name: 'Medical Supplies', description: 'Medical equipment and supplies' },
  { id: 2, name: 'Pharmaceuticals', description: 'Drugs and medications' },
  { id: 3, name: 'Laboratory', description: 'Lab equipment and reagents' },
];

const mockSubcategories = [
  { id: 1, name: 'Surgical Instruments', category_id: 1 },
  { id: 2, name: 'Antibiotics', category_id: 2 },
  { id: 3, name: 'Blood Tests', category_id: 3 },
];

const mockItems = [
  {
    id: 1,
    name: 'Scalpel',
    category_id: 1,
    subcategory_id: 1,
    quantity: 50,
    reorder_level: 10,
    is_low_stock: false,
    is_expiring: false,
  },
  {
    id: 2,
    name: 'Amoxicillin',
    category_id: 2,
    subcategory_id: 2,
    quantity: 5,
    reorder_level: 20,
    is_low_stock: true,
    is_expiring: false,
  },
  {
    id: 3,
    name: 'Blood Test Kit',
    category_id: 3,
    subcategory_id: 3,
    quantity: 15,
    reorder_level: 5,
    is_low_stock: false,
    is_expiring: true,
  },
];

const mockMovements = [
  {
    id: 1,
    item_id: 1,
    type: 'in',
    quantity: 10,
    movement_date: '2024-01-15T10:00:00Z',
    reason: 'Purchase',
  },
  {
    id: 2,
    item_id: 2,
    type: 'out',
    quantity: 5,
    movement_date: '2024-01-16T14:30:00Z',
    reason: 'Dispensed',
  },
];

const mockRequests = [
  {
    id: 1,
    user_id: 101,
    status: 'pending',
    items: [{ item_id: 1, quantity: 5 }],
    is_my_request: true,
  },
  {
    id: 2,
    user_id: 102,
    status: 'pending_approval',
    items: [{ item_id: 2, quantity: 10 }],
    is_my_request: false,
  },
];

const mockDispensaries = [
  { id: 1, name: 'Main Pharmacy', location: 'Ground Floor' },
  { id: 2, name: 'Emergency Pharmacy', location: 'Emergency Ward' },
];

// Mock old state structure for migration testing
const mockOldState = {
  categories: mockCategories,
  subcategories: mockSubcategories,
  items: mockItems,
  movements: mockMovements,
  requests: mockRequests,
  dispensaries: mockDispensaries,
  currentCategory: mockCategories[0],
  currentSubcategory: mockSubcategories[0],
  currentItem: mockItems[0],
  currentRequest: mockRequests[0],
  categoriesTotal: 3,
  categoriesPages: 1,
  subcategoriesTotal: 3,
  subcategoriesPages: 1,
  itemsTotal: 3,
  itemsPages: 1,
  movementsTotal: 2,
  movementsPages: 1,
  requestsTotal: 2,
  requestsPages: 1,
  dispensariesTotal: 2,
  dispensariesPages: 1,
  loading: false,
  filters: { category: 'Medical Supplies' },
  pagination: { page: 1, limit: 10 },
  dashboardStats: { totalItems: 3, lowStockItems: 1 },
  stockReport: { generated: true },
  movementReport: { generated: true },
  recentReports: ['report1', 'report2'],
  settings: { autoRefresh: true },
};

/**
 * Test Suite for Normalized State Structure
 */
const testNormalizedState = () => {
  console.log('\n=== Testing Normalized State Structure ===');

  try {
    const state = normalizedState();

    // Test state structure
    console.assert(state.entities, 'State should have entities property');
    console.assert(state.currentSelections, 'State should have currentSelections property');
    console.assert(state.metadata, 'State should have metadata property');
    console.assert(state.ui, 'State should have ui property');
    console.assert(state.cache, 'State should have cache property');

    // Test entities structure
    const requiredEntities = [
      'categories',
      'subcategories',
      'items',
      'movements',
      'requests',
      'dispensaries',
    ];
    requiredEntities.forEach((entity) => {
      console.assert(state.entities[entity], `State should have ${entity} entity`);
      console.assert(state.entities[entity].byId, `${entity} should have byId lookup`);
      console.assert(state.entities[entity].allIds, `${entity} should have allIds array`);
    });

    console.log('✅ Normalized state structure test passed');
  } catch (error) {
    console.error('❌ Normalized state structure test failed:', error);
  }
};

/**
 * Test Suite for State Migration
 */
const testStateMigration = () => {
  console.log('\n=== Testing State Migration ===');

  try {
    const migratedState = migrateToNormalizedState(mockOldState);

    // Test migration completeness
    console.assert(migratedState.entities, 'Migrated state should have entities');
    console.assert(
      migratedState.entities.categories.allIds.length === 3,
      'Should migrate all categories'
    );
    console.assert(
      migratedState.entities.subcategories.allIds.length === 3,
      'Should migrate all subcategories'
    );
    console.assert(migratedState.entities.items.allIds.length === 3, 'Should migrate all items');
    console.assert(
      migratedState.entities.movements.allIds.length === 2,
      'Should migrate all movements'
    );
    console.assert(
      migratedState.entities.requests.allIds.length === 2,
      'Should migrate all requests'
    );
    console.assert(
      migratedState.entities.dispensaries.allIds.length === 2,
      'Should migrate all dispensaries'
    );

    // Test lookup tables
    console.assert(
      migratedState.entities.subcategories.byCategory[1].length === 1,
      'Should create category lookup for subcategories'
    );
    console.assert(
      migratedState.entities.items.byCategory[1].length === 1,
      'Should create category lookup for items'
    );
    console.assert(
      migratedState.entities.items.bySubcategory[1].length === 1,
      'Should create subcategory lookup for items'
    );
    console.assert(
      migratedState.entities.items.lowStock.length === 1,
      'Should track low stock items'
    );
    console.assert(
      migratedState.entities.items.expiring.length === 1,
      'Should track expiring items'
    );

    // Test metadata migration
    console.assert(
      migratedState.metadata.categories.total === 3,
      'Should migrate categories total'
    );
    console.assert(migratedState.metadata.items.total === 3, 'Should migrate items total');

    // Test current selections migration
    console.assert(
      migratedState.currentSelections.category === 1,
      'Should migrate current category'
    );
    console.assert(migratedState.currentSelections.item === 1, 'Should migrate current item');

    console.log('✅ State migration test passed');
  } catch (error) {
    console.error('❌ State migration test failed:', error);
  }
};

/**
 * Test Suite for Backward Compatibility
 */
const testBackwardCompatibility = () => {
  console.log('\n=== Testing Backward Compatibility ===');

  try {
    const migratedState = migrateToNormalizedState(mockOldState);
    const compatibleState = createBackwardCompatibleState(migratedState);

    // Test array access
    console.assert(
      Array.isArray(compatibleState.categories),
      'Categories should be accessible as array'
    );
    console.assert(Array.isArray(compatibleState.items), 'Items should be accessible as array');
    console.assert(
      compatibleState.categories.length === 3,
      'Should have correct number of categories'
    );
    console.assert(compatibleState.items.length === 3, 'Should have correct number of items');

    // Test current selections
    console.assert(compatibleState.currentCategory.id === 1, 'Should have current category object');
    console.assert(compatibleState.currentItem.id === 1, 'Should have current item object');

    // Test totals and pagination
    console.assert(compatibleState.categoriesTotal === 3, 'Should have categories total');
    console.assert(compatibleState.itemsTotal === 3, 'Should have items total');

    // Test UI state
    console.assert(compatibleState.loading === false, 'Should have loading state');
    console.assert(compatibleState.filters.category === 'Medical Supplies', 'Should have filters');

    console.log('✅ Backward compatibility test passed');
  } catch (error) {
    console.error('❌ Backward compatibility test failed:', error);
  }
};

/**
 * Test Suite for State Validation
 */
const testStateValidation = () => {
  console.log('\n=== Testing State Validation ===');

  try {
    const validState = migrateToNormalizedState(mockOldState);
    const validation = validateNormalizedState(validState);

    console.assert(validation.isValid === true, 'Valid state should pass validation');
    console.assert(validation.errors.length === 0, 'Valid state should have no errors');

    // Test invalid state
    const invalidState = { entities: {} };
    const invalidValidation = validateNormalizedState(invalidState);

    console.assert(invalidValidation.isValid === false, 'Invalid state should fail validation');
    console.assert(invalidValidation.errors.length > 0, 'Invalid state should have errors');

    console.log('✅ State validation test passed');
  } catch (error) {
    console.error('❌ State validation test failed:', error);
  }
};

/**
 * Test Suite for Mutations
 */
const testMutations = () => {
  console.log('\n=== Testing Normalized Mutations ===');

  try {
    const state = normalizedState();

    // Test SET_CATEGORIES mutation
    normalizedMutations.SET_CATEGORIES(state, mockCategories);
    console.assert(state.entities.categories.allIds.length === 3, 'Should set categories');
    console.assert(
      state.entities.categories.byId[1].name === 'Medical Supplies',
      'Should set category data'
    );

    // Test SET_ITEMS mutation
    normalizedMutations.SET_ITEMS(state, mockItems);
    console.assert(state.entities.items.allIds.length === 3, 'Should set items');
    console.assert(state.entities.items.lowStock.length === 1, 'Should track low stock items');
    console.assert(state.entities.items.expiring.length === 1, 'Should track expiring items');
    console.assert(
      state.entities.items.byCategory[1].length === 1,
      'Should create category lookup'
    );

    // Test ADD_ITEM mutation
    const newItem = { id: 4, name: 'New Item', category_id: 1, subcategory_id: 1 };
    normalizedMutations.ADD_ITEM(state, newItem);
    console.assert(state.entities.items.allIds.length === 4, 'Should add new item');
    console.assert(state.entities.items.byId[4].name === 'New Item', 'Should add item data');

    // Test UPDATE_ITEM mutation
    const updatedItem = { ...newItem, name: 'Updated Item' };
    normalizedMutations.UPDATE_ITEM(state, updatedItem);
    console.assert(state.entities.items.byId[4].name === 'Updated Item', 'Should update item data');

    // Test REMOVE_ITEM mutation
    normalizedMutations.REMOVE_ITEM(state, 4);
    console.assert(state.entities.items.allIds.length === 3, 'Should remove item');
    console.assert(!state.entities.items.byId[4], 'Should remove item data');

    console.log('✅ Normalized mutations test passed');
  } catch (error) {
    console.error('❌ Normalized mutations test failed:', error);
  }
};

/**
 * Test Suite for Getters
 */
const testGetters = () => {
  console.log('\n=== Testing Normalized Getters ===');

  try {
    const state = normalizedState();

    // Set up test data
    normalizedMutations.SET_CATEGORIES(state, mockCategories);
    normalizedMutations.SET_SUBCATEGORIES(state, mockSubcategories);
    normalizedMutations.SET_ITEMS(state, mockItems);
    normalizedMutations.SET_MOVEMENTS(state, mockMovements);
    normalizedMutations.SET_REQUESTS(state, mockRequests);

    // Test basic getters
    const allCategories = normalizedGetters.allCategories(state);
    console.assert(allCategories.length === 3, 'Should get all categories');

    const allItems = normalizedGetters.allItems(state);
    console.assert(allItems.length === 3, 'Should get all items');

    // Test filtered getters
    const categoryById = normalizedGetters.getCategoryById(state)(1);
    console.assert(categoryById.name === 'Medical Supplies', 'Should get category by ID');

    const itemsByCategory = normalizedGetters.getItemsByCategory(state)(1);
    console.assert(itemsByCategory.length === 1, 'Should get items by category');

    const subcategoriesByCategory = normalizedGetters.getSubcategoriesByCategory(state)(1);
    console.assert(subcategoriesByCategory.length === 1, 'Should get subcategories by category');

    // Test special item getters
    const lowStockItems = normalizedGetters.getLowStockItems(state);
    console.assert(lowStockItems.length === 1, 'Should get low stock items');

    const expiringItems = normalizedGetters.getExpiringItems(state);
    console.assert(expiringItems.length === 1, 'Should get expiring items');

    // Test request getters
    const requestsByStatus = normalizedGetters.getRequestsByStatus(state)('pending');
    console.assert(requestsByStatus.length === 1, 'Should get requests by status');

    const myRequests = normalizedGetters.getMyRequests(state);
    console.assert(myRequests.length === 1, 'Should get my requests');

    // Test statistics getters
    const totalItems = normalizedGetters.getTotalItemsCount(state);
    console.assert(totalItems === 3, 'Should get total items count');

    const lowStockCount = normalizedGetters.getLowStockCount(state);
    console.assert(lowStockCount === 1, 'Should get low stock count');

    console.log('✅ Normalized getters test passed');
  } catch (error) {
    console.error('❌ Normalized getters test failed:', error);
  }
};

/**
 * Test Suite for Performance Monitoring
 */
const testPerformanceMonitoring = () => {
  console.log('\n=== Testing Performance Monitoring ===');

  try {
    // Test performance measurement
    const result = performanceMonitor.measure('test-operation', () => {
      return mockCategories.map((cat) => ({ ...cat, processed: true }));
    });

    console.assert(result.length === 3, 'Should return operation result');
    console.assert(result[0].processed === true, 'Should process data correctly');

    // Test state size logging
    const state = migrateToNormalizedState(mockOldState);
    performanceMonitor.logStateSize(state);

    // Test memory leak detection
    const memoryIssues = performanceMonitor.checkMemoryLeaks(state);
    console.assert(Array.isArray(memoryIssues), 'Should return memory issues array');

    console.log('✅ Performance monitoring test passed');
  } catch (error) {
    console.error('❌ Performance monitoring test failed:', error);
  }
};

/**
 * Test Suite for Development Utilities
 */
const testDevUtils = () => {
  console.log('\n=== Testing Development Utilities ===');

  try {
    const state = migrateToNormalizedState(mockOldState);

    // Test state export
    const exported = devUtils.exportState(state);
    console.assert(typeof exported === 'string', 'Should export state as string');
    console.assert(exported.includes('entities'), 'Should include entities in export');

    // Test state import
    const imported = devUtils.importState(exported);
    console.assert(imported.entities, 'Should import state correctly');
    console.assert(
      imported.entities.categories.allIds.length === 3,
      'Should preserve data in import'
    );

    // Test state comparison
    const modifiedState = { ...state };
    modifiedState.entities.categories.allIds = [1, 2]; // Remove one category

    const differences = devUtils.compareStates(state, modifiedState);
    console.assert(differences.length > 0, 'Should detect state differences');

    console.log('✅ Development utilities test passed');
  } catch (error) {
    console.error('❌ Development utilities test failed:', error);
  }
};

/**
 * Test Suite for Migration Plan
 */
const testMigrationPlan = () => {
  console.log('\n=== Testing Migration Plan ===');

  try {
    const validState = migrateToNormalizedState(mockOldState);
    const plan = createMigrationPlan(validState);

    console.assert(typeof plan === 'object', 'Should return migration plan object');
    console.assert(
      typeof plan.needsMigration === 'boolean',
      'Should indicate if migration is needed'
    );
    console.assert(Array.isArray(plan.validationErrors), 'Should include validation errors');
    console.assert(Array.isArray(plan.memoryIssues), 'Should include memory issues');
    console.assert(Array.isArray(plan.recommendedActions), 'Should include recommended actions');
    console.assert(typeof plan.estimatedBenefits === 'object', 'Should include estimated benefits');

    console.log('✅ Migration plan test passed');
  } catch (error) {
    console.error('❌ Migration plan test failed:', error);
  }
};

/**
 * Run all tests
 */
const runAllTests = () => {
  console.log('🧪 Starting General Store Normalized State Tests...');

  testNormalizedState();
  testStateMigration();
  testBackwardCompatibility();
  testStateValidation();
  testMutations();
  testGetters();
  testPerformanceMonitoring();
  testDevUtils();
  testMigrationPlan();

  console.log('\n🎉 All tests completed!');
};

// Auto-run tests in development environment
if (process.env.NODE_ENV === 'development') {
  runAllTests();
}

// Export test functions for individual testing
module.exports = {
  runAllTests,
  testNormalizedState,
  testStateMigration,
  testBackwardCompatibility,
  testStateValidation,
  testMutations,
  testGetters,
  testPerformanceMonitoring,
  testDevUtils,
  testMigrationPlan,
  mockOldState,
  mockCategories,
  mockItems,
  mockMovements,
  mockRequests,
};

// Run tests immediately
runAllTests();
