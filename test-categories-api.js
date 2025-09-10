const axios = require('axios');

// Test the categories API flow
async function testCategoriesAPI() {
  try {
    console.log('🔐 Testing login...');
    
    // Step 1: Login to get token
    const loginResponse = await axios.post('http://localhost:4050/api/auth/login', {
      username: 'admin',
      password: '123456'
    });
    
    console.log('✅ Login successful');
    console.log('Response structure:', JSON.stringify(loginResponse.data, null, 2));
    
    // The token is directly in loginResponse.data.data (which is the token string)
    const token = loginResponse.data.data;
    
    if (!token) {
      console.log('❌ No token received from login');
      return;
    }
    
    console.log('Token received: Yes');
    console.log('Token preview:', token.substring(0, 20) + '...');
    
    console.log('\n📋 Testing categories API...');
    
    // Step 2: Test categories API with token
    const categoriesResponse = await axios.get('http://localhost:4050/api/general-store/categories', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        currentPage: 1,
        pageLimit: 20
      }
    });
    
    console.log('✅ Categories API successful');
    console.log('Response status:', categoriesResponse.status);
    console.log('Categories count:', categoriesResponse.data.data?.rows?.length || 0);
    console.log('Total items:', categoriesResponse.data.pagination?.total_items || 0);
    
    if (categoriesResponse.data.data?.rows?.length > 0) {
      console.log('\n📝 Sample category:');
      console.log(JSON.stringify(categoriesResponse.data.data.rows[0], null, 2));
    }
    
    console.log('\n🎯 Testing frontend proxy...');
    
    // Step 3: Test frontend proxy (same request through frontend)
    const proxyResponse = await axios.get('http://localhost:8081/api/general-store/categories', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        currentPage: 1,
        pageLimit: 20
      }
    });
    
    console.log('✅ Frontend proxy successful');
    console.log('Proxy response status:', proxyResponse.status);
    console.log('Proxy categories count:', proxyResponse.data.data?.rows?.length || 0);
    
  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('Error message:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testCategoriesAPI();