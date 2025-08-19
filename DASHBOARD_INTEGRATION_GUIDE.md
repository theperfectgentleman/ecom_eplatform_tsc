# Dashboard Integration Guide

## Overview

The ENCOMPAS e-Platform dashboard has been successfully updated to integrate with the implemented API endpoints. This document provides guidance on testing and using the dashboard with real data.

## Dashboard Features

### Toggle System
- **Sample Data Mode**: Uses predefined sample data to demonstrate functionality
- **Live Data Mode**: Fetches real data from API endpoints
- Toggle located in the top-right corner of the dashboard

### API Integration

The dashboard now connects to these implemented API endpoints:

1. **Patient Bio**: `/api/dashboard/patient-bio`
2. **ANC Registration**: `/api/dashboard/antenatal-registration`
3. **ANC Visits**: `/api/dashboard/antenatal-visits`
4. **Case Files**: `/api/dashboard/case-files`
5. **Kit Distribution**: `/api/dashboard/kit-distribution`
6. **Kit Usage**: `/api/dashboard/kit-usage`
7. **Geographic Distribution**: `/api/dashboard/geographic-distribution`
8. **Monthly Trends**: `/api/dashboard/monthly-trends`

### Access Level Filtering

The API endpoints should handle access level filtering on the backend based on the user's permissions:

- **Community Level (0)**: Only see data from their specific community
- **Subdistrict Level (1)**: See data from their subdistrict and communities within
- **District Level (2)**: See data from their district and sub-areas
- **Region Level (3)**: See data from their region and sub-areas
- **National Level (4)**: See all data

### Expected API Response Format

Each endpoint should return data in this format:

```json
{
  "data": [
    // Array of records
  ],
  "meta": {
    "total": 123,
    "page": 1,
    "limit": 50,
    "new_registrations_this_week": 8, // Only for patient-bio endpoint
    "filtered": true,
    "filter_level": "district"
  }
}
```

## Testing the Dashboard

### 1. Sample Data Testing
1. Open the dashboard
2. Ensure the toggle is set to "Sample Data" (left position)
3. Verify all charts, cards, and tables display sample data
4. Test regional/district filtering
5. Verify all components render correctly

### 2. Live Data Testing
1. Ensure your API server is running
2. Toggle to "Live Data" (right position)
3. Watch for loading indicators
4. Verify data loads from API endpoints
5. Test error handling (disconnect API server)

### 3. Access Level Testing
Test with different user access levels:
1. Login as users with different access levels
2. Toggle to "Live Data"
3. Verify data filtering works correctly
4. Check that users only see data they're authorized to view

### 4. Regional Filtering Testing
1. Select different regions from dropdown
2. Verify district dropdown updates accordingly
3. Confirm data updates to match selected region/district
4. Test "All Regions" and "All Districts" options

## Key Metrics Tracked

### Patient Registration
- Total patients registered
- New registrations this week
- Geographic distribution

### ANC Program
- Active ANC registrations
- Monthly registration trends
- Visit completion rates
- Upcoming appointments

### Referral System
- Open referral cases
- High-risk patients
- Case priority distribution
- Monthly referral trends

### Kit Management
- Total kits distributed
- Kit usage in field
- Usage results (positive/negative)
- Distribution confirmation status

## Charts and Visualizations

### Line Charts
- **Monthly Trends**: 4 metrics over 12 months
- Shows patients, ANC registrations, visits, and referrals

### Bar Charts
- **Kit Distribution**: Monthly distribution volumes
- **ANC Progress**: Registration vs visit completion

### Pie Chart
- **Kit Usage Results**: Distribution of test results

### Tables
- **Recent ANC Registrations**: Latest 5 registrations
- **Recent Cases**: Latest 5 referral cases
- **Kit Distribution Log**: Latest 5 distributions
- **Kit Usage Log**: Latest 5 field uses

## Performance Considerations

### Caching
Consider implementing caching for:
- Monthly trends (update daily)
- Geographic distribution (update hourly)
- Total counts (update every 15 minutes)

### Pagination
Most endpoints support pagination:
- Default limit: 50 records
- Dashboard typically shows first 5 records in tables
- Full data available via API pagination

### Error Handling
The dashboard handles:
- API connection errors
- Loading states
- Empty data gracefully
- Invalid responses

## Troubleshooting

### Common Issues

1. **Dashboard shows "Loading..." indefinitely**
   - Check API server is running
   - Verify API endpoints are accessible
   - Check browser console for errors

2. **No data displayed in Live Data mode**
   - Verify database has sample data
   - Check user access level permissions
   - Confirm API filtering is working

3. **Charts not rendering**
   - Check data format matches expected structure
   - Verify date fields are valid
   - Check for JavaScript console errors

### Debug Mode
1. Open browser developer tools
2. Check Network tab for API calls
3. Review Console for error messages
4. Verify API responses match expected format

## Future Enhancements

### Possible Additions
1. **Real-time Updates**: WebSocket integration for live updates
2. **Export Features**: PDF/Excel export for reports
3. **Alert System**: Notifications for high-risk cases
4. **Advanced Filtering**: Date ranges, custom filters
5. **Drill-down**: Click charts to view detailed data

### Performance Optimizations
1. **Data Virtualization**: For large datasets
2. **Chart Optimization**: Reduce data points for better performance
3. **Background Refresh**: Auto-refresh without user interaction
4. **Compression**: Gzip API responses

This dashboard provides comprehensive insights into the ENCOMPAS project's performance and helps stakeholders monitor the success of antenatal care programs and referral systems across Ghana.
