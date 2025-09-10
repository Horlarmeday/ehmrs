#!/usr/bin/env node

/**
 * Cash Register Setup Script
 *
 * This script helps set up the first cash register for the EHMS system.
 * Run this script after starting the server to create a default cash register.
 *
 * Usage: node src/scripts/setup-cash-register.js
 */

const axios = require('axios');

// Configuration
const CONFIG = {
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  adminToken: process.env.ADMIN_TOKEN || '', // Set this in your environment
  defaultRegister: {
    register_code: 'REG001',
    register_name: 'Main Cash Register',
    location: 'Reception',
    assigned_staff_id: 1, // Default to staff ID 1
    minimum_balance: 0,
    maximum_balance: 1000000,
    description: 'Default cash register for daily operations',
  },
};

async function setupCashRegister() {
  console.log('🚀 Starting Cash Register Setup...\n');

  try {
    // Check if admin token is provided
    if (!CONFIG.adminToken) {
      console.error('❌ Error: ADMIN_TOKEN environment variable is required');
      console.log('Please set ADMIN_TOKEN in your environment variables');
      console.log('Example: export ADMIN_TOKEN="your_jwt_token_here"');
      return;
    }

    // Check if server is running
    try {
      await axios.get(`${CONFIG.baseURL}/health`, { timeout: 5000 });
      console.log('✅ Server is running');
    } catch (error) {
      console.error('❌ Error: Cannot connect to server');
      console.log('Please ensure the server is running on:', CONFIG.baseURL);
      return;
    }

    // Check if cash registers already exist
    try {
      const response = await axios.get(`${CONFIG.baseURL}/accounting/cash-registers`, {
        headers: { Authorization: `Bearer ${CONFIG.adminToken}` },
      });

      if (response.data.data && response.data.data.length > 0) {
        console.log('ℹ️  Cash registers already exist:');
        response.data.data.forEach(register => {
          console.log(
            `   - ${register.register_code}: ${register.register_name} (${register.status})`
          );
        });
        console.log('\n✅ Setup not needed - cash registers already exist');
        return;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.error('❌ Error: Invalid or expired admin token');
        console.log('Please check your ADMIN_TOKEN and ensure it has admin privileges');
        return;
      }
      // Continue if endpoint doesn't exist yet (first time setup)
    }

    // Create the default cash register
    console.log('📝 Creating default cash register...');

    const createResponse = await axios.post(
      `${CONFIG.baseURL}/accounting/cash-registers`,
      CONFIG.defaultRegister,
      {
        headers: {
          Authorization: `Bearer ${CONFIG.adminToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (createResponse.data.success) {
      const register = createResponse.data.data;
      console.log('✅ Cash register created successfully!');
      console.log(`   Code: ${register.register_code}`);
      console.log(`   Name: ${register.register_name}`);
      console.log(`   Location: ${register.location}`);
      console.log(`   Status: ${register.status}`);
      console.log(`   ID: ${register.id}`);
    } else {
      throw new Error(createResponse.data.error || 'Unknown error');
    }

    // Open the cash register
    console.log('\n🔓 Opening cash register...');

    const openResponse = await axios.post(
      `${CONFIG.baseURL}/accounting/cash-registers/${createResponse.data.data.id}/open`,
      { opening_amount: 0 },
      {
        headers: {
          Authorization: `Bearer ${CONFIG.adminToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (openResponse.data.success) {
      console.log('✅ Cash register opened successfully!');
      console.log(`   Current Balance: ₦${openResponse.data.data.current_balance}`);
      console.log(`   Status: ${openResponse.data.data.status}`);
    } else {
      throw new Error(openResponse.data.error || 'Failed to open register');
    }

    console.log('\n🎉 Cash Register Setup Complete!');
    console.log('\nNext steps:');
    console.log('1. The cash register is now ready for payments');
    console.log('2. Staff can process cash payments using this register');
    console.log('3. Daily opening/closing procedures can be managed through the UI');
    console.log('4. Access the cash register management at: /accounting/cash-registers');
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);

    if (error.response) {
      console.error('Server response:', error.response.data);
      console.error('Status:', error.response.status);
    }

    console.log('\nTroubleshooting:');
    console.log('1. Ensure the server is running');
    console.log('2. Check your ADMIN_TOKEN is valid and has admin privileges');
    console.log('3. Verify the API endpoints are accessible');
    console.log('4. Check server logs for any errors');
  }
}

// Run the setup
if (require.main === module) {
  setupCashRegister();
}

module.exports = { setupCashRegister };
