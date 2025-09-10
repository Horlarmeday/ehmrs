const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();
  
  // Monitor console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  // Monitor page errors
  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
  });
  
  // Monitor navigation
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      console.log('🔄 Navigation to:', frame.url());
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
    const testName = `Test Redirect ${Date.now()}`;
    await page.type('#name', testName);
    await page.select('#category', '1');
    await page.type('#description', 'Testing redirect functionality');
    
    // Submit and wait for redirect
    console.log('🚀 Submitting form and waiting for redirect...');
    const navigationPromise = page.waitForNavigation({ timeout: 10000 });
    await page.click('button[type="submit"]');
    
    try {
      await navigationPromise;
      console.log('✅ Redirect successful to:', page.url());
      
      // Check if we're on the subcategories list page
      if (page.url().includes('/general-store/subcategories') && !page.url().includes('/create')) {
        console.log('✅ Successfully redirected to subcategories list');
        
        // Wait for the list to load and check if our subcategory is there
        await page.waitForSelector('.table', { timeout: 5000 });
        const pageContent = await page.content();
        if (pageContent.includes(testName)) {
          console.log('✅ New subcategory found in the list');
        } else {
          console.log('⚠️ New subcategory not found in the list yet');
        }
      } else {
        console.log('❌ Redirect went to unexpected page:', page.url());
      }
    } catch (error) {
      console.log('❌ No redirect detected within 10 seconds');
      console.log('📍 Current URL:', page.url());
      
      // Check for success/error messages
      const successMessage = await page.$('.toast-success, .alert-success');
      const errorMessage = await page.$('.toast-error, .alert-danger');
      
      if (successMessage) {
        console.log('✅ Success message found, but no redirect');
      }
      if (errorMessage) {
        console.log('❌ Error message found');
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();