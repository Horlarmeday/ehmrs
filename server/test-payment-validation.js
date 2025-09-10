const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:4050/api';
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual test token

// Test data for payment validation
const testPaymentData = {
  bill_id: 1,
  patient_id: 1,
  selected_items: [1, 2],
  amount: 150.0,
  payment_method: 'CASH',
  payment_type: 'FULL',
  payment_date: new Date().toISOString(),
  notes: 'Test payment for validation framework',
  cash_received: 200.0,
  change_given: 50.0,
};

// Test scenarios
const testScenarios = [
  {
    name: 'Valid Cash Payment',
    data: { ...testPaymentData },
    expectedResult: 'success',
  },
  {
    name: 'Invalid Amount (Negative)',
    data: { ...testPaymentData, amount: -50.0 },
    expectedResult: 'validation_error',
  },
  {
    name: 'Invalid Amount (Exceeds Bill)',
    data: { ...testPaymentData, amount: 1000.0 },
    expectedResult: 'validation_error',
  },
  {
    name: 'Invalid Payment Method',
    data: { ...testPaymentData, payment_method: 'INVALID_METHOD' },
    expectedResult: 'validation_error',
  },
  {
    name: 'Missing Required Fields',
    data: { bill_id: 1, patient_id: 1 },
    expectedResult: 'validation_error',
  },
  {
    name: 'Card Payment Without POS Terminal',
    data: {
      ...testPaymentData,
      payment_method: 'CARD',
      pos_terminal_id: null,
    },
    expectedResult: 'validation_error',
  },
  {
    name: 'Bank Transfer Without Bank Account',
    data: {
      ...testPaymentData,
      payment_method: 'BANK_TRANSFER',
      bank_account_id: null,
    },
    expectedResult: 'validation_error',
  },
  {
    name: 'Insurance Payment Without Provider',
    data: {
      ...testPaymentData,
      payment_method: 'INSURANCE',
      insurance_provider: null,
    },
    expectedResult: 'validation_error',
  },
  {
    name: 'Deposit Payment Without Usage Amount',
    data: {
      ...testPaymentData,
      payment_method: 'DEPOSIT',
      deposit_usage: null,
    },
    expectedResult: 'validation_error',
  },
  {
    name: 'Large Cash Payment (Requires Approval)',
    data: {
      ...testPaymentData,
      amount: 15000.0,
      cash_received: 15000.0,
      change_given: 0.0,
    },
    expectedResult: 'approval_required',
  },
];

// Test functions
async function testPaymentValidation() {
  console.log('🧪 Testing Payment Validation Framework\n');

  for (const scenario of testScenarios) {
    console.log(`📋 Testing: ${scenario.name}`);

    try {
      const response = await axios.post(`${BASE_URL}/accounting/process-payment`, scenario.data, {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (scenario.expectedResult === 'success') {
        console.log('✅ PASSED: Payment processed successfully');
        console.log(`   Payment ID: ${response.data.data.payment.id}`);
        console.log(`   Status: ${response.data.data.payment.status}`);
      } else {
        console.log('❌ FAILED: Expected validation error but payment was processed');
      }
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (scenario.expectedResult === 'validation_error' && status === 400) {
          console.log('✅ PASSED: Validation error as expected');
          console.log(`   Error: ${data.message}`);
        } else if (scenario.expectedResult === 'approval_required' && status === 400) {
          console.log('✅ PASSED: Approval required as expected');
          console.log(`   Error: ${data.message}`);
        } else {
          console.log('❌ FAILED: Unexpected error response');
          console.log(`   Status: ${status}`);
          console.log(`   Error: ${data.message}`);
        }
      } else {
        console.log('❌ FAILED: Network or other error');
        console.log(`   Error: ${error.message}`);
      }
    }

    console.log(''); // Empty line for readability
  }
}

// Test validation service directly (if available)
async function testValidationServiceDirectly() {
  console.log('🔧 Testing Validation Service Directly\n');

  try {
    // This would test the validation service without going through the full payment process
    const response = await axios.post(`${BASE_URL}/accounting/validate-payment`, testPaymentData, {
      headers: {
        Authorization: `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Validation service response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.log('❌ Validation service error:');
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

// Test payment options
async function testPaymentOptions() {
  console.log('💳 Testing Payment Options\n');

  try {
    const response = await axios.get(
      `${BASE_URL}/accounting/payment-options?billId=1&patientId=1`,
      {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Payment options response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.log('❌ Payment options error:');
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Payment Validation Framework Tests\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Payment validation through API
    await testPaymentValidation();

    console.log('='.repeat(60));

    // Test 2: Payment options
    await testPaymentOptions();

    console.log('='.repeat(60));

    // Test 3: Direct validation service (if endpoint exists)
    await testValidationServiceDirectly();
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }

  console.log('\n🏁 Payment Validation Framework Tests Complete');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testPaymentValidation,
  testPaymentOptions,
  testValidationServiceDirectly,
  runTests,
};
