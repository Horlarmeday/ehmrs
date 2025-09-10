const puppeteer = require('puppeteer');

(async () => {
  console.log('🔍 Debugging Categories List Page...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Login first
    console.log('📝 Logging in...');
    await page.goto('http://localhost:8081/auth/login', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    const emailInput = await page.$('input[name="username"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button[type="submit"], .btn-primary');
    
    if (emailInput && passwordInput && loginButton) {
      await emailInput.type('admin');
      await passwordInput.type('123456');
      await loginButton.click();
      
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
      console.log('✅ Login successful');
    }
    
    // Navigate to categories list
    console.log('📝 Navigating to categories list...');
    await page.goto('http://localhost:8081/general-store/categories', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n📋 Page Analysis:');
    console.log('Current URL:', page.url());
    
    // Check for different table/list structures
    const tables = await page.$$('table');
    console.log(`Tables found: ${tables.length}`);
    
    const tableRows = await page.$$('table tbody tr, table tr');
    console.log(`Table rows found: ${tableRows.length}`);
    
    const listItems = await page.$$('.list-group-item, .category-item, .item');
    console.log(`List items found: ${listItems.length}`);
    
    const cards = await page.$$('.card, .category-card');
    console.log(`Cards found: ${cards.length}`);
    
    // Get all elements with 'category' in class name
    const categoryElements = await page.$$('[class*="category"]');
    console.log(`Elements with 'category' in class: ${categoryElements.length}`);
    
    // Check for Vue.js data
    const vueData = await page.evaluate(() => {
      if (window.Vue && window.Vue.version) {
        return { version: window.Vue.version, hasVue: true };
      }
      return { hasVue: false };
    });
    console.log('Vue.js detected:', vueData);
    
    // Get page content sample
    const bodyText = await page.evaluate(() => {
      return document.body.innerText.substring(0, 500);
    });
    console.log('\n📄 Page content sample:');
    console.log(bodyText);
    
    // Check for any elements containing "Test Category"
    const testCategoryElements = await page.$$eval('*', elements => {
      return elements.filter(el => 
        el.textContent && el.textContent.includes('Test Category')
      ).length;
    });
    console.log(`\n🔍 Elements containing 'Test Category': ${testCategoryElements}`);
    
    // Get all text content to search for categories
    const allText = await page.evaluate(() => document.body.textContent);
    const testCategoryMatches = (allText.match(/Test Category/g) || []).length;
    console.log(`Text matches for 'Test Category': ${testCategoryMatches}`);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'categories-list-debug.png', fullPage: true });
    console.log('\n📸 Screenshot saved as categories-list-debug.png');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'categories-list-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();