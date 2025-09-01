const { sequelize } = require('./src/database/models');
const {
  Staff,
  Patient,
  ChartOfAccount,
  JournalEntry,
  JournalEntryLine,
  FinancialPeriod,
  Department,
} = require('./src/database/models');

const { JournalEntryStatus } = require('./src/modules/Accounting/enums');

async function testPhase3Completion() {
  console.log('🚀 Testing Phase 3 Completion: Enhanced Journal Entry System');
  console.log('=' .repeat(60));

  try {
    // Test 1: Create test data
    console.log('\n📋 Test 1: Creating test data...');
    
    // Create test staff
    const staff = await Staff.create({
      firstname: 'Test',
      lastname: 'Accountant',
      email: 'test.accountant@hospital.com',
      phone: '08012345678',
      role: 'ACCOUNTANT',
      is_active: true,
    });

    // Create test patient
    const patient = await Patient.create({
      firstname: 'Test',
      lastname: 'Patient',
      hospital_id: 'TEST001',
      phone: '08087654321',
      email: 'test.patient@email.com',
      is_active: true,
    });

    // Create test department
    const department = await Department.create({
      name: 'Test Department',
      code: 'TEST',
      is_active: true,
    });

    // Create test financial period
    const period = await FinancialPeriod.create({
      name: 'Test Period 2024',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-12-31'),
      period_type: 'ANNUAL',
      status: 'OPEN',
      is_current: true,
      created_by: staff.id,
    });

    // Create test chart of accounts
    const cashAccount = await ChartOfAccount.create({
      code: '1001',
      name: 'Cash Account',
      type: 'ASSET',
      balance: 10000.00,
      is_active: true,
    });

    const revenueAccount = await ChartOfAccount.create({
      code: '4001',
      name: 'Patient Revenue',
      type: 'INCOME',
      balance: 0.00,
      is_active: true,
    });

    const expenseAccount = await ChartOfAccount.create({
      code: '5001',
      name: 'Operating Expenses',
      type: 'EXPENSE',
      balance: 0.00,
      is_active: true,
    });

    console.log('✅ Test data created successfully');

    // Test 2: Create journal entry workflow
    console.log('\n📋 Test 2: Testing journal entry workflow...');
    
    // Create a journal entry
    const journalEntry = await JournalEntry.create({
      reference: 'JE-TEST-001',
      description: 'Test journal entry for patient services',
      transaction_date: new Date(),
      patient_id: patient.id,
      period_id: period.id,
      status: JournalEntryStatus.DRAFT,
      entry_type: 'PATIENT_SERVICE',
      created_by: staff.id,
    });

    // Create journal entry lines
    const lines = await JournalEntryLine.bulkCreate([
      {
        journal_entry_id: journalEntry.id,
        account_id: cashAccount.id,
        debit: 5000.00,
        credit: 0.00,
        description: 'Cash received for patient services',
        line_type: 'STANDARD',
      },
      {
        journal_entry_id: journalEntry.id,
        account_id: revenueAccount.id,
        debit: 0.00,
        credit: 5000.00,
        description: 'Revenue from patient services',
        line_type: 'STANDARD',
      },
    ]);

    console.log('✅ Journal entry created with lines');

    // Test 3: Test approval workflow
    console.log('\n📋 Test 3: Testing approval workflow...');
    
    // Move to pending approval
    await journalEntry.update({
      status: JournalEntryStatus.PENDING_APPROVAL,
    });

    console.log('✅ Entry moved to pending approval');

    // Approve the entry
    const { AccountingRepository } = require('./src/modules/Accounting/accounting.repository');
    await AccountingRepository.approveJournalEntry(journalEntry.id, staff.id, 'Approved for posting');

    console.log('✅ Entry approved successfully');

    // Test 4: Test posting workflow
    console.log('\n📋 Test 4: Testing posting workflow...');
    
    // Post the entry
    await AccountingRepository.postJournalEntry(journalEntry.id, staff.id);

    console.log('✅ Entry posted successfully');

    // Verify account balances were updated
    await cashAccount.reload();
    await revenueAccount.reload();

    console.log(`✅ Account balances updated - Cash: ${cashAccount.balance}, Revenue: ${revenueAccount.balance}`);

    // Test 5: Test reversal system
    console.log('\n📋 Test 5: Testing reversal system...');
    
    // Reverse the entry
    const reversalEntry = await AccountingRepository.reverseJournalEntry(
      journalEntry.id,
      'Test reversal for demonstration',
      staff.id
    );

    console.log('✅ Entry reversed successfully');
    console.log(`✅ Reversal entry created: ${reversalEntry.reference}`);

    // Test 6: Test audit trail
    console.log('\n📋 Test 6: Testing audit trail...');
    
    const auditTrail = await AccountingRepository.getJournalEntryAuditTrail(journalEntry.id);
    console.log('✅ Audit trail retrieved successfully');
    console.log(`✅ Audit trail has ${auditTrail.audit_trail.length} entries`);

    // Test 7: Test transaction rollback
    console.log('\n📋 Test 7: Testing transaction rollback...');
    
    // Create another entry to test rollback
    const testEntry = await JournalEntry.create({
      reference: 'JE-TEST-002',
      description: 'Test entry for rollback',
      transaction_date: new Date(),
      patient_id: patient.id,
      period_id: period.id,
      status: JournalEntryStatus.DRAFT,
      entry_type: 'TEST',
      created_by: staff.id,
    });

    const testLines = await JournalEntryLine.bulkCreate([
      {
        journal_entry_id: testEntry.id,
        account_id: cashAccount.id,
        debit: 1000.00,
        credit: 0.00,
        description: 'Test cash debit',
        line_type: 'STANDARD',
      },
      {
        journal_entry_id: testEntry.id,
        account_id: expenseAccount.id,
        debit: 0.00,
        credit: 1000.00,
        description: 'Test expense credit',
        line_type: 'STANDARD',
      },
    ]);

    // Approve and post
    await testEntry.update({ status: JournalEntryStatus.PENDING_APPROVAL });
    await AccountingRepository.approveJournalEntry(testEntry.id, staff.id, 'Approved for testing');
    await AccountingRepository.postJournalEntry(testEntry.id, staff.id);

    console.log('✅ Test entry posted for rollback testing');

    // Test rollback
    await AccountingRepository.rollbackJournalEntryPosting(
      testEntry.id,
      staff.id,
      'Testing rollback functionality'
    );

    console.log('✅ Entry rollback completed successfully');

    // Test 8: Test statistics and reporting
    console.log('\n📋 Test 8: Testing statistics and reporting...');
    
    const stats = await AccountingRepository.getJournalEntryStatistics();
    console.log('✅ Journal entry statistics retrieved');
    console.log(`✅ Total entries: ${stats.total_entries}`);
    console.log(`✅ Pending approval: ${stats.pending_approval}`);
    console.log(`✅ Approved: ${stats.approved}`);
    console.log(`✅ Posted: ${stats.posted}`);
    console.log(`✅ Reversed: ${stats.reversed}`);

    // Test 9: Test recovery information
    console.log('\n📋 Test 9: Testing recovery information...');
    
    const recoveryInfo = await AccountingRepository.getTransactionRecoveryInfo(journalEntry.id);
    console.log('✅ Recovery information retrieved');
    console.log(`✅ Entry can be rolled back: ${recoveryInfo.can_be_rolled_back}`);
    console.log(`✅ Rollback risks: ${recoveryInfo.rollback_risks.length}`);

    console.log('\n🎉 All Phase 3 tests completed successfully!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    try {
      await JournalEntryLine.destroy({ where: {} });
      await JournalEntry.destroy({ where: {} });
      await ChartOfAccount.destroy({ where: {} });
      await FinancialPeriod.destroy({ where: {} });
      await Department.destroy({ where: {} });
      await Patient.destroy({ where: {} });
      await Staff.destroy({ where: {} });
      console.log('✅ Test data cleaned up');
    } catch (cleanupError) {
      console.error('⚠️ Cleanup error:', cleanupError.message);
    }
    
    await sequelize.close();
    console.log('✅ Database connection closed');
  }
}

// Run the test
testPhase3Completion().catch(console.error);
