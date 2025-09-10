const puppeteer = require('puppeteer');

(async () => {
  console.log('🧪 Starting Subcategories List Test with Authentication...');
  
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
    
    // Step 2: Navigate to subcategories page
    console.log('📝 Step 2: Navigating to subcategories page...');
    await page.goto('http://localhost:8081/general-store/subcategories', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Subcategories page loaded');
    
    // Step 3: Verify page content and API calls
    console.log('📝 Step 3: Verifying subcategories data...');
    
    // Check for API calls
    if (apiCalls.length > 0) {
      console.log('✅ API calls detected:');
      apiCalls.forEach(call => {
        console.log(`   ${call.method} ${call.url} - Status: ${call.status}`);
      });
    } else {
      console.log('❌ No API calls detected');
    }
    
    // Check for subcategories content
    const subcategoryElements = await page.$$('.card, [class*="subcategory"], .subcategory-item');
    console.log(`✅ Found ${subcategoryElements.length} subcategory elements`);
    
    // Check for loading indicators
    const loadingIndicators = await page.$$('.loading, .spinner, .loader');
    if (loadingIndicators.length > 0) {
      console.log('⚠️ Loading indicators still present');
    } else {
      console.log('✅ No loading indicators found');
    }
    
    // Check for error messages
    const errorMessages = await page.$$('.alert-danger, .error, .text-danger');
    if (errorMessages.length > 0) {
      console.log('❌ Error messages found on page');
      for (let error of errorMessages) {
        const errorText = await page.evaluate(el => el.textContent, error);
        console.log(`   Error: ${errorText}`);
      }
    } else {
      console.log('✅ No error messages found');
    }
    
    // Check page content
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        hasSubcategoriesText: document.body.textContent.includes('subcategories') || document.body.textContent.includes('Subcategories'),
        hasDataTable: document.querySelector('table') !== null,
        hasCards: document.querySelectorAll('.card').length,
        bodyText: document.body.innerText.substring(0, 300)
      };
    });
    
    console.log('📄 Page analysis:');
    console.log(`   Title: ${pageContent.title}`);
    console.log(`   Has subcategories text: ${pageContent.hasSubcategoriesText}`);
    console.log(`   Has data table: ${pageContent.hasDataTable}`);
    console.log(`   Number of cards: ${pageContent.hasCards}`);
    console.log(`   Content sample: ${pageContent.bodyText.replace(/\n/g, ' ')}`);
    
    // Check for Vue.js
    const vueDetected = await page.evaluate(() => {
      return window.Vue !== undefined || document.querySelector('[data-v-]') !== null;
    });
    console.log(`✅ Vue.js detected: ${vueDetected}`);
    
    // Take screenshot for verification
    await page.screenshot({ path: 'subcategories-test.png', fullPage: true });
    console.log('📸 Screenshot saved as subcategories-test.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'subcategories-error.png', fullPage: true });
    console.log('📸 Error screenshot saved as subcategories-error.png');
  } finally {
    await browser.close();
    console.log('\n🎉 Subcategories list test completed!');
  }
})();