# Patient and ANC Registration Code Generation Guide

## Overview

This document explains how **Patient IDs** and **ANC (Antenatal Care) Registration codes** are generated in the eCompas platform. These codes serve as unique identifiers. The ANC Registration Code is directly derived from the Patient ID.

## 1. Patient ID Generation

The Patient ID is the primary unique identifier for a patient. It is generated once when a new patient is registered.

### Patient ID Format

The format is: `EN-[DC][YY]-[DDDD][LL]`

-   **EN-**: A static prefix for "eCompas Network".
-   **DC**: A 2-digit code for the patient's district (e.g., `11` - Wa West and `22` - North East).
-   **YY**: The last two digits of the registration year.
-   **DDDD**: Four random digits (0-9).
-   **LL**: Two random uppercase letters (A-Z, excluding 'O' and 'I').

**Example**: `EN-1125-8432KL`

### Patient ID Implementation

-   **Location**: `src/components/antenatal/PersonDetailsForm.tsx`
-   **Function**: `generatePatientId(district: string)`

```typescript
// District code mapping
const DISTRICT_CODES = {
  'Wa West': '11',
  'Mamprugu Moagduri': '22'
} as const;

const generatePatientId = (district: string): string => {
  const districtCode = DISTRICT_CODES[district as keyof typeof DISTRICT_CODES] || '00';
  const year = new Date().getFullYear().toString().slice(-2);
  const randomDigits = generateRandomDigits(4);
  const randomLetters = generateRandomLetters(2);
  
  return `EN-${districtCode}${year}-${randomDigits}${randomLetters}`;
};
```

---

## 2. ANC Registration Code Generation

The ANC Registration code builds upon the Patient ID to create a unique identifier for each antenatal care registration.

### ANC Code Format

The format is: `[Patient_ID]-[C][N][C]`

-   **Patient_ID**: The full Patient ID generated above.
-   **C**: A random character (letter).
-   **N**: A random number.
-   **C**: A random character (letter).

**Example**: `EN-1125-8432KL-A5Z`

### Suffix Character and Number Rules

#### Allowed Characters (C)
The random characters for the suffix are selected from:
`A B C D E F G H J K M N P Q R S T U V W X Y Z`
(Excludes: `O`, `I`, `L`)

#### Allowed Numbers (N)
The random number for the suffix is selected from:
`1 2 3 4 5 6 7 8 9`
(Excludes: `0`)

### ANC Code Implementation

-   **Location**: `src/components/antenatal/ANCRegistrationForm.tsx`
-   **Function**: `generateAntenatalRegistrationNumber(patientId: string)`

```typescript
const generateAntenatalRegistrationNumber = (patientId: string): string => {
  const allowedChars = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  const allowedNumbers = '123456789';

  const getRandomChar = () => allowedChars[Math.floor(Math.random() * allowedChars.length)];
  const getRandomNumber = () => allowedNumbers[Math.floor(Math.random() * allowedNumbers.length)];

  const char1 = getRandomChar();
  const number = getRandomNumber();
  const char2 = getRandomChar();

  return `${patientId}-${char1}${number}${char2}`;
};
```

## System Usage and Maintenance

This section applies to both ID types.

### When Codes Are Generated
-   **Patient ID**: Generated once when a new patient is created in `PersonDetailsForm`.
-   **ANC Registration Code**: Generated when a new ANC registration is created in `ANCRegistrationForm`.
-   Codes are immutable and preserved during updates.

### Uniqueness and Collision
-   The multi-part structure with random elements provides a high degree of uniqueness.
-   In the extremely rare case of a collision, the database's unique constraints would prevent a duplicate entry, and a retry with a new random code would be necessary.

## Related Files

-   `src/components/antenatal/PersonDetailsForm.tsx` - Patient ID generation logic.
-   `src/components/antenatal/ANCRegistrationForm.tsx` - ANC Registration Code generation logic.
-   `src/types/index.ts` - Type definitions.
-   `src/components/antenatal/AntenatalCareForm.tsx` - Form integration.

---

**Last Updated**: August 18, 2025
**Version**: 3.0 (Combined Patient and ANC ID documentation)
**Previous Format**: ANC[YYYY][MM][DD][XXX] (deprecated)
