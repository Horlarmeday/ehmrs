// Test script to verify login and categories functionality
const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:4050';
const FRONTEND_URL = 'http://localhost:8081';
const LOGIN_CREDENTIALS = {
  username: 'admin',
  password: '123456'
};

async function testLoginAndCategories() {
  console.log('🔐 Testing login flow...');
  
  try {
    // Step 1: Test login API
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, LOGIN_CREDENTIALS);
    console.log('✅ Login successful');
    console.log('📋 Response status:', loginResponse.status);
    console.log('🔑 Token received:', loginResponse.data.token ? 'Yes' : 'No');
    
    if (!loginResponse.data.token) {
      throw new Error('No token received from login');
    }
    
    const token = loginResponse.data.token;
    console.log('🎫 Token preview:', token.substring(0, 20) + '...');
    
    // Step 2: Test categories API with token
    console.log('\n📂 Testing categories API...');
    const categoriesResponse = await axios.get(`${BASE_URL}/api/general-store/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Categories API successful');
    console.log('📋 Response status:', categoriesResponse.status);
    console.log('📊 Categories count:', categoriesResponse.data.data?.docs?.length || 0);
    console.log('📄 Sample category:', categoriesResponse.data.data?.docs?.[0]?.name || 'None');
    
    // Step 3: Test frontend proxy
    console.log('\n🌐 Testing frontend proxy...');
    try {
      const proxyResponse = await axios.get(`${FRONTEND_URL}/api/general-store/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Frontend proxy successful');
      console.log('📋 Proxy response status:', proxyResponse.status);
    } catch (proxyError) {
      console.log('❌ Frontend proxy failed:', proxyError.response?.status || proxyError.message);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('📋 Status:', error.response?.status);
    process.exit(1);
  }
}

// Run the test
testLoginAndCategories();