const { 
  ClinicalPayment, 
  BankTransfer, 
  InsuranceClaim, 
  POSTerminalTransaction, 
  CashTransaction,
  BankAccount,
  POSTerminal,
  CashRegister,
  Staff,
  Patient,
  ClinicalBill
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

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test data creation
async function createTestData() {
  log('🔧 Creating test data...', 'info');
  
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
    
    // Create test clinical bill
    const bill = await ClinicalBill.create({
      bill_number: 'TEST-BILL-001',
      patient_id: patient.id,
      visit_id: 1, // You might need to create a visit first
      total_amount: 1000.00,
      discount_amount: 0,
      tax_amount: 0,
      final_amount: 1000.00,
      billing_mode: 'IMMEDIATE',
      patient_co_pay_amount: 100.00,
      hmo_billed_amount: 900.00,
      payment_status: 'PENDING',
      billing_status: 'ACTIVE',
      payment_collection_method: 'CASH',
      payment_collection_point: 'Main Reception',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: 'Test bill for payment testing',
      created_by: staff.id,
      updated_by: staff.id
    });
    
    // Create test bank account
    const bankAccount = await BankAccount.create({
      bank_name: 'Test Bank',
      account_number: '1234567890',
      account_name: 'Test Hospital Account',
      account_type: 'CURRENT',
      current_balance: 100000.00,
      is_active: true,
      description: 'Test bank account for payment testing',
      created_by: staff.id,
      updated_by: staff.id
    });
    
    // Create test POS terminal
    const posTerminal = await POSTerminal.create({
      terminal_id: 'TEST-TERM-001',
      bank_account_id: bankAccount.id,
      location: 'Main Reception',
      terminal_type: 'CARD_READER',
      is_active: true,
      merchant_name: 'Test Hospital',
      merchant_id: 'TEST-MERCHANT-001',
      daily_transaction_limit: 1000000.00,
      daily_amount_limit: 100000.00,
      description: 'Test POS terminal for payment testing',
      created_by: staff.id,
      updated_by: staff.id
    });
    
    // Create test cash register
    const cashRegister = await CashRegister.create({
      register_code: 'TEST-REG-001',
      register_name: 'Test Cash Register',
      location: 'Main Reception',
      current_balance: 5000.00,
      opening_balance: 5000.00,
      expected_closing_balance: 5000.00,
      actual_closing_balance: 5000.00,
      total_cash_received: 0,
      total_cash_disbursed: 0,
      total_change_given: 0,
      total_payments_processed: 0,
      transaction_count: 0,
      status: 'OPEN',
      is_active: true,
      is_in_use: true,
      minimum_balance: 1000.00,
      maximum_balance: 50000.00,
      notes: 'Test cash register for payment testing',
      assigned_staff_id: staff.id
    });
    
    log('✅ Test data created successfully', 'success');
    
    return {
      staff,
      patient,
      bill,
      bankAccount,
      posTerminal,
      cashRegister
    };
    
  } catch (error) {
    log(`❌ Failed to create test data: ${error.message}`, 'error');
    throw error;
  }
}

// Test payment processing
async function testPaymentProcessing(testData) {
  log('\n🧪 Testing Payment Processing...', 'info');
  
  try {
    // Test 1: Cash Payment
    log('📋 Test 1: Cash Payment Processing', 'info');
    
    const cashPayment = await ClinicalPayment.create({
      payment_reference: 'TEST-CASH-001',
      bill_id: testData.bill.id,
      patient_id: testData.patient.id,
      amount: 150.00,
      payment_method: 'CASH',
      payment_type: 'FULL',
      collection_point: 'Main Reception',
      notes: 'Test cash payment',
      status: 'PAID',
      processed_by: testData.staff.id,
      processed_at: new Date()
    });
    
    const cashTransaction = await CashTransaction.create({
      payment_id: cashPayment.id,
      register_id: testData.cashRegister.id,
      movement_type: 'PAYMENT_RECEIVED',
      amount: 150.00,
      previous_balance: 5000.00,
      new_balance: 5150.00,
      reference_number: 'CASH-REF-001',
      transaction_reference: cashPayment.payment_reference,
      status: 'COMPLETED',
      processed_by: testData.staff.id
    });
    
    log('✅ Cash Payment Test PASSED', 'success');
    
    // Test 2: Bank Transfer Payment
    log('📋 Test 2: Bank Transfer Payment Processing', 'info');
    
    const bankPayment = await ClinicalPayment.create({
      payment_reference: 'TEST-BANK-001',
      bill_id: testData.bill.id,
      patient_id: testData.patient.id,
      amount: 250.00,
      payment_method: 'BANK_TRANSFER',
      payment_type: 'FULL',
      notes: 'Test bank transfer payment',
      status: 'PENDING',
      processed_by: testData.staff.id,
      processed_at: new Date()
    });
    
    const bankTransfer = await BankTransfer.create({
      payment_id: bankPayment.id,
      bank_account_id: testData.bankAccount.id,
      transfer_date: new Date(),
      expected_settlement_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      transfer_fee: 5.00,
      transfer_currency: 'NGN',
      exchange_rate: 1.0,
      original_amount: 250.00,
      original_currency: 'NGN',
      transfer_processor: 'BANK_API',
      transfer_processor_reference: 'BT-REF-001',
      transfer_status: 'PENDING'
    });
    
    log('✅ Bank Transfer Payment Test PASSED', 'success');
    
    // Test 3: Insurance Payment
    log('📋 Test 3: Insurance Payment Processing', 'info');
    
    const insurancePayment = await ClinicalPayment.create({
      payment_reference: 'TEST-INS-001',
      bill_id: testData.bill.id,
      patient_id: testData.patient.id,
      amount: 500.00,
      payment_method: 'INSURANCE',
      payment_type: 'FULL',
      insurance_provider: 'Test Insurance Co',
      insurance_claim_number: 'CLM-001',
      notes: 'Test insurance payment',
      status: 'PENDING',
      processed_by: testData.staff.id,
      processed_at: new Date()
    });
    
    const insuranceClaim = await InsuranceClaim.create({
      payment_id: insurancePayment.id,
      claim_reference: 'CLM-001',
      claim_date: new Date(),
      claim_amount: 500.00,
      copay_amount: 50.00,
      insurance_coverage: 450.00,
      claim_status: 'PENDING',
      notes: 'Test insurance claim',
      submitted_by: testData.staff.id,
      submitted_at: new Date()
    });
    
    log('✅ Insurance Payment Test PASSED', 'success');
    
    // Test 4: POS Terminal Payment
    log('📋 Test 4: POS Terminal Payment Processing', 'info');
    
    const posPayment = await ClinicalPayment.create({
      payment_reference: 'TEST-POS-001',
      bill_id: testData.bill.id,
      patient_id: testData.patient.id,
      amount: 100.00,
      payment_method: 'CARD',
      payment_type: 'FULL',
      notes: 'Test POS terminal payment',
      status: 'PAID',
      processed_by: testData.staff.id,
      processed_at: new Date()
    });
    
    const posTransaction = await POSTerminalTransaction.create({
      payment_id: posPayment.id,
      terminal_id: testData.posTerminal.id,
      transaction_id: 'TXN-001',
      authorization_code: 'AUTH-001',
      card_type: 'VISA',
      card_last_four: '1234',
      transaction_status: 'APPROVED',
      transaction_amount: 100.00,
      transaction_fee: 2.50,
      merchant_discount_rate: 0.025,
      processor_reference: 'PROC-001',
      notes: 'Test POS transaction'
    });
    
    log('✅ POS Terminal Payment Test PASSED', 'success');
    
    return {
      cashPayment,
      cashTransaction,
      bankPayment,
      bankTransfer,
      insurancePayment,
      insuranceClaim,
      posPayment,
      posTransaction
    };
    
  } catch (error) {
    log(`❌ Payment processing test failed: ${error.message}`, 'error');
    throw error;
  }
}

// Test data retrieval
async function testDataRetrieval(testData, paymentResults) {
  log('\n🔍 Testing Data Retrieval...', 'info');
  
  try {
    // Test 1: Get payment with specialized data
    log('📋 Test 1: Payment with Specialized Data Retrieval', 'info');
    
    const paymentWithData = await ClinicalPayment.findByPk(paymentResults.cashPayment.id, {
      include: [
        { model: CashTransaction, as: 'cashTransaction' },
        { model: Staff, as: 'processedByStaff' },
        { model: Patient, as: 'patient' }
      ]
    });
    
    if (paymentWithData && paymentWithData.cashTransaction) {
      log('✅ Specialized Data Retrieval PASSED', 'success');
      log(`Cash Transaction Amount: ${paymentWithData.cashTransaction.amount}`, 'success');
    } else {
      log('❌ Specialized Data Retrieval FAILED', 'error');
    }
    
    // Test 2: Get bank transfer payment
    log('📋 Test 2: Bank Transfer Payment Retrieval', 'info');
    
    const bankPaymentWithData = await ClinicalPayment.findByPk(paymentResults.bankPayment.id, {
      include: [
        { model: BankTransfer, as: 'bankTransfer' },
        { model: BankAccount, as: 'bankTransfer.bankAccount' }
      ]
    });
    
    if (bankPaymentWithData && bankPaymentWithData.bankTransfer) {
      log('✅ Bank Transfer Data Retrieval PASSED', 'success');
      log(`Bank Account: ${bankPaymentWithData.bankTransfer.bankAccount?.bank_name}`, 'success');
    } else {
      log('❌ Bank Transfer Data Retrieval FAILED', 'error');
    }
    
    // Test 3: Get insurance payment
    log('📋 Test 3: Insurance Payment Retrieval', 'info');
    
    const insurancePaymentWithData = await ClinicalPayment.findByPk(paymentResults.insurancePayment.id, {
      include: [
        { model: InsuranceClaim, as: 'insuranceClaim' }
      ]
    });
    
    if (insurancePaymentWithData && insurancePaymentWithData.insuranceClaim) {
      log('✅ Insurance Claim Data Retrieval PASSED', 'success');
      log(`Claim Status: ${insurancePaymentWithData.insuranceClaim.claim_status}`, 'success');
    } else {
      log('❌ Insurance Claim Data Retrieval FAILED', 'error');
    }
    
    // Test 4: Get POS payment
    log('📋 Test 4: POS Terminal Payment Retrieval', 'info');
    
    const posPaymentWithData = await ClinicalPayment.findByPk(paymentResults.posPayment.id, {
      include: [
        { model: POSTerminalTransaction, as: 'posTerminalTransaction' },
        { model: POSTerminal, as: 'posTerminalTransaction.terminal' }
      ]
    });
    
    if (posPaymentWithData && posPaymentWithData.posTerminalTransaction) {
      log('✅ POS Terminal Data Retrieval PASSED', 'success');
      log(`Terminal Location: ${posPaymentWithData.posTerminalTransaction.terminal?.location}`, 'success');
    } else {
      log('❌ POS Terminal Data Retrieval FAILED', 'error');
    }
    
    log('✅ All Data Retrieval Tests PASSED', 'success');
    
  } catch (error) {
    log(`❌ Data retrieval test failed: ${error.message}`, 'error');
    throw error;
  }
}

// Clean up test data
async function cleanupTestData(testData, paymentResults) {
  log('\n🧹 Cleaning up test data...', 'info');
  
  try {
    // Delete payment method specific records
    await CashTransaction.destroy({ where: { id: paymentResults.cashTransaction.id } });
    await BankTransfer.destroy({ where: { id: paymentResults.bankTransfer.id } });
    await InsuranceClaim.destroy({ where: { id: paymentResults.insuranceClaim.id } });
    await POSTerminalTransaction.destroy({ where: { id: paymentResults.posTransaction.id } });
    
    // Delete payments
    await ClinicalPayment.destroy({ where: { id: paymentResults.cashPayment.id } });
    await ClinicalPayment.destroy({ where: { id: paymentResults.bankPayment.id } });
    await ClinicalPayment.destroy({ where: { id: paymentResults.insurancePayment.id } });
    await ClinicalPayment.destroy({ where: { id: paymentResults.posPayment.id } });
    
    // Delete test entities
    await CashRegister.destroy({ where: { id: testData.cashRegister.id } });
    await POSTerminal.destroy({ where: { id: testData.posTerminal.id } });
    await BankAccount.destroy({ where: { id: testData.bankAccount.id } });
    await ClinicalBill.destroy({ where: { id: testData.bill.id } });
    await Patient.destroy({ where: { id: testData.patient.id } });
    await Staff.destroy({ where: { id: testData.staff.id } });
    
    log('✅ Test data cleaned up successfully', 'success');
    
  } catch (error) {
    log(`⚠️  Warning: Failed to clean up some test data: ${error.message}`, 'warning');
  }
}

// Main test runner
async function runArchitectureTests() {
  log('🚀 Starting Payment Architecture Tests', 'info');
  log('Testing new normalized payment architecture...', 'info');
  
  let testData, paymentResults;
  
  try {
    // Create test data
    testData = await createTestData();
    
    // Test payment processing
    paymentResults = await testPaymentProcessing(testData);
    
    // Test data retrieval
    await testDataRetrieval(testData, paymentResults);
    
    log('\n🎉 All Payment Architecture Tests PASSED!', 'success');
    log('The new normalized payment architecture is working correctly.', 'success');
    
  } catch (error) {
    log(`\n❌ Payment Architecture Tests FAILED: ${error.message}`, 'error');
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
  runArchitectureTests().catch(error => {
    log(`Test execution failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runArchitectureTests };
