import { chromium } from 'playwright';

async function testReferralForm() {
  console.log('🚀 Starting AI form test...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down so you can see what's happening
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to your app
    console.log('📱 Navigating to http://localhost:5174...');
    await page.goto('http://localhost:5174');
    
    // Wait a bit for the page to load
    await page.waitForTimeout(2000);
    
    // Take a screenshot to see what we're working with
    await page.screenshot({ path: 'current-page.png', fullPage: true });
    console.log('📸 Screenshot taken: current-page.png');
    
    // Try to find the referral form
    console.log('🔍 Looking for referral form...');
    
    // Look for common form elements
    const formSelectors = [
      'form[data-cy="referral-form"]',
      'form',
      '[data-testid="referral-form"]',
      '.referral-form'
    ];
    
    let foundForm = false;
    for (const selector of formSelectors) {
      const formCount = await page.locator(selector).count();
      if (formCount > 0) {
        console.log(`✅ Found form using selector: ${selector}`);
        foundForm = true;
        break;
      }
    }
    
    if (!foundForm) {
      console.log('❌ No form found. Let me check what\'s on the page...');
      const title = await page.title();
      console.log(`Page title: ${title}`);
      
      const bodyText = await page.locator('body').textContent();
      console.log(`Page content preview: ${bodyText.substring(0, 200)}...`);
    }
    
    // Try to find input fields by name attribute
    console.log('🔍 Looking for input fields...');
    const inputFields = [
      '[name="name"]',
      '[name="year_of_birth"]',
      '[name="gender"]',
      '[name="present_complaints"]',
      '[name="bp"]'
    ];
    
    for (const field of inputFields) {
      const count = await page.locator(field).count();
      if (count > 0) {
        console.log(`✅ Found field: ${field}`);
        
        // Try to fill it if it's a text input
        try {
          const element = page.locator(field).first();
          const tagName = await element.evaluate(el => el.tagName.toLowerCase());
          
          if (tagName === 'input' || tagName === 'textarea') {
            await element.fill('Test Value');
            console.log(`   ✅ Filled ${field} with test value`);
          }
        } catch (e) {
          console.log(`   ⚠️  Could not fill ${field}: ${e.message}`);
        }
      } else {
        console.log(`❌ Field not found: ${field}`);
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'after-test.png', fullPage: true });
    console.log('📸 Final screenshot taken: after-test.png');
    
    // Wait so you can see the result
    console.log('⏱️  Waiting 5 seconds so you can see the result...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('✅ Test completed!');
  }
}

// Run the test
testReferralForm().catch(console.error);
