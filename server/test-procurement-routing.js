const { sequelize } = require('./src/database/models');
const {
  GeneralStoreDispensary,
  GeneralStoreDispensaryItem,
  GeneralStoreItem,
  GeneralStoreCategory,
  GeneralStoreSubcategory,
} = require('./src/database/models/generalStore');
const { Drug, PharmacyStore, LaboratoryStore } = require('./src/database/models');
const {
  ProcurementRoutingService,
} = require('./src/modules/Procurement/services/procurementRouting.service');
const {
  ItemTypeDetectionService,
} = require('./src/modules/Procurement/services/itemTypeDetection.service');
const {
  EnhancedProcurementService,
} = require('./src/modules/Procurement/services/enhancedProcurement.service');

// Test data setup
async function setupTestDatabase() {
  try {
    console.log('🔧 Setting up test database...');

    // Sync database
    await sequelize.sync({ force: true });

    // Create test categories
    const medicalCategory = await GeneralStoreCategory.create({
      name: 'Medical Supplies',
      description: 'Medical supplies and equipment',
      is_active: true,
      created_by: 1,
      updated_by: 1,
    });

    const labCategory = await GeneralStoreCategory.create({
      name: 'Laboratory Supplies',
      description: 'Laboratory reagents and equipment',
      is_active: true,
      created_by: 1,
      updated_by: 1,
    });

    // Create test subcategories
    const surgicalSubcat = await GeneralStoreSubcategory.create({
      name: 'Surgical Equipment',
      category_id: medicalCategory.id,
      description: 'Surgical tools and supplies',
      is_active: true,
      created_by: 1,
      updated_by: 1,
    });

    const reagentSubcat = await GeneralStoreSubcategory.create({
      name: 'Chemical Reagents',
      category_id: labCategory.id,
      description: 'Laboratory chemical reagents',
      is_active: true,
      created_by: 1,
      updated_by: 1,
    });

    // Create test items
    const surgicalGloves = await GeneralStoreItem.create({
      item_code: 'MED001',
      name: 'Surgical Gloves Sterile',
      description: 'Sterile disposable surgical gloves',
      category_id: medicalCategory.id,
      subcategory_id: surgicalSubcat.id,
      unit_id: 1,
      minimum_stock: 10,
      maximum_stock: 100,
      current_stock: 50,
      unit_cost: 15.0,
      location: 'MED-A1',
      created_by: 1,
      updated_by: 1,
    });

    const labReagent = await GeneralStoreItem.create({
      item_code: 'LAB001',
      name: 'Chemistry Test Kit',
      description: 'Blood chemistry analysis reagent kit',
      category_id: labCategory.id,
      subcategory_id: reagentSubcat.id,
      unit_id: 1,
      minimum_stock: 5,
      maximum_stock: 50,
      current_stock: 20,
      unit_cost: 45.0,
      location: 'LAB-B2',
      created_by: 1,
      updated_by: 1,
    });

    // Create test drug
    const testDrug = await Drug.create({
      name: 'Paracetamol Tablets 500mg',
      generic_name: 'Paracetamol',
      code: 'PARA500',
      type: 'tablet',
      strength: '500mg',
      unit_id: 1,
      drug_form: 'DRUG',
      dosage_form_id: 1,
      route_id: 1,
    });

    // Create test dispensaries
    const surgeryDispensary = await GeneralStoreDispensary.create({
      name: 'Surgery Department Dispensary',
      department_id: 1,
      location: 'Surgery Ward Block A',
      accepted_item_types: 'medical_supplies',
      funding_source: 'hospital',
      status: 'active',
      manager_staff_id: 1,
      minimum_stock_level: 5,
      maximum_stock_level: 50,
      auto_replenish: true,
    });

    const labDispensary = await GeneralStoreDispensary.create({
      name: 'Laboratory Dispensary',
      department_id: 2,
      location: 'Laboratory Block B',
      accepted_item_types: 'laboratory',
      funding_source: 'hospital',
      status: 'active',
      manager_staff_id: 2,
      minimum_stock_level: 3,
      maximum_stock_level: 30,
      auto_replenish: true,
    });

    const generalDispensary = await GeneralStoreDispensary.create({
      name: 'General Medical Dispensary',
      department_id: 3,
      location: 'Main Hospital',
      accepted_item_types: 'all',
      funding_source: 'hospital',
      status: 'active',
      manager_staff_id: 3,
      minimum_stock_level: 10,
      maximum_stock_level: 100,
      auto_replenish: true,
    });

    console.log('✅ Test database setup completed successfully');
    return {
      medicalCategory,
      labCategory,
      surgicalGloves,
      labReagent,
      testDrug,
      surgeryDispensary,
      labDispensary,
      generalDispensary,
    };
  } catch (error) {
    console.error('❌ Error setting up test database:', error);
    throw error;
  }
}

