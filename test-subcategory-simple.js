const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // First, go to login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:8081/auth/login', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('Current URL:', page.url());
    
    // Wait for page to load and analyze what's available
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check what form elements are available
    const pageAnalysis = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        inputs: Array.from(document.querySelectorAll('input')).map(input => ({
          type: input.type,
          name: input.name,
          id: input.id,
          placeholder: input.placeholder,
          className: input.className
        })),
        buttons: Array.from(document.querySelectorAll('button')).map(button => ({
          type: button.type,
          textContent: button.textContent.trim(),
          className: button.className,
          id: button.id
        })),
        forms: Array.from(document.querySelectorAll('form')).length,
        bodyText: document.body.textContent.substring(0, 500)
      };
    });
    
    console.log('Page analysis:', JSON.stringify(pageAnalysis, null, 2));
    
    // Try to find and fill login form
    const usernameInput = await page.$('input[name="username"]');
    const passwordInput = await page.$('input[name="password"]');
    const submitButton = await page.$('button[type="submit"]');
    
    console.log('Form elements found:');
    console.log('Username input:', !!usernameInput);
    console.log('Password input:', !!passwordInput);
    console.log('Submit button:', !!submitButton);
    
    if (usernameInput && passwordInput && submitButton) {
      console.log('Filling login form...');
      
      // Clear existing values and type new ones
      await usernameInput.click({ clickCount: 3 });
      await usernameInput.type('admin');
      
      await passwordInput.click({ clickCount: 3 });
      await passwordInput.type('123456');
      
      console.log('Submitting login form...');
      await submitButton.click();
      
      // Wait for navigation
      await page.waitForNavigation({ 
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      console.log('Login completed. Current URL:', page.url());
      
      // Now navigate to subcategory creation page
      console.log('Navigating to subcategory creation page...');
      await page.goto('http://localhost:8081/general-store/subcategories/create', { 
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      console.log('Subcategory page URL:', page.url());
      
      // Wait for the form to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Analyze the subcategory form
      const formAnalysis = await page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        const inputs = document.querySelectorAll('input');
        const selects = document.querySelectorAll('select');
        const submitButtons = document.querySelectorAll('button[type="submit"], input[type="submit"]');
        
        return {
          formsCount: forms.length,
          inputs: Array.from(inputs).map(input => ({
            name: input.name || '',
            id: input.id || '',
            placeholder: input.placeholder || '',
            type: input.type,
            className: input.className
          })),
          selects: Array.from(selects).map(select => ({
            name: select.name || '',
            id: select.id || '',
            className: select.className,
            options: Array.from(select.options).map(option => ({
              value: option.value,
              text: option.textContent.trim()
            }))
          })),
          submitButtons: Array.from(submitButtons).map(button => ({
            type: button.type,
            textContent: button.textContent.trim(),
            id: button.id || '',
            className: button.className
          }))
        };
      });
      
      console.log('Subcategory form analysis:', JSON.stringify(formAnalysis, null, 2));
      
      // Test form interaction if we have the right elements
      if (formAnalysis.inputs.length > 0 && formAnalysis.selects.length > 0) {
        console.log('Testing subcategory form interaction...');
        
        // Find name input (look for common patterns)
         const nameInput = await page.$('input[name="name"], input[placeholder*="name"], input[placeholder*="Name"], input[id*="name"]');
         if (nameInput) {
           await nameInput.click();
           await nameInput.type('Test Subcategory ' + Date.now());
           console.log('Filled subcategory name');
         } else {
           console.log('Could not find name input field');
         }
         
         // Find description textarea
         const descriptionInput = await page.$('#description, textarea[id="description"]');
         if (descriptionInput) {
           await descriptionInput.click();
           await descriptionInput.type('Test subcategory description for automated testing');
           console.log('Filled subcategory description');
         } else {
           console.log('Could not find description input field');
         }
        
        // Find category select
        const categorySelect = await page.$('select');
        if (categorySelect) {
          const options = await categorySelect.$$eval('option', options => 
            options.map(option => ({ value: option.value, text: option.textContent.trim() }))
          );
          
          if (options.length > 1) {
            await categorySelect.select(options[1].value);
            console.log('Selected parent category:', options[1].text);
          }
        } else {
          console.log('Could not find category select');
        }
        
        // Submit the form
        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) {
          console.log('Submitting subcategory creation form...');
          await submitBtn.click();
          
          // Wait for response
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          console.log('URL after submission:', page.url());
          
          // Check for messages
          const messages = await page.evaluate(() => {
            const alerts = document.querySelectorAll('.alert, .toast, .notification, .message');
            const errors = document.querySelectorAll('.error, .danger, .invalid-feedback');
            
            return {
              alerts: Array.from(alerts).map(el => el.textContent.trim()),
              errors: Array.from(errors).map(el => el.textContent.trim())
            };
          });
          
          console.log('Messages after submission:', JSON.stringify(messages, null, 2));
        }
      }
    } else {
      console.log('Could not find all required login form elements');
    }
    
    console.log('Keeping browser open for 20 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 20000));
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();