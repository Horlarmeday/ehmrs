const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:4050/api'; // Server runs on port 4050 with /api prefix
const TEST_PERIOD = {
  name: 'Test Period Q1 2024',
  period_type: 'QUARTERLY',
  start_date: '2024-01-01',
  end_date: '2024-03-31',
  opening_balance: 1000.0,
  description: 'Test financial period for Q1 2024',
  status: 'DRAFT',
  auto_close: false,
};

async function testFinancialPeriods() {
  try {
    console.log('🧪 Testing Financial Periods API...\n');

    // Test 1: Create a financial period
    console.log('1️⃣ Testing CREATE financial period...');
    try {
      const createResponse = await axios.post(
        `${BASE_URL}/accounting/financial-periods`,
        TEST_PERIOD
      );
      console.log('✅ CREATE successful:', createResponse.data.message);
      const periodId = createResponse.data.data.id;
      console.log(`   Period ID: ${periodId}\n`);
    } catch (error) {
      console.log('❌ CREATE failed:', error.response?.data?.message || error.message);
      return;
    }

    // Test 2: Get all financial periods
    console.log('2️⃣ Testing GET all financial periods...');
    try {
      const getResponse = await axios.get(`${BASE_URL}/accounting/financial-periods`);
      console.log('✅ GET successful:', getResponse.data.message);
      console.log(`   Total periods: ${getResponse.data.total}`);
      console.log(`   Periods returned: ${getResponse.data.data.length}`);
      if (getResponse.data.summary) {
        console.log(`   Summary: ${JSON.stringify(getResponse.data.summary)}`);
      }
      console.log('');
    } catch (error) {
      console.log('❌ GET failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Get financial period by ID
    console.log('3️⃣ Testing GET financial period by ID...');
    try {
      const getByIdResponse = await axios.get(`${BASE_URL}/accounting/financial-periods/1`);
      console.log('✅ GET by ID successful:', getByIdResponse.data.message);
      console.log(`   Period: ${getByIdResponse.data.data.name}`);
      console.log(`   Status: ${getByIdResponse.data.data.status}`);
      console.log(`   Type: ${getByIdResponse.data.data.period_type}`);
      console.log(`   Balance: ${getByIdResponse.data.data.balance}`);
      console.log(`   Notes: ${getByIdResponse.data.data.notes}`);
      console.log(`   Is Current: ${getByIdResponse.data.data.is_current}`);
      console.log(`   Auto Close: ${getByIdResponse.data.data.auto_close}`);
      console.log('');
    } catch (error) {
      console.log('❌ GET by ID failed:', error.response?.data?.message || error.message);
    }

    console.log('🎉 Financial Periods API test completed!');
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }
}

// Run the test
testFinancialPeriods();
