const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Starting error handling tests...');
    
    // Test 1: Login with invalid credentials
    console.log('\n=== Test 1: Invalid Login Credentials ===');
    await page.goto('http://localhost:8081/auth/login');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fill login form with invalid credentials
    await page.type('input[name="username"]', 'invalid_user');
    await page.type('input[name="password"]', 'wrong_password');
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for error messages
    const loginErrorMessages = await page.evaluate(() => {
      const alerts = Array.from(document.querySelectorAll('.alert, .error, .invalid-feedback, .text-danger'));
      return alerts.map(alert => alert.textContent.trim()).filter(text => text.length > 0);
    });
    
    console.log('Login error messages:', loginErrorMessages);
    
    // Test 2: Login with correct credentials for subsequent tests
    console.log('\n=== Test 2: Valid Login for Network Error Tests ===');
    await page.goto('http://localhost:8081/auth/login');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clear and fill with correct credentials
    await page.evaluate(() => {
      document.querySelector('input[name="username"]').value = '';
      document.querySelector('input[name="password"]').value = '';
    });
    
    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Login successful, current URL:', await page.url());
    
    // Test 3: Check for JavaScript errors and network issues
    console.log('\n=== Test 3: JavaScript Error Monitoring ===');
    
    const jsErrors = [];
    const networkErrors = [];
    
    // Monitor JavaScript errors
    page.on('pageerror', error => {
      jsErrors.push(error.message);
      console.log('JavaScript error detected:', error.message);
    });
    
    // Monitor failed network requests
    page.on('requestfailed', request => {
      networkErrors.push(`${request.method()} ${request.url()} - ${request.failure().errorText}`);
      console.log('Network request failed:', request.url(), request.failure().errorText);
    });
    
    // Navigate to various pages to check for errors
    const pagesToTest = [
      'http://localhost:8081/general-store/categories',
      'http://localhost:8081/general-store/subcategories',
      'http://localhost:8081/general-store/categories/create'
    ];
    
    for (const url of pagesToTest) {
      console.log(`Testing page for errors: ${url}`);
      await page.goto(url);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.log('JavaScript errors found:', jsErrors.length);
    console.log('Network errors found:', networkErrors.length);
    
    // Test 4: Form validation errors
    console.log('\n=== Test 4: Form Validation Errors ===');
    
    const validationErrors = [];
    
    // Disable request interception for this test
    await page.setRequestInterception(false);
    
    const validationPages = [
      'http://localhost:8081/general-store/categories/create',
      'http://localhost:8081/general-store/subcategories/create'
    ];
    
    for (const url of validationPages) {
       console.log(`Testing validation on page: ${url}`);
       await page.goto(url);
       await new Promise(resolve => setTimeout(resolve, 3000));
       
       // Submit form without filling required fields
       await page.click('button[type="submit"]');
       await new Promise(resolve => setTimeout(resolve, 3000));
       
       // Check for validation error messages
       const validationErrorsFromPage = await page.evaluate(() => {
         const errors = Array.from(document.querySelectorAll('.invalid-feedback, .error, .text-danger, .alert-danger'));
         return errors.map(error => error.textContent.trim()).filter(text => text.length > 0);
       });
       
       validationErrors.push(...validationErrorsFromPage);
     }
     
     console.log('Validation error messages:', validationErrors);
    
    // Test 5: Check console errors
    console.log('\n=== Test 5: Console Error Monitoring ===');
    
    // Monitor console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate to a few pages to check for console errors
    const consoleTestPages = [
      'http://localhost:8081/general-store/categories',
      'http://localhost:8081/general-store/subcategories',
      'http://localhost:8081/general-store/items'
    ];
    
    for (const url of consoleTestPages) {
      console.log(`Testing page: ${url}`);
      await page.goto(url);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.log('Console errors detected:', consoleErrors);
    
    // Test Summary
    console.log('\n=== Error Handling Test Summary ===');
    console.log('1. Login errors:', loginErrorMessages.length > 0 ? 'DETECTED' : 'NONE');
    console.log('2. JavaScript errors:', jsErrors.length > 0 ? `${jsErrors.length} FOUND` : 'NONE');
    console.log('3. Network errors:', networkErrors.length > 0 ? `${networkErrors.length} FOUND` : 'NONE');
    console.log('4. Validation errors:', validationErrors.length > 0 ? 'DETECTED' : 'NONE');
    console.log('5. Console errors:', consoleErrors.length > 0 ? `${consoleErrors.length} FOUND` : 'NONE');
    
    console.log('\nError handling tests completed successfully!');
    
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('\nKeeping browser open for 30 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    await browser.close();
  }
})();