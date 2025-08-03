import { test, expect } from '@playwright/test';
import { AIFormTester } from './ai-form-tester';

test.describe('AI-Powered Referral Form Testing', () => {
  
  test('Fill complete referral form for urgent cardiac patient', async ({ page }) => {
    const tester = new AIFormTester(page);
    
    await tester.fillReferralForm(
      "Fill out a complete referral form for a male patient with chest pain who needs urgent cardiac evaluation",
      {
        // Personal Information
        name: "John Doe",
        year_of_birth: "1975",
        gender: "Male",
        national_id: "CM12345678901",
        contact_number: "0701234567",
        
        // Location
        region: "Central",
        district: "Kampala",
        sub_district: "Nakawa",
        
        // Clinical Information
        present_complaints: "Severe chest pain radiating to left arm, shortness of breath, diaphoresis. Patient reports crushing sensation in chest that started 2 hours ago during physical activity.",
        examination_findings: "Patient appears anxious and diaphoretic. Chest examination reveals no obvious trauma. Heart sounds regular but tachycardic. Lungs clear bilaterally. No peripheral edema noted.",
        
        // Vital Signs - These will use your masks
        bp: "16095",  // Will become 160/95
        weight: "78",  // 78 kg
        temperature: "37", // 37°C
        pulse: "95",   // 95 bpm
        blood_group: "O+",
        
        // Treatment
        treatment_given: "Patient placed on oxygen 2L/min via nasal cannula. IV access established in right antecubital fossa. Cardiac monitoring initiated. Patient positioned upright for comfort.",
        medications_given: "Aspirin 300mg chewed and swallowed, Sublingual GTN 0.4mg administered with partial relief of symptoms.",
        medications_on: "Amlodipine 5mg daily for hypertension, Metformin 500mg twice daily for diabetes mellitus type 2.",
        
        // Insurance
        insurance_status: "Insured",
        insurance_no: "INS123456789",
        
        // Referral Information
        referral_needed: true,
        priority_level: "Urgent",
        referring_facility_name: "Bugolobi Health Center III",
        facility_referred_to: "Mulago National Referral Hospital - Cardiac Unit",
        referring_officer_name: "Dr. Sarah Nakamya",
        referring_officer_position: "Medical Officer",
        transportation_means: "Ambulance with cardiac monitor",
        referral_reason_notes: "Suspected acute myocardial infarction based on clinical presentation. Requires immediate cardiology evaluation, ECG, cardiac enzymes, and possible PCI. Patient has risk factors including diabetes and hypertension.",
        other_notes: "Patient's wife contacted and is accompanying patient. Medical records from previous admissions attached. Patient allergic to penicillin - documented in file."
      }
    );
    
    await tester.submitForm();
    await tester.expectSuccess();
  });

  test('Fill referral form for pediatric patient', async ({ page }) => {
    const tester = new AIFormTester(page);
    
    await tester.fillReferralForm(
      "Create a referral for a child with fever and respiratory symptoms",
      {
        name: "Mary Nakato",
        year_of_birth: "2018", // 5 years old
        gender: "Female",
        contact_number: "0759876543",
        
        region: "Western",
        district: "Mbarara",
        sub_district: "Nyamitanga",
        
        present_complaints: "High fever for 3 days, difficulty breathing, poor feeding, irritability",
        examination_findings: "Febrile child, temperature 39.2°C, fast breathing, chest indrawing noted",
        
        bp: "9060", // 90/60 - appropriate for child
        weight: "18", // 18 kg
        temperature: "39", // 39°C
        pulse: "120", // 120 bpm
        
        treatment_given: "Paracetamol 250mg given, oxygen therapy started",
        
        insurance_status: "Not Insured",
        
        referral_needed: true,
        priority_level: "Urgent",
        referring_facility_name: "Nyamitanga Health Center IV",
        facility_referred_to: "Mbarara Regional Referral Hospital",
        referring_officer_name: "Dr. Peter Mugisha",
        referring_officer_position: "Medical Officer",
        referral_reason_notes: "Suspected severe pneumonia in child, requires chest X-ray and intensive management"
      }
    );
    
    await tester.submitForm();
    await tester.expectSuccess();
  });

  test('Fill minimal referral form - basic case', async ({ page }) => {
    const tester = new AIFormTester(page);
    
    await tester.fillReferralForm(
      "Create a basic referral with minimal required information for routine case",
      {
        name: "Grace Nambi",
        year_of_birth: "1990",
        gender: "Female",
        present_complaints: "Routine antenatal check-up, 32 weeks pregnant",
        priority_level: "Opened",
        referral_needed: false
      }
    );
    
    await tester.submitForm();
    await tester.expectSuccess();
  });

  test('Test blood pressure mask formatting', async ({ page }) => {
    const tester = new AIFormTester(page);
    
    await tester.fillReferralForm(
      "Test the blood pressure input mask formatting",
      {
        name: "Test Patient",
        year_of_birth: "1980",
        gender: "Male",
        present_complaints: "Hypertension monitoring",
        bp: "14090", // Should format to 140/90
        weight: "75", // Should stay as 75
        temperature: "38", // Should stay as 38
        pulse: "88", // Should stay as 88
        priority_level: "Opened"
      }
    );
    
    // Verify the formatting worked
    const bpField = page.locator('[name="bp"]');
    await expect(bpField).toHaveValue('140/90');
    
    await tester.takeScreenshot('bp-mask-test');
  });

  test('Test form validation - empty required fields', async ({ page }) => {
    const tester = new AIFormTester(page);
    
    await tester.fillReferralForm(
      "Try to submit form with missing required fields to test validation",
      {
        // Intentionally leaving name empty
        name: "",
        present_complaints: "", // Also empty
        year_of_birth: "1990"
      }
    );
    
    await tester.submitForm();
    // Should expect validation errors instead of success
    await tester.expectError();
  });

  test('Test dropdown cascading - location fields', async ({ page }) => {
    const tester = new AIFormTester(page);
    
    await tester.fillReferralForm(
      "Test the cascading dropdown functionality for location fields",
      {
        name: "Location Test Patient",
        year_of_birth: "1985",
        gender: "Male",
        present_complaints: "Testing location dropdowns",
        
        // Test cascading: Region -> District -> Subdistrict
        region: "Northern",
        // Wait and then select district
        district: "Gulu", 
        // Wait and then select subdistrict
        sub_district: "Gulu Municipality",
        
        priority_level: "Opened"
      }
    );
    
    await tester.takeScreenshot('cascading-dropdowns-test');
    await tester.submitForm();
    await tester.expectSuccess();
  });

  test('Test priority level color coding', async ({ page }) => {
    const tester = new AIFormTester(page);
    
    await tester.fillReferralForm(
      "Test different priority levels and their color coding",
      {
        name: "Priority Test Patient",
        year_of_birth: "1970",
        gender: "Female",
        present_complaints: "Testing priority levels",
        priority_level: "Critical" // Should show red color coding
      }
    );
    
    // Check if priority field has the correct color class
    const priorityField = page.locator('[name="priority_level"]').locator('..');
    await expect(priorityField).toHaveClass(/bg-red-100/);
    
    await tester.takeScreenshot('priority-critical-test');
  });

  test.skip('Performance test - rapid form filling', async ({ page }) => {
    const tester = new AIFormTester(page);
    
    console.time('Form filling performance');
    
    await tester.fillReferralForm(
      "Performance test - fill form as quickly as possible",
      {
        name: "Speed Test Patient",
        year_of_birth: "1995",
        gender: "Male",
        present_complaints: "Performance testing",
        bp: "12080",
        weight: "70",
        temperature: "37",
        pulse: "72",
        priority_level: "Opened"
      }
    );
    
    console.timeEnd('Form filling performance');
    
    await tester.submitForm();
    await tester.expectSuccess();
  });
});

// Helper test for debugging specific fields
test.describe('Debug Helpers', () => {
  test.skip('Debug specific field selector', async ({ page }) => {
    const tester = new AIFormTester(page);
    
    await page.goto('/');
    await page.waitForSelector('form[data-cy="referral-form"]');
    
    // Take screenshot to see current form state
    await tester.takeScreenshot('debug-form-state');
    
    // Try to interact with a specific field
    const fieldName = 'name'; // Change this to debug different fields
    await tester.fillReferralForm(`Debug field: ${fieldName}`, {
      [fieldName]: 'Debug Value'
    });
    
    await tester.takeScreenshot(`debug-${fieldName}-filled`);
  });
});
