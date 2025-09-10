/**
 * Comprehensive Deceased Patient Management Workflow Test
 * This script tests the complete workflow from marking a patient as deceased
 * to generating reports and tracking certificates.
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual token

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Test data
const testPatientData = {
  fullname: 'Test Patient Deceased',
  hospital_id: 'TEST-DECEASED-001',
  date_of_birth: '1980-01-01',
  gender: 'Male',
  phone: '+1234567890',
  address: '123 Test Street, Test City'
};

const deathData = {
  date_of_death: new Date().toISOString(),
  cause_of_death: 'Test Cause of Death',
  place_of_death: 'Test Hospital',
  marked_deceased_by: 1, // Staff ID
  notes: 'Test death for integration testing'
};

async function createTestPatient() {
  console.log('👤 Creating test patient...');
  try {
    const response = await api.post('/patients/create', testPatientData);
    console.log('✅ Test patient created:', response.data.data.id);
    return response.data.data.id;
  } catch (error) {
    console.error('❌ Failed to create test patient:', error.response?.data || error.message);
    throw error;
  }
}

async function markPatientAsDeceased(patientId) {
  console.log('💀 Marking patient as deceased...');
  try {
    const response = await api.put(`/patients/mark-deceased/${patientId}`, deathData);
    console.log('✅ Patient marked as deceased');
    console.log('📋 Death certificate number:', response.data.data.death_certificate_number);
    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to mark patient as deceased:', error.response?.data || error.message);
    throw error;
  }
}

async function testDeathStatistics() {
  console.log('📊 Testing death statistics...');
  try {
    const response = await api.get('/patients/death-statistics');
    const stats = response.data.data;
    console.log('✅ Death statistics retrieved');
    console.log('📈 Total deaths:', stats.summary.total_deaths);
    console.log('📅 Recent deaths (30 days):', stats.summary.recent_deaths_30_days);
    console.log('👴 Average age at death:', stats.summary.average_age_at_death);
    return true;
  } catch (error) {
    console.error('❌ Death statistics failed:', error.response?.data || error.message);
    return false;
  }
}

async function testMortalityReports() {
  console.log('📈 Testing mortality reports...');
  try {
    // Test department report
    const deptResponse = await api.get('/patients/mortality-reports', {
      params: { report_type: 'department' }
    });
    console.log('✅ Department mortality report retrieved');
    console.log('🏥 Departments:', deptResponse.data.data.summary.total_departments);
    
    // Test condition report
    const conditionResponse = await api.get('/patients/mortality-reports', {
      params: { report_type: 'condition' }
    });
    console.log('✅ Condition mortality report retrieved');
    console.log('🩺 Conditions:', conditionResponse.data.data.summary.total_conditions);
    
    return true;
  } catch (error) {
    console.error('❌ Mortality reports failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDeathCertificateTracking() {
  console.log('📋 Testing death certificate tracking...');
  try {
    const response = await api.get('/patients/death-certificate-tracking');
    const tracking = response.data.data;
    console.log('✅ Death certificate tracking retrieved');
    console.log('📄 Total certificates:', tracking.summary.total_certificates);
    console.log('📝 Generated:', tracking.summary.generated);
    console.log('🖨️ Printed:', tracking.summary.printed);
    console.log('✅ Delivered:', tracking.summary.delivered);
    return true;
  } catch (error) {
    console.error('❌ Death certificate tracking failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDeceasedPatientsList() {
  console.log('👥 Testing deceased patients list...');
  try {
    const response = await api.get('/patients/deceased');
    const patients = response.data.data;
    console.log('✅ Deceased patients list retrieved');
    console.log('👥 Total patients:', patients.count);
    console.log('📄 Patients returned:', patients.rows.length);
    
    if (patients.rows.length > 0) {
      const patient = patients.rows[0];
      console.log('👤 Sample patient:', {
        name: patient.fullname,
        hospital_id: patient.hospital_id,
        date_of_death: patient.date_of_death,
        cause_of_death: patient.cause_of_death,
        certificate_number: patient.death_certificate_number
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Deceased patients list failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDeathCertificatePDF(patientId) {
  console.log('📄 Testing death certificate PDF generation...');
  try {
    const response = await api.get(`/patients/death-certificate-pdf/${patientId}`, {
      responseType: 'stream'
    });
    console.log('✅ Death certificate PDF generated');
    console.log('📄 Content-Type:', response.headers['content-type']);
    console.log('📏 Content-Length:', response.headers['content-length']);
    return true;
  } catch (error) {
    console.error('❌ Death certificate PDF failed:', error.response?.data || error.message);
    return false;
  }
}

async function testSystemRestrictions(patientId) {
  console.log('🚫 Testing system restrictions for deceased patient...');
  try {
    // Try to create a prescription for deceased patient
    const prescriptionData = {
      patient_id: patientId,
      drug_id: 1,
      quantity_prescribed: 10,
      dosage: '1 tablet',
      frequency: 'twice daily'
    };
    
    try {
      await api.post('/pharmacy-orders/create', prescriptionData);
      console.log('❌ System restriction failed - prescription created for deceased patient');
      return false;
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ System restriction working - prescription blocked for deceased patient');
        return true;
      } else {
        console.log('⚠️  Unexpected error:', error.response?.data || error.message);
        return false;
      }
    }
  } catch (error) {
    console.error('❌ System restrictions test failed:', error.response?.data || error.message);
    return false;
  }
}

async function cleanupTestData(patientId) {
  console.log('🧹 Cleaning up test data...');
  try {
    // Note: In a real scenario, you might want to delete the test patient
    // or mark them as revived for testing purposes
    console.log('⚠️  Test patient cleanup not implemented - manual cleanup required');
    console.log(`📝 Test patient ID: ${patientId}`);
    return true;
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    return false;
  }
}

async function runCompleteWorkflowTest() {
  console.log('🚀 Starting Complete Deceased Patient Management Workflow Test...\n');
  
  let patientId = null;
  let testResults = {
    patientCreation: false,
    markDeceased: false,
    deathStatistics: false,
    mortalityReports: false,
    certificateTracking: false,
    deceasedPatientsList: false,
    certificatePDF: false,
    systemRestrictions: false,
    cleanup: false
  };
  
  try {
    // Step 1: Create test patient
    patientId = await createTestPatient();
    testResults.patientCreation = true;
    console.log('');
    
    // Step 2: Mark patient as deceased
    await markPatientAsDeceased(patientId);
    testResults.markDeceased = true;
    console.log('');
    
    // Step 3: Test death statistics
    testResults.deathStatistics = await testDeathStatistics();
    console.log('');
    
    // Step 4: Test mortality reports
    testResults.mortalityReports = await testMortalityReports();
    console.log('');
    
    // Step 5: Test death certificate tracking
    testResults.certificateTracking = await testDeathCertificateTracking();
    console.log('');
    
    // Step 6: Test deceased patients list
    testResults.deceasedPatientsList = await testDeceasedPatientsList();
    console.log('');
    
    // Step 7: Test death certificate PDF
    testResults.certificatePDF = await testDeathCertificatePDF(patientId);
    console.log('');
    
    // Step 8: Test system restrictions
    testResults.systemRestrictions = await testSystemRestrictions(patientId);
    console.log('');
    
    // Step 9: Cleanup
    testResults.cleanup = await cleanupTestData(patientId);
    console.log('');
    
  } catch (error) {
    console.error('❌ Workflow test failed:', error.message);
  }
  
  // Print results
  console.log('📊 Complete Workflow Test Results:');
  console.log('================================');
  Object.entries(testResults).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const passedTests = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Complete workflow test PASSED! All deceased patient management features are working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the error messages above for details.');
  }
  
  return testResults;
}

// Run the complete workflow test if this script is executed directly
if (require.main === module) {
  runCompleteWorkflowTest().catch(console.error);
}

module.exports = {
  runCompleteWorkflowTest,
  createTestPatient,
  markPatientAsDeceased,
  testDeathStatistics,
  testMortalityReports,
  testDeathCertificateTracking,
  testDeceasedPatientsList,
  testDeathCertificatePDF,
  testSystemRestrictions,
  cleanupTestData
};
