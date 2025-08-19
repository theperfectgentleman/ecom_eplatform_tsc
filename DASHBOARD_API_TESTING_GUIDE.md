# Dashboard API Testing Guide

## Issue Resolution: Double `/api/` in URLs

**Problem**: Dashboard was making requests to `https://api.encompas.org/api/api/dashboard/...` (double `/api/`)

**Solution**: Updated all dashboard API paths to be relative to the base URL:
- ❌ `path: '/api/dashboard/patient-bio'` 
- ✅ `path: 'dashboard/patient-bio'`

## Testing the Dashboard Live Data

### 1. Quick API Endpoint Test

Test each endpoint individually to verify they're working:

```bash
# Test patient bio endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.encompas.org/api/dashboard/patient-bio

# Test ANC registrations endpoint  
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.encompas.org/api/dashboard/antenatal-registration

# Test visits endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.encompas.org/api/dashboard/antenatal-visits

# Test cases endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.encompas.org/api/dashboard/case-files

# Test kit distribution endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.encompas.org/api/dashboard/kit-distribution

# Test kit usage endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.encompas.org/api/dashboard/kit-usage
```

### 2. Dashboard Debug Information

When you toggle to "Live Data" mode, the dashboard now shows debug information including:

- **Loading Status**: Shows if data is currently being fetched
- **Data Count**: Shows how many records were loaded for each endpoint
- **Error Status**: Shows "No data" if endpoints return empty or fail

### 3. Expected Behavior

#### When Live Data Toggle is OFF (Sample Data):
- Total Patients: 356
- All KPI cards show sample data values
- Charts display sample trends and distributions

#### When Live Data Toggle is ON (Live API Data):
- **If APIs work**: Total Patients shows actual count from database
- **If APIs fail**: Falls back to sample data (Total Patients: 356)
- Debug panel shows status of each API call

### 4. Debugging Steps

1. **Check the debug panel** when live data is enabled
2. **Verify API responses** using browser dev tools (Network tab)
3. **Check for authentication errors** (401/403 responses)
4. **Verify API endpoints exist** on the backend

### 5. Common Issues

#### Total Patients = 0 in Live Mode
**Possible causes:**
- API endpoint `/dashboard/patient-bio` returns empty array `[]`
- API endpoint returns error (check debug panel)
- Authentication token invalid/expired
- Endpoint not implemented on backend

#### Debug panel shows "No data"
**Possible causes:**
- Backend API endpoints not implemented
- Database tables empty
- SQL queries returning no results
- Wrong endpoint URLs

#### Debug panel shows "Loading..."
**Possible causes:**
- API endpoint is slow to respond
- Network connectivity issues
- API endpoint hanging/timeout

### 6. Next Steps

If Total Patients is still 0:

1. **Verify backend implementation**: Check if `/dashboard/patient-bio` endpoint exists
2. **Check database data**: Ensure `patient_bio` table has records
3. **Test API directly**: Use curl or Postman to test endpoints
4. **Check SQL queries**: Verify queries in `DASHBOARD_SQL_QUERIES.md` work
5. **Review authentication**: Ensure API requires/handles auth tokens correctly

### 7. API Endpoint Implementation Status

Use this checklist to verify which endpoints are implemented:

- [ ] `GET /api/dashboard/patient-bio`
- [ ] `GET /api/dashboard/antenatal-registration` 
- [ ] `GET /api/dashboard/antenatal-visits`
- [ ] `GET /api/dashboard/case-files`
- [ ] `GET /api/dashboard/kit-distribution`
- [ ] `GET /api/dashboard/kit-usage`
- [ ] `GET /api/dashboard/monthly-trends`
- [ ] `GET /api/dashboard/age-distribution`
- [ ] `GET /api/dashboard/insurance-coverage`
- [ ] `GET /api/dashboard/risk-distribution`
- [ ] `GET /api/dashboard/anc-performance`
- [ ] `GET /api/dashboard/kit-performance`
- [ ] `GET /api/dashboard/volunteer-performance`
- [ ] `GET /api/dashboard/geographic-distribution`

The dashboard will work with sample data even if no endpoints are implemented, but for accurate Total Patients count, at minimum the `patient-bio` endpoint must return valid data.
