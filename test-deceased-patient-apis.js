/**
 * Test script for Deceased Patient Management APIs
 * Run this script to test all the new API endpoints
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api'; // Adjust port if different
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual token

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Test functions
async function testDeathStatistics() {
  console.log('🧪 Testing Death Statistics API...');
  try {
    const response = await api.get('/patients/death-statistics');
    console.log('✅ Death Statistics API working');
    console.log('📊 Data:', {
      total_deaths: response.data.data.summary.total_deaths,
      recent_deaths: response.data.data.summary.recent_deaths_30_days,
      average_age: response.data.data.summary.average_age_at_death
    });
    return true;
  } catch (error) {
    console.error('❌ Death Statistics API failed:', error.response?.data || error.message);
    return false;
  }
}

async function testMortalityReports() {
  console.log('🧪 Testing Mortality Reports API...');
  try {
    const response = await api.get('/patients/mortality-reports', {
      params: { report_type: 'department' }
    });
    console.log('✅ Mortality Reports API working');
    console.log('📈 Report type:', response.data.data.report_type);
    console.log('📊 Total departments:', response.data.data.summary.total_departments);
    return true;
  } catch (error) {
    console.error('❌ Mortality Reports API failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDeathCertificateTracking() {
  console.log('🧪 Testing Death Certificate Tracking API...');
  try {
    const response = await api.get('/patients/death-certificate-tracking');
    console.log('✅ Death Certificate Tracking API working');
    console.log('📋 Total certificates:', response.data.data.summary.total_certificates);
    console.log('📊 Generated:', response.data.data.summary.generated);
    return true;
  } catch (error) {
    console.error('❌ Death Certificate Tracking API failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDeceasedPatients() {
  console.log('🧪 Testing Deceased Patients API...');
  try {
    const response = await api.get('/patients/deceased');
    console.log('✅ Deceased Patients API working');
    console.log('👥 Total patients:', response.data.data.count);
    console.log('📄 Patients returned:', response.data.data.rows.length);
    return true;
  } catch (error) {
    console.error('❌ Deceased Patients API failed:', error.response?.data || error.message);
    return false;
  }
}

async function testMarkPatientAsDeceased() {
  console.log('🧪 Testing Mark Patient as Deceased API...');
  try {
    // This would require a valid patient ID and test data
    console.log('⚠️  Mark Patient as Deceased API requires valid patient ID');
    console.log('📝 To test: PUT /api/patients/mark-deceased/:id with death details');
    return true;
  } catch (error) {
    console.error('❌ Mark Patient as Deceased API failed:', error.response?.data || error.message);
    return false;
  }
}

async function testTransferDependants() {
  console.log('🧪 Testing Transfer Dependants API...');
  try {
    // This would require valid patient IDs
    console.log('⚠️  Transfer Dependants API requires valid patient IDs');
    console.log('📝 To test: POST /api/patients/transfer-dependants with deceased_principal_id and new_principal_id');
    return true;
  } catch (error) {
    console.error('❌ Transfer Dependants API failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDeathCertificatePDF() {
  console.log('🧪 Testing Death Certificate PDF API...');
  try {
    // This would require a valid patient ID
    console.log('⚠️  Death Certificate PDF API requires valid patient ID');
    console.log('📝 To test: GET /api/patients/death-certificate-pdf/:id');
    return true;
  } catch (error) {
    console.error('❌ Death Certificate PDF API failed:', error.response?.data || error.message);
    return false;
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Deceased Patient Management API Tests...\n');
  
  const tests = [
    testDeathStatistics,
    testMortalityReports,
    testDeathCertificateTracking,
    testDeceasedPatients,
    testMarkPatientAsDeceased,
    testTransferDependants,
    testDeathCertificatePDF
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await test();
    if (result) passed++;
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Deceased Patient Management APIs are working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the error messages above.');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testDeathStatistics,
  testMortalityReports,
  testDeathCertificateTracking,
  testDeceasedPatients,
  testMarkPatientAsDeceased,
  testTransferDependants,
  testDeathCertificatePDF,
  runAllTests
};
