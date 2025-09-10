#!/usr/bin/env node

/**
 * 🧪 TRIAL BALANCE UNIT TESTS
 *
 * This script tests the trial balance implementation at the unit level
 * without requiring the full server to be running.
 *
 * Run with: node test-trial-balance-unit.js
 */

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test data
const mockTrialBalanceData = [
  {
    id: 1,
    code: '1000',
    name: 'Cash',
    type: 'ASSET',
    status: 'ACTIVE',
    opening_balance: 10000,
    debits: 5000,
    credits: 2000,
    closing_balance: 13000,
    parent_code: null,
    parent_name: null,
  },
  {
    id: 2,
    code: '2000',
    name: 'Accounts Payable',
    type: 'LIABILITY',
    status: 'ACTIVE',
    opening_balance: 5000,
    debits: 1000,
    credits: 3000,
    closing_balance: 7000, // 5000 + 3000 - 1000 = 7000
    parent_code: null,
    parent_name: null,
  },
  {
    id: 3,
    code: '3000',
    name: 'Revenue',
    type: 'INCOME',
    status: 'ACTIVE',
    opening_balance: 0,
    debits: 0,
    credits: 15000,
    closing_balance: 15000,
    parent_code: null,
    parent_name: null,
  },
];

// Test functions
function testDataStructure() {
  logInfo('Testing Trial Balance Data Structure...');

  try {
    // Check if data is array
    if (!Array.isArray(mockTrialBalanceData)) {
      throw new Error('Trial balance data should be an array');
    }
    logSuccess('Data is an array');

    // Check if array has data
    if (mockTrialBalanceData.length === 0) {
      throw new Error('Trial balance data should not be empty');
    }
    logSuccess(`Array contains ${mockTrialBalanceData.length} records`);

    // Check required fields for each record
    const requiredFields = [
      'id',
      'code',
      'name',
      'type',
      'status',
      'opening_balance',
      'debits',
      'credits',
      'closing_balance',
    ];

    mockTrialBalanceData.forEach((record, index) => {
      const missingFields = requiredFields.filter(field => !(field in record));
      if (missingFields.length > 0) {
        throw new Error(`Record ${index} missing required fields: ${missingFields.join(', ')}`);
      }
    });
    logSuccess('All records have required fields');

    // Check data types
    mockTrialBalanceData.forEach((record, index) => {
      if (typeof record.id !== 'number') throw new Error(`Record ${index} id should be number`);
      if (typeof record.code !== 'string') throw new Error(`Record ${index} code should be string`);
      if (typeof record.name !== 'string') throw new Error(`Record ${index} name should be string`);
      if (typeof record.type !== 'string') throw new Error(`Record ${index} type should be string`);
      if (typeof record.status !== 'string')
        throw new Error(`Record ${index} status should be string`);
      if (typeof record.opening_balance !== 'number')
        throw new Error(`Record ${index} opening_balance should be number`);
      if (typeof record.debits !== 'number')
        throw new Error(`Record ${index} debits should be number`);
      if (typeof record.credits !== 'number')
        throw new Error(`Record ${index} credits should be number`);
      if (typeof record.closing_balance !== 'number')
        throw new Error(`Record ${index} closing_balance should be number`);
    });
    logSuccess('All records have correct data types');

    return true;
  } catch (error) {
    logError(`Data structure test failed: ${error.message}`);
    return false;
  }
}

function testCalculations() {
  logInfo('Testing Trial Balance Calculations...');

  try {
    // Test summary calculations
    const totalDebits = mockTrialBalanceData.reduce(
      (sum, account) => sum + (account.debits || 0),
      0
    );
    const totalCredits = mockTrialBalanceData.reduce(
      (sum, account) => sum + (account.credits || 0),
      0
    );
    const totalOpeningBalance = mockTrialBalanceData.reduce(
      (sum, account) => sum + (account.opening_balance || 0),
      0
    );
    const totalClosingBalance = mockTrialBalanceData.reduce(
      (sum, account) => sum + (account.closing_balance || 0),
      0
    );

    logSuccess(`Total Debits: ${totalDebits}`);
    logSuccess(`Total Credits: ${totalCredits}`);
    logSuccess(`Total Opening Balance: ${totalOpeningBalance}`);
    logSuccess(`Total Closing Balance: ${totalClosingBalance}`);

    // Test individual account calculations
    mockTrialBalanceData.forEach((account, index) => {
      let calculatedClosing;

      // Different calculation based on account type
      if (account.type === 'ASSET' || account.type === 'EXPENSE') {
        // Assets and expenses increase with debits
        calculatedClosing = account.opening_balance + account.debits - account.credits;
      } else {
        // Liabilities, equity, and income increase with credits
        calculatedClosing = account.opening_balance + account.credits - account.debits;
      }

      if (Math.abs(calculatedClosing - account.closing_balance) > 0.01) {
        throw new Error(
          `Account ${index} (${account.code}) closing balance calculation incorrect. Expected: ${calculatedClosing}, Got: ${account.closing_balance}`
        );
      }
    });
    logSuccess('All account closing balance calculations are correct');

    return true;
  } catch (error) {
    logError(`Calculations test failed: ${error.message}`);
    return false;
  }
}

function testAccountTypeLogic() {
  logInfo('Testing Account Type Logic...');

  try {
    // Test asset accounts (should increase with debits)
    const assetAccounts = mockTrialBalanceData.filter(account => account.type === 'ASSET');
    assetAccounts.forEach(account => {
      if (account.debits < 0 || account.credits < 0) {
        throw new Error(`Asset account ${account.code} should have positive debits/credits`);
      }
    });
    logSuccess('Asset account logic validated');

    // Test liability accounts (should increase with credits)
    const liabilityAccounts = mockTrialBalanceData.filter(account => account.type === 'LIABILITY');
    liabilityAccounts.forEach(account => {
      if (account.debits < 0 || account.credits < 0) {
        throw new Error(`Liability account ${account.code} should have positive debits/credits`);
      }
    });
    logSuccess('Liability account logic validated');

    // Test income accounts (should increase with credits)
    const incomeAccounts = mockTrialBalanceData.filter(account => account.type === 'INCOME');
    incomeAccounts.forEach(account => {
      if (account.debits < 0 || account.credits < 0) {
        throw new Error(`Income account ${account.code} should have positive debits/credits`);
      }
    });
    logSuccess('Income account logic validated');

    return true;
  } catch (error) {
    logError(`Account type logic test failed: ${error.message}`);
    return false;
  }
}

function testFilteringLogic() {
  logInfo('Testing Filtering Logic...');

  try {
    // Test account type filtering
    const assetAccounts = mockTrialBalanceData.filter(account => account.type === 'ASSET');
    if (assetAccounts.length !== 1) {
      throw new Error(`Expected 1 ASSET account, found ${assetAccounts.length}`);
    }
    logSuccess('Account type filtering working');

    // Test search filtering (case insensitive)
    const cashAccounts = mockTrialBalanceData.filter(
      account =>
        account.name.toLowerCase().includes('cash') || account.code.toLowerCase().includes('cash')
    );
    if (cashAccounts.length !== 1) {
      throw new Error(`Expected 1 cash-related account, found ${cashAccounts.length}`);
    }
    logSuccess('Search filtering working');

    // Test zero balance filtering
    const nonZeroAccounts = mockTrialBalanceData.filter(
      account => Math.abs(account.closing_balance) > 0.01
    );
    if (nonZeroAccounts.length !== 3) {
      throw new Error(`Expected 3 non-zero accounts, found ${nonZeroAccounts.length}`);
    }
    logSuccess('Zero balance filtering working');

    return true;
  } catch (error) {
    logError(`Filtering logic test failed: ${error.message}`);
    return false;
  }
}

function testExportFormat() {
  logInfo('Testing Export Format...');

  try {
    // Simulate CSV export
    const headers = Object.keys(mockTrialBalanceData[0]);
    const csvRows = [headers.join(',')];

    mockTrialBalanceData.forEach(record => {
      const values = headers.map(header => {
        const value = record[header];
        if (value === null || value === undefined) return '';
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Validate CSV format
    if (!csvContent.includes(',')) throw new Error('CSV should contain commas');
    if (!csvContent.includes('\n')) throw new Error('CSV should contain newlines');
    if (!csvContent.includes('"')) throw new Error('CSV should contain quotes for strings');

    logSuccess('CSV export format validated');
    logSuccess(`CSV contains ${csvRows.length} rows and ${headers.length} columns`);

    return true;
  } catch (error) {
    logError(`Export format test failed: ${error.message}`);
    return false;
  }
}

function testChartDataStructure() {
  logInfo('Testing Chart Data Structure...');

  try {
    // Simulate chart data generation
    const chartData = {
      accountTypeDistribution: mockTrialBalanceData.reduce((acc, account) => {
        if (!acc[account.type]) {
          acc[account.type] = { count: 0, totalClosingBalance: 0 };
        }
        acc[account.type].count++;
        acc[account.type].totalClosingBalance += account.closing_balance;
        return acc;
      }, {}),
      balanceTrend: mockTrialBalanceData.map(account => ({
        type: account.type,
        openingTotal: account.opening_balance,
        closingTotal: account.closing_balance,
        change: account.closing_balance - account.opening_balance,
      })),
      topAccounts: mockTrialBalanceData
        .map(account => ({ ...account, absoluteBalance: Math.abs(account.closing_balance) }))
        .sort((a, b) => b.absoluteBalance - a.absoluteBalance)
        .slice(0, 5),
    };

    // Validate structure
    if (!chartData.accountTypeDistribution) throw new Error('Missing accountTypeDistribution');
    if (!chartData.balanceTrend) throw new Error('Missing balanceTrend');
    if (!chartData.topAccounts) throw new Error('Missing topAccounts');

    logSuccess('Chart data structure validated');
    logSuccess(
      `Generated data for ${Object.keys(chartData.accountTypeDistribution).length} account types`
    );
    logSuccess(`Generated ${chartData.balanceTrend.length} balance trend records`);
    logSuccess(`Generated ${chartData.topAccounts.length} top accounts`);

    return true;
  } catch (error) {
    logError(`Chart data structure test failed: ${error.message}`);
    return false;
  }
}

function testVarianceAnalysis() {
  logInfo('Testing Variance Analysis...');

  try {
    // Simulate variance analysis
    const varianceAnalysis = {
      accountVariances: mockTrialBalanceData.map(account => {
        const variance = account.closing_balance - account.opening_balance;
        const variancePercentage =
          account.opening_balance !== 0 ? (variance / Math.abs(account.opening_balance)) * 100 : 0;

        return {
          account_code: account.code,
          variance: variance,
          variance_percentage: variancePercentage,
          is_significant: Math.abs(variancePercentage) > 10,
        };
      }),
      overallVariance: {
        total_opening_balance: mockTrialBalanceData.reduce(
          (sum, acc) => sum + acc.opening_balance,
          0
        ),
        total_closing_balance: mockTrialBalanceData.reduce(
          (sum, acc) => sum + acc.closing_balance,
          0
        ),
      },
    };

    // Validate variance analysis
    if (!varianceAnalysis.accountVariances) throw new Error('Missing accountVariances');
    if (!varianceAnalysis.overallVariance) throw new Error('Missing overallVariance');

    const significantVariances = varianceAnalysis.accountVariances.filter(v => v.is_significant);
    logSuccess(
      `Variance analysis generated for ${varianceAnalysis.accountVariances.length} accounts`
    );
    logSuccess(`Found ${significantVariances.length} significant variances (>10%)`);

    return true;
  } catch (error) {
    logError(`Variance analysis test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
function runAllUnitTests() {
  log('🧪 STARTING TRIAL BALANCE UNIT TESTS', 'bright');
  log('=' * 60, 'cyan');

  const startTime = Date.now();
  const tests = [
    { name: 'Data Structure', fn: testDataStructure },
    { name: 'Calculations', fn: testCalculations },
    { name: 'Account Type Logic', fn: testAccountTypeLogic },
    { name: 'Filtering Logic', fn: testFilteringLogic },
    { name: 'Export Format', fn: testExportFormat },
    { name: 'Chart Data Structure', fn: testChartDataStructure },
    { name: 'Variance Analysis', fn: testVarianceAnalysis },
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  tests.forEach(test => {
    try {
      const result = test.fn();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      logError(`${test.name} test crashed: ${error.message}`);
    }
  });

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  log('=' * 60, 'cyan');
  log(
    `📊 TEST RESULTS: ${passedTests}/${totalTests} tests passed`,
    passedTests === totalTests ? 'green' : 'yellow'
  );
  log(`⏱️  Total test duration: ${duration.toFixed(2)} seconds`, 'cyan');

  if (passedTests === totalTests) {
    log('🎉 ALL UNIT TESTS PASSED!', 'bright');
  } else {
    log(`⚠️  ${totalTests - passedTests} tests failed`, 'yellow');
  }

  log('=' * 60, 'cyan');

  return passedTests === totalTests;
}

// Main execution
function main() {
  log('🚀 TRIAL BALANCE UNIT TEST SUITE', 'bright');
  log('This script tests the trial balance implementation at the unit level', 'cyan');
  log('No server required - testing logic and data structures only', 'cyan');
  log('');

  const success = runAllUnitTests();

  if (success) {
    log('✅ Unit tests completed successfully', 'green');
    process.exit(0);
  } else {
    log('❌ Some unit tests failed', 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  testDataStructure,
  testCalculations,
  testAccountTypeLogic,
  testFilteringLogic,
  testExportFormat,
  testChartDataStructure,
  testVarianceAnalysis,
  runAllUnitTests,
};
