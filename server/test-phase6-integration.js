const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual test token

// Test data
const testParams = {
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  department: 'pharmacy',
  report_type: 'comprehensive',
  analysis_type: 'trends',
  include_forecasts: true,
  include_risk_assessment: true,
};

// Test functions
async function testPhase6Integration() {
  console.log('🚀 Testing Phase 6: Reporting & Analytics Integration');
  console.log('='.repeat(60));

  try {
    // Test 1: Financial Reporting
    console.log('\n📊 Testing Financial Reporting Endpoints...');

    const comprehensiveReport = await testEndpoint(
      '/accounting/reports/financial/comprehensive',
      testParams
    );
    console.log('✅ Comprehensive Financial Report:', comprehensiveReport ? 'SUCCESS' : 'FAILED');

    const plStatement = await testEndpoint('/accounting/reports/financial/pl', testParams);
    console.log('✅ Profit & Loss Statement:', plStatement ? 'SUCCESS' : 'FAILED');

    const balanceSheet = await testEndpoint(
      '/accounting/reports/financial/balance-sheet',
      testParams
    );
    console.log('✅ Balance Sheet:', balanceSheet ? 'SUCCESS' : 'FAILED');

    const cashFlow = await testEndpoint('/accounting/reports/financial/cash-flow', testParams);
    console.log('✅ Cash Flow Statement:', cashFlow ? 'SUCCESS' : 'FAILED');

    // Test 2: Operational Reporting
    console.log('\n⚡ Testing Operational Reporting Endpoints...');

    const operationalPerformance = await testEndpoint(
      '/accounting/reports/operational/performance',
      testParams
    );
    console.log('✅ Operational Performance:', operationalPerformance ? 'SUCCESS' : 'FAILED');

    const paymentUtilization = await testEndpoint(
      '/accounting/reports/operational/utilization',
      testParams
    );
    console.log('✅ Payment Method Utilization:', paymentUtilization ? 'SUCCESS' : 'FAILED');

    const reconciliationStatus = await testEndpoint(
      '/accounting/reports/operational/reconciliation',
      testParams
    );
    console.log('✅ Reconciliation Status:', reconciliationStatus ? 'SUCCESS' : 'FAILED');

    const settlementTracking = await testEndpoint(
      '/accounting/reports/operational/settlement',
      testParams
    );
    console.log('✅ Settlement Tracking:', settlementTracking ? 'SUCCESS' : 'FAILED');

    // Test 3: Business Intelligence
    console.log('\n🧠 Testing Business Intelligence Endpoints...');

    const comprehensiveBI = await testEndpoint(
      '/accounting/reports/business-intelligence/comprehensive',
      testParams
    );
    console.log('✅ Comprehensive BI Report:', comprehensiveBI ? 'SUCCESS' : 'FAILED');

    const trendAnalysis = await testEndpoint(
      '/accounting/reports/business-intelligence/trends',
      testParams
    );
    console.log('✅ Payment Trend Analysis:', trendAnalysis ? 'SUCCESS' : 'FAILED');

    const predictiveAnalytics = await testEndpoint(
      '/accounting/reports/business-intelligence/predictive',
      testParams
    );
    console.log('✅ Predictive Analytics:', predictiveAnalytics ? 'SUCCESS' : 'FAILED');

    const kpiMonitoring = await testEndpoint(
      '/accounting/reports/business-intelligence/kpi',
      testParams
    );
    console.log('✅ KPI Monitoring:', kpiMonitoring ? 'SUCCESS' : 'FAILED');

    const realTimeMonitoring = await testEndpoint(
      '/accounting/reports/business-intelligence/real-time',
      testParams
    );
    console.log('✅ Real-Time Monitoring:', realTimeMonitoring ? 'SUCCESS' : 'FAILED');

    console.log('\n🎉 Phase 6 Integration Test Completed!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testEndpoint(endpoint, params) {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params,
      headers: {
        Authorization: `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (response.status === 200 && response.data.success) {
      return true;
    }
    return false;
  } catch (error) {
    if (error.response) {
      console.log(
        `⚠️  ${endpoint}: ${error.response.status} - ${error.response.data.message ||
          'Unknown error'}`
      );
    } else {
      console.log(`⚠️  ${endpoint}: ${error.message}`);
    }
    return false;
  }
}

// Helper function to test service methods directly
async function testServiceMethods() {
  console.log('\n🔧 Testing Service Methods Directly...');

  try {
    // Import services (this would need to be run in the server context)
    console.log('ℹ️  To test service methods directly, run this in the server context');
    console.log(
      'ℹ️  Use: node -e "require(\'./src/modules/Accounting/services/financialReporting.service\')"'
    );
  } catch (error) {
    console.error('❌ Service method test failed:', error.message);
  }
}

// Run tests
if (require.main === module) {
  testPhase6Integration();
  testServiceMethods();
}

module.exports = {
  testPhase6Integration,
  testServiceMethods,
};
