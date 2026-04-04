# Account Creation Results

## Summary

- **Total Accounts Created:** 16
- **Midwives (Clinicians):** 8
- **CHVs (Volunteers):** 8
- **Region:** North East
- **District:** Mamprugu Moagduri

## Privacy Notice

This document has been sanitized to remove personal identifiers, contact details, usernames, email addresses, and passwords. Operational account credentials should never be stored in repository documentation.

## Role Distribution

### Midwives (Clinicians)

- Count: 8
- Access level: Subdistrict

### CHVs (Volunteers)

- Count: 8
- Access level: Community

## Technical Implementation Details

### User Type Mapping:
- **Midwives** → `user_type: 'clinician'`, `access_level: 1` (SUBDISTRICT)
- **CHVs** → `user_type: 'volunteer'`, `access_level: 0` (COMMUNITY)

### Geographic Assignment:
- **Region:** North East
- **District:** Mamprugu Moagduri
- **Subdistricts:** Kubori, Kunkua, Yikpabongo, Yagaba
- **Communities:** Kubori, Kunkua, Yizesi, Loagri, Katigri, Yagaba, Zanwara, Tantala

### Provisioning Notes:
1. User accounts were created according to the project's role and geography assignment rules.
2. Initial credentials were provisioned through controlled operational processes and should be distributed outside source control.
3. Any future account-creation reports should store only counts, role breakdowns, and non-sensitive assignment summaries.

### API Endpoints Used:
- **Base URL:** Approved Encompas API environment
- **Endpoint:** Account creation endpoint
- **Authentication:** Authorized administrative credentials