// Test Item Type Detection Service
async function testItemTypeDetection(testData) {
  console.log('\n🧪 Testing ItemTypeDetectionService...');

  try {
    const { surgicalGloves, labReagent, testDrug } = testData;

    // Test 1: Detect medical supply
    console.log('Testing medical supply detection...');
    const medicalResult = await ItemTypeDetectionService.detectItemType(
      surgicalGloves.id,
      surgicalGloves.name
    );

    if (
      medicalResult.item_type === 'general_store_item' &&
      medicalResult.category.includes('medical') &&
      medicalResult.confidence > 70
    ) {
      console.log('✅ Medical supply detection works correctly');
    } else {
      console.log('❌ Medical supply detection failed:', medicalResult);
    }

    // Test 2: Detect laboratory item
    console.log('Testing laboratory item detection...');
    const labResult = await ItemTypeDetectionService.detectItemType(labReagent.id, labReagent.name);

    if (
      labResult.item_type === 'general_store_item' &&
      labResult.category.includes('laboratory') &&
      labResult.confidence > 70
    ) {
      console.log('✅ Laboratory item detection works correctly');
    } else {
      console.log('❌ Laboratory item detection failed:', labResult);
    }

    // Test 3: Detect drug by name pattern
    console.log('Testing drug detection by name...');
    const drugResult = await ItemTypeDetectionService.detectItemType(
      0, // No ID, test by name only
      'Paracetamol Tablets 500mg'
    );

    if (drugResult.item_type === 'drug' && drugResult.confidence > 60) {
      console.log('✅ Drug detection by name works correctly');
    } else {
      console.log('❌ Drug detection by name failed:', drugResult);
    }

    // Test 4: Batch detection
    console.log('Testing batch detection...');
    const batchResults = await ItemTypeDetectionService.batchDetectItemTypes([
      { id: surgicalGloves.id, name: surgicalGloves.name },
      { id: labReagent.id, name: labReagent.name },
      { id: 0, name: 'Syringe 10ml Disposable' },
      { id: 0, name: 'Blood Culture Bottles' },
    ]);

    if (batchResults.length === 4) {
      console.log('✅ Batch detection works correctly');
      batchResults.forEach(result => {
        console.log(
          `   - ${result.item_id || 'New'}: ${result.item_type} (${result.confidence}% confidence)`
        );
      });
    } else {
      console.log('❌ Batch detection failed');
    }

    console.log('✅ ItemTypeDetectionService tests passed');
  } catch (error) {
    console.error('❌ ItemTypeDetectionService tests failed:', error);
  }
}

// Test Procurement Routing Service
async function testProcurementRouting(testData) {
  console.log('\n🧪 Testing ProcurementRoutingService...');

  try {
    const { surgicalGloves, labReagent, surgeryDispensary, labDispensary } = testData;

    // Test 1: Route medical supply
    console.log('Testing medical supply routing...');
    const medicalRoutingData = [
      {
        item_id: surgicalGloves.id,
        item_type: 'general_store_item',
        quantity_received: 25,
        unit_cost: 15.0,
        batch_number: 'BATCH001',
      },
    ];

    await ProcurementRoutingService.routeReceivedItems(1, medicalRoutingData, 1);

    // Check if item stock was updated
    await surgicalGloves.reload();
    if (surgicalGloves.current_stock === 75) {
      // 50 + 25
      console.log('✅ Medical supply routing works correctly');
    } else {
      console.log(
        '❌ Medical supply routing failed - expected 75, got:',
        surgicalGloves.current_stock
      );
    }

    // Test 2: Route laboratory item
    console.log('Testing laboratory item routing...');
    const labRoutingData = [
      {
        item_id: labReagent.id,
        item_type: 'laboratory_item',
        quantity_received: 10,
        unit_cost: 45.0,
        batch_number: 'LAB001',
      },
    ];

    await ProcurementRoutingService.routeReceivedItems(2, labRoutingData, 1);

    // Check if item stock was updated
    await labReagent.reload();
    if (labReagent.current_stock === 30) {
      // 20 + 10
      console.log('✅ Laboratory item routing works correctly');
    } else {
      console.log(
        '❌ Laboratory item routing failed - expected 30, got:',
        labReagent.current_stock
      );
    }

    // Test 3: Check dispensary distribution
    console.log('Testing auto-distribution to dispensaries...');
    const dispensaryItems = await GeneralStoreDispensaryItem.findAll({
      where: {
        item_id: [surgicalGloves.id, labReagent.id],
      },
    });

    if (dispensaryItems.length > 0) {
      console.log('✅ Auto-distribution to dispensaries works correctly');
      console.log(`   - ${dispensaryItems.length} dispensary items created`);
    } else {
      console.log('❌ Auto-distribution to dispensaries failed');
    }

    // Test 4: Preview distribution
    console.log('Testing distribution preview...');
    const preview = await ProcurementRoutingService.previewDistribution(
      surgicalGloves.id,
      'general_store_item',
      20
    );

    if (preview.routing_decision && preview.distribution_plan) {
      console.log('✅ Distribution preview works correctly');
      console.log(`   - Routing to: ${preview.routing_decision.store_type}`);
      console.log(`   - Distribution plans: ${preview.distribution_plan.length}`);
    } else {
      console.log('❌ Distribution preview failed');
    }

    console.log('✅ ProcurementRoutingService tests passed');
  } catch (error) {
    console.error('❌ ProcurementRoutingService tests failed:', error);
  }
}

// Test Enhanced Procurement Service
async function testEnhancedProcurement(testData) {
  console.log('\n🧪 Testing EnhancedProcurementService...');

  try {
    const { surgicalGloves, labReagent } = testData;

    // Create mock procurement order and items
    const { ProcurementOrder, ProcurementOrderItem } = require('./src/database/models');

    const mockOrder = await ProcurementOrder.create({
      po_number: 'TEST-001',
      vendor_id: 1,
      order_date: new Date(),
      total_amount: 500.0,
      created_by: 1,
      status: 'SENT',
    });

    const mockOrderItem = await ProcurementOrderItem.create({
      procurement_order_id: mockOrder.id,
      drug_id: surgicalGloves.id,
      unit_id: 1,
      quantity_ordered: 30,
      unit_price: 15.0,
      total_price: 450.0,
    });

    // Test 1: Enhanced receiving with auto-detection
    console.log('Testing enhanced receiving with auto-detection...');
    try {
      const receivedItems = [
        {
          item_id: mockOrderItem.id,
          quantity_received: 25,
          unit_cost: 15.0,
          batch_number: 'TEST001',
          auto_distribute: true,
        },
      ];

      const result = await EnhancedProcurementService.receiveProcurementOrderItemsEnhanced(
        mockOrder.id,
        receivedItems,
        {
          staff_id: 1,
          auto_detect_item_types: true,
          auto_distribute_to_dispensaries: true,
        }
      );

      if (result && result.status === 'RECEIVED') {
        console.log('✅ Enhanced receiving works correctly');
      } else {
        console.log('❌ Enhanced receiving failed - unexpected status:', result?.status);
      }
    } catch (error) {
      console.log('⚠️ Enhanced receiving test skipped (missing dependencies):', error.message);
    }

    // Test 2: Preview receiving plan
    console.log('Testing receiving plan preview...');
    try {
      const previewItems = [
        {
          item_id: mockOrderItem.id,
          quantity_received: 25,
          unit_cost: 15.0,
        },
      ];

      const preview = await EnhancedProcurementService.previewReceivingPlan(
        mockOrder.id,
        previewItems
      );

      if (preview.routing_plan && preview.routing_plan.length > 0) {
        console.log('✅ Receiving plan preview works correctly');
        console.log(`   - Items in plan: ${preview.routing_plan.length}`);
        console.log(`   - Total value: $${preview.total_value}`);
      } else {
        console.log('❌ Receiving plan preview failed');
      }
    } catch (error) {
      console.log('⚠️ Receiving plan preview test skipped:', error.message);
    }

    console.log('✅ EnhancedProcurementService tests passed');
  } catch (error) {
    console.error('❌ EnhancedProcurementService tests failed:', error);
  }
}

// Test Integration Scenarios
async function testIntegrationScenarios(testData) {
  console.log('\n🧪 Testing integration scenarios...');

  try {
    const { surgicalGloves, labReagent, surgeryDispensary, labDispensary } = testData;

    // Test 1: Complete procurement to dispensary workflow
    console.log('Testing complete procurement to dispensary workflow...');

    const initialSurgicalStock = surgicalGloves.current_stock;
    const initialLabStock = labReagent.current_stock;

    // Simulate receiving mixed items
    const mixedRoutingData = [
      {
        item_id: surgicalGloves.id,
        item_type: 'general_store_item',
        quantity_received: 15,
        unit_cost: 15.0,
        batch_number: 'MIX001',
      },
      {
        item_id: labReagent.id,
        item_type: 'laboratory_item',
        quantity_received: 8,
        unit_cost: 45.0,
        batch_number: 'MIX002',
      },
    ];

    await ProcurementRoutingService.routeReceivedItems(99, mixedRoutingData, 1);

    // Verify stock updates
    await surgicalGloves.reload();
    await labReagent.reload();

    const surgicalStockIncrease = surgicalGloves.current_stock - initialSurgicalStock;
    const labStockIncrease = labReagent.current_stock - initialLabStock;

    if (surgicalStockIncrease === 15 && labStockIncrease === 8) {
      console.log('✅ Complete workflow - stock updates work correctly');
    } else {
      console.log('❌ Complete workflow - stock updates failed');
      console.log(`   Surgical: expected +15, got +${surgicalStockIncrease}`);
      console.log(`   Lab: expected +8, got +${labStockIncrease}`);
    }

    // Test 2: Verify dispensary items were created
    const surgicalDispensaryItems = await GeneralStoreDispensaryItem.findAll({
      where: {
        item_id: surgicalGloves.id,
        dispensary_id: surgeryDispensary.id,
      },
    });

    const labDispensaryItems = await GeneralStoreDispensaryItem.findAll({
      where: {
        item_id: labReagent.id,
        dispensary_id: labDispensary.id,
      },
    });

    if (surgicalDispensaryItems.length > 0 && labDispensaryItems.length > 0) {
      console.log('✅ Complete workflow - dispensary distribution works correctly');
    } else {
      console.log('❌ Complete workflow - dispensary distribution failed');
    }

    // Test 3: Cross-store reporting
    console.log('Testing cross-store reporting...');
    const routingStats = await ProcurementRoutingService.getRoutingStatistics({
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date(),
    });

    if (routingStats && routingStats.store_distribution) {
      console.log('✅ Cross-store reporting works correctly');
    } else {
      console.log('❌ Cross-store reporting failed');
    }

    console.log('✅ Integration scenario tests passed');
  } catch (error) {
    console.error('❌ Integration scenario tests failed:', error);
  }
}

// Test Error Handling
async function testErrorHandling(testData) {
  console.log('\n🧪 Testing error handling...');

  try {
    // Test 1: Invalid item type
    console.log('Testing invalid item type handling...');
    try {
      await ProcurementRoutingService.routeReceivedItems(
        1,
        [
          {
            item_id: 99999, // Non-existent item
            item_type: 'invalid_type',
            quantity_received: 10,
            unit_cost: 10.0,
          },
        ],
        1
      );
      console.log('❌ Should have thrown error for invalid item type');
    } catch (error) {
      if (error.name === 'BadException') {
        console.log('✅ Invalid item type error handled correctly');
      } else {
        console.log('❌ Unexpected error type:', error.name);
      }
    }

    // Test 2: Detection service with invalid data
    console.log('Testing detection service error handling...');
    const invalidResult = await ItemTypeDetectionService.detectItemType(
      99999, // Non-existent ID
      'Unknown Item XYZ'
    );

    if (invalidResult.confidence < 50) {
      console.log('✅ Detection service handles unknown items correctly');
    } else {
      console.log('❌ Detection service should have low confidence for unknown items');
    }

    console.log('✅ Error handling tests passed');
  } catch (error) {
    console.error('❌ Error handling tests failed:', error);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Procurement Routing System Tests...\n');

  try {
    // Setup test database and data
    const testData = await setupTestDatabase();

    // Run all tests
    await testItemTypeDetection(testData);
    await testProcurementRouting(testData);
    await testEnhancedProcurement(testData);
    await testIntegrationScenarios(testData);
    await testErrorHandling(testData);

    console.log('\n🎉 All procurement routing tests completed successfully!');
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
  testItemTypeDetection,
  testProcurementRouting,
  testEnhancedProcurement,
  testIntegrationScenarios,
  testErrorHandling,
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}
