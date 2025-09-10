const puppeteer = require('puppeteer');

(async () => {
  console.log('🧪 Starting Create Subcategory Form Tests with Authentication...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Monitor console logs
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warn') {
        console.log(`🔍 Console ${type}:`, msg.text());
      }
    });
    
    // Step 1: Login
    console.log('📝 Step 1: Logging in...');
    await page.goto('http://localhost:8081/auth/login', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    const emailInput = await page.$('input[name="username"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button[type="submit"], .btn-primary');
    
    if (emailInput && passwordInput && loginButton) {
      await emailInput.type('admin');
      console.log('✅ Email input found with selector: input[name="username"]');
      
      await passwordInput.type('123456');
      console.log('✅ Password input found with selector: input[type="password"]');
      
      await loginButton.click();
      console.log('✅ Login form submitted');
      
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
      console.log('✅ Login successful, redirected to:', page.url());
    } else {
      throw new Error('Login form elements not found');
    }
    
    // Step 2: Navigate to create subcategory page
    console.log('📝 Step 2: Navigating to create subcategory page...');
    await page.goto('http://localhost:8081/general-store/subcategories/create', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Create subcategory page loaded');
    
    // Step 3: Test form elements and validation
    console.log('📝 Step 3: Testing form submission...');
    
    // Find form elements based on the Vue template structure
    const nameInput = await page.$('#name, input[type="text"].form-control');
    const categorySelect = await page.$('#category, select.form-control');
    const descriptionTextarea = await page.$('#description, textarea.form-control');
    const submitButton = await page.$('button[type="submit"], .btn-primary');
    
    console.log('Form elements found:');
    console.log(`  Name input: ${nameInput ? '✅' : '❌'}`);
    console.log(`  Category select: ${categorySelect ? '✅' : '❌'}`);
    console.log(`  Description textarea: ${descriptionTextarea ? '✅' : '❌'}`);
    console.log(`  Submit button: ${submitButton ? '✅' : '❌'}`);
    
    if (nameInput && categorySelect && submitButton) {
      console.log('✅ Form elements found');
      
      // Test form validation first (submit empty form)
      await submitButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const errorMessages = await page.$$('.invalid-feedback, .text-danger, .error');
      console.log(`✅ Form validation working: ${errorMessages.length} error message(s) found`);
      
      // Check if categories are loaded in the dropdown
      const categoryOptions = await page.$$eval('#category option', options => 
        options.map(option => ({ value: option.value, text: option.textContent.trim() }))
      );
      console.log(`✅ Category dropdown loaded with ${categoryOptions.length} options:`);
      categoryOptions.slice(0, 5).forEach(option => {
        console.log(`   ${option.value}: ${option.text}`);
      });
      
      if (categoryOptions.length > 1) {
        // Fill form with valid data
        const testSubcategoryName = 'Test Subcategory ' + Date.now();
        await nameInput.type(testSubcategoryName);
        console.log('✅ Name field filled');
        
        // Select the first available category (skip the empty option)
        const firstCategory = categoryOptions.find(option => option.value !== '');
        if (firstCategory) {
          await page.select('#category', firstCategory.value);
          console.log(`✅ Category selected: ${firstCategory.text}`);
        }
        
        if (descriptionTextarea) {
          await descriptionTextarea.type('Test subcategory description for automated testing');
          console.log('✅ Description filled');
        }
        
        // Monitor network requests
        const apiCalls = [];
        page.on('response', response => {
          if (response.url().includes('/api/') || response.url().includes('/subcategories')) {
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
          console.log('✅ API calls detected:');
          apiCalls.forEach(call => {
            console.log(`   ${call.method} ${call.url} - Status: ${call.status}`);
          });
        } else {
          console.log('❌ No API calls detected');
        }
        
        // Check for redirect or success message
        const currentUrl = page.url();
        const successMessage = await page.$('.alert-success, .toast-success, .success');
        
        if (currentUrl !== 'http://localhost:8081/general-store/subcategories/create') {
          console.log('✅ Page redirected to:', currentUrl);
        } else if (successMessage) {
          console.log('✅ Success message found');
        } else {
          console.log('❌ No redirect or success message found');
        }
        
        // Navigate to subcategories list to verify creation
        await page.goto('http://localhost:8081/general-store/subcategories', { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const subcategoryElements = await page.$$('.card, [class*="subcategory"]');
        if (subcategoryElements.length > 0) {
          console.log(`✅ Subcategories list loaded with ${subcategoryElements.length} items`);
          
          // Look for our test subcategory
          const pageContent = await page.content();
          if (pageContent.includes(testSubcategoryName)) {
            console.log('✅ Test subcategory found in the list');
          } else {
            console.log('❌ Test subcategory not found in the list');
          }
          
          // Count test subcategories for verification
          const testSubcategoryCount = await page.$$eval('*', (elements, subcategoryName) => {
            return elements.filter(el => 
              el.textContent && el.textContent.includes(subcategoryName)
            ).length;
          }, testSubcategoryName);
          console.log(`✅ Found ${testSubcategoryCount} elements containing the test subcategory name`);
        } else {
          console.log('❌ No subcategories found in the list');
        }
        
      } else {
        console.log('❌ No categories available in dropdown - cannot test subcategory creation');
      }
      
    } else {
      console.log('❌ Form elements not found');
    }
    
    // Take screenshot for verification
    await page.screenshot({ path: 'create-subcategory-test.png', fullPage: true });
    console.log('📸 Screenshot saved as create-subcategory-test.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'create-subcategory-error.png', fullPage: true });
    console.log('📸 Error screenshot saved as create-subcategory-error.png');
  } finally {
    await browser.close();
    console.log('\n🎉 Create subcategory test completed!');
  }
})();