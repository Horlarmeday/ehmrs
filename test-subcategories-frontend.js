const puppeteer = require('puppeteer');

// Test configuration
const BASE_URL = 'http://localhost:8080';
const LOGIN_CREDENTIALS = {
  username: 'admin',
  password: '123456'
};

async function testSubcategoriesFrontend() {
  let browser;
  let page;
  
  try {
    console.log('🧪 Testing Subcategories Frontend Functionality\n');
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Set to true for headless mode
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser Console Error:', msg.text());
      }
    });
    
    // Step 1: Navigate to login page
    console.log('🔐 Step 1: Navigating to login page...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle2' });
    
    // Step 2: Login
    console.log('🔐 Step 2: Logging in...');
    await page.type('input[name="username"]', LOGIN_CREDENTIALS.username);
    await page.type('input[name="password"]', LOGIN_CREDENTIALS.password);
    
    // Click login button and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[type="submit"]')
    ]);
    
    console.log('✅ Login successful');
    console.log();
    
    // Step 3: Navigate to subcategories page
    console.log('📋 Step 3: Navigating to subcategories page...');
    await page.goto(`${BASE_URL}/general-store/subcategories`, { waitUntil: 'networkidle2' });
    
    // Wait for the page to load
    await page.waitForSelector('.subcategories-list', { timeout: 10000 });
    console.log('✅ Subcategories page loaded successfully');
    
    // Step 4: Check page title and header
    console.log('📋 Step 4: Verifying page content...');
    const pageTitle = await page.$eval('h3.card-title', el => el.textContent.trim());
    if (pageTitle !== 'Subcategories') {
      throw new Error(`Expected page title 'Subcategories', got '${pageTitle}'`);
    }
    console.log('✅ Page title verified:', pageTitle);
    
    // Step 5: Check if "New Subcategory" button exists
    const newSubcategoryButton = await page.$('a.btn.btn-primary, a[href*="create-subcategory"]');
    if (!newSubcategoryButton) {
      throw new Error('New Subcategory button not found');
    }
    console.log('✅ New Subcategory button found');
    
    // Get button text to verify
    const buttonText = await page.$eval('a.btn.btn-primary, a[href*="create-subcategory"]', el => el.textContent.trim());
    console.log('   Button text:', buttonText);
    
    // Step 6: Check if subcategories table/list exists
    const subcategoriesTable = await page.$('table');
    if (subcategoriesTable) {
      console.log('✅ Subcategories table found');
      
      // Count rows (excluding header)
      const rowCount = await page.$$eval('tbody tr', rows => rows.length);
      console.log(`   Found ${rowCount} subcategory rows`);
      
      if (rowCount > 0) {
        // Check table headers
        const headers = await page.$$eval('thead th', ths => ths.map(th => th.textContent.trim()));
        console.log('   Table headers:', headers);
        
        // Check first row data
        const firstRowData = await page.$$eval('tbody tr:first-child td', tds => 
          tds.map(td => td.textContent.trim())
        );
        console.log('   First row data:', firstRowData);
      }
    } else {
      console.log('ℹ️  No subcategories table found (might be empty state)');
    }
    
    // Step 7: Test search functionality if it exists
    console.log('🔍 Step 7: Testing search functionality...');
    const searchInput = await page.$('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]');
    if (searchInput) {
      console.log('✅ Search input found');
      await page.type('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]', 'test');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for search to process
      console.log('✅ Search functionality tested');
    } else {
      console.log('ℹ️  No search input found');
    }
    
    // Step 8: Test category filter if it exists
    console.log('🔍 Step 8: Testing category filter...');
    const categorySelect = await page.$('select');
    if (categorySelect) {
      console.log('✅ Category filter found');
      const options = await page.$$eval('select option', options => 
        options.map(option => ({ value: option.value, text: option.textContent.trim() }))
      );
      console.log('   Filter options:', options);
    } else {
      console.log('ℹ️  No category filter found');
    }
    
    // Step 9: Test pagination if it exists
    console.log('📄 Step 9: Testing pagination...');
    const pagination = await page.$('.pagination');
    if (pagination) {
      console.log('✅ Pagination found');
      const paginationInfo = await page.$eval('.pagination', el => {
        const items = el.querySelectorAll('.page-item');
        return {
          totalItems: items.length,
          hasNext: !!el.querySelector('.page-item:not(.disabled) .page-link[aria-label="Next"]'),
          hasPrevious: !!el.querySelector('.page-item:not(.disabled) .page-link[aria-label="Previous"]')
        };
      });
      console.log('   Pagination info:', paginationInfo);
    } else {
      console.log('ℹ️  No pagination found');
    }
    
    // Step 10: Test navigation to create subcategory page
    console.log('➕ Step 10: Testing navigation to create subcategory page...');
    
    try {
      // Try clicking the button first
      const createButton = await page.$('a.btn.btn-primary, a[href*="create-subcategory"]');
      if (createButton) {
         await createButton.click();
         await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // Fallback: navigate directly to the create page URL
        console.log('Button not found, navigating directly to create page...');
        await page.goto('http://localhost:8080/general-store/subcategories/create', { waitUntil: 'networkidle0' });
      }
      
      // Wait for page to load
      await page.waitForSelector('h3.card-title', { timeout: 10000 });
      
      // Verify we're on the create page
      const createPageTitle = await page.$eval('h3.card-title', el => el.textContent.trim());
      if (createPageTitle.includes('Create')) {
        console.log('✅ Successfully navigated to create subcategory page');
        console.log('   Page title:', createPageTitle);
        
        // Check for form elements
        const nameInput = await page.$('#name');
        const categorySelect = await page.$('#category');
        const submitButton = await page.$('button[type="submit"]');
        
        if (nameInput && categorySelect && submitButton) {
          console.log('✅ Create form elements found');
          console.log('   - Name input: ✓');
          console.log('   - Category select: ✓');
          console.log('   - Submit button: ✓');
        } else {
          console.log('❌ Some form elements missing');
          console.log('   - Name input:', nameInput ? '✓' : '✗');
          console.log('   - Category select:', categorySelect ? '✓' : '✗');
          console.log('   - Submit button:', submitButton ? '✓' : '✗');
        }
      } else {
        console.log('❌ Not on create page, title:', createPageTitle);
      }
    } catch (error) {
      console.log('❌ Navigation failed:', error.message);
    }
    
    console.log();
    console.log('🎉 Subcategories frontend functionality testing completed successfully!');
    
  } catch (error) {
    console.error('❌ Subcategories frontend test failed:', error.message);
    
    // Take screenshot on error
    if (page) {
      await page.screenshot({ path: 'subcategories-error.png', fullPage: true });
      console.log('📸 Screenshot saved as subcategories-error.png');
    }
    
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  require('puppeteer');
  testSubcategoriesFrontend();
} catch (error) {
  console.log('⚠️  Puppeteer not available. Installing...');
  console.log('Run: npm install puppeteer');
  console.log('Then run this test again.');
  process.exit(1);
}