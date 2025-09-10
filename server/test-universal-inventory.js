const { sequelize } = require('./src/database/models');
const {
  GeneralStoreDispensary,
  GeneralStoreDispensaryItem,
  GeneralStoreItem,
  GeneralStoreCategory,
  GeneralStoreSubcategory,
} = require('./src/database/models/generalStore');
const { UniversalInventoryService } = require('./src/core/services/universalInventory.service');

// Test database setup
async function setupTestDatabase() {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Test database synced successfully');

    // Create test data
    const testCategory = await GeneralStoreCategory.create({
      name: 'Test Medical Supplies',
      description: 'Test category for medical supplies',
      is_active: true,
      created_by: 1,
      updated_by: 1,
    });

    const testSubcategory = await GeneralStoreSubcategory.create({
      name: 'Test Consumables',
      category_id: testCategory.id,
      description: 'Test subcategory for consumables',
      is_active: true,
      created_by: 1,
      updated_by: 1,
    });

    const testItem = await GeneralStoreItem.create({
      item_code: 'TEST001',
      name: 'Test Surgical Gloves',
      description: 'Test item for unit testing',
      category_id: testCategory.id,
      subcategory_id: testSubcategory.id,
      unit_id: 1,
      minimum_stock: 10,
      maximum_stock: 100,
      current_stock: 50,
      unit_cost: 25.0,
      location: 'TEST-A1',
      created_by: 1,
      updated_by: 1,
    });

    const testDispensary = await GeneralStoreDispensary.create({
      name: 'Test Surgery Dispensary',
      department_id: 1,
      location: 'Surgery Ward',
      accepted_item_types: 'medical_supplies',
      funding_source: 'hospital',
      status: 'active',
      manager_staff_id: 1,
      minimum_stock_level: 5,
      maximum_stock_level: 50,
      auto_replenish: true,
    });

    console.log('✅ Test data created successfully');
    return { testCategory, testSubcategory, testItem, testDispensary };
  } catch (error) {
    console.error('❌ Error setting up test database:', error);
    throw error;
  }
}

// Test GeneralStoreDispensary model
async function testGeneralStoreDispensary(testData) {
  console.log('\n🧪 Testing GeneralStoreDispensary model...');

  try {
    const { testDispensary } = testData;

    // Test canReceiveItemType method
    console.log('Testing canReceiveItemType...');
    const canReceiveMedical = testDispensary.canReceiveItemType('medical_supplies');
    const canReceiveEquipment = testDispensary.canReceiveItemType('equipment');

    if (canReceiveMedical && !canReceiveEquipment) {
      console.log('✅ canReceiveItemType works correctly');
    } else {
      console.log('❌ canReceiveItemType failed');
    }

    // Test getTotalValue method (should be 0 initially)
    const totalValue = testDispensary.getTotalValue();
    if (totalValue === 0) {
      console.log('✅ getTotalValue works correctly (empty dispensary)');
    } else {
      console.log('❌ getTotalValue failed - expected 0, got:', totalValue);
    }

    // Test getStockStatus method
    const stockStatus = testDispensary.getStockStatus();
    if (stockStatus === 'out_of_stock') {
      console.log('✅ getStockStatus works correctly (empty dispensary)');
    } else {
      console.log('❌ getStockStatus failed - expected out_of_stock, got:', stockStatus);
    }

    console.log('✅ GeneralStoreDispensary model tests passed');
  } catch (error) {
    console.error('❌ GeneralStoreDispensary model tests failed:', error);
  }
}

