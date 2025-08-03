import { Page, expect } from '@playwright/test';

export interface FormData {
  [key: string]: string | boolean | number;
}

export class AIFormTester {
  constructor(private page: Page) {}

  async fillReferralForm(instructions: string, formData: FormData) {
    console.log(`🤖 AI Instructions: ${instructions}`);
    
    // Navigate to referral page - will use baseURL from playwright config
    await this.page.goto('/');
    
    // Wait for form to load
    await this.page.waitForSelector('form[data-cy="referral-form"]', { timeout: 10000 });
    
    // Take screenshot for reference
    await this.page.screenshot({ path: 'test-results/before-fill.png', fullPage: true });

    // Fill form based on provided data
    for (const [field, value] of Object.entries(formData)) {
      await this.fillField(field, value);
      // Small delay to allow for any UI updates (floating labels, etc.)
      await this.page.waitForTimeout(200);
    }

    // Take screenshot after filling
    await this.page.screenshot({ path: 'test-results/after-fill.png', fullPage: true });
    
    console.log('✅ Form filling completed');
    return this;
  }

  private async fillField(fieldName: string, value: string | boolean | number) {
    try {
      // Map common field names to actual selectors based on your form
      const fieldSelectors = this.getFieldSelectors();
      const possibleSelectors = [
        fieldSelectors[fieldName.toLowerCase()],
        `[name="${fieldName}"]`,
        `input[name="${fieldName}"]`,
        `textarea[name="${fieldName}"]`,
        `select[name="${fieldName}"]`,
        `[data-testid="${fieldName}"]`,
        `[id="${fieldName}"]`
      ].filter(Boolean);

      let filled = false;

      for (const selector of possibleSelectors) {
        try {
          const element = this.page.locator(selector).first();
          
          if (await element.count() === 0) continue;

          if (typeof value === 'boolean') {
            // Handle checkboxes
            if (value) {
              await element.check({ timeout: 5000 });
            } else {
              await element.uncheck({ timeout: 5000 });
            }
            filled = true;
            break;
          } else {
            const tagName = await element.evaluate(el => el.tagName.toLowerCase());
            const role = await element.getAttribute('role');

            // Handle different input types
            if (tagName === 'select' || role === 'combobox') {
              // Handle select dropdowns and floating selects
              await element.click({ timeout: 5000 });
              await this.page.waitForTimeout(500);
              
              // Try to find and click the option
              const optionSelectors = [
                `text="${value}"`,
                `[value="${value}"]`,
                `li:has-text("${value}")`,
                `.select-item:has-text("${value}")`
              ];
              
              for (const optionSelector of optionSelectors) {
                try {
                  await this.page.locator(optionSelector).first().click({ timeout: 2000 });
                  filled = true;
                  break;
                } catch (e) {
                  continue;
                }
              }
              
              if (!filled) {
                // If no option found, try pressing Escape and try typing
                await this.page.keyboard.press('Escape');
                await element.fill(value.toString());
                filled = true;
              }
              break;
            } else if (tagName === 'textarea' || tagName === 'input') {
              // Handle text inputs and textareas
              await element.fill(value.toString(), { timeout: 5000 });
              filled = true;
              break;
            }
          }
        } catch (error) {
          continue; // Try next selector
        }
      }

      if (filled) {
        console.log(`✓ Filled ${fieldName}: ${value}`);
      } else {
        console.warn(`⚠️  Could not find field: ${fieldName}`);
        // Take a screenshot to help debug
        await this.page.screenshot({ 
          path: `test-results/debug-${fieldName}.png`, 
          fullPage: true 
        });
      }
      
    } catch (error) {
      console.error(`✗ Failed to fill ${fieldName}:`, error instanceof Error ? error.message : String(error));
    }
  }

  private getFieldSelectors(): Record<string, string> {
    return {
      // Personal Information - using name attributes from your form
      'name': '[name="name"]',
      'fullname': '[name="name"]',
      'patient_name': '[name="name"]',
      'full_name': '[name="name"]',
      
      'year_of_birth': '[name="year_of_birth"]',
      'age': '[name="year_of_birth"]',
      'birth_year': '[name="year_of_birth"]',
      
      'gender': '[name="gender"]',
      'sex': '[name="gender"]',
      
      'national_id': '[name="national_id"]',
      'id_number': '[name="national_id"]',
      
      'contact_number': '[name="contact_number"]',
      'phone': '[name="contact_number"]',
      'telephone': '[name="contact_number"]',
      
      // Location
      'region': '[name="region"]',
      'district': '[name="district"]',
      'subdistrict': '[name="sub_district"]',
      'sub_district': '[name="sub_district"]',
      
      // Clinical Information
      'present_complaints': '[name="present_complaints"]',
      'symptoms': '[name="present_complaints"]',
      'complaints': '[name="present_complaints"]',
      
      'examination_findings': '[name="examination_findings"]',
      'examination': '[name="examination_findings"]',
      'physical_exam': '[name="examination_findings"]',
      
      // Vital Signs - using the masks you implemented
      'blood_pressure': '[name="bp"]',
      'bp': '[name="bp"]',
      'systolic_diastolic': '[name="bp"]',
      
      'weight': '[name="weight"]',
      'weight_kg': '[name="weight"]',
      
      'temperature': '[name="temperature"]',
      'temp': '[name="temperature"]',
      'body_temp': '[name="temperature"]',
      
      'pulse': '[name="pulse"]',
      'heart_rate': '[name="pulse"]',
      'pulse_rate': '[name="pulse"]',
      
      'blood_group': '[name="blood_group"]',
      'blood_type': '[name="blood_group"]',
      
      // Treatment
      'treatment_given': '[name="treatment_given"]',
      'treatment': '[name="treatment_given"]',
      
      'medications_given': '[name="medications_given"]',
      'medications': '[name="medications_given"]',
      'drugs_given': '[name="medications_given"]',
      
      'medications_on': '[name="medications_on"]',
      'current_medications': '[name="medications_on"]',
      
      // Insurance
      'insurance_status': '[name="insurance_status"]',
      'insurance': '[name="insurance_status"]',
      
      'insurance_no': '[name="insurance_no"]',
      'insurance_number': '[name="insurance_no"]',
      
      // Referral
      'referral_needed': '[name="referral_needed"]',
      'needs_referral': '[name="referral_needed"]',
      
      'referring_facility_name': '[name="referring_facility_name"]',
      'from_facility': '[name="referring_facility_name"]',
      
      'facility_referred_to': '[name="facility_referred_to"]',
      'to_facility': '[name="facility_referred_to"]',
      
      'referring_officer_name': '[name="referring_officer_name"]',
      'doctor_name': '[name="referring_officer_name"]',
      
      'referring_officer_position': '[name="referring_officer_position"]',
      'doctor_position': '[name="referring_officer_position"]',
      
      'priority_level': '[name="priority_level"]',
      'priority': '[name="priority_level"]',
      'urgency': '[name="priority_level"]',
      
      'referral_reason_notes': '[name="referral_reason_notes"]',
      'referral_reason': '[name="referral_reason_notes"]',
      'reason': '[name="referral_reason_notes"]',
      
      'transportation_means': '[name="transportation_means"]',
      'transport': '[name="transportation_means"]',
      
      'other_notes': '[name="other_notes"]',
      'notes': '[name="other_notes"]',
      'additional_notes': '[name="other_notes"]',
    };
  }

  async submitForm() {
    console.log('🚀 Submitting form...');
    
    // Take screenshot before submission
    await this.page.screenshot({ path: 'test-results/before-submit.png', fullPage: true });
    
    // Find and click submit button
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Submit")',
      'button:has-text("Save")',
      'input[type="submit"]'
    ];
    
    for (const selector of submitSelectors) {
      try {
        const button = this.page.locator(selector).first();
        if (await button.count() > 0 && await button.isEnabled()) {
          await button.click({ timeout: 5000 });
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    // Wait for potential form submission processing
    await this.page.waitForTimeout(2000);
    
    // Take screenshot after submission attempt
    await this.page.screenshot({ path: 'test-results/after-submit.png', fullPage: true });
    
    console.log('✅ Form submission completed');
    return this;
  }

  async expectSuccess(timeout: number = 10000) {
    console.log('🔍 Checking for success indicators...');
    
    // Look for various success indicators
    const successSelectors = [
      'text=/success/i',
      'text=/submitted/i',
      'text=/created/i',
      'text=/saved/i',
      '[role="alert"]:has-text("success")',
      '.toast:has-text("success")',
      '.success',
      '.alert-success'
    ];
    
    for (const selector of successSelectors) {
      try {
        await expect(this.page.locator(selector).first()).toBeVisible({ timeout: timeout });
        console.log('✅ Success detected!');
        return this;
      } catch (error) {
        continue;
      }
    }
    
    // If no success found, log current page state
    console.warn('⚠️  No clear success indicator found');
    await this.page.screenshot({ path: 'test-results/final-state.png', fullPage: true });
    return this;
  }

  async expectError(errorMessage?: string, timeout: number = 5000) {
    console.log('🔍 Checking for error indicators...');
    
    if (errorMessage) {
      await expect(this.page.locator(`text=${errorMessage}`)).toBeVisible({ timeout });
    } else {
      // Look for generic error indicators
      const errorSelectors = [
        '[role="alert"]',
        '.error',
        '.alert-error',
        'text=/error/i',
        'text=/failed/i',
        '.toast:has-text("error")'
      ];
      
      for (const selector of errorSelectors) {
        try {
          await expect(this.page.locator(selector).first()).toBeVisible({ timeout });
          console.log('✅ Error detected as expected!');
          return this;
        } catch (error) {
          continue;
        }
      }
    }
    
    console.log('✅ Error validation completed');
    return this;
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/${name}.png`, 
      fullPage: true 
    });
    return this;
  }

  async logPageContent() {
    const content = await this.page.content();
    console.log('📄 Current page content:', content.substring(0, 500) + '...');
    return this;
  }
}
