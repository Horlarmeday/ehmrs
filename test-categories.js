const axios = require('axios');

async function testCategoriesAPI() {
  try {
    console.log('Testing Categories API...');
    
    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:4050/api/auth/login', {
      username: 'admin',
      password: '123456'
    });
    
    const token = loginResponse.data.data;
    console.log('Login successful, token received:', token ? 'Yes' : 'No');
    
    // Step 2: Test categories endpoint
    console.log('2. Testing categories endpoint...');
    const categoriesResponse = await axios.get('http://localhost:4050/api/general-store/categories', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Categories API Response:');
    console.log('Status:', categoriesResponse.status);
    console.log('Data:', JSON.stringify(categoriesResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error testing API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testCategoriesAPI();