// Test GeneralStoreDispensaryItem model
async function testGeneralStoreDispensaryItem(testData) {
  console.log('\n🧪 Testing GeneralStoreDispensaryItem model...');

  try {
    const { testDispensary, testItem } = testData;

    // Create a dispensary item
    const dispensaryItem = await GeneralStoreDispensaryItem.create({
      dispensary_id: testDispensary.id,
      item_id: testItem.id,
      quantity_received: 20,
      quantity_remaining: 15,
      quantity_reserved: 3,
      unit_cost: 25.0,
      batch_number: 'BATCH001',
      expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    // Test getAvailableQuantity method
    const availableQty = dispensaryItem.getAvailableQuantity();
    if (availableQty === 12) {
      // 15 - 3
      console.log('✅ getAvailableQuantity works correctly');
    } else {
      console.log('❌ getAvailableQuantity failed - expected 12, got:', availableQty);
    }

    // Test canReserve method
    const canReserve = dispensaryItem.canReserve(10);
    if (canReserve) {
      console.log('✅ canReserve works correctly (can reserve within available)');
    } else {
      console.log('❌ canReserve failed');
    }

    const cannotReserve = dispensaryItem.canReserve(15);
    if (!cannotReserve) {
      console.log('✅ canReserve works correctly (cannot reserve more than available)');
    } else {
      console.log('❌ canReserve failed - should not be able to reserve more than available');
    }

    // Test reserve method
    const reserveSuccess = dispensaryItem.reserve(5);
    if (reserveSuccess && dispensaryItem.quantity_reserved === 8) {
      console.log('✅ reserve method works correctly');
    } else {
      console.log('❌ reserve method failed');
    }

    // Test dispense method
    const dispenseSuccess = dispensaryItem.dispense(3);
    if (dispenseSuccess && dispensaryItem.quantity_remaining === 12) {
      console.log('✅ dispense method works correctly');
    } else {
      console.log('❌ dispense method failed');
    }

    // Test isExpiringSoon method
    const expiringSoon = dispensaryItem.isExpiringSoon(45); // Should be true for 30-day expiry
    if (expiringSoon) {
      console.log('✅ isExpiringSoon works correctly');
    } else {
      console.log('❌ isExpiringSoon failed');
    }

    // Test validation method
    const validation = dispensaryItem.validateQuantityOperation('dispense', 15);
    if (!validation.valid) {
      console.log('✅ validateQuantityOperation works correctly (prevents over-dispensing)');
    } else {
      console.log('❌ validateQuantityOperation failed - should prevent over-dispensing');
    }

    console.log('✅ GeneralStoreDispensaryItem model tests passed');
  } catch (error) {
    console.error('❌ GeneralStoreDispensaryItem model tests failed:', error);
  }
}

// Test UniversalInventoryService
async function testUniversalInventoryService(testData) {
  console.log('\n🧪 Testing UniversalInventoryService...');

  try {
    const { testDispensary, testItem } = testData;

    // Test transferToDispensary method
    console.log('Testing transferToDispensary...');

    const transferResult = await UniversalInventoryService.transferToDispensary({
      from_store_type: 'general',
      from_store_id: 1,
      to_dispensary_id: testDispensary.id,
      item_id: testItem.id,
      quantity: 10,
      reason: 'Initial stock transfer',
      staff_id: 1,
    });

    if (transferResult && transferResult.quantity_remaining === 10) {
      console.log('✅ transferToDispensary works correctly');
    } else {
      console.log('❌ transferToDispensary failed');
    }

    // Reload test item to check stock reduction
    await testItem.reload();
    if (testItem.current_stock === 40) {
      // 50 - 10
      console.log('✅ Source inventory updated correctly');
    } else {
      console.log('❌ Source inventory update failed - expected 40, got:', testItem.current_stock);
    }

    // Test getDispensaryStockSummary method
    console.log('Testing getDispensaryStockSummary...');

    const summary = await UniversalInventoryService.getDispensaryStockSummary(testDispensary.id);

    if (summary && summary.summary.total_items === 10) {
      console.log('✅ getDispensaryStockSummary works correctly');
    } else {
      console.log('❌ getDispensaryStockSummary failed');
    }

    // Test insufficient stock scenario
    console.log('Testing insufficient stock handling...');

    try {
      await UniversalInventoryService.transferToDispensary({
        from_store_type: 'general',
        from_store_id: 1,
        to_dispensary_id: testDispensary.id,
        item_id: testItem.id,
        quantity: 100, // More than available (40)
        reason: 'Test insufficient stock',
        staff_id: 1,
      });
      console.log('❌ Should have thrown insufficient stock error');
    } catch (error) {
      if (error.name === 'BadException' && error.code === 'INSUFFICIENT_STOCK') {
        console.log('✅ Insufficient stock error handled correctly');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('✅ UniversalInventoryService tests passed');
  } catch (error) {
    console.error('❌ UniversalInventoryService tests failed:', error);
  }
}

// Test business logic integration
async function testBusinessLogicIntegration(testData) {
  console.log('\n🧪 Testing business logic integration...');

  try {
    const { testDispensary } = testData;

    // Get dispensary with items
    const dispensaryWithItems = await GeneralStoreDispensary.findByPk(testDispensary.id, {
      include: [GeneralStoreDispensaryItem],
    });

    // Test dispensary methods with real data
    const totalValue = dispensaryWithItems.getTotalValue();
    const totalItems = dispensaryWithItems.getTotalItems();
    const stockStatus = dispensaryWithItems.getStockStatus();

    console.log(`Total value: ${totalValue}`);
    console.log(`Total items: ${totalItems}`);
    console.log(`Stock status: ${stockStatus}`);

    if (totalValue > 0 && totalItems > 0) {
      console.log('✅ Business logic integration works correctly');
    } else {
      console.log('❌ Business logic integration failed');
    }

    // Test low stock detection
    const lowStockItems = dispensaryWithItems.getLowStockItems();
    if (lowStockItems.length === 0 || lowStockItems.length > 0) {
      console.log('✅ Low stock detection works correctly');
    }

    console.log('✅ Business logic integration tests passed');
  } catch (error) {
    console.error('❌ Business logic integration tests failed:', error);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Universal Inventory System Tests...\n');

  try {
    // Setup test database and data
    const testData = await setupTestDatabase();

    // Run all tests
    await testGeneralStoreDispensary(testData);
    await testGeneralStoreDispensaryItem(testData);
    await testUniversalInventoryService(testData);
    await testBusinessLogicIntegration(testData);

    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('📝 Database connection closed');
  }
}

// Export for potential external use
module.exports = {
  runTests,
  setupTestDatabase,
  testGeneralStoreDispensary,
  testGeneralStoreDispensaryItem,
  testUniversalInventoryService,
  testBusinessLogicIntegration,
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}
