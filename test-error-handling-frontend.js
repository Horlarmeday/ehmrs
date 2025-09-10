const puppeteer = require('puppeteer');

// Test configuration
const BASE_URL = 'http://localhost:8081';
const LOGIN_CREDENTIALS = {
  username: 'admin',
  password: '123456'
};

let browser;
let page;

(async () => {
  try {
    console.log('🚀 Starting Error Handling Frontend Test...');
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Enable console logging to capture errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ Browser Console Error:', msg.text());
      }
    });
    
    // Capture network failures
    const networkErrors = [];
    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        failure: request.failure().errorText
      });
      console.log('🌐 Network Error:', request.url(), '-', request.failure().errorText);
    });
    
    // Step 1: Login first
    console.log('🔐 Step 1: Logging in...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle2' });
    await page.type('input[name="username"]', LOGIN_CREDENTIALS.username);
    await page.type('input[name="password"]', LOGIN_CREDENTIALS.password);
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[type="submit"]')
    ]);
    console.log('✅ Login successful');
    
    // Step 2: Test network error handling by blocking API requests
    console.log('🚫 Step 2: Testing network error handling...');
    
    // Block API requests to simulate network errors
    await page.setRequestInterception(true);
    
    const requestHandler = (req) => {
      if (req.url().includes('/api/')) {
        console.log('🚫 Blocking API request:', req.url());
        req.abort('failed');
      } else {
        req.continue();
      }
    };
    
    page.on('request', requestHandler);
    
    // Navigate to categories page with blocked requests
    await page.goto(`${BASE_URL}/general-store/categories`, { waitUntil: 'networkidle2' });
    
    // Step 3: Try to create a new category (should fail)
    console.log('➕ Step 3: Testing create category with network error...');
    
    try {
      // Navigate to create category page
      await page.goto(`${BASE_URL}/general-store/categories/create`, { waitUntil: 'networkidle2' });
      
      // Fill form
      await page.waitForSelector('#name', { timeout: 5000 });
      await page.type('#name', 'Test Error Category');
      await page.type('#description', 'Testing error handling');
      
      // Submit form
      console.log('📤 Submitting form (should fail)...');
      await page.click('button[type="submit"]');
      
      // Wait a bit for error handling
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check for error messages in the UI
      const errorMessages = await page.$$eval('.alert-danger, .error-message, .text-danger', 
        elements => elements.map(el => el.textContent.trim())
      );
      
      if (errorMessages.length > 0) {
        console.log('✅ Error messages found in UI:', errorMessages);
      } else {
        console.log('⚠️ No error messages found in UI');
      }
      
    } catch (error) {
      console.log('⚠️ Form submission error (expected):', error.message);
    }
    
    // Step 4: Test loading states
    console.log('⏳ Step 4: Testing loading states...');
    
    // Remove request handler and disable request interception
    page.removeAllListeners('request');
    await page.setRequestInterception(false);
    
    // Navigate to a page that loads data
    await page.goto(`${BASE_URL}/general-store/categories`, { waitUntil: 'networkidle2' });
    
    // Check for loading indicators
    const loadingIndicators = await page.$$('.spinner, .loading, .loader, [class*="loading"]');
    if (loadingIndicators.length > 0) {
      console.log('✅ Loading indicators found');
    } else {
      console.log('ℹ️ No loading indicators detected');
    }
    
    // Step 5: Test form validation errors
    console.log('📝 Step 5: Testing form validation errors...');
    
    await page.goto(`${BASE_URL}/general-store/categories/create`, { waitUntil: 'networkidle2' });
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check for validation errors
    const validationErrors = await page.$$eval('.invalid-feedback, .error, .field-error, .text-danger', 
      elements => elements.map(el => el.textContent.trim()).filter(text => text.length > 0)
    );
    
    if (validationErrors.length > 0) {
      console.log('✅ Validation errors found:', validationErrors);
    } else {
      console.log('ℹ️ No validation errors detected');
    }
    
    // Step 6: Test 404 error handling
    console.log('🔍 Step 6: Testing 404 error handling...');
    
    try {
      await page.goto(`${BASE_URL}/non-existent-page`, { waitUntil: 'networkidle2' });
      
      // Check if there's a 404 page or error message
      const pageContent = await page.content();
      if (pageContent.includes('404') || pageContent.includes('Not Found') || pageContent.includes('Page not found')) {
        console.log('✅ 404 error page detected');
      } else {
        console.log('ℹ️ No specific 404 error page found');
      }
    } catch (error) {
      console.log('⚠️ Navigation to non-existent page failed:', error.message);
    }
    
    // Summary
    console.log('\n📊 Error Handling Test Summary:');
    console.log(`   Console Errors: ${consoleErrors.length}`);
    console.log(`   Network Errors: ${networkErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('   Console Error Details:');
      consoleErrors.forEach((error, index) => {
        console.log(`     ${index + 1}. ${error}`);
      });
    }
    
    if (networkErrors.length > 0) {
      console.log('   Network Error Details:');
      networkErrors.forEach((error, index) => {
        console.log(`     ${index + 1}. ${error.url} - ${error.failure}`);
      });
    }
    
    console.log('\n🎉 Error Handling frontend functionality testing completed!');
    
  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
    
    // Take screenshot on error
    if (page) {
      await page.screenshot({ path: 'error-handling-test-error.png', fullPage: true });
      console.log('📸 Screenshot saved as error-handling-test-error.png');
    }
    
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();

// Check if puppeteer is available
try {
  require('puppeteer');
} catch (error) {
  console.error('❌ Puppeteer not found. Please install it with: npm install puppeteer');
  process.exit(1);
}