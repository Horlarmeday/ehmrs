const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting API Optimization Test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Track network requests
  const networkRequests = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    }
  });
  
  try {
    console.log('📋 Step 1: Login to application...');
    await page.goto('http://localhost:8081');
    await page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 10000 });
    
    await page.type('input[type="text"], input[type="email"]', 'admin');
    await page.type('input[type="password"]', '123456');
    await page.click('button[type="submit"], .btn-primary');
    
    // Wait for login redirect
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Login successful');
    
    console.log('📋 Step 2: Navigate to categories page...');
    await page.goto('http://localhost:8081/general-store/categories');
    await page.waitForSelector('.categories-container, .card, .table', { timeout: 10000 });
    
    // Clear previous requests and track categories page requests
    const categoriesRequests = [];
    const startTime = Date.now();
    
    console.log('📋 Step 3: Test initial data loading...');
    await page.reload();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Filter requests after reload
    const reloadRequests = networkRequests.filter(req => req.timestamp > startTime);
    console.log(`📊 Initial load requests: ${reloadRequests.length}`);
    reloadRequests.forEach(req => {
      console.log(`  - ${req.method} ${req.url}`);
    });
    
    console.log('📋 Step 4: Test cache behavior - navigate away and back...');
    await page.goto('http://localhost:8081/general-store/subcategories');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const beforeCacheTime = Date.now();
    await page.goto('http://localhost:8081/general-store/categories');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if fewer requests were made (indicating cache usage)
    const cacheTestRequests = networkRequests.filter(req => req.timestamp > beforeCacheTime);
    console.log(`📊 Cache test requests: ${cacheTestRequests.length}`);
    cacheTestRequests.forEach(req => {
      console.log(`  - ${req.method} ${req.url}`);
    });
    
    console.log('📋 Step 5: Test search functionality...');
    const searchInput = await page.$('input[placeholder*="search"], input[type="search"], .search-input');
    if (searchInput) {
      await searchInput.type('test');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const searchRequests = networkRequests.filter(req => 
        req.timestamp > beforeCacheTime + 3000 && req.url().includes('search')
      );
      console.log(`📊 Search requests: ${searchRequests.length}`);
    } else {
      console.log('⚠️ Search input not found');
    }
    
    console.log('📋 Step 6: Test pagination...');
    const paginationButtons = await page.$$('.pagination button, .page-link, .btn-page');
    if (paginationButtons.length > 1) {
      await paginationButtons[1].click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paginationRequests = networkRequests.filter(req => 
        req.timestamp > Date.now() - 3000
      );
      console.log(`📊 Pagination requests: ${paginationRequests.length}`);
    } else {
      console.log('⚠️ Pagination not found or not enough pages');
    }
    
    console.log('📋 Step 7: Check for duplicate API calls...');
    const apiCalls = networkRequests.map(req => req.url);
    const uniqueApiCalls = [...new Set(apiCalls)];
    const duplicateCount = apiCalls.length - uniqueApiCalls.length;
    
    console.log(`📊 Total API calls: ${apiCalls.length}`);
    console.log(`📊 Unique API calls: ${uniqueApiCalls.length}`);
    console.log(`📊 Duplicate calls: ${duplicateCount}`);
    
    console.log('📋 Step 8: Check console for optimization logs...');
    const consoleLogs = await page.evaluate(() => {
      return window.console._logs || [];
    });
    
    const optimizationLogs = consoleLogs.filter(log => 
      log && (log.includes('cache') || log.includes('optimization') || log.includes('dedup'))
    );
    
    console.log(`📊 Optimization-related console logs: ${optimizationLogs.length}`);
    optimizationLogs.forEach(log => console.log(`  - ${log}`));
    
    // Performance analysis
    console.log('\n📊 API Optimization Analysis:');
    console.log(`- Total network requests: ${networkRequests.length}`);
    console.log(`- Duplicate API calls detected: ${duplicateCount}`);
    console.log(`- Cache behavior: ${cacheTestRequests.length < reloadRequests.length ? 'Working' : 'Not detected'}`);
    
    if (duplicateCount > 5) {
      console.log('⚠️ High number of duplicate API calls detected - optimization needed');
    } else if (duplicateCount > 0) {
      console.log('✅ Some duplicate calls detected - optimization partially working');
    } else {
      console.log('✅ No duplicate calls detected - optimization working well');
    }
    
    console.log('\n✅ API Optimization test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take screenshot on error
    await page.screenshot({ path: 'api-optimization-error.png', fullPage: true });
    console.log('📸 Error screenshot saved as api-optimization-error.png');
  } finally {
    await browser.close();
  }
})();