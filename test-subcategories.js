const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:4050';
const LOGIN_CREDENTIALS = {
  username: 'admin',
  password: '123456'
};

async function testSubcategories() {
  try {
    console.log('🧪 Testing Subcategories Functionality\n');
    
    // Step 1: Login and get token
    console.log('🔐 Step 1: Getting authentication token...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, LOGIN_CREDENTIALS);
    const token = loginResponse.data.data;
    console.log('✅ Token obtained successfully\n');
    
    // Configure axios with token
    const authenticatedAxios = axios.create({
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Step 2: Get categories to use as parent for subcategories
    console.log('📋 Step 2: Fetching categories for parent selection...');
    const categoriesResponse = await authenticatedAxios.get(`${BASE_URL}/api/general-store/categories?is_active=true`);
    const categories = categoriesResponse.data.data || [];
    
    if (categories.length === 0) {
      throw new Error('No categories found. Need at least one category to test subcategories.');
    }
    
    const parentCategory = categories[0];
    console.log('✅ Found parent category:', {
      id: parentCategory.id,
      name: parentCategory.name
    });
    console.log();
    
    // Step 3: Test subcategories listing (all)
    console.log('📋 Step 3: Testing subcategories listing (all)...');
    const allSubcategoriesResponse = await authenticatedAxios.get(`${BASE_URL}/api/general-store/subcategories`);
    console.log('✅ All subcategories fetched successfully');
    console.log('   Total subcategories:', allSubcategoriesResponse.data.pagination?.total_items || 0);
    console.log();
    
    // Step 4: Test subcategories listing by category
    console.log(`📋 Step 4: Testing subcategories for category ${parentCategory.id}...`);
    const categorySubcategoriesResponse = await authenticatedAxios.get(
      `${BASE_URL}/api/general-store/categories/${parentCategory.id}/subcategories`
    );
    console.log('✅ Category subcategories fetched successfully');
    console.log('   Subcategories for this category:', categorySubcategoriesResponse.data.pagination?.total_items || 0);
    console.log();
    
    // Step 5: Test subcategory creation
    console.log('📝 Step 5: Testing subcategory creation...');
    const subcategoryData = {
      name: 'Test Subcategory ' + Date.now(),
      description: 'A test subcategory for validation',
      category_id: parentCategory.id,
      is_active: true
    };
    
    const createResponse = await authenticatedAxios.post(
      `${BASE_URL}/api/general-store/subcategories`,
      subcategoryData
    );
    
    const createdSubcategory = createResponse.data.data;
    console.log('✅ Subcategory created successfully');
    console.log('   Created subcategory:', {
      id: createdSubcategory.id,
      name: createdSubcategory.name,
      category_id: createdSubcategory.category_id,
      is_active: createdSubcategory.is_active
    });
    console.log();
    
    // Step 6: Verify created subcategory appears in listings
    console.log('🔍 Step 6: Verifying created subcategory appears in listings...');
    
    // Check in all subcategories
    const updatedAllResponse = await authenticatedAxios.get(`${BASE_URL}/api/general-store/subcategories`);
    const allSubcategories = updatedAllResponse.data.data || [];
    const foundInAll = allSubcategories.find(sub => sub.id === createdSubcategory.id);
    
    if (!foundInAll) {
      throw new Error('Created subcategory not found in all subcategories list');
    }
    console.log('✅ Created subcategory found in all subcategories list');
    
    // Check in category-specific subcategories
    const updatedCategoryResponse = await authenticatedAxios.get(
      `${BASE_URL}/api/general-store/categories/${parentCategory.id}/subcategories`
    );
    const categorySubcategories = updatedCategoryResponse.data.data || [];
    const foundInCategory = categorySubcategories.find(sub => sub.id === createdSubcategory.id);
    
    if (!foundInCategory) {
      throw new Error('Created subcategory not found in category subcategories list');
    }
    console.log('✅ Created subcategory found in category subcategories list');
    console.log();
    
    // Step 7: Test subcategory retrieval by ID
    console.log('🔍 Step 7: Testing subcategory retrieval by ID...');
    const getByIdResponse = await authenticatedAxios.get(
      `${BASE_URL}/api/general-store/subcategories/${createdSubcategory.id}`
    );
    
    const retrievedSubcategory = getByIdResponse.data.data;
    console.log('✅ Subcategory retrieved by ID successfully');
    console.log('   Retrieved subcategory:', {
      id: retrievedSubcategory.id,
      name: retrievedSubcategory.name,
      category: retrievedSubcategory.category?.name || 'N/A'
    });
    console.log();
    
    // Step 8: Test validation errors
    console.log('🚫 Step 8: Testing validation errors...');
    
    // Test missing required fields
    try {
      await authenticatedAxios.post(`${BASE_URL}/api/general-store/subcategories`, {
        description: 'Missing name and category_id'
      });
      throw new Error('Should have failed validation');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validation correctly rejected missing required fields');
        console.log('   Error message:', error.response.data.message);
      } else {
        throw error;
      }
    }
    
    // Test invalid category_id
    try {
      await authenticatedAxios.post(`${BASE_URL}/api/general-store/subcategories`, {
        name: 'Test Invalid Category',
        category_id: 99999,
        is_active: true
      });
      throw new Error('Should have failed with invalid category_id');
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 404)) {
        console.log('✅ Validation correctly rejected invalid category_id');
        console.log('   Error message:', error.response.data.message);
      } else {
        throw error;
      }
    }
    console.log();
    
    console.log('🎉 Subcategories functionality testing completed successfully!');
    
  } catch (error) {
    console.error('❌ Subcategories test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run the test
testSubcategories();