const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:4050';
const FRONTEND_URL = 'http://localhost:8081';
const LOGIN_CREDENTIALS = {
  username: 'admin',
  password: '123456'
};

async function testCategoriesListFunctionality() {
  console.log('🧪 Testing Categories List Functionality\n');
  
  try {
    // Step 1: Login and get token
    console.log('🔐 Step 1: Getting authentication token...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, LOGIN_CREDENTIALS);
    
    if (!loginResponse.data?.data) {
      throw new Error('Login failed - no token received');
    }
    
    const token = loginResponse.data.data;
    console.log('✅ Token obtained successfully\n');
    
    // Configure axios with token
    const authenticatedAxios = axios.create({
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Step 2: Test categories list endpoint
    console.log('📋 Step 2: Testing categories list endpoint...');
    const categoriesResponse = await authenticatedAxios.get(`${BASE_URL}/api/general-store/categories`);
    
    console.log('Categories API Response:');
    console.log('- Status:', categoriesResponse.status);
    console.log('- Categories count:', categoriesResponse.data?.data?.docs?.length || 0);
    console.log('- Total items:', categoriesResponse.data?.data?.totalDocs || 0);
    console.log('- Current page:', categoriesResponse.data?.data?.page || 1);
    console.log('- Total pages:', categoriesResponse.data?.data?.totalPages || 1);
    
    if (categoriesResponse.data?.data?.docs?.length > 0) {
      console.log('- Sample category:', JSON.stringify(categoriesResponse.data.data.docs[0], null, 2));
    }
    console.log('');
    
    // Step 3: Test pagination
    console.log('📄 Step 3: Testing pagination...');
    const paginatedResponse = await authenticatedAxios.get(`${BASE_URL}/api/general-store/categories?page=1&limit=10`);
    console.log('Pagination test:');
    console.log('- Status:', paginatedResponse.status);
    console.log('- Page 1 results:', paginatedResponse.data?.data?.docs?.length || 0);
    console.log('');
    
    // Step 4: Test filtering by is_active
    console.log('🎯 Step 4: Testing is_active filter...');
    try {
      const activeResponse = await authenticatedAxios.get(`${BASE_URL}/api/general-store/categories?is_active=true`);
      console.log('Active filter test:');
      console.log('- Status:', activeResponse.status);
      console.log('- Active categories:', activeResponse.data?.data?.docs?.length || 0);
      
      const inactiveResponse = await authenticatedAxios.get(`${BASE_URL}/api/general-store/categories?is_active=false`);
      console.log('Inactive filter test:');
      console.log('- Status:', inactiveResponse.status);
      console.log('- Inactive categories:', inactiveResponse.data?.data?.docs?.length || 0);
    } catch (error) {
      console.log('❌ is_active filter test failed:', error.response?.data?.message || error.message);
    }
    console.log('');
    
    // Step 5: Test frontend proxy
    console.log('🌐 Step 5: Testing frontend proxy...');
    try {
      const proxyResponse = await axios.get(`${FRONTEND_URL}/api/general-store/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Frontend proxy test:');
      console.log('- Status:', proxyResponse.status);
      console.log('- Proxy categories count:', proxyResponse.data?.data?.docs?.length || 0);
    } catch (proxyError) {
      console.log('❌ Frontend proxy failed:', proxyError.message);
    }
    console.log('');
    
    // Step 6: Test filtering by active status
    console.log('🎯 Step 6: Testing active status filtering...');
    const activeResponse = await authenticatedAxios.get(`${BASE_URL}/api/general-store/categories?is_active=true`);
    console.log('Active categories filter:');
    console.log('- Status:', activeResponse.status);
    console.log('- Active categories:', activeResponse.data?.data?.docs?.length || 0);
    console.log('');
    
    console.log('🎉 Categories list functionality test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testCategoriesListFunctionality();