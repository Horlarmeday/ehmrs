const axios = require('axios');

const BASE_URL = 'http://localhost:4050';
let authToken = null;

// Configure axios with timeout
axios.defaults.timeout = 10000;

async function login() {
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: '123456'
    });
    
    console.log('✅ Login successful');
    console.log('Response data:', loginResponse.data);
    
    // Extract token from response
    const token = loginResponse.data.data;
    if (token && typeof token === 'string') {
      authToken = token;
      console.log('Token:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.error('❌ Token not found in response');
      console.error('Response structure:', JSON.stringify(loginResponse.data, null, 2));
      return null;
    }
  } catch (error) {
    console.error('❌ Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    return null;
  }
}

async function testReportEndpoint(endpoint, name, authToken) {
  try {
    const response = await axios.get(`${BASE_URL}/api/store/reports/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log(`✅ ${name} endpoint working:`, {
      status: response.status,
      dataKeys: Object.keys(response.data),
      hasData: !!response.data.data
    });
    return true;
  } catch (error) {
    console.error(`❌ ${name} endpoint failed:`, error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting API Tests...');
  
  // Test authentication
  const token = await login();
  if (!token) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  // Test all report endpoints
  const endpoints = [
    { path: 'dashboard', name: 'Dashboard Overview' },
    { path: 'inventory-movements', name: 'Inventory Movements' },
    { path: 'sales-performance', name: 'Sales Performance' },
    { path: 'expiry-tracking', name: 'Expiry Tracking' },
    { path: 'stock-levels', name: 'Stock Levels' },
    { path: 'trends-analysis', name: 'Trends Analysis' },
    { path: 'config', name: 'Report Config' }
  ];
  
  let successCount = 0;
  for (const endpoint of endpoints) {
    const success = await testReportEndpoint(endpoint.path, endpoint.name, token);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }
  
  console.log(`\n📊 Test Results: ${successCount}/${endpoints.length} endpoints working`);
}

runTests().catch(console.error);