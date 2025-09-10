const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:4050';
const LOGIN_CREDENTIALS = {
  username: 'admin',
  password: '123456'
};

async function debugCategories() {
  try {
    // Login and get token
    console.log('🔐 Getting authentication token...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, LOGIN_CREDENTIALS);
    const token = loginResponse.data.data;
    console.log('✅ Token obtained\n');
    
    // Configure axios with token
    const authenticatedAxios = axios.create({
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Create a test category
    console.log('📝 Creating test category...');
    const categoryData = {
      name: 'Debug Category ' + Date.now(),
      description: 'Debug test category',
      is_active: true
    };
    
    const createResponse = await authenticatedAxios.post(`${BASE_URL}/api/general-store/categories`, categoryData);
    console.log('Created category:', {
      id: createResponse.data?.data?.id,
      name: createResponse.data?.data?.name,
      is_active: createResponse.data?.data?.is_active
    });
    
    const createdId = createResponse.data?.data?.id;
    console.log('\n🔍 Fetching categories with different filters...');
    
    // Test 1: No filters
    console.log('\n1. No filters:');
    const response1 = await authenticatedAxios.get(`${BASE_URL}/api/general-store/categories`);
    console.log('Full response structure:', JSON.stringify(response1.data, null, 2));
    console.log('Total items:', response1.data?.pagination?.total_items);
    console.log('Categories found:', response1.data?.data?.docs?.length);
    const found1 = response1.data?.data?.docs?.find(cat => cat.id === createdId);
    console.log('Created category found:', !!found1);
    
    // Test 2: is_active=true
    console.log('\n2. With is_active=true:');
    const response2 = await authenticatedAxios.get(`${BASE_URL}/api/general-store/categories?is_active=true`);
    console.log('Total items:', response2.data?.pagination?.total_items);
    console.log('Categories found:', response2.data?.data?.docs?.length);
    const found2 = response2.data?.data?.docs?.find(cat => cat.id === createdId);
    console.log('Created category found:', !!found2);
    
    // Test 3: Show all category IDs
    console.log('\n3. All category IDs in response:');
    const allIds = response2.data?.data?.docs?.map(cat => ({ id: cat.id, name: cat.name, is_active: cat.is_active })) || [];
    console.log(JSON.stringify(allIds, null, 2));
    
    console.log('\n🎯 Looking for created ID:', createdId);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the debug
debugCategories();