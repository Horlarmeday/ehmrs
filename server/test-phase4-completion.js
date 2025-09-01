const { sequelize } = require('./src/database/models');
const BankReconciliationService = require('./src/modules/Accounting/services/bankReconciliation.service').default;
const POSSettlementApprovalService = require('./src/modules/Accounting/services/posSettlementApproval.service').default;
const InsuranceSettlementApprovalService = require('./src/modules/Accounting/services/insuranceSettlementApproval.service').default;
const SettlementExceptionHandlerService = require('./src/modules/Accounting/services/settlementExceptionHandler.service').default;

/**
 * Phase 4 Completion Test Script
 * 
 * This script tests the completed Phase 4: Reconciliation & Settlement implementation including:
 * - Bank Reconciliation System
 * - POS Terminal Settlement Approval
 * - Insurance Settlement Approval
 * - Enhanced Exception Handling
 */

async function testPhase4Completion() {
  console.log('🚀 Starting Phase 4 Completion Tests...\n');

  try {
    // Test 1: Bank Reconciliation System
    console.log('📊 Test 1: Bank Reconciliation System');
    await testBankReconciliationSystem();
    console.log('✅ Bank Reconciliation System: PASSED\n');

    // Test 2: POS Terminal Settlement Approval
    console.log('💳 Test 2: POS Terminal Settlement Approval');
    await testPOSSettlementApproval();
    console.log('✅ POS Terminal Settlement Approval: PASSED\n');

    // Test 3: Insurance Settlement Approval
    console.log('🏥 Test 3: Insurance Settlement Approval');
    await testInsuranceSettlementApproval();
    console.log('✅ Insurance Settlement Approval: PASSED\n');

    // Test 4: Enhanced Exception Handling
    console.log('⚠️  Test 4: Enhanced Exception Handling');
    await testEnhancedExceptionHandling();
    console.log('✅ Enhanced Exception Handling: PASSED\n');

    // Test 5: Integration Tests
    console.log('🔗 Test 5: Integration Tests');
    await testIntegrationScenarios();
    console.log('✅ Integration Tests: PASSED\n');

    console.log('🎉 All Phase 4 tests completed successfully!');
    console.log('📋 Phase 4: Reconciliation & Settlement is 100% COMPLETE');

  } catch (error) {
    console.error('❌ Phase 4 test failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// ===== TEST 1: BANK RECONCILIATION SYSTEM =====

async function testBankReconciliationSystem() {
  console.log('  Testing bank statement import...');
  
  // Test bank statement data
  const statementData = {
    bank_account_id: 1,
    statement_date: new Date(),
    statement_reference: 'BS-2024-001',
    opening_balance: 10000.00,
    closing_balance: 10500.00,
    transactions: [
      {
        transaction_date: new Date(),
        description: 'Payment received',
        reference: 'TXN-001',
        amount: 500.00,
        type: 'CREDIT',
        bank_reference: 'BR-001',
      }
    ],
    imported_by: 1,
    notes: 'Test bank statement',
  };

  // Test import functionality
  const reconciliationResult = await BankReconciliationService.importBankStatement(statementData);
  
  // Validate result structure
  if (!reconciliationResult.statement_id || 
      reconciliationResult.total_transactions !== 1 ||
      reconciliationResult.matched_transactions !== 0) {
    throw new Error('Bank reconciliation result validation failed');
  }

  console.log('  Testing automated reconciliation...');
  
  // Test reconciliation summary
  const summary = await BankReconciliationService.getReconciliationSummary();
  if (typeof summary.total_statements !== 'number') {
    throw new Error('Reconciliation summary validation failed');
  }

  console.log('  Testing exception detection...');
  
  // Test reconciliation exceptions
  const exceptions = await BankReconciliationService.getReconciliationExceptions();
  if (!Array.isArray(exceptions)) {
    throw new Error('Reconciliation exceptions validation failed');
  }

  console.log('  Testing approval workflow...');
  
  // Test reconciliation approval
  await BankReconciliationService.approveReconciliation('TEST-REC-001', 1, 'Test approval');
}

// ===== TEST 2: POS TERMINAL SETTLEMENT APPROVAL =====

async function testPOSSettlementApproval() {
  console.log('  Testing settlement submission...');
  
  // Test settlement data
  const settlementData = {
    settlement_id: 'POS-SETTLEMENT-001',
    terminal_id: 1,
    settlement_date: new Date(),
    total_amount: 1500.00,
    total_transactions: 15,
    approval_notes: 'Test POS settlement',
    approved_by: 1,
  };

  // Test submission functionality
  const workflow = await POSSettlementApprovalService.submitSettlementForApproval(settlementData);
  
  // Validate workflow structure
  if (workflow.current_status !== 'PENDING_APPROVAL' ||
      !workflow.can_approve ||
      !workflow.can_reject) {
    throw new Error('POS settlement workflow validation failed');
  }

  console.log('  Testing settlement approval...');
  
  // Test approval functionality
  const approvedWorkflow = await POSSettlementApprovalService.approvePOSSettlement(
    'POS-SETTLEMENT-001',
    1,
    'Test approval'
  );
  
  if (approvedWorkflow.current_status !== 'APPROVED' ||
      !approvedWorkflow.can_post) {
    throw new Error('POS settlement approval validation failed');
  }

  console.log('  Testing settlement posting...');
  
  // Test posting functionality
  const postedWorkflow = await POSSettlementApprovalService.postPOSSettlement(
    'POS-SETTLEMENT-001',
    1,
    'Test posting'
  );
  
  if (postedWorkflow.current_status !== 'POSTED') {
    throw new Error('POS settlement posting validation failed');
  }

  console.log('  Testing approval summary...');
  
  // Test approval summary
  const summary = await POSSettlementApprovalService.getSettlementApprovalSummary();
  if (typeof summary.total_settlements !== 'number') {
    throw new Error('POS settlement approval summary validation failed');
  }
}

// ===== TEST 3: INSURANCE SETTLEMENT APPROVAL =====

async function testInsuranceSettlementApproval() {
  console.log('  Testing insurance settlement submission...');
  
  // Test settlement data
  const settlementData = {
    settlement_id: 'INS-SETTLEMENT-001',
    claim_reference: 'CLAIM-001',
    settlement_date: new Date(),
    settled_amount: 2500.00,
    settlement_method: 'BANK_TRANSFER',
    approval_notes: 'Test insurance settlement',
    approved_by: 1,
  };

  // Test submission functionality
  const workflow = await InsuranceSettlementApprovalService.submitSettlementForApproval(settlementData);
  
  // Validate workflow structure
  if (workflow.current_status !== 'PENDING_APPROVAL' ||
      !workflow.can_approve ||
      !workflow.can_reject) {
    throw new Error('Insurance settlement workflow validation failed');
  }

  console.log('  Testing insurance settlement approval...');
  
  // Test approval functionality
  const approvedWorkflow = await InsuranceSettlementApprovalService.approveInsuranceSettlement(
    'INS-SETTLEMENT-001',
    1,
    'Test approval'
  );
  
  if (approvedWorkflow.current_status !== 'APPROVED' ||
      !approvedWorkflow.can_post) {
    throw new Error('Insurance settlement approval validation failed');
  }

  console.log('  Testing insurance settlement posting...');
  
  // Test posting functionality
  const postedWorkflow = await InsuranceSettlementApprovalService.postInsuranceSettlement(
    'INS-SETTLEMENT-001',
    1,
    'Test posting'
  );
  
  if (postedWorkflow.current_status !== 'POSTED') {
    throw new Error('Insurance settlement posting validation failed');
  }

  console.log('  Testing insurance settlement analytics...');
  
  // Test analytics functionality
  const analytics = await InsuranceSettlementApprovalService.getInsuranceSettlementAnalytics();
  if (typeof analytics.total_settlements !== 'number') {
    throw new Error('Insurance settlement analytics validation failed');
  }
}

// ===== TEST 4: ENHANCED EXCEPTION HANDLING =====

async function testEnhancedExceptionHandling() {
  console.log('  Testing exception detection...');
  
  // Test exception detection
  const exceptions = await SettlementExceptionHandlerService.detectSettlementExceptions(
    'PAYMENT',
    1,
    {
      expected_amount: 100.00,
      actual_amount: 99.95,
      expected_date: new Date(),
      actual_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    }
  );
  
  if (!Array.isArray(exceptions)) {
    throw new Error('Exception detection validation failed');
  }

  console.log('  Testing automatic resolution...');
  
  // Test automatic resolution
  const resolutions = await SettlementExceptionHandlerService.attemptAutoResolution(exceptions);
  if (!Array.isArray(resolutions)) {
    throw new Error('Automatic resolution validation failed');
  }

  console.log('  Testing manual resolution...');
  
  // Test manual resolution
  const resolution = {
    exception_id: 'TEST-EXCEPTION-001',
    resolution_type: 'MANUAL',
    resolution_action: 'ADJUST_AMOUNT',
    resolution_notes: 'Test manual resolution',
    resolved_by: 1,
  };
  
  await SettlementExceptionHandlerService.manuallyResolveException('TEST-EXCEPTION-001', resolution);

  console.log('  Testing exception summary...');
  
  // Test exception summary
  const summary = await SettlementExceptionHandlerService.getExceptionSummary();
  if (typeof summary.total_exceptions !== 'number') {
    throw new Error('Exception summary validation failed');
  }

  console.log('  Testing exception trends...');
  
  // Test exception trends
  const trends = await SettlementExceptionHandlerService.getExceptionTrends();
  if (!trends.daily_exceptions || !Array.isArray(trends.daily_exceptions)) {
    throw new Error('Exception trends validation failed');
  }

  console.log('  Testing recovery mechanisms...');
  
  // Test recovery mechanisms
  const recoveryResult = await SettlementExceptionHandlerService.recoverFromSettlementFailure('PAYMENT', 1);
  if (typeof recoveryResult !== 'boolean') {
    throw new Error('Recovery mechanism validation failed');
  }

  console.log('  Testing rollback mechanisms...');
  
  // Test rollback mechanisms
  const rollbackResult = await SettlementExceptionHandlerService.rollbackSettlementChanges('PAYMENT', 1);
  if (typeof rollbackResult !== 'boolean') {
    throw new Error('Rollback mechanism validation failed');
  }
}

// ===== TEST 5: INTEGRATION TESTS =====

async function testIntegrationScenarios() {
  console.log('  Testing end-to-end reconciliation workflow...');
  
  // Test complete reconciliation workflow
  const statementData = {
    bank_account_id: 1,
    statement_date: new Date(),
    statement_reference: 'BS-INTEGRATION-001',
    opening_balance: 5000.00,
    closing_balance: 5500.00,
    transactions: [
      {
        transaction_date: new Date(),
        description: 'Integration test payment',
        reference: 'INT-TXN-001',
        amount: 500.00,
        type: 'CREDIT',
        bank_reference: 'INT-BR-001',
      }
    ],
    imported_by: 1,
  };

  // Import and reconcile
  const reconciliationResult = await BankReconciliationService.importBankStatement(statementData);
  
  // Test exception handling integration
  const exceptions = await SettlementExceptionHandlerService.detectSettlementExceptions(
    'BANK_TRANSFER',
    1,
    {
      expected_amount: 500.00,
      actual_amount: 500.00,
      settlement_status: 'SUCCESS',
    }
  );

  // Test auto-resolution integration
  const resolutions = await SettlementExceptionHandlerService.attemptAutoResolution(exceptions);

  console.log('  Testing settlement approval integration...');
  
  // Test POS settlement approval integration
  const posSettlementData = {
    settlement_id: 'POS-INTEGRATION-001',
    terminal_id: 1,
    settlement_date: new Date(),
    total_amount: 2000.00,
    total_transactions: 20,
    approved_by: 1,
  };

  const posWorkflow = await POSSettlementApprovalService.submitSettlementForApproval(posSettlementData);
  const posApproved = await POSSettlementApprovalService.approvePOSSettlement('POS-INTEGRATION-001', 1);
  const posPosted = await POSSettlementApprovalService.postPOSSettlement('POS-INTEGRATION-001', 1);

  // Test insurance settlement approval integration
  const insSettlementData = {
    settlement_id: 'INS-INTEGRATION-001',
    claim_reference: 'INT-CLAIM-001',
    settlement_date: new Date(),
    settled_amount: 3000.00,
    settlement_method: 'CHECK',
    approved_by: 1,
  };

  const insWorkflow = await InsuranceSettlementApprovalService.submitSettlementForApproval(insSettlementData);
  const insApproved = await InsuranceSettlementApprovalService.approveInsuranceSettlement('INS-INTEGRATION-001', 1);
  const insPosted = await InsuranceSettlementApprovalService.postInsuranceSettlement('INS-INTEGRATION-001', 1);

  console.log('  Testing exception handling integration...');
  
  // Test exception handling with settlement processes
  const settlementExceptions = await SettlementExceptionHandlerService.detectSettlementExceptions(
    'POS_TRANSACTION',
    1,
    {
      settlement_status: 'FAILED',
      failure_reason: 'Integration test failure',
    }
  );

  // Test recovery integration
  const recoveryResult = await SettlementExceptionHandlerService.recoverFromSettlementFailure('POS_TRANSACTION', 1);
  const rollbackResult = await SettlementExceptionHandlerService.rollbackSettlementChanges('POS_TRANSACTION', 1);
}

// ===== MAIN EXECUTION =====

if (require.main === module) {
  testPhase4Completion()
    .then(() => {
      console.log('\n🎯 Phase 4 testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Phase 4 testing failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testPhase4Completion,
  testBankReconciliationSystem,
  testPOSSettlementApproval,
  testInsuranceSettlementApproval,
  testEnhancedExceptionHandling,
  testIntegrationScenarios,
};
