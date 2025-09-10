// Debug script to examine the create category page structure
// This script logs in and then inspects all form elements on the page

const puppeteer = require('puppeteer');

async function debugCreateCategoryPage() {
  console.log('🔍 Debugging Create Category Page Structure...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Step 1: Login
    console.log('📝 Step 1: Logging in...');
    await page.goto('http://localhost:8081/auth/login', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    await page.waitForSelector('form', { timeout: 10000 });
    
    const emailInput = await page.$('input[name="username"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button[type="submit"], .btn-primary');
    
    if (emailInput && passwordInput && loginButton) {
      await emailInput.type('admin');
      await passwordInput.type('123456');
      await loginButton.click();
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('✅ Login completed');
    }
    
    // Step 2: Navigate to create category page
    console.log('📝 Step 2: Navigating to create category page...');
    await page.goto('http://localhost:8081/general-store/categories/create', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    await page.waitForSelector('form', { timeout: 10000 });
    console.log('✅ Create category page loaded');
    
    // Step 3: Debug page structure
    console.log('📝 Step 3: Analyzing page structure...');
    
    // Get all forms
    const forms = await page.$$('form');
    console.log('\n📋 Found', forms.length, 'form(s)');
    
    for (let i = 0; i < forms.length; i++) {
      const formClass = await page.evaluate(el => el.className, forms[i]);
      const formId = await page.evaluate(el => el.id, forms[i]);
      console.log(`Form ${i}: class="${formClass}", id="${formId}"`);
    }
    
    // Get all input elements
    const inputs = await page.$$('input');
    console.log('\n📝 Found', inputs.length, 'input element(s):');
    
    for (let i = 0; i < inputs.length; i++) {
      const inputType = await page.evaluate(el => el.type, inputs[i]);
      const inputName = await page.evaluate(el => el.name, inputs[i]);
      const inputClass = await page.evaluate(el => el.className, inputs[i]);
      const inputId = await page.evaluate(el => el.id, inputs[i]);
      const inputPlaceholder = await page.evaluate(el => el.placeholder, inputs[i]);
      const inputRequired = await page.evaluate(el => el.required, inputs[i]);
      
      console.log(`Input ${i}: type="${inputType}", name="${inputName}", class="${inputClass}", id="${inputId}", placeholder="${inputPlaceholder}", required=${inputRequired}`);
    }
    
    // Get all textarea elements
    const textareas = await page.$$('textarea');
    console.log('\n📝 Found', textareas.length, 'textarea element(s):');
    
    for (let i = 0; i < textareas.length; i++) {
      const textareaName = await page.evaluate(el => el.name, textareas[i]);
      const textareaClass = await page.evaluate(el => el.className, textareas[i]);
      const textareaId = await page.evaluate(el => el.id, textareas[i]);
      const textareaRows = await page.evaluate(el => el.rows, textareas[i]);
      
      console.log(`Textarea ${i}: name="${textareaName}", class="${textareaClass}", id="${textareaId}", rows=${textareaRows}`);
    }
    
    // Get all select elements
    const selects = await page.$$('select');
    console.log('\n📝 Found', selects.length, 'select element(s):');
    
    for (let i = 0; i < selects.length; i++) {
      const selectName = await page.evaluate(el => el.name, selects[i]);
      const selectClass = await page.evaluate(el => el.className, selects[i]);
      const selectId = await page.evaluate(el => el.id, selects[i]);
      
      console.log(`Select ${i}: name="${selectName}", class="${selectClass}", id="${selectId}"`);
    }
    
    // Get all buttons
    const buttons = await page.$$('button');
    console.log('\n🔘 Found', buttons.length, 'button element(s):');
    
    for (let i = 0; i < buttons.length; i++) {
      const buttonType = await page.evaluate(el => el.type, buttons[i]);
      const buttonClass = await page.evaluate(el => el.className, buttons[i]);
      const buttonId = await page.evaluate(el => el.id, buttons[i]);
      const buttonText = await page.evaluate(el => el.textContent.trim(), buttons[i]);
      
      console.log(`Button ${i}: type="${buttonType}", class="${buttonClass}", id="${buttonId}", text="${buttonText}"`);
    }
    
    // Check if page has Vue.js loaded
    const hasVue = await page.evaluate(() => {
      return typeof window.Vue !== 'undefined' || typeof window.$vm !== 'undefined';
    });
    console.log('\n🔧 Vue.js detected:', hasVue);
    
    // Check page title and URL
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log('\n📄 Page title:', pageTitle);
    console.log('📄 Page URL:', pageUrl);
    
    // Wait for user to inspect
    console.log('\n⏸️ Pausing for 10 seconds to allow manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    
    // Take screenshot on error
    await page.screenshot({ 
      path: 'debug-create-category-error.png', 
      fullPage: true 
    });
    console.log('📸 Error screenshot saved as debug-create-category-error.png');
  } finally {
    await browser.close();
  }
}

// Run the debug
debugCreateCategoryPage().catch(console.error);