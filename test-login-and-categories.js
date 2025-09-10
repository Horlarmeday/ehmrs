const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false, devtools: true });
  const page = await browser.newPage();
  
  // Enable request interception to monitor API calls
  await page.setRequestInterception(true);
  
  const apiCalls = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/')) {
      apiCalls.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
      console.log(`API Call: ${request.method()} ${request.url()}`);
      if (request.headers().authorization) {
        console.log(`Authorization: ${request.headers().authorization.substring(0, 20)}...`);
      }
    }
    request.continue();
  });
  
  page.on('response', (response) => {
    if (response.url().includes('/api/')) {
      console.log(`API Response: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    // Navigate to the app
    console.log('Navigating to http://localhost:8081');
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle2' });
    
    // Wait for login form
    await page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 10000 });
    console.log('Login form found');
    
    // Fill login form
    await page.type('input[type="text"], input[type="email"]', 'admin');
    await page.type('input[type="password"]', '123456');
    
    console.log('Credentials entered, clicking login...');
    
    // Click login button
    await page.click('button[type="submit"], .btn-primary');
    
    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    console.log('Login successful, navigated to dashboard');
    
    // Navigate to categories page
    console.log('Navigating to categories page...');
    await page.goto('http://localhost:8081/general-store/categories', { waitUntil: 'networkidle2' });
    
    // Wait a bit for any API calls to complete
    await page.waitForTimeout(3000);
    
    console.log('\n=== API Calls Summary ===');
    apiCalls.forEach((call, index) => {
      console.log(`${index + 1}. ${call.method} ${call.url}`);
      if (call.headers.authorization) {
        console.log(`   Auth: ${call.headers.authorization.substring(0, 30)}...`);
      }
    });
    
    // Check localStorage for token
    const token = await page.evaluate(() => localStorage.getItem('user_token'));
    console.log(`\nToken in localStorage: ${token ? 'Present' : 'Missing'}`);
    if (token) {
      console.log(`Token preview: ${token.substring(0, 50)}...`);
    }
    
    console.log('\nTest completed. Check the browser for visual inspection.');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
  
  // Keep browser open for manual inspection
  console.log('Browser will remain open for manual inspection...');
})();