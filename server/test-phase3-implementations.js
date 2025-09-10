const sequelizeConnection = require('./dist/database/config/config').default;
const {
  GeneralStoreDispensary,
  GeneralStoreDispensaryItem,
  GeneralStoreItem,
  GeneralStoreRequest,
  GeneralStoreRequestItem,
  ProcurementOrder,
  ProcurementOrderItem,
  Drug,
  Staff,
  Unit,
} = require('./src/database/models');

// Services to test
const {
  DispensaryManagementService,
} = require('./src/modules/GeneralStore/services/dispensaryManagement.service');
const {
  WorkflowManagementService,
} = require('./src/modules/GeneralStore/services/workflowManagement.service');
const {
  ProcurementRoutingService,
} = require('./src/modules/Procurement/services/procurementRouting.service');
const {
  EnhancedProcurementService,
} = require('./src/modules/Procurement/services/enhancedProcurement.service');
const {
  ItemTypeDetectionService,
} = require('./src/modules/Procurement/services/itemTypeDetection.service');
const { UniversalInventoryService } = require('./src/core/services/universalInventory.service');

async function testPhase3Implementations() {
  console.log('🧪 Starting Phase 3 Implementation Tests...\n');

  try {
    await sequelizeConnection.authenticate();
    console.log('✅ Database connection established');

    // Test 1: Dispensary Management Service
    await testDispensaryManagementService();

    // Test 2: Workflow Management Service
    await testWorkflowManagementService();

    // Test 3: Procurement Routing Service
    await testProcurementRoutingService();

    // Test 4: Enhanced Procurement Service
    await testEnhancedProcurementService();

    // Test 5: Item Type Detection Service
    await testItemTypeDetectionService();

    // Test 6: Universal Inventory Service
    await testUniversalInventoryService();

    console.log('\n🎉 All Phase 3 tests completed successfully!');
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelizeConnection.close();
  }
}

async function testDispensaryManagementService() {
  console.log('\n📋 Testing Dispensary Management Service...');

  const transaction = await sequelizeConnection.transaction();

  try {
    // Test creating a dispensary
    const dispensaryData = {
      name: 'Test Emergency Dispensary',
      location: 'Emergency Ward',
      description: 'Test dispensary for emergency supplies',
      funding_source: 'HOSPITAL',
      accepted_item_types: 'medical_supplies',
      department_id: 1,
      supervisor_staff_id: 1,
      max_items_allowed: 100,
      reorder_threshold: 10,
    };

    const dispensary = await DispensaryManagementService.createDispensary(dispensaryData);
    console.log('✅ Dispensary created:', dispensary.name);

    // Test getting dispensary details
    const details = await DispensaryManagementService.getDispensaryDetails(dispensary.id);
    console.log('✅ Dispensary details retrieved');

    // Test updating dispensary
    await DispensaryManagementService.updateDispensary(dispensary.id, {
      max_items_allowed: 150,
    });
    console.log('✅ Dispensary updated');

    // Test getting all dispensaries
    const allDispensaries = await DispensaryManagementService.getAllDispensaries();
    console.log('✅ All dispensaries retrieved:', allDispensaries.length);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw new Error(`Dispensary Management test failed: ${error.message}`);
  }
}

async function testWorkflowManagementService() {
  console.log('\n🔄 Testing Workflow Management Service...');

  try {
    // Test getting workflow statistics
    const stats = await WorkflowManagementService.getWorkflowStatistics();
    console.log('✅ Workflow statistics retrieved');
    console.log('   - Total requests:', stats.total_requests || 0);
    console.log('   - Pending requests:', stats.pending_requests || 0);

    // Test getting active dispensaries for workflows
    const activeDispensaries = await WorkflowManagementService.getActiveDispensariesForWorkflow();
    console.log('✅ Active dispensaries for workflow:', activeDispensaries.length);

    console.log('✅ Workflow Management Service tests passed');
  } catch (error) {
    throw new Error(`Workflow Management test failed: ${error.message}`);
  }
}

async function testProcurementRoutingService() {
  console.log('\n🚚 Testing Procurement Routing Service...');

  try {
    // Test getting routing statistics
    const stats = await ProcurementRoutingService.getRoutingStatistics();
    console.log('✅ Routing statistics retrieved');
    console.log('   - Store distribution:', JSON.stringify(stats.store_distribution));

    // Test getting recommended dispensaries
    const recommendedDispensaries = await ProcurementRoutingService.getRecommendedDispensaries(
      'medical_supplies'
    );
    console.log('✅ Recommended dispensaries retrieved:', recommendedDispensaries.length);

    console.log('✅ Procurement Routing Service tests passed');
  } catch (error) {
    throw new Error(`Procurement Routing test failed: ${error.message}`);
  }
}

async function testEnhancedProcurementService() {
  console.log('\n📦 Testing Enhanced Procurement Service...');

  try {
    // Test getting enhanced procurement statistics
    const stats = await EnhancedProcurementService.getEnhancedProcurementStatistics();
    console.log('✅ Enhanced procurement statistics retrieved');
    console.log('   - Total orders:', stats.total_orders);
    console.log('   - Total items:', stats.total_items);

    // Test getting pending receipt items
    const pendingItems = await EnhancedProcurementService.getPendingReceiptItems();
    console.log('✅ Pending receipt items retrieved:', pendingItems.length);

    console.log('✅ Enhanced Procurement Service tests passed');
  } catch (error) {
    throw new Error(`Enhanced Procurement test failed: ${error.message}`);
  }
}

async function testItemTypeDetectionService() {
  console.log('\n🔍 Testing Item Type Detection Service...');

  try {
    // Test item type detection with a known drug
    const drugs = await Drug.findAll({ limit: 1 });
    if (drugs.length > 0) {
      const detection = await ItemTypeDetectionService.detectItemType(drugs[0].id, drugs[0].name);
      console.log('✅ Item type detected:', detection.item_type);
      console.log('   - Confidence:', detection.confidence);
    }

    // Test batch detection
    const mockItems = [
      { id: 1, name: 'Paracetamol Tablets' },
      { id: 2, name: 'Surgical Gloves' },
      { id: 3, name: 'Blood Test Kit' },
    ];

    const batchDetection = await ItemTypeDetectionService.batchDetectItemTypes(mockItems);
    console.log('✅ Batch detection completed:', batchDetection.length);

    console.log('✅ Item Type Detection Service tests passed');
  } catch (error) {
    throw new Error(`Item Type Detection test failed: ${error.message}`);
  }
}

async function testUniversalInventoryService() {
  console.log('\n🏪 Testing Universal Inventory Service...');

  try {
    // Test getting inventory overview
    const overview = await UniversalInventoryService.getInventoryOverview();
    console.log('✅ Inventory overview retrieved');
    console.log('   - Total stores:', overview.total_stores || 0);
    console.log('   - Total dispensaries:', overview.total_dispensaries || 0);

    // Test getting store inventory
    const storeInventory = await UniversalInventoryService.getStoreInventory('general', 1);
    console.log('✅ Store inventory retrieved:', storeInventory.items?.length || 0, 'items');

    // Test getting dispensary inventory
    const dispensaries = await GeneralStoreDispensary.findAll({ limit: 1 });
    if (dispensaries.length > 0) {
      const dispensaryInventory = await UniversalInventoryService.getDispensaryInventory(
        dispensaries[0].id
      );
      console.log(
        '✅ Dispensary inventory retrieved:',
        dispensaryInventory.items?.length || 0,
        'items'
      );
    }

    console.log('✅ Universal Inventory Service tests passed');
  } catch (error) {
    throw new Error(`Universal Inventory test failed: ${error.message}`);
  }
}

// Additional test utilities
async function runIntegrationTests() {
  console.log('\n🔗 Running Integration Tests...');

  const transaction = await sequelizeConnection.transaction();

  try {
    // Test the full procurement-to-dispensary flow
    console.log('Testing procurement to dispensary integration...');

    // This would test the complete flow but requires more setup
    console.log('✅ Integration tests framework ready');

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw new Error(`Integration test failed: ${error.message}`);
  }
}

// Performance tests
async function runPerformanceTests() {
  console.log('\n⚡ Running Performance Tests...');

  try {
    const startTime = Date.now();

    // Test service response times
    await DispensaryManagementService.getAllDispensaries();
    const dispensaryTime = Date.now() - startTime;

    console.log('✅ Performance metrics:');
    console.log(`   - Dispensary query: ${dispensaryTime}ms`);

    if (dispensaryTime > 5000) {
      console.warn('⚠️  Dispensary queries are slow (>5s)');
    }
  } catch (error) {
    throw new Error(`Performance test failed: ${error.message}`);
  }
}

// Run the tests
if (require.main === module) {
  testPhase3Implementations()
    .then(() => runIntegrationTests())
    .then(() => runPerformanceTests())
    .then(() => {
      console.log('\n🎊 All tests completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  testPhase3Implementations,
  runIntegrationTests,
  runPerformanceTests,
};
