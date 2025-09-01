const { sequelize } = require('./src/database/models');
const BankReconciliationService = require('./src/modules/Accounting/services/bankReconciliation.service').default;

/**
 * Simple test for BankReconciliationService
 * This tests the basic functionality of the service
 */

async function testBankReconciliationService() {
  console.log('🧪 Testing BankReconciliationService...\n');

  try {
    // Test 1: Import bank statement
    console.log('📊 Test 1: Import Bank Statement');
    
    const statementData = {
      bank_account_id: 1,
      statement_date: new Date('2024-01-31'),
      statement_reference: 'BS-2024-01-001',
      opening_balance: 10000.00,
      closing_balance: 10500.00,
      transactions: [
        {
          transaction_date: new Date('2024-01-30'),
          description: 'Payment received from Patient A',
          reference: 'TXN-001',
          amount: 500.00,
          type: 'CREDIT',
          bank_reference: 'BR-001',
          counterparty: 'Patient A',
          category: 'Patient Payment'
        }
      ],
      imported_by: 1,
      notes: 'Test bank statement import'
    };

    const reconciliationResult = await BankReconciliationService.importBankStatement(statementData);
    
    if (!reconciliationResult || !reconciliationResult.statement_id) {
      throw new Error('Bank statement import failed');
    }
    
    console.log('✅ Bank statement import: PASSED');
    console.log(`   Statement ID: ${reconciliationResult.statement_id}`);
    console.log(`   Total transactions: ${reconciliationResult.total_transactions}`);
    console.log(`   Matched transactions: ${reconciliationResult.matched_transactions}`);

    // Test 2: Get reconciliation summary
    console.log('\n📊 Test 2: Get Reconciliation Summary');
    
    const summary = await BankReconciliationService.getReconciliationSummary();
    
    if (!summary) {
      throw new Error('Reconciliation summary failed');
    }
    
    console.log('✅ Reconciliation summary: PASSED');
    console.log(`   Total statements: ${summary.total_statements}`);
    console.log(`   Reconciliation rate: ${summary.reconciliation_rate}%`);

    // Test 3: Get reconciliation exceptions
    console.log('\n📊 Test 3: Get Reconciliation Exceptions');
    
    const exceptions = await BankReconciliationService.getReconciliationExceptions();
    
    if (!Array.isArray(exceptions)) {
      throw new Error('Reconciliation exceptions failed');
    }
    
    console.log('✅ Reconciliation exceptions: PASSED');
    console.log(`   Exceptions count: ${exceptions.length}`);

    // Test 4: Approve reconciliation
    console.log('\n📊 Test 4: Approve Reconciliation');
    
    await BankReconciliationService.approveReconciliation(
      reconciliationResult.statement_id,
      1,
      'Test approval'
    );
    
    console.log('✅ Reconciliation approval: PASSED');

    console.log('\n🎉 All BankReconciliationService tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the test
if (require.main === module) {
  testBankReconciliationService()
    .then(() => {
      console.log('\n🚀 BankReconciliationService test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 BankReconciliationService test failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testBankReconciliationService,
};
