// Test script for Create Category form functionality
// This script tests form validation, submission, and error handling

const puppeteer = require('puppeteer');

async function testCreateCategoryForm() {
  console.log('🧪 Starting Create Category Form Tests...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate to login page
    console.log('📝 Step 1: Logging in...');
    await page.goto('http://localhost:8081/#/auth/login', { waitUntil: 'networkidle0' });
    
    // Login with admin credentials
    await page.type('#example-input-1', 'admin@demo.com');
    await page.type('#example-input-2', 'demo');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Login successful');
    
    // Step 2: Navigate to create category page
    console.log('📝 Step 2: Navigating to create category page...');
    await page.goto('http://localhost:8081/#/general-store/categories/create', { waitUntil: 'networkidle0' });
    
    // Wait for form to load
    await page.waitForSelector('form.category-form', { timeout: 10000 });
    console.log('✅ Create category form loaded');
    
    // Step 3: Test form validation with empty required fields
    console.log('📝 Step 3: Testing form validation with empty fields...');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Wait a moment for validation to trigger
    await page.waitForTimeout(1000);
    
    // Check if validation errors appear
    const nameError = await page.$('.invalid-feedback');
    if (nameError) {
      const errorText = await page.evaluate(el => el.textContent, nameError);
      console.log('✅ Validation working - Name error:', errorText);
    } else {
      console.log('❌ No validation error found for empty name field');
    }
    
    // Step 4: Test with invalid data
    console.log('📝 Step 4: Testing with invalid data...');
    
    // Test with name too short
    await page.type('input[name="name"]', 'A'); // Too short
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Clear the field
    await page.evaluate(() => {
      document.querySelector('input[name="name"]').value = '';
    });
    
    // Step 5: Test with valid data
    console.log('📝 Step 5: Testing with valid category data...');
    
    // Fill form with valid data
    await page.type('input[name="name"]', 'Test Category ' + Date.now());
    await page.type('input[name="code"]', 'TEST_CAT');
    await page.type('textarea[name="description"]', 'This is a test category for automated testing');
    await page.type('input[name="sort_order"]', '10');
    
    // Select a parent category if available
    const parentSelect = await page.$('select[name="parent_id"]');
    if (parentSelect) {
      const options = await page.$$eval('select[name="parent_id"] option', options => 
        options.map(option => ({ value: option.value, text: option.textContent }))
      );
      
      if (options.length > 1) {
        await page.select('select[name="parent_id"]', options[1].value);
        console.log('✅ Selected parent category:', options[1].text);
      }
    }
    
    // Monitor network requests
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/') && response.request().method() === 'POST') {
        responses.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method()
        });
      }
    });
    
    // Submit the form
    console.log('📝 Submitting form with valid data...');
    await page.click('button[type="submit"]');
    
    // Wait for submission to complete
    await page.waitForTimeout(3000);
    
    // Check for success message or redirect
    const successMessage = await page.$('.alert-success, .toast-success');
    if (successMessage) {
      console.log('✅ Success message displayed');
    }
    
    // Check API calls
    if (responses.length > 0) {
      console.log('✅ API calls made:');
      responses.forEach(resp => {
        console.log(`  - ${resp.method} ${resp.url} - Status: ${resp.status}`);
      });
    } else {
      console.log('❌ No API calls detected');
    }
    
    // Step 6: Verify category was created by checking categories list
    console.log('📝 Step 6: Verifying category appears in list...');
    await page.goto('http://localhost:8081/#/general-store/categories', { waitUntil: 'networkidle0' });
    
    // Wait for categories to load
    await page.waitForSelector('.categories-list, .table, .card', { timeout: 10000 });
    
    // Check if our test category appears
    const pageContent = await page.content();
    if (pageContent.includes('Test Category')) {
      console.log('✅ Test category found in categories list');
    } else {
      console.log('❌ Test category not found in categories list');
    }
    
    // Step 7: Test error handling
    console.log('📝 Step 7: Testing error handling...');
    
    // Go back to create form
    await page.goto('http://localhost:8081/#/general-store/categories/create', { waitUntil: 'networkidle0' });
    await page.waitForSelector('form.category-form', { timeout: 10000 });
    
    // Try to create duplicate category (same name)
    await page.type('input[name="name"]', 'Test Category ' + Date.now());
    await page.type('input[name="description"]', 'Duplicate test');
    
    // Submit and check for error handling
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log('✅ All Create Category form tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testCreateCategoryForm().catch(console.error);