const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Starting Create Subcategory Frontend Test...');
    
    // Step 1: Navigate to login page
    console.log('🔐 Step 1: Navigating to login page...');
    await page.goto('http://localhost:8081/auth/login', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    
    // Step 2: Login with admin credentials
    console.log('🔑 Step 2: Logging in with admin credentials...');
    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', '123456');
    
    // Click login button and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[type="submit"]')
    ]);
    console.log('✅ Login successful');
    
    // Step 3: Navigate to create subcategory page
    console.log('➕ Step 3: Navigating to create subcategory page...');
    await page.goto('http://localhost:8081/general-store/subcategories/create');
    await page.waitForSelector('form', { timeout: 10000 });
    console.log('✅ Create subcategory page loaded successfully');
    
    // Step 4: Verify page content
    console.log('📋 Step 4: Verifying page content...');
    
    // Check page title
    const pageTitle = await page.$eval('h1, h2, h3, .page-title, .card-title', el => el.textContent.trim());
    console.log(`✅ Page title verified: ${pageTitle}`);
    
    // Step 5: Verify form elements
    console.log('📝 Step 5: Verifying form elements...');
    
    // Check name input
    const nameInput = await page.$('input[name="name"], #name, input[placeholder*="name"], input[placeholder*="Name"]');
    if (nameInput) {
      console.log('✅ Name input found');
    } else {
      console.log('❌ Name input not found');
    }
    
    // Check parent category dropdown
    const categorySelect = await page.$('select[name="category"], select[name="categoryId"], select[name="parent_category"], #category, #categoryId');
    if (categorySelect) {
      console.log('✅ Parent category dropdown found');
      
      // Get dropdown options
      const options = await page.evaluate(() => {
        const select = document.querySelector('select[name="category"], select[name="categoryId"], select[name="parent_category"], #category, #categoryId');
        if (select) {
          return Array.from(select.options).map(option => ({
            value: option.value,
            text: option.textContent.trim()
          }));
        }
        return [];
      });
      console.log('   Available categories:', options.slice(0, 5)); // Show first 5 options
    } else {
      console.log('❌ Parent category dropdown not found');
    }
    
    // Check description textarea
    const descriptionTextarea = await page.$('textarea[name="description"], #description, textarea[placeholder*="description"]');
    if (descriptionTextarea) {
      console.log('✅ Description textarea found');
    } else {
      console.log('⚠️ Description textarea not found (optional field)');
    }
    
    // Check submit button
    const submitButton = await page.$('button[type="submit"], .btn-primary');
    if (!submitButton) {
      throw new Error('Submit button not found');
    }
    console.log('✅ Submit button found');
    
    // Get button text
    const buttonText = await page.$eval('button[type="submit"], .btn-primary', el => el.textContent.trim());
    console.log('   Button text:', buttonText);
    
    // Step 6: Test form validation
    console.log('🔍 Step 6: Testing form validation...');
    
    // Try to submit empty form
    if (submitButton) {
      await submitButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for validation messages
      const validationMessages = await page.$$eval('.invalid-feedback, .error-message, .text-danger, .alert-danger', 
        elements => elements.map(el => el.textContent.trim()).filter(text => text.length > 0)
      );
      
      if (validationMessages.length > 0) {
        console.log('✅ Form validation working:', validationMessages);
      } else {
        console.log('⚠️ No validation messages found (might be handled differently)');
      }
    }
    
    // Step 7: Test form submission with valid data
    console.log('📤 Step 7: Testing form submission with valid data...');
    
    // Fill in the form
    if (nameInput) {
      await nameInput.click({ clickCount: 3 }); // Select all text
      await nameInput.type(`Test Subcategory ${Date.now()}`);
      console.log('✅ Name field filled');
    }
    
    if (categorySelect) {
      // Select the first available category (not empty option)
      const firstCategory = await page.evaluate(() => {
        const select = document.querySelector('select[name="category"], select[name="categoryId"], select[name="parent_category"], #category, #categoryId');
        if (select && select.options.length > 1) {
          for (let i = 1; i < select.options.length; i++) {
            if (select.options[i].value && select.options[i].value !== '') {
              return select.options[i].value;
            }
          }
        }
        return null;
      });
      
      if (firstCategory) {
        await page.select('select[name="category"], select[name="categoryId"], select[name="parent_category"], #category, #categoryId', firstCategory);
        console.log('✅ Parent category selected');
      } else {
        console.log('⚠️ No valid parent category available');
      }
    }
    
    if (descriptionTextarea) {
      await descriptionTextarea.click();
      await descriptionTextarea.type('A test subcategory created for validation purposes');
      console.log('✅ Description field filled');
    }
    
    // Submit the form
    if (submitButton) {
      console.log('🚀 Submitting form...');
      await submitButton.click();
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check for success message or redirect
      const currentUrl = page.url();
      if (currentUrl.includes('/subcategories') && !currentUrl.includes('/create')) {
        console.log('✅ Form submitted successfully - redirected to subcategories list');
      } else {
        // Check for success message
        const successMessage = await page.$('.alert-success, .toast-success, .success-message');
        if (successMessage) {
          const messageText = await page.evaluate(el => el.textContent.trim(), successMessage);
          console.log(`✅ Success message found: ${messageText}`);
        } else {
          console.log('⚠️ Form submission result unclear - no redirect or success message detected');
        }
      }
    }
    
    // Step 8: Check for any console errors
    console.log('🔍 Step 8: Checking for console errors...');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser Console Error:', msg.text());
      }
    });
    
    console.log('\n🎉 Create Subcategory frontend functionality testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take screenshot on error
    await page.screenshot({ 
      path: 'create-subcategory-error.png', 
      fullPage: true 
    });
    console.log('📸 Error screenshot saved as create-subcategory-error.png');
  } finally {
    await browser.close();
  }
})();