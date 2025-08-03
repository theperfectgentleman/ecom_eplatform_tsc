# AI-Powered UI Testing for Referral Forms

This testing system allows you to give natural language instructions to fill and submit your referral forms automatically using Playwright and AI assistance.

## 🚀 Quick Start

### 1. Make sure your dev server is running:
```bash
npm run dev
```

### 2. Run a quick test:
```bash
npm run test:quick
```

### 3. Run full test suite:
```bash
npm run test
```

### 4. Run tests with UI (visual mode):
```bash
npm run test:ui
```

### 5. Run tests in headed mode (see browser):
```bash
npm run test:headed
```

## 📝 How to Use

### Quick Testing
You can quickly test your form by modifying the `tests/quick-test.ts` file:

```typescript
await quickTest("Fill a referral form for emergency patient", {
  name: "John Doe",
  year_of_birth: "1975",
  gender: "Male",
  present_complaints: "Chest pain and shortness of breath",
  bp: "14090", // Will format to 140/90
  weight: "75",
  temperature: "38",
  pulse: "95",
  priority_level: "Urgent",
  referral_needed: true
});
```

### Custom Test Cases
Add new test cases in `tests/referral-form.spec.ts`:

```typescript
test('Your custom test', async ({ page }) => {
  const tester = new AIFormTester(page);
  
  await tester.fillReferralForm(
    "Your natural language instruction here",
    {
      // Your form data here
      name: "Patient Name",
      // ... more fields
    }
  );
  
  await tester.submitForm();
  await tester.expectSuccess();
});
```

## 🎯 Supported Fields

The AI form tester recognizes these field names and their aliases:

### Personal Information
- `name`, `fullname`, `patient_name`
- `year_of_birth`, `age`, `birth_year`
- `gender`, `sex`
- `national_id`, `id_number`
- `contact_number`, `phone`, `telephone`

### Location
- `region`
- `district`
- `sub_district`, `subdistrict`

### Clinical Information
- `present_complaints`, `symptoms`, `complaints`
- `examination_findings`, `examination`, `physical_exam`

### Vital Signs (with automatic formatting)
- `bp`, `blood_pressure` → formats as `nnn/nnn`
- `weight` → formats as `nnn`
- `temperature`, `temp` → formats as `nn`
- `pulse`, `heart_rate` → formats as `nnn`
- `blood_group`, `blood_type`

### Treatment
- `treatment_given`, `treatment`
- `medications_given`, `medications`
- `medications_on`, `current_medications`

### Insurance
- `insurance_status`, `insurance`
- `insurance_no`, `insurance_number`

### Referral
- `referral_needed`, `needs_referral`
- `priority_level`, `priority`, `urgency`
- `referring_facility_name`, `from_facility`
- `facility_referred_to`, `to_facility`
- `referring_officer_name`, `doctor_name`
- `referring_officer_position`, `doctor_position`
- `referral_reason_notes`, `reason`
- `transportation_means`, `transport`
- `other_notes`, `notes`

## 🔧 Advanced Features

### Input Masks Testing
The system automatically tests your input masks:
- Blood pressure: `"14090"` → `"140/90"`
- Weight: `"75"` → `"75"`
- Temperature: `"38"` → `"38"`
- Pulse: `"95"` → `"95"`
- Year: `"1990"` → `"1990"`

### Dropdown Cascade Testing
Tests the cascading behavior of location dropdowns:
```typescript
{
  region: "Northern",
  district: "Gulu", // Only available after region is selected
  sub_district: "Gulu Municipality" // Only available after district
}
```

### Priority Color Testing
Verifies that priority levels show correct colors:
- `"Critical"` → Red background
- `"Urgent"` → Orange background
- `"Opened"` → Purple background
- `"Closed"` → Gray background

## 📸 Screenshots

All tests automatically take screenshots:
- `before-fill.png` - Form before filling
- `after-fill.png` - Form after filling
- `before-submit.png` - Before submission
- `after-submit.png` - After submission
- `final-state.png` - Final result

## 🐛 Debugging

### Debug specific fields:
```bash
# Modify the debug test in referral-form.spec.ts
# Set the field name you want to debug
const fieldName = 'blood_pressure'; // Change this
```

### Run in debug mode:
```bash
npm run test:debug
```

### View test results:
```bash
npm run test:report
```

## 💡 Example Test Instructions

You can use natural language instructions like:

- "Fill out a complete referral form for a cardiac emergency patient"
- "Create a referral for a child with respiratory symptoms"
- "Test the blood pressure input mask formatting"
- "Fill minimal required fields for a routine case"
- "Test form validation with missing required fields"

## 🔍 What the AI Tests

1. **Form Field Recognition** - Automatically finds and fills form fields
2. **Input Masking** - Tests your custom input masks work correctly
3. **Dropdown Cascading** - Verifies location dropdowns work in sequence
4. **Form Validation** - Tests required field validation
5. **Success/Error Handling** - Checks for proper feedback messages
6. **Visual Verification** - Takes screenshots for manual review
7. **Performance** - Measures form filling speed
8. **Accessibility** - Tests keyboard navigation and screen reader compatibility

## 🎨 Customization

Edit the field selectors in `tests/ai-form-tester.ts` if your form structure changes:

```typescript
private getFieldSelectors(): Record<string, string> {
  return {
    'name': '[name="name"]', // Update selectors here
    // ... more field mappings
  };
}
```

## 📊 Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

This shows:
- ✅ Passed tests
- ❌ Failed tests  
- 📸 Screenshots
- 🎥 Video recordings
- ⏱️ Performance metrics

---

Now you can tell the AI exactly what to test and it will do it automatically! 🤖✨
