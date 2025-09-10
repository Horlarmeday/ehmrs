const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();
  
  // Monitor all console messages
  page.on('console', msg => {
    console.log(`🔍 Console [${msg.type()}]:`, msg.text());
  });
  
  // Monitor page errors
  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
  });
  
  // Monitor network requests
  page.on('response', response => {
    if (response.url().includes('/subcategories')) {
      console.log(`🌐 API Response: ${response.request().method()} ${response.url()} - Status: ${response.status()}`);
    }
  });
  
  try {
    // Login
    console.log('🔐 Logging in...');
    await page.goto('http://localhost:8081/auth/login');
    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    console.log('✅ Login successful');
    
    // Navigate to create subcategory
    console.log('📝 Navigating to create subcategory...');
    await page.goto('http://localhost:8081/general-store/subcategories/create');
    await page.waitForSelector('#category');
    console.log('✅ Create page loaded');
    
    // Fill form
    console.log('📝 Filling form...');
    const testName = `Debug Test ${Date.now()}`;
    await page.type('#name', testName);
    await page.select('#category', '1');
    await page.type('#description', 'Debug test for redirect issue');
    
    // Submit form and monitor what happens
    console.log('🚀 Submitting form...');
    await page.click('button[type="submit"]');
    
    // Wait a bit and check for any changes
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📍 Current URL after 3 seconds:', page.url());
    
    // Check for toast messages
    const toastSuccess = await page.$('.toast-success, .swal2-success');
    const toastError = await page.$('.toast-error, .swal2-error');
    
    if (toastSuccess) {
      console.log('✅ Success toast found');
      const toastText = await page.evaluate(el => el.textContent, toastSuccess);
      console.log('📝 Success message:', toastText);
    }
    
    if (toastError) {
      console.log('❌ Error toast found');
      const toastText = await page.evaluate(el => el.textContent, toastError);
      console.log('📝 Error message:', toastText);
    }
    
    // Check form state
    const nameValue = await page.$eval('#name', el => el.value);
    const submitButton = await page.$('button[type="submit"]');
    const isDisabled = await page.evaluate(el => el.disabled, submitButton);
    
    console.log('📝 Form name value:', nameValue);
    console.log('🔘 Submit button disabled:', isDisabled);
    
    // Check for validation errors
    const validationErrors = await page.$$('.invalid-feedback');
    console.log('⚠️ Validation errors found:', validationErrors.length);
    
    if (validationErrors.length > 0) {
      for (let i = 0; i < validationErrors.length; i++) {
        const errorText = await page.evaluate(el => el.textContent, validationErrors[i]);
        console.log(`   Error ${i + 1}: ${errorText}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  } finally {
    // Keep browser open for manual inspection
    console.log('🔍 Browser will stay open for 10 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
  }
})();