const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000/api/accounting';
const TEST_TIMEOUT = 30000;

// Test data
const testData = {
  bill_id: 1, // You'll need to create a test bill first
  patient_id: 1, // You'll need to create a test patient first
  staff_id: 1, // You'll need to create a test staff first
};

// Test scenarios
const testScenarios = [
  {
    name: 'Cash Payment Test',
    endpoint: '/process-payment',
    data: {
      bill_id: testData.bill_id,
      patient_id: testData.patient_id,
      amount: 150.0,
      payment_method: 'CASH',
      payment_type: 'FULL',
      collection_point: 'Main Reception',
      cash_register_id: 1, // You'll need to create a test cash register first
      notes: 'Test cash payment',
    },
    expectedStatus: 201,
    description: 'Process a cash payment using the new CashTransaction model',
  },
  {
    name: 'Bank Transfer Payment Test',
    endpoint: '/process-payment',
    data: {
      bill_id: testData.bill_id,
      patient_id: testData.patient_id,
      amount: 250.0,
      payment_method: 'BANK_TRANSFER',
      payment_type: 'FULL',
      bank_account_id: 1, // You'll need to create a test bank account first
      transfer_date: new Date().toISOString(),
      expected_settlement_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      transfer_fee: 5.0,
      transfer_currency: 'NGN',
      exchange_rate: 1.0,
      original_amount: 250.0,
      original_currency: 'NGN',
      transfer_processor: 'BANK_API',
      transfer_processor_reference: 'BT-REF-001',
      notes: 'Test bank transfer payment',
    },
    expectedStatus: 201,
    description: 'Process a bank transfer payment using the new BankTransfer model',
  },
  {
    name: 'Insurance Payment Test',
    endpoint: '/process-payment',
    data: {
      bill_id: testData.bill_id,
      patient_id: testData.patient_id,
      amount: 500.0,
      payment_method: 'INSURANCE',
      payment_type: 'FULL',
      insurance_provider: 'Test Insurance Co',
      policy_number: 'POL-001',
      copay_amount: 50.0,
      claim_date: new Date().toISOString(),
      notes: 'Test insurance payment',
    },
    expectedStatus: 201,
    description: 'Process an insurance payment using the new InsuranceClaim model',
  },
  {
    name: 'POS Terminal Payment Test',
    endpoint: '/process-payment',
    data: {
      bill_id: testData.bill_id,
      patient_id: testData.patient_id,
      amount: 100.0,
      payment_method: 'CARD',
      payment_type: 'FULL',
      terminal_id: 1, // You'll need to create a test POS terminal first
      transaction_id: 'TXN-001',
      authorization_code: 'AUTH-001',
      card_type: 'VISA',
      card_last_four: '1234',
      transaction_status: 'APPROVED',
      transaction_amount: 100.0,
      transaction_fee: 2.5,
      merchant_discount_rate: 0.025,
      processor_reference: 'PROC-001',
      notes: 'Test POS terminal payment',
    },
    expectedStatus: 201,
    description: 'Process a POS terminal payment using the new POSTerminalTransaction model',
  },
];

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m', // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m', // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m', // Reset
  };

  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Test runner
async function runTests() {
  log('🚀 Starting Payment System Tests', 'info');
  log('Testing new normalized payment architecture...', 'info');

  let passedTests = 0;
  let failedTests = 0;
  let totalTests = testScenarios.length;

  for (let i = 0; i < testScenarios.length; i++) {
    const test = testScenarios[i];
    log(`\n📋 Test ${i + 1}/${totalTests}: ${test.name}`, 'info');
    log(`Description: ${test.description}`, 'info');

    try {
      log(`🌐 Making request to: ${test.endpoint}`, 'info');

      const response = await axios.post(`${BASE_URL}${test.endpoint}`, test.data, {
        timeout: TEST_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': 'Bearer YOUR_TOKEN'
        },
      });

      if (response.status === test.expectedStatus) {
        log(`✅ Test PASSED: ${test.name}`, 'success');
        log(`Response Status: ${response.status}`, 'success');
        log(`Response Data: ${JSON.stringify(response.data, null, 2)}`, 'success');
        passedTests++;
      } else {
        log(`❌ Test FAILED: ${test.name}`, 'error');
        log(`Expected Status: ${test.expectedStatus}, Got: ${response.status}`, 'error');
        log(`Response Data: ${JSON.stringify(response.data, null, 2)}`, 'error');
        failedTests++;
      }
    } catch (error) {
      log(`❌ Test FAILED: ${test.name}`, 'error');

      if (error.response) {
        log(`Error Status: ${error.response.status}`, 'error');
        log(`Error Data: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
      } else if (error.request) {
        log(`Network Error: ${error.message}`, 'error');
      } else {
        log(`Error: ${error.message}`, 'error');
      }

      failedTests++;
    }

    // Add delay between tests to avoid overwhelming the server
    if (i < testScenarios.length - 1) {
      log(`⏳ Waiting 2 seconds before next test...`, 'warning');
      await delay(2000);
    }
  }

  // Test summary
  log('\n📊 Test Summary', 'info');
  log(`Total Tests: ${totalTests}`, 'info');
  log(`Passed: ${passedTests}`, 'success');
  log(`Failed: ${failedTests}`, 'error');
  log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`, 'info');

  if (failedTests === 0) {
    log('\n🎉 All tests passed! The new payment architecture is working correctly.', 'success');
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.', 'warning');
  }

  // Additional validation tests
  log('\n🔍 Running Additional Validation Tests...', 'info');
  await runValidationTests();
}

// Additional validation tests
async function runValidationTests() {
  try {
    log('📋 Testing Payment Retrieval...', 'info');

    // Test getting payments with specialized data
    const paymentsResponse = await axios.get(`${BASE_URL}/payments`, {
      timeout: TEST_TIMEOUT,
      params: {
        payment_method: 'BANK_TRANSFER',
        limit: 5,
      },
    });

    if (paymentsResponse.status === 200) {
      log('✅ Payment Retrieval Test PASSED', 'success');
      log(`Found ${paymentsResponse.data.payments?.length || 0} payments`, 'success');

      // Check if specialized data is included
      const payment = paymentsResponse.data.payments?.[0];
      if (payment && payment.bankTransfer) {
        log('✅ Specialized Data Loading PASSED - BankTransfer data found', 'success');
      } else {
        log('⚠️  Specialized Data Loading WARNING - No BankTransfer data found', 'warning');
      }
    } else {
      log('❌ Payment Retrieval Test FAILED', 'error');
    }
  } catch (error) {
    log('❌ Payment Retrieval Test FAILED', 'error');
    if (error.response) {
      log(`Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`, 'error');
    }
  }

  try {
    log('📋 Testing Payment Summary...', 'info');

    const summaryResponse = await axios.get(`${BASE_URL}/payment-summary`, {
      timeout: TEST_TIMEOUT,
    });

    if (summaryResponse.status === 200) {
      log('✅ Payment Summary Test PASSED', 'success');
      log(`Summary Data: ${JSON.stringify(summaryResponse.data, null, 2)}`, 'success');

      // Check if enhanced details are included
      if (
        summaryResponse.data.bank_transfer_details ||
        summaryResponse.data.insurance_details ||
        summaryResponse.data.pos_details ||
        summaryResponse.data.cash_details
      ) {
        log('✅ Enhanced Summary Details PASSED', 'success');
      } else {
        log('⚠️  Enhanced Summary Details WARNING - No specialized details found', 'warning');
      }
    } else {
      log('❌ Payment Summary Test FAILED', 'error');
    }
  } catch (error) {
    log('❌ Payment Summary Test FAILED', 'error');
    if (error.response) {
      log(`Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`, 'error');
    }
  }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'error');
});

process.on('uncaughtException', error => {
  log(`Uncaught Exception: ${error.message}`, 'error');
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    log(`Test execution failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runTests, runValidationTests };
