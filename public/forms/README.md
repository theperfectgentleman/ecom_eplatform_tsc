# Patient Registration Forms - Documentation

## Overview

This package contains printable forms for patient registration that serve as backup data collection tools for remote areas where power outages or device failures prevent digital data entry.

## Files Included

### 1. PersonDetailsForm_Printable.html
- **Purpose**: Full-featured color form with comprehensive layout
- **Best for**: Clinics with color printers and good paper supply
- **Features**: 
  - Color-coded sections
  - Visual icons and styling
  - Clear section separators
  - Comprehensive instructions

### 2. PersonDetailsForm_Simple.html
- **Purpose**: Black and white form optimized for photocopying
- **Best for**: Remote areas with basic printing/photocopying facilities
- **Features**:
  - Minimal ink usage
  - High contrast design
  - Photocopy-friendly layout
  - Compact design fits more on a page

## Form Sections

Both forms capture the same data fields organized into sections:

### Section A: Basic Information
- Surname
- Other Names
- Date of Birth
- Registration Date
- NHIS Number

### Section B: Contact Information
- Contact Number
- Alternative Number

### Section C: Next of Kin Information
- Next of Kin Name
- Next of Kin Contact

### Section D: Location & Address Information
**Geographic Details:**
- District - Wa West or Mamprugu Moagduri
- Subdistrict
- Community

**Address Information:**
- Detailed Address

## Usage Instructions

### For Field Workers

1. **Before Going to Remote Areas:**
   - Print sufficient copies of the form
   - Bring backup pens/pencils
   - Ensure you have a clipboard or hard surface
   - Consider laminating a master copy for reference

2. **When Filling the Form:**
   - Use BLOCK LETTERS for all text
   - Complete all fields thoroughly
   - Double-check phone number formats (XXX-XXX-XXXX)
   - Get patient/guardian signature
   - Sign and date the form yourself

3. **GPS Location Collection:**
   - GPS functionality removed for simplicity
   - Focus on address and geographic area selection

4. **After Field Work:**
   - Review all forms for completeness
   - Prioritize data entry for urgent cases
   - Keep original forms as backup

### For Data Entry Staff

1. **Processing Paper Forms:**
   - Check the "Data Entry Checklist" section
   - Verify all fields are complete
   - Generate Patient ID in the system (follows format: EN-DDYY-NNNNLL)
   - Cross-reference with existing patient records

2. **Quality Control:**
   - Validate phone numbers and dates
   - Confirm geographic location selections
   - Mark forms as "Entered" with system ID

## Patient ID Format

The system generates Patient IDs in the format: **EN-DDYY-NNNNLL**

Where:
- **EN** = Fixed prefix
- **DD** = District code (11 = Wa West, 22 = Mamprugu Moagduri)
- **YY** = Last 2 digits of current year
- **NNNN** = 4 random digits
- **LL** = 2 random letters (excluding O and I)

Example: EN-1125-4729AB

## District Codes

- Wa West: 11
- Mamprugu Moagduri: 22
- Other districts: Contact system administrator

## Printing Guidelines

### For Color Version (PersonDetailsForm_Printable.html):
- Print on A4 paper
- Use standard margins (1cm)
- Color printer recommended
- Heavier paper weight (80gsm+) preferred

### For Simple Version (PersonDetailsForm_Simple.html):
- Print on A4 paper
- Black and white compatible
- Suitable for photocopying
- Works with basic 70gsm paper

## Troubleshooting

### Common Issues:

1. **Form doesn't print properly:**
   - Check page orientation (Portrait)
   - Verify paper size (A4)
   - Adjust browser print settings

2. **GPS coordinates are unclear:**
   - GPS functionality has been removed for simplicity
   - Focus on detailed address instead

3. **Patient ID conflicts:**
   - Check for duplicate entries in system
   - Verify district code is correct
   - Contact supervisor if needed

## Integration with Digital System

The form fields map directly to the digital system database:

| Form Field | Database Field | Type | Notes |
|------------|----------------|------|-------|
| Surname | name | VARCHAR(255) | Patient's surname |
| Other Names | othernames | VARCHAR(255) | Given names |
| Date of Birth | dob | DATE | Format: YYYY-MM-DD |
| Contact Number | contact_number | VARCHAR(20) | Primary phone |
| Alternative Number | alternative_number | VARCHAR(20) | Secondary phone |
| Next of Kin Name | next_kin | VARCHAR(255) | Emergency contact |
| Next of Kin Contact | next_kin_contact | VARCHAR(255) | Emergency phone |
| Registration Date | registration_date | DATE | Form completion date |
| District | district | VARCHAR(100) | Wa West or Mamprugu Moagduri |
| Subdistrict | subdistrict | VARCHAR(100) | Administrative subdivision |
| Community | community | VARCHAR(100) | Local community name |
| Address | address | TEXT | Full address details |

## Best Practices

1. **Form Management:**
   - Keep blank forms in waterproof storage
   - Number forms for tracking
   - Use carbon paper for immediate copies if needed

2. **Data Quality:**
   - Train staff on proper form completion
   - Implement double-entry verification for critical fields
   - Regular audits of paper vs digital records

3. **Backup Strategy:**
   - Store completed forms securely
   - Scan forms when possible
   - Maintain forms for at least 1 year after digital entry

## Support

For technical issues with the forms or integration with the digital system, contact:
- System Administrator
- IT Support Team
- Project Manager

---

**Last Updated:** September 2025  
**Version:** 1.0  
**Compatible with:** Patient Registration System v1.0+
