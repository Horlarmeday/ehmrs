const puppeteer = require('puppeteer');

(async () => {
  console.log('🔍 Debug: Subcategory Creation Process...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Monitor all network requests
    const apiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`🌐 API Call: ${request.method()} ${request.url()}`);
        if (request.method() === 'POST' && request.url().includes('/subcategories')) {
          console.log('📤 Request payload:', request.postData());
        }
      }
    });

    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/') || url.includes('subcategories') || url.includes('categories')) {
        console.log(`🌐 API Call: ${response.request().method()} ${url} - Status: ${response.status()}`);
        if (response.status() === 400 && response.url().includes('/subcategories')) {
          try {
            const responseBody = await response.text();
            console.log('❌ 400 Response body:', responseBody);
          } catch (e) {
            console.log('❌ Could not read response body');
          }
        }
        apiCalls.push({
          url: url,
          status: response.status(),
          method: response.request().method(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Monitor console for errors
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });
    
    // Step 1: Login
    console.log('\n📝 Step 1: Logging in...');
    await page.goto('http://localhost:8081/auth/login', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    await page.type('input[name="username"]', 'admin');
    await page.type('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
    console.log('✅ Login completed');
    
    // Step 2: Navigate to create subcategory
    console.log('\n📝 Step 2: Navigating to create subcategory...');
    await page.goto('http://localhost:8081/general-store/subcategories/create', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Create subcategory page loaded');
    
    // Step 3: Analyze form and categories
    console.log('\n📝 Step 3: Analyzing form...');
    
    const categoryOptions = await page.$$eval('#category option, select option', options => 
      options.map(option => ({ value: option.value, text: option.textContent.trim() }))
    );
    console.log(`Categories available: ${categoryOptions.length}`);
    categoryOptions.forEach((option, index) => {
      console.log(`  ${index}: "${option.value}" - "${option.text}"`);
    });
    
    // Step 4: Fill and submit form
    console.log('\n📝 Step 4: Filling form...');
    const testName = 'Debug Subcategory ' + Date.now();
    
    await page.type('#name', testName);
    console.log(`✅ Name filled: ${testName}`);
    
    // Select first non-empty category (excluding status options)
    const validCategory = categoryOptions.find(opt => 
      opt.value && 
      opt.value !== '' && 
      opt.value !== 'active' && 
      opt.value !== 'inactive' &&
      !isNaN(parseInt(opt.value))
    );
    if (validCategory) {
      await page.select('#category', validCategory.value);
      console.log(`✅ Category selected: ${validCategory.text} (${validCategory.value})`);
    } else {
      console.log('❌ No valid categories found');
      await browser.close();
      return;
    }
    
    // Fill description (optional field)
    await page.type('#description', 'This is a test subcategory created by automated testing.');
    console.log('✅ Description filled');
    
    // Note: Not filling code, sort_order, status as they're not in backend schema
    
    // Clear previous API calls and submit
    apiCalls.length = 0;
    console.log('\n📝 Step 5: Submitting form...');
    
    await page.click('button[type="submit"]');
    console.log('✅ Form submitted');
    
    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check API calls after submission
    console.log('\n📊 API Calls after submission:');
    if (apiCalls.length > 0) {
      apiCalls.forEach(call => {
        console.log(`  ${call.method} ${call.url} - Status: ${call.status} at ${call.timestamp}`);
      });
    } else {
      console.log('  No API calls detected');
    }
    
    // Check current page state
    const currentUrl = page.url();
    console.log(`\n📍 Current URL: ${currentUrl}`);
    
    const successElements = await page.$$('.alert-success, .toast-success, .success, .alert.alert-success');
    console.log(`✅ Success elements found: ${successElements.length}`);
    
    const errorElements = await page.$$('.alert-danger, .toast-error, .error, .alert.alert-danger');
    console.log(`❌ Error elements found: ${errorElements.length}`);
    
    // Check if still on create page or redirected
    if (currentUrl.includes('/create')) {
      console.log('📍 Still on create page - checking for validation errors');
      const validationErrors = await page.$$('.invalid-feedback, .text-danger');
      console.log(`Validation errors: ${validationErrors.length}`);
    } else {
      console.log('📍 Redirected from create page');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'debug-subcategory-creation.png', fullPage: true });
    console.log('\n📸 Screenshot saved as debug-subcategory-creation.png');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    await page.screenshot({ path: 'debug-subcategory-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🎉 Debug completed!');
  }
})();