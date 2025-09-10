// Manual test for Create Category form functionality
// This script tests the form by directly interacting with the page

const puppeteer = require('puppeteer');

async function testCreateCategoryManual() {
  console.log('🧪 Starting Manual Create Category Form Tests...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate directly to create category page
    console.log('📝 Step 1: Navigating to create category page...');
    await page.goto('http://localhost:8081/#/general-store/categories/create', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for the form to load
    await page.waitForSelector('form', { timeout: 10000 });
    console.log('✅ Create category page loaded');
    
    // Step 2: Check if form elements exist
    console.log('📝 Step 2: Checking form elements...');
    
    const nameInput = await page.$('input[name="name"], #name, input[placeholder*="name"]');
    const descriptionTextarea = await page.$('textarea[name="description"], #description');
    const submitButton = await page.$('button[type="submit"], .btn-primary');
    
    if (nameInput) {
      console.log('✅ Name input found');
    } else {
      console.log('❌ Name input not found');
    }
    
    if (descriptionTextarea) {
      console.log('✅ Description textarea found');
    } else {
      console.log('❌ Description textarea not found');
    }
    
    if (submitButton) {
      console.log('✅ Submit button found');
    } else {
      console.log('❌ Submit button not found');
    }
    
    // Step 3: Test form validation (empty submission)
    console.log('📝 Step 3: Testing form validation...');
    
    if (submitButton) {
      await submitButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check for validation messages
      const validationErrors = await page.$$('.invalid-feedback, .error-message, .text-danger');
      if (validationErrors.length > 0) {
        console.log('✅ Form validation working - found', validationErrors.length, 'error messages');
      } else {
        console.log('⚠️ No validation errors found (might use different selectors)');
      }
    }
    
    // Step 4: Test with valid data
    console.log('📝 Step 4: Testing with valid data...');
    
    if (nameInput) {
      await nameInput.click({ clickCount: 3 }); // Select all
      await nameInput.type(`Test Category ${Date.now()}`);
      console.log('✅ Name field filled');
    }
    
    if (descriptionTextarea) {
      await descriptionTextarea.click();
      await descriptionTextarea.type('A test category created for validation purposes');
      console.log('✅ Description field filled');
    }
    
    // Monitor network requests for API calls
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
    if (submitButton) {
      console.log('🚀 Submitting form...');
      await submitButton.click();
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check API calls
      if (responses.length > 0) {
        console.log('✅ API calls detected:');
        responses.forEach(resp => {
          console.log(`   ${resp.method} ${resp.url} - Status: ${resp.status}`);
        });
      } else {
        console.log('⚠️ No API calls detected');
      }
      
      // Check for success message or redirect
      const currentUrl = page.url();
      if (currentUrl.includes('/categories') && !currentUrl.includes('/create')) {
        console.log('✅ Successfully redirected to categories list');
      } else {
        console.log('⚠️ No redirect detected, checking for success message...');
        
        const successMessage = await page.$('.alert-success, .success-message, .toast-success');
        if (successMessage) {
          console.log('✅ Success message found');
        } else {
          console.log('❌ No success message found');
        }
      }
    }
    
    // Step 5: Verify category was created by checking categories list
    console.log('📝 Step 5: Verifying category creation...');
    
    await page.goto('http://localhost:8081/#/general-store/categories', { 
      waitUntil: 'networkidle0' 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const pageContent = await page.content();
    if (pageContent.includes('Test Category')) {
      console.log('✅ Test category found in categories list');
    } else {
      console.log('❌ Test category not found in categories list');
    }
    
    console.log('\n🎉 Manual test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take screenshot on error
    await page.screenshot({ 
      path: 'create-category-manual-error.png', 
      fullPage: true 
    });
    console.log('📸 Error screenshot saved as create-category-manual-error.png');
  } finally {
    await browser.close();
  }
}

// Run the test
testCreateCategoryManual().catch(console.error);