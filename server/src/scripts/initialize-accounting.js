#!/usr/bin/env node

/**
 * Standalone Accounting System Initialization Script
 *
 * This script can be run independently to initialize the accounting system
 * without starting the full server. Useful for:
 * - Initial setup
 * - Database migrations
 * - System maintenance
 * - Testing
 */

require('dotenv').config();
const { AccountingStartupService } = require('../modules/Accounting/services/startup.service');

async function initializeAccounting() {
  try {
    console.log('🚀 Starting Accounting System Initialization...');
    console.log('================================================');

    // Initialize the accounting system
    await AccountingStartupService.initialize();

    console.log('================================================');
    console.log('✅ Accounting System Initialization Completed Successfully!');
    console.log('');
    console.log('📊 System Status:');

    // Validate the configuration
    const config = await AccountingStartupService.validateConfiguration();
    if (config.valid) {
      console.log('   • Chart of Accounts: ✅ All required accounts exist');
      console.log('   • System Configuration: ✅ Valid');
    } else {
      console.log('   • Chart of Accounts: ❌ Missing accounts detected');
      console.log('   • Missing Accounts:', config.issues.join(', '));
    }

    console.log('');
    console.log('🎯 Next Steps:');
    console.log('   1. Start your server - accounting system will auto-initialize');
    console.log('   2. Check system health: GET /accounting/health');
    console.log('   3. Manual initialization: POST /accounting/initialize');

    process.exit(0);
  } catch (error) {
    console.error('❌ Accounting System Initialization Failed:');
    console.error('   Error:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   1. Check database connection');
    console.error('   2. Verify environment variables');
    console.error('   3. Check database permissions');
    console.error('   4. Review error logs above');

    process.exit(1);
  }
}

// Run the initialization
initializeAccounting();
