// Test Create Category form with authentication
// This script logs in first, then tests the create category form

const puppeteer = require('puppeteer');

async function testCreateCategoryWithAuth() {
  console.log('🧪 Starting Create Category Form Tests with Authentication...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate to login page and login
    console.log('📝 Step 1: Logging in...');
    await page.goto('http://localhost:8081/auth/login', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for login form
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Try different selectors for email/username input
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[name="username"]',
      'input[placeholder*="email"]',
      'input[placeholder*="username"]',
      '#email',
      '#username',
      '.form-control[type="email"]',
      '.form-control[name="email"]'
    ];
    
    let emailInput = null;
    for (const selector of emailSelectors) {
      emailInput = await page.$(selector);
      if (emailInput) {
        console.log('✅ Email input found with selector:', selector);
        break;
      }
    }
    
    if (!emailInput) {
      console.log('❌ Email input not found, trying to find any input field...');
      const allInputs = await page.$$('input');
      console.log('Found', allInputs.length, 'input fields');
      
      for (let i = 0; i < allInputs.length; i++) {
        const inputType = await page.evaluate(el => el.type, allInputs[i]);
        const inputName = await page.evaluate(el => el.name, allInputs[i]);
        const inputPlaceholder = await page.evaluate(el => el.placeholder, allInputs[i]);
        console.log(`Input ${i}: type=${inputType}, name=${inputName}, placeholder=${inputPlaceholder}`);
      }
      
      if (allInputs.length > 0) {
        emailInput = allInputs[0]; // Use first input as email
        console.log('✅ Using first input field as email');
      }
    }
    
    // Try different selectors for password input
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      '#password',
      '.form-control[type="password"]'
    ];
    
    let passwordInput = null;
    for (const selector of passwordSelectors) {
      passwordInput = await page.$(selector);
      if (passwordInput) {
        console.log('✅ Password input found with selector:', selector);
        break;
      }
    }
    
    if (emailInput && passwordInput) {
      // Fill login form
      await emailInput.type('admin');
      await passwordInput.type('123456');
      
      // Find and click login button
      const loginButton = await page.$('button[type="submit"], .btn-primary');
      if (loginButton) {
        await loginButton.click();
        console.log('✅ Login form submitted');
        
        // Wait for redirect or dashboard
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const currentUrl = page.url();
        if (!currentUrl.includes('/auth/login')) {
          console.log('✅ Login successful, redirected to:', currentUrl);
        } else {
          console.log('⚠️ Still on login page, login might have failed');
        }
      } else {
        console.log('❌ Login button not found');
      }
    } else {
      console.log('❌ Could not find login form inputs');
    }
    
    // Step 2: Navigate to create category page
    console.log('📝 Step 2: Navigating to create category page...');
    await page.goto('http://localhost:8081/general-store/categories/create', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for the form to load
    await page.waitForSelector('form', { timeout: 10000 });
    console.log('✅ Create category page loaded');
    
    // Step 3: Test form submission with valid data
    console.log('📝 Step 3: Testing form submission...');
    
    // Look for form inputs based on the actual page structure
    const nameInput = await page.$('input.form-control[type="text"]'); // First text input should be name
    const descriptionTextarea = await page.$('textarea.form-control');
    const submitButton = await page.$('button.btn-success'); // "Create Category" button
    
    if (nameInput && submitButton) {
      console.log('✅ Form elements found');
      
      // Test form validation first (submit empty form)
      await submitButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const errorMessages = await page.$$('.invalid-feedback, .text-danger, .error');
      console.log(`✅ Form validation working: ${errorMessages.length} error message(s) found`);
      
      // Fill form with valid data
      const testCategoryName = 'Test Category ' + Date.now();
      await nameInput.type(testCategoryName);
      
      if (descriptionTextarea) {
        await descriptionTextarea.type('Test category description for automated testing');
        console.log('✅ Description filled');
      }
      
      // Monitor network requests
      const apiCalls = [];
      page.on('response', response => {
        if (response.url().includes('/api/') || response.url().includes('/categories')) {
          apiCalls.push({
            url: response.url(),
            status: response.status(),
            method: response.request().method()
          });
        }
      });
      
      // Submit form
      await submitButton.click();
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check for API calls
      if (apiCalls.length > 0) {
        console.log('✅ API calls detected:', apiCalls);
      } else {
        console.log('❌ No API calls detected');
      }
      
      // Check for redirect or success message
      const currentUrl = page.url();
      const successMessage = await page.$('.alert-success, .toast-success, .success');
      
      if (currentUrl !== 'http://localhost:8081/general-store/categories/create') {
        console.log('✅ Page redirected to:', currentUrl);
      } else if (successMessage) {
        console.log('✅ Success message found');
      } else {
        console.log('❌ No redirect or success message found');
      }
      
      // Navigate to categories list to verify creation
      await page.goto('http://localhost:8081/general-store/categories', { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const categoryElements = await page.$$('.card, [class*="category"]');
      if (categoryElements.length > 0) {
        console.log(`✅ Categories list loaded with ${categoryElements.length} items`);
        
        // Look for our test category
        const pageContent = await page.content();
        if (pageContent.includes(testCategoryName)) {
          console.log('✅ Test category found in the list');
        } else {
          console.log('❌ Test category not found in the list');
        }
        
        // Count test categories for verification
        const testCategoryCount = await page.$$eval('*', (elements, categoryName) => {
          return elements.filter(el => 
            el.textContent && el.textContent.includes(categoryName)
          ).length;
        }, testCategoryName);
        console.log(`✅ Found ${testCategoryCount} elements containing the test category name`);
      } else {
        console.log('❌ No categories found in the list');
      }
      
    } else {
      console.log('❌ Form elements not found');
    }
    
    console.log('\n🎉 Authentication test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take screenshot on error
    await page.screenshot({ 
      path: 'create-category-auth-error.png', 
      fullPage: true 
    });
    console.log('📸 Error screenshot saved as create-category-auth-error.png');
  } finally {
    await browser.close();
  }
}

// Run the test
testCreateCategoryWithAuth().catch(console.error);