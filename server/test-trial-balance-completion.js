#!/usr/bin/env node

/**
 * 🧪 TRIAL BALANCE COMPLETION TEST SCRIPT
 *
 * This script tests the completed trial balance implementation including:
 * - Basic trial balance functionality
 * - Export functionality
 * - Chart data generation
 * - Variance analysis
 * - Balance sheet preview
 *
 * Run with: node test-trial-balance-completion.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Adjust if your server runs on different port
const API_BASE = `${BASE_URL}/accounting`;

// Test data
const testFilters = {
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  account_type: 'ASSET',
  search: 'cash',
  include_zero_balances: false,
};

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

// Test functions
async function testBasicTrialBalance() {
  logInfo('Testing Basic Trial Balance Functionality...');

  try {
    const response = await axios.get(`${API_BASE}/trial-balance`, { params: testFilters });

    if (response.status === 200 && response.data.success) {
      logSuccess('Basic trial balance endpoint working');

      const data = response.data.data;
      const summary = response.data.summary;

      // Validate data structure
      if (Array.isArray(data) && data.length > 0) {
        logSuccess(`Retrieved ${data.length} trial balance records`);

        // Check required fields
        const firstRecord = data[0];
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

        const missingFields = requiredFields.filter(field => !(field in firstRecord));
        if (missingFields.length === 0) {
          logSuccess('All required fields present in trial balance data');
        } else {
          logError(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Validate summary
        if (
          summary &&
          typeof summary.totalDebits === 'number' &&
          typeof summary.totalCredits === 'number'
        ) {
          logSuccess('Trial balance summary data valid');
        } else {
          logError('Trial balance summary data invalid');
        }
      } else {
        logError('No trial balance data returned');
      }
    } else {
      logError('Basic trial balance endpoint failed');
    }
  } catch (error) {
    logError(`Basic trial balance test failed: ${error.message}`);
  }
}

async function testExportFunctionality() {
  logInfo('Testing Export Functionality...');

  try {
    const response = await axios.get(`${API_BASE}/trial-balance/export`, {
      params: testFilters,
      responseType: 'text',
    });

    if (response.status === 200) {
      logSuccess('Export endpoint working');

      // Check if response is CSV
      const content = response.data;
      if (content.includes(',') && content.includes('\n')) {
        logSuccess('Export returns CSV format');

        // Check for headers
        const lines = content.split('\n');
        if (lines.length > 1) {
          const headers = lines[0].split(',');
          logSuccess(`Export contains ${headers.length} columns`);
        }
      } else {
        logWarning('Export format may not be CSV');
      }
    } else {
      logError('Export endpoint failed');
    }
  } catch (error) {
    logError(`Export test failed: ${error.message}`);
  }
}

async function testChartData() {
  logInfo('Testing Chart Data Generation...');

  try {
    const response = await axios.get(`${API_BASE}/trial-balance/chart-data`, {
      params: testFilters,
    });

    if (response.status === 200 && response.data.success) {
      logSuccess('Chart data endpoint working');

      const chartData = response.data.data;

      // Validate chart data structure
      if (chartData) {
        const requiredSections = [
          'accountTypeDistribution',
          'balanceTrend',
          'topAccounts',
          'balanceSheetPreview',
          'periodComparison',
        ];

        const missingSections = requiredSections.filter(section => !(section in chartData));
        if (missingSections.length === 0) {
          logSuccess('All chart data sections present');
        } else {
          logError(`Missing chart data sections: ${missingSections.join(', ')}`);
        }

        // Check account type distribution
        if (chartData.accountTypeDistribution && Array.isArray(chartData.accountTypeDistribution)) {
          logSuccess(
            `Account type distribution contains ${chartData.accountTypeDistribution.length} types`
          );
        }

        // Check top accounts
        if (chartData.topAccounts && Array.isArray(chartData.topAccounts)) {
          logSuccess(`Top accounts contains ${chartData.topAccounts.length} accounts`);
        }
      } else {
        logError('No chart data returned');
      }
    } else {
      logError('Chart data endpoint failed');
    }
  } catch (error) {
    logError(`Chart data test failed: ${error.message}`);
  }
}

async function testVarianceAnalysis() {
  logInfo('Testing Variance Analysis...');

  try {
    const response = await axios.get(`${API_BASE}/trial-balance/variance-analysis`, {
      params: testFilters,
    });

    if (response.status === 200 && response.data.success) {
      logSuccess('Variance analysis endpoint working');

      const varianceData = response.data.data;

      // Validate variance analysis structure
      if (varianceData) {
        const requiredSections = [
          'accountVariances',
          'typeVariances',
          'overallVariance',
          'recommendations',
        ];

        const missingSections = requiredSections.filter(section => !(section in varianceData));
        if (missingSections.length === 0) {
          logSuccess('All variance analysis sections present');
        } else {
          logError(`Missing variance analysis sections: ${missingSections.join(', ')}`);
        }

        // Check overall variance
        if (varianceData.overallVariance) {
          const ov = varianceData.overallVariance;
          if (
            typeof ov.total_opening_balance === 'number' &&
            typeof ov.total_closing_balance === 'number'
          ) {
            logSuccess('Overall variance calculation working');
          }
        }

        // Check recommendations
        if (varianceData.recommendations && Array.isArray(varianceData.recommendations)) {
          logSuccess(`Generated ${varianceData.recommendations.length} recommendations`);
        }
      } else {
        logError('No variance analysis data returned');
      }
    } else {
      logError('Variance analysis endpoint failed');
    }
  } catch (error) {
    logError(`Variance analysis test failed: ${error.message}`);
  }
}

async function testBalanceSheetPreview() {
  logInfo('Testing Balance Sheet Preview...');

  try {
    const response = await axios.get(`${API_BASE}/trial-balance/balance-sheet-preview`, {
      params: testFilters,
    });

    if (response.status === 200 && response.data.success) {
      logSuccess('Balance sheet preview endpoint working');

      const balanceSheetData = response.data.data;

      // Validate balance sheet structure
      if (balanceSheetData) {
        const requiredCategories = ['assets', 'liabilities', 'equity', 'income', 'expenses'];

        const missingCategories = requiredCategories.filter(
          category => !(category in balanceSheetData)
        );
        if (missingCategories.length === 0) {
          logSuccess('All balance sheet categories present');
        } else {
          logError(`Missing balance sheet categories: ${missingCategories.join(', ')}`);
        }

        // Check each category has required fields
        const requiredFields = ['opening', 'closing', 'movement'];
        let allFieldsPresent = true;

        requiredCategories.forEach(category => {
          if (balanceSheetData[category]) {
            const missingFields = requiredFields.filter(
              field => !(field in balanceSheetData[category])
            );
            if (missingFields.length > 0) {
              logError(`Category ${category} missing fields: ${missingFields.join(', ')}`);
              allFieldsPresent = false;
            }
          }
        });

        if (allFieldsPresent) {
          logSuccess('All balance sheet categories have required fields');
        }
      } else {
        logError('No balance sheet preview data returned');
      }
    } else {
      logError('Balance sheet preview endpoint failed');
    }
  } catch (error) {
    logError(`Balance sheet preview test failed: ${error.message}`);
  }
}

async function testFiltering() {
  logInfo('Testing Filtering Functionality...');

  try {
    // Test different filter combinations
    const filterTests = [
      { name: 'Account Type Filter', filters: { account_type: 'ASSET' } },
      { name: 'Search Filter', filters: { search: 'cash' } },
      { name: 'Date Range Filter', filters: { start_date: '2024-01-01', end_date: '2024-12-31' } },
      { name: 'Zero Balance Filter', filters: { include_zero_balances: false } },
    ];

    for (const test of filterTests) {
      try {
        const response = await axios.get(`${API_BASE}/trial-balance`, { params: test.filters });

        if (response.status === 200 && response.data.success) {
          logSuccess(`${test.name} working`);
        } else {
          logError(`${test.name} failed`);
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        logError(`${test.name} test failed: ${error.message}`);
      }
    }
  } catch (error) {
    logError(`Filtering test failed: ${error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  log('🧪 STARTING TRIAL BALANCE COMPLETION TESTS', 'bright');
  log('=' * 60, 'cyan');

  const startTime = Date.now();

  try {
    // Run all tests
    await testBasicTrialBalance();
    await testExportFunctionality();
    await testChartData();
    await testVarianceAnalysis();
    await testBalanceSheetPreview();
    await testFiltering();

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    log('=' * 60, 'cyan');
    log('🎉 ALL TESTS COMPLETED!', 'bright');
    log(`⏱️  Total test duration: ${duration.toFixed(2)} seconds`, 'cyan');
    log('=' * 60, 'cyan');
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    if (response.status === 200) {
      logSuccess('Server is running and healthy');
      return true;
    }
  } catch (error) {
    logWarning('Server health check failed - make sure your server is running');
    logInfo('You can start the server with: npm run start:dev');
    return false;
  }
}

// Main execution
async function main() {
  log('🚀 TRIAL BALANCE COMPLETION TEST SUITE', 'bright');
  log('This script will test all completed trial balance functionality', 'cyan');
  log('');

  // Check server health first
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    logWarning('Please start your server before running tests');
    logInfo('Tests will continue but may fail...');
    log('');
  }

  // Run tests
  await runAllTests();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    logError(`Test suite execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testBasicTrialBalance,
  testExportFunctionality,
  testChartData,
  testVarianceAnalysis,
  testBalanceSheetPreview,
  testFiltering,
  runAllTests,
};
