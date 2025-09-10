const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false, 
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Listen to console logs
  page.on('console', msg => {
    console.log('Browser console:', msg.text());
  });
  
  // Listen to page errors
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });
  
  try {
    // Login with correct credentials
    console.log('Logging in with admin credentials...');
    await page.goto('http://localhost:8081/#/login');
    
    // Wait for login form to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Log available login page elements
    const loginElements = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input')).map(input => ({
        type: input.type,
        name: input.name,
        id: input.id,
        placeholder: input.placeholder
      }));
      const buttons = Array.from(document.querySelectorAll('button')).map(button => ({
        type: button.type,
        textContent: button.textContent.trim(),
        id: button.id
      }));
      return { inputs, buttons };
    });
    console.log('Login page elements:', JSON.stringify(loginElements, null, 2));
    
    // Use name selectors since IDs are not available
    await page.waitForSelector('input[name="username"]', { timeout: 5000 });
    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', '123456');
    
    // Submit the form
    console.log('Submitting login form...');
    await page.click('button[type="submit"]');
    
    // Wait for login to process and check for URL change or success indicators
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('After login attempt, current URL:', page.url());
    
    // Check if we're still on login page or if login was successful
    const stillOnLogin = await page.$('input[name="username"]') !== null;
    console.log('Still on login page:', stillOnLogin);
    
    if (stillOnLogin) {
      console.log('Login may have failed, checking for error messages...');
      const errorMsg = await page.evaluate(() => {
        const errorEl = document.querySelector('.alert-danger, .error-message, .text-danger');
        return errorEl ? errorEl.textContent : 'No error message found';
      });
      console.log('Error message:', errorMsg);
    }
    
    // Navigate to subcategory creation page
    console.log('Navigating to subcategory creation page...');
    await page.goto('http://localhost:8081/#/general-store/subcategories/create', { waitUntil: 'networkidle2' });
    
    // Wait for Vue to mount and render
    console.log('Waiting for Vue component to mount...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Page title:', await page.title());
    console.log('Current URL after navigation:', page.url());
    
    // Check page content to understand what we're looking at
    const pageContent = await page.evaluate(() => {
      return {
        h1Text: document.querySelector('h1') ? document.querySelector('h1').textContent : 'No h1',
        h2Text: document.querySelector('h2') ? document.querySelector('h2').textContent : 'No h2',
        h3Text: document.querySelector('h3') ? document.querySelector('h3').textContent : 'No h3',
        bodyClasses: document.body.className,
        mainContent: document.querySelector('main') ? document.querySelector('main').innerHTML.substring(0, 500) : 'No main',
        routerView: document.querySelector('#app') ? document.querySelector('#app').innerHTML.substring(0, 500) : 'No app'
      };
    });
    console.log('Page content analysis:', JSON.stringify(pageContent, null, 2));
    
    // Check if form container exists
    const formExists = await page.$('.form-container') !== null;
    console.log('Form container exists:', formExists);
    
    // Wait for categories to load - check Vuex store
    console.log('Checking Vuex store for categories...');
    const storeData = await page.evaluate(() => {
      if (window.Vue && window.Vue.prototype.$store) {
        const store = window.Vue.prototype.$store;
        return {
          categories: store.getters['generalStore/categories'],
          loading: store.getters['generalStore/loading']
        };
      }
      return { error: 'Store not accessible' };
    });
    console.log('Store data:', JSON.stringify(storeData, null, 2));
    
    // Wait for categories to load if they're still loading
    if (storeData.loading) {
      console.log('Categories still loading, waiting...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Check for form elements after categories load
    console.log('Checking form elements...');
    const formElements = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return { error: 'No form found' };
      
      return {
        inputs: Array.from(form.querySelectorAll('input')).map(input => ({
          type: input.type,
          name: input.name,
          id: input.id,
          placeholder: input.placeholder
        })),
        selects: Array.from(form.querySelectorAll('select')).map(select => ({
          name: select.name,
          id: select.id,
          optionsCount: select.options.length,
          options: Array.from(select.options).map(opt => opt.text)
        })),
        textareas: Array.from(form.querySelectorAll('textarea')).map(textarea => ({
          name: textarea.name,
          id: textarea.id,
          placeholder: textarea.placeholder
        }))
      };
    });
    
    console.log('Form elements:', JSON.stringify(formElements, null, 2));
    
    // Check if category dropdown is populated
    const categorySelect = await page.$('#category');
    if (categorySelect) {
      console.log('Category select found!');
      const options = await page.evaluate(() => {
        const select = document.querySelector('#category');
        return Array.from(select.options).map(opt => ({
          value: opt.value,
          text: opt.text
        }));
      });
      console.log('Category options:', options);
      
      // Try to fill and submit the form if categories are loaded
      if (options.length > 1) { // More than just placeholder option
        console.log('Testing form submission...');
        
        // Fill form fields
        await page.type('#name', 'Test Subcategory');
        await page.type('#description', 'Test description for subcategory');
        await page.select('#category', options[1].value); // Select first real category
        
        // Submit form
        await page.click('button[type="submit"]');
        
        // Wait for response
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('Form submitted, checking for success...');
        
        // Check current URL to see if redirected
        const currentUrl = page.url();
        console.log('Current URL after submission:', currentUrl);
        
        // Check for success message or redirect
        const successIndicator = await page.evaluate(() => {
          // Check for success toast/notification
          const toast = document.querySelector('.toast, .alert-success, .notification');
          if (toast) return { type: 'toast', text: toast.textContent };
          
          // Check if URL changed (redirect)
          return { type: 'url_check', url: window.location.href };
        });
        
        console.log('Success indicator:', successIndicator);
        
      } else {
        console.log('No categories loaded - cannot test form submission');
      }
    } else {
      console.log('Category select not found');
    }
    
    // Keep browser open for manual inspection
    console.log('Keeping browser open for 15 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();