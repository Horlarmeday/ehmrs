const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Starting comprehensive subcategory creation test...');
    
    // Monitor network requests and console errors
    const apiCalls = [];
    const consoleErrors = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`🌐 API Request: ${request.method()} ${request.url()}`);
        if (request.method() === 'POST' && request.url().includes('/subcategories')) {
          console.log('📤 Request payload:', request.postData());
        }
      }
    });
    
    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        console.log(`🌐 API Response: ${response.request().method()} ${response.url()} - Status: ${response.status()}`);
        apiCalls.push({
          method: response.request().method(),
          url: response.url(),
          status: response.status(),
          timestamp: new Date().toISOString()
        });
        
        if (response.status() >= 400) {
          try {
            const responseBody = await response.text();
            console.log(`❌ Error Response (${response.status()}):`, responseBody);
          } catch (e) {
            console.log('❌ Could not read error response body');
          }
        }
      }
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
        consoleErrors.push(msg.text());
      }
    });
    
    // Step 1: Login
    console.log('\n📝 Step 1: Logging in...');
    await page.goto('http://localhost:8081/auth/login');
    await page.waitForSelector('input[name="username"]');
    
    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation();
    console.log('✅ Login successful');
    
    // Step 2: Navigate to create subcategory page
    console.log('\n📝 Step 2: Navigating to create subcategory page...');
    await page.goto('http://localhost:8081/general-store/subcategories/create');
    await page.waitForSelector('#name');
    console.log('✅ Create subcategory page loaded');
    
    // Step 3: Fill and submit form
    console.log('\n📝 Step 3: Filling form...');
    const subcategoryName = `Test Subcategory ${Date.now()}`;
    
    await page.type('#name', subcategoryName);
    console.log(`✅ Name filled: ${subcategoryName}`);
    
    // Select first valid category
    const categoryOptions = await page.$$eval('#category option', options => 
      options.map(opt => ({ value: opt.value, text: opt.textContent.trim() }))
        .filter(opt => opt.value && opt.value !== '' && !isNaN(Number(opt.value)))
    );
    
    if (categoryOptions.length > 0) {
      const firstCategory = categoryOptions[0];
      await page.select('#category', firstCategory.value);
      console.log(`✅ Category selected: ${firstCategory.text} (${firstCategory.value})`);
    }
    
    await page.type('#description', 'Automated test subcategory');
    console.log('✅ Description filled');
    
    // Clear previous API calls and submit
    apiCalls.length = 0;
    
    console.log('\n📝 Step 4: Submitting form...');
    await page.click('button[type="submit"]');
    
    // Wait for either redirect or error
    try {
      await page.waitForFunction(
        () => {
          return window.location.pathname.includes('/subcategories') && 
                 !window.location.pathname.includes('/create');
        },
        { timeout: 10000 }
      );
      console.log('✅ Successfully redirected to subcategories list');
    } catch (e) {
      console.log('⚠️ No redirect detected, checking current page...');
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      // Check for validation errors
      const validationErrors = await page.$$('.invalid-feedback:not(:empty)');
      console.log(`Validation errors found: ${validationErrors.length}`);
      
      // Check for toast messages
      const toastMessages = await page.$$eval('.toast', toasts => 
        toasts.map(toast => toast.textContent.trim())
      ).catch(() => []);
      
      if (toastMessages.length > 0) {
        console.log('📢 Toast messages:', toastMessages);
      }
    }
    
    // Step 5: Verify subcategory in list
    console.log('\n📝 Step 5: Verifying subcategory in list...');
    
    // Navigate to subcategories list if not already there
    if (!page.url().includes('/subcategories') || page.url().includes('/create')) {
      await page.goto('http://localhost:8081/general-store/subcategories');
      await page.waitForSelector('.table', { timeout: 10000 });
    }
    
    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if subcategory appears in the list
    const subcategoryFound = await page.evaluate((name) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      return rows.some(row => row.textContent.includes(name));
    }, subcategoryName);
    
    if (subcategoryFound) {
      console.log(`✅ Subcategory "${subcategoryName}" found in the list`);
    } else {
      console.log(`❌ Subcategory "${subcategoryName}" NOT found in the list`);
      
      // Get current list content for debugging
      const listContent = await page.$$eval('tbody tr', rows => 
        rows.map(row => row.textContent.trim())
      ).catch(() => ['No rows found']);
      
      console.log('📋 Current subcategories in list:');
      listContent.forEach((content, index) => {
        console.log(`  ${index + 1}: ${content}`);
      });
    }
    
    // Step 6: Summary
    console.log('\n📊 Test Summary:');
    console.log(`API Calls made: ${apiCalls.length}`);
    apiCalls.forEach(call => {
      console.log(`  ${call.method} ${call.url} - Status: ${call.status}`);
    });
    
    console.log(`Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(error => console.log(`  ❌ ${error}`));
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'subcategory-creation-test-final.png', fullPage: true });
    console.log('📸 Final screenshot saved as subcategory-creation-test-final.png');
    
    console.log('\n🎉 Comprehensive subcategory creation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'subcategory-creation-test-error.png', fullPage: true });
    console.log('📸 Error screenshot saved as subcategory-creation-test-error.png');
  } finally {
    await browser.close();
  }
})();