# 🔧 Dashboard API Diagnostic Report

## Issue Summary
- **Status**: 500 Internal Server Error on all dashboard endpoints
- **Root Cause**: Controller functions throwing exceptions
- **Authentication**: Working (getting 500, not 401/404)

## Frontend API Calls Analysis

Based on the error logs, the frontend is correctly calling:
- `GET https://api.encompas.org/api/dashboard/patient-bio`
- `GET https://api.encompas.org/api/dashboard/antenatal-registration` 
- `GET https://api.encompas.org/api/dashboard/antenatal-visits`
- `GET https://api.encompas.org/api/dashboard/insurance-coverage`
- `GET https://api.encompas.org/api/dashboard/age-distribution`
- `GET https://api.encompas.org/api/dashboard/volunteer-performance`
- `GET https://api.encompas.org/api/dashboard/kit-performance`

## Most Likely Issues

### 1. Database Connection/Configuration
The controllers expect a PostgreSQL database with specific tables. Issues could be:
- Missing database tables
- Incorrect database connection string
- Database authentication failures
- Wrong database schema

### 2. SQL Query Syntax Issues
The controllers use template literals with `sql` tagged templates. Issues could be:
- Incorrect SQL syntax for PostgreSQL version
- Missing database functions/operators
- Null parameter handling

### 3. Missing Dependencies
The controllers import `sql` from somewhere. Issues could be:
- Missing postgres/SQL client library
- Incorrect import path
- Version mismatch

## Debugging Steps

### Step 1: Check Backend Logs
```bash
# Check if backend is running and logs
pm2 logs
# or
docker logs <container_name>
# or
tail -f /var/log/nodejs/app.log
```

### Step 2: Test Database Connection
```bash
# Connect to PostgreSQL directly
psql -h localhost -U your_user -d your_database

# Check if tables exist
\dt

# Verify table structure
\d patient_bio
\d antenatal_registration
\d antenatal_visits
\d case_files
\d kit_distro_log
\d kit_usage_log
```

### Step 3: Test Individual Endpoint
```bash
# Test with curl (use your actual token)
curl -X GET \
  "https://api.encompas.org/api/dashboard/patient-bio" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -v
```

### Step 4: Check SQL Library Import
The controller uses `sql` but we need to verify:
```typescript
// Should be something like:
import { sql } from '@vercel/postgres';
// or
import sql from 'postgres';
// or
import { Pool } from 'pg'; const sql = new Pool();
```

## Quick Fixes to Try

### Fix 1: Add Error Logging to Controllers
Add detailed logging to see exact error:
```typescript
export const getPatientBioStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Starting getPatientBioStats...');
    const { region, district, subdistrict } = getUserLocationFilter(req);
    console.log('Filters:', { region, district, subdistrict });
    
    // ... rest of function
  } catch (error) {
    console.error('getPatientBioStats error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
```

### Fix 2: Verify Database Schema
Make sure these tables exist with correct column names:
- `patient_bio`
- `antenatal_registration` 
- `antenatal_visits`
- `case_files`
- `kit_distro_log`
- `kit_usage_log`

### Fix 3: Check SQL Import
Verify the `sql` import at the top of dashboardController.ts:
```typescript
// Make sure this line exists and is correct
import sql from 'postgres'; // or whatever SQL client you're using
```

## Next Steps

1. **Check backend console logs** - This will show the exact error
2. **Verify database connection** - Test if PostgreSQL is accessible
3. **Confirm table structure** - Make sure all required tables exist
4. **Test one endpoint** - Start with the simplest controller function

The issue is definitely in the backend controller execution, not the frontend or routing.
