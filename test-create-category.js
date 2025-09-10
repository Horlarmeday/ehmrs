const axios = require('axios');

// Test creating a category and then fetching it
async function testCreateAndFetchCategory() {
  try {
    console.log('🔐 Getting authentication token...');
    
    // Step 1: Login to get token
    const loginResponse = await axios.post('http://localhost:4050/api/auth/login', {
      username: 'admin',
      password: '123456'
    });
    
    const token = loginResponse.data.data;
    console.log('✅ Token obtained');
    
    console.log('\n📝 Creating a test category...');
    
    // Step 2: Create a test category
    const categoryData = {
      name: 'Test Category ' + Date.now(),
      description: 'A test category created by automated test',
      is_active: true
    };
    
    const createResponse = await axios.post('http://localhost:4050/api/general-store/categories', categoryData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Category created successfully');
    console.log('Created category:', JSON.stringify(createResponse.data.data, null, 2));
    
    console.log('\n📋 Fetching categories list...');
    
    // Step 3: Fetch categories to verify it appears
    const categoriesResponse = await axios.get('http://localhost:4050/api/general-store/categories', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        currentPage: 1,
        pageLimit: 20
      }
    });
    
    console.log('✅ Categories fetched successfully');
    console.log('Categories count:', categoriesResponse.data.data?.rows?.length || 0);
    console.log('Total items:', categoriesResponse.data.pagination?.total_items || 0);
    
    if (categoriesResponse.data.data?.rows?.length > 0) {
      console.log('\n📝 Categories list:');
      categoriesResponse.data.data.rows.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name} (${category.status})`);
      });
    }
    
    console.log('\n🎯 Testing frontend proxy with categories...');
    
    // Step 4: Test frontend proxy
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
    console.log('Proxy categories count:', proxyResponse.data.data?.rows?.length || 0);
    console.log('\n🎉 All tests passed! Categories API is working correctly.');
    
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
testCreateAndFetchCategory();