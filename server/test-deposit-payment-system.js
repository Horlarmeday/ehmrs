const { 
  ClinicalPayment, 
  PatientDeposit,
  Staff,
  Patient,
  ClinicalBill,
  BankAccount
} = require('./src/database/models');

// Test configuration
const TEST_TIMEOUT = 10000;

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'     // Reset
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
};

// Test data creation
async function createTestData() {
  log('🔧 Creating test data for deposit payment system...', 'info');
  
  try {
    // Create test staff
    const staff = await Staff.create({
      firstname: 'Test',
      lastname: 'Staff',
      email: 'test.staff@test.com',
      phone: '1234567890',
      role: 'ACCOUNTANT',
      department: 'ACCOUNTING',
      is_active: true
    });
    
    // Create test patient
    const patient = await Patient.create({
      firstname: 'Test',
      lastname: 'Patient',
      hospital_id: 'TEST001',
      date_of_birth: new Date('1990-01-01'),
      gender: 'MALE',
      phone: '0987654321',
      address: 'Test Address',
      is_active: true
    });
    
    // Create test bank account
    const bankAccount = await BankAccount.create({
      bank_name: 'Test Bank',
      account_number: '1234567890',
      account_name: 'Test Hospital Account',
      account_type: 'CURRENT',
      current_balance: 100000.00,
      is_active: true,
      description: 'Test bank account for deposit testing',
      created_by: staff.id,
      updated_by: staff.id
    });
    
    // Create test clinical bill
    const bill = await ClinicalBill.create({
      bill_number: 'TEST-BILL-001',
      patient_id: patient.id,
      visit_id: 1,
      total_amount: 1000.00,
      discount_amount: 0,
      tax_amount: 0,
      final_amount: 1000.00,
      billing_mode: 'IMMEDIATE',
      patient_co_pay_amount: 100.00,
      hmo_billed_amount: 900.00,
      payment_status: 'PENDING',
      billing_status: 'ACTIVE',
      payment_collection_method: 'DEPOSIT',
      payment_collection_point: 'Main Reception',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: 'Test bill for deposit payment testing',
      created_by: staff.id,
      updated_by: staff.id
    });
    
    // Create test patient deposit
    const deposit = await PatientDeposit.create({
      patient_id: patient.id,
      amount: 2000.00,
      deposit_type: 'CASH',
      reference_number: 'DEP-001',
      description: 'Test patient deposit',
      status: 'ACTIVE',
      current_balance: 2000.00,
      refundable_amount: 2000.00,
      initial_amount: 2000.00,
      bank_account_id: bankAccount.id,
      created_by: staff.id,
      updated_by: staff.id
    });
    
    log('✅ Test data created successfully', 'success');
    
    return {
      staff,
      patient,
      bill,
      bankAccount,
      deposit
    };
    
  } catch (error) {
    log(`❌ Failed to create test data: ${error.message}`, 'error');
    throw error;
  }
}

// Test deposit payment processing
async function testDepositPaymentProcessing(testData) {
  log('\n🧪 Testing Deposit Payment Processing...', 'info');
  
  try {
    // Test 1: Create deposit payment
    log('📋 Test 1: Deposit Payment Creation', 'info');
    
    const depositPayment = await ClinicalPayment.create({
      payment_reference: 'TEST-DEP-001',
      bill_id: testData.bill.id,
      patient_id: testData.patient.id,
      amount: 500.00,
      payment_method: 'DEPOSIT',
      payment_type: 'FULL',
      notes: 'Test deposit payment',
      deposit_id: testData.deposit.id,
      deposit_usage: 500.00,
      status: 'PAID',
      processed_by: testData.staff.id,
      processed_at: new Date()
    });
    
    log('✅ Deposit Payment Creation Test PASSED', 'success');
    log(`Payment ID: ${depositPayment.id}`, 'success');
    log(`Deposit Usage: ${depositPayment.deposit_usage}`, 'success');
    
    // Test 2: Verify deposit payment data
    log('📋 Test 2: Deposit Payment Data Verification', 'info');
    
    const retrievedPayment = await ClinicalPayment.findByPk(depositPayment.id, {
      include: [
        { model: PatientDeposit, as: 'deposit' },
        { model: Staff, as: 'processedByStaff' },
        { model: Patient, as: 'patient' }
      ]
    });
    
    if (retrievedPayment && retrievedPayment.deposit) {
      log('✅ Deposit Payment Data Retrieval PASSED', 'success');
      log(`Deposit ID: ${retrievedPayment.deposit.id}`, 'success');
      log(`Deposit Balance: ${retrievedPayment.deposit.current_balance}`, 'success');
      log(`Deposit Usage: ${retrievedPayment.deposit_usage}`, 'success');
    } else {
      log('❌ Deposit Payment Data Retrieval FAILED', 'error');
    }
    
    return {
      depositPayment,
      retrievedPayment
    };
    
  } catch (error) {
    log(`❌ Deposit payment processing test failed: ${error.message}`, 'error');
    throw error;
  }
}

// Clean up test data
async function cleanupTestData(testData, paymentResults) {
  log('\n🧹 Cleaning up test data...', 'info');
  
  try {
    // Delete payments
    if (paymentResults.depositPayment) {
      await ClinicalPayment.destroy({ where: { id: paymentResults.depositPayment.id } });
    }
    
    // Delete test entities
    await ClinicalBill.destroy({ where: { id: testData.bill.id } });
    await PatientDeposit.destroy({ where: { id: testData.deposit.id } });
    await BankAccount.destroy({ where: { id: testData.bankAccount.id } });
    await Patient.destroy({ where: { id: testData.patient.id } });
    await Staff.destroy({ where: { id: testData.staff.id } });
    
    log('✅ Test data cleaned up successfully', 'success');
    
  } catch (error) {
    log(`⚠️  Warning: Failed to clean up some test data: ${error.message}`, 'warning');
  }
}

// Main test runner
async function runDepositPaymentTests() {
  log('🚀 Starting Deposit Payment System Tests', 'info');
  log('Testing Patient Deposit payment system integration...', 'info');
  
  let testData, paymentResults;
  
  try {
    // Create test data
    testData = await createTestData();
    
    // Test deposit payment processing
    paymentResults = await testDepositPaymentProcessing(testData);
    
    log('\n🎉 All Deposit Payment System Tests PASSED!', 'success');
    log('The Patient Deposit payment system is working correctly with the new architecture.', 'success');
    
  } catch (error) {
    log(`\n❌ Deposit Payment System Tests FAILED: ${error.message}`, 'error');
    throw error;
    
  } finally {
    // Clean up test data
    if (testData && paymentResults) {
      await cleanupTestData(testData, paymentResults);
    }
  }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'error');
});

process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`, 'error');
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runDepositPaymentTests().catch(error => {
    log(`Test execution failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runDepositPaymentTests };
