import { chromium } from 'playwright';
import { AIFormTester } from './ai-form-tester';

// Quick test function you can call with instructions
export async function quickTest(instructions: string, formData: any) {
  const browser = await chromium.launch({ 
    headless: false, // Set to true if you don't want to see the browser
    slowMo: 500 // Slow down actions so you can see what's happening
  });
  
  const page = await browser.newPage();
  
  // Set the base URL for the page
  await page.goto('http://localhost:5174/');
  
  const tester = new AIFormTester(page);
  
  try {
    console.log(`🤖 AI Testing: ${instructions}`);
    
    await tester.fillReferralForm(instructions, formData);
    await tester.submitForm();
    await tester.expectSuccess();
    
    // Wait a bit so you can see the result
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await tester.takeScreenshot('error-state');
  } finally {
    await browser.close();
  }
}

// Run the test directly
console.log('🚀 Starting quick test...');

quickTest("Fill a referral form for emergency cardiac patient", {
  name: "Emergency Patient John",
  year_of_birth: "1965",
  gender: "Male",
  present_complaints: "Severe chest pain, difficulty breathing",
  bp: "18095", // Will format to 180/95
  weight: "82",
  temperature: "38",
  pulse: "105",
  priority_level: "Critical",
  referral_needed: true,
  referring_facility_name: "Local Health Center",
  facility_referred_to: "National Hospital",
  referring_officer_name: "Dr. Smith",
  referring_officer_position: "Medical Officer"
}).then(() => {
  console.log('✅ Quick test completed!');
}).catch(error => {
  console.error('❌ Quick test failed:', error);
});
