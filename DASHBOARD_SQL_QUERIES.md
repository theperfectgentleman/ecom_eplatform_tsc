# Dashboard SQL Queries and API Implementation Guide

# Dashboard API Endpoints and SQL Queries

This document provides the complete SQL implementation for all dashboard API endpoints in the ENCOMPAS e-Platform.

## Base URL Configuration

**Important**: The frontend expects these endpoints to be available at:
- Base URL: `https://api.encompas.org/api`
- Dashboard endpoints: `{baseUrl}/dashboard/*`

**Correct endpoint URLs:**
- `https://api.encompas.org/api/dashboard/patient-bio`
- `https://api.encompas.org/api/dashboard/antenatal-registration`
- etc.

**Note**: Avoid double `/api/` in URLs. The frontend paths are relative to the base URL.

## Overview

The dashboard tracks:
- Patient registrations and demographics
- ANC (Antenatal Care) registrations and visits
- Referral cases (case files)
- Kit distribution and usage
- Geographic distribution of services

## Database Tables

The following tables are used:
- `patient_bio` - Patient demographics and registration
- `antenatal_registration` - ANC program registrations
- `antenatal_visits` - ANC visit records
- `case_files` - Referral cases
- `kit_distro_log` - Kit distribution records
- `kit_usage_log` - Kit usage in the field

## API Endpoints and SQL Queries

### 1. Patient Bio Statistics (`GET /api/dashboard/patient-bio`)

#### Total Patients Count
```sql
SELECT COUNT(*) as total_patients
FROM patient_bio
WHERE 1=1
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict);
```

#### Patient List with Filtering
```sql
SELECT 
    patient_id,
    name,
    year_of_birth,
    gender,
    contact_number,
    region,
    district,
    sub_district,
    community,
    national_id,
    insurance_status,
    registration_date
FROM patient_bio
WHERE 1=1
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict)
ORDER BY registration_date DESC
LIMIT $limit OFFSET $offset;
```

#### New Registrations This Week
```sql
SELECT COUNT(*) as new_registrations
FROM patient_bio
WHERE registration_date >= CURRENT_DATE - INTERVAL '7 days'
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict);
```

### 2. ANC Registration Statistics (`GET /api/dashboard/antenatal-registration`)

#### Active ANC Registrations
```sql
SELECT 
    antenatal_registration_id,
    patient_id,
    registration_date,
    registration_number,
    parity,
    gestation_weeks,
    estimated_delivery_date,
    antenatal_status,
    region,
    district,
    sub_district,
    community
FROM antenatal_registration
WHERE antenatal_status = 'active'
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict)
ORDER BY registration_date DESC;
```

#### ANC Registration Count by Status
```sql
SELECT 
    antenatal_status,
    COUNT(*) as count
FROM antenatal_registration
WHERE 1=1
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict)
GROUP BY antenatal_status;
```

#### Monthly ANC Registration Trends
```sql
SELECT 
    DATE_TRUNC('month', registration_date) as month,
    COUNT(*) as registrations
FROM antenatal_registration
WHERE registration_date >= CURRENT_DATE - INTERVAL '12 months'
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict)
GROUP BY DATE_TRUNC('month', registration_date)
ORDER BY month;
```

### 3. ANC Visits Statistics (`GET /api/dashboard/antenatal-visits`)

#### Recent ANC Visits
```sql
SELECT 
    antenatal_visit_id,
    patient_id,
    antenatal_registration_id,
    visit_date,
    gestation_weeks,
    blood_pressure,
    weight_kg,
    next_visit_date,
    region,
    district,
    sub_district,
    community
FROM antenatal_visits
WHERE 1=1
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict)
ORDER BY visit_date DESC
LIMIT $limit OFFSET $offset;
```

#### Visits This Month
```sql
SELECT COUNT(*) as visits_this_month
FROM antenatal_visits
WHERE DATE_TRUNC('month', visit_date) = DATE_TRUNC('month', CURRENT_DATE)
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict);
```

#### Upcoming Appointments (Next Visit Dates)
```sql
SELECT COUNT(*) as upcoming_appointments
FROM antenatal_visits
WHERE next_visit_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict);
```

### 4. Case Files (Referrals) Statistics (`GET /api/dashboard/case-files`)

#### Recent Cases
```sql
SELECT 
    case_file_id,
    patient_id,
    priority_level,
    status,
    date_created,
    region,
    district,
    sub_district,
    community,
    referral_reason_notes,
    facility_referred_to
FROM case_files
WHERE 1=1
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict)
ORDER BY date_created DESC
LIMIT $limit OFFSET $offset;
```

#### Cases by Status
```sql
SELECT 
    status,
    COUNT(*) as count
FROM case_files
WHERE 1=1
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict)
GROUP BY status;
```

#### High Risk Patients
```sql
SELECT COUNT(*) as high_risk_patients
FROM case_files
WHERE priority_level = 'high'
  AND status = 'open'
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict);
```

### 5. Kit Distribution Statistics (`GET /api/dashboard/kit-distribution`)

#### Kit Distribution Records
```sql
SELECT 
    distro_id,
    quantity,
    vol_user_id,
    adm_user_id,
    vol_user_confirm,
    adm_user_confirm,
    distro_date,
    region,
    district,
    sub_district,
    community
FROM kit_distro_log
WHERE 1=1
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict)
ORDER BY distro_date DESC
LIMIT $limit OFFSET $offset;
```

#### Total Kits Distributed
```sql
SELECT SUM(quantity) as total_kits_distributed
FROM kit_distro_log
WHERE vol_user_confirm = true 
  AND adm_user_confirm = true
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict);
```

### 6. Kit Usage Statistics (`GET /api/dashboard/kit-usage`)

#### Kit Usage Records
```sql
SELECT 
    kit_id,
    user_id,
    recipient_name,
    recipient_phone,
    lat,
    lng,
    result,
    usage_date,
    region,
    district,
    sub_district,
    community
FROM kit_usage_log
WHERE 1=1
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict)
ORDER BY usage_date DESC
LIMIT $limit OFFSET $offset;
```

#### Kit Usage by Result
```sql
SELECT 
    result,
    COUNT(*) as count
FROM kit_usage_log
WHERE 1=1
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict)
GROUP BY result;
```

### 7. Geographic Distribution (`GET /api/dashboard/geographic-distribution`)

#### Patient Distribution by Region/District
```sql
SELECT 
    region,
    district,
    COUNT(*) as patient_count
FROM patient_bio
WHERE 1=1
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict)
GROUP BY region, district
ORDER BY patient_count DESC;
```

### 8. Monthly Trends (`GET /api/dashboard/monthly-trends`)

#### Combined Monthly Statistics
```sql
WITH monthly_patients AS (
    SELECT 
        DATE_TRUNC('month', registration_date) as month,
        COUNT(*) as patients
    FROM patient_bio
    WHERE registration_date >= CURRENT_DATE - INTERVAL '12 months'
      AND ($region IS NULL OR region = $region)
      AND ($district IS NULL OR district = $district)
      AND ($subdistrict IS NULL OR sub_district = $subdistrict)
    GROUP BY DATE_TRUNC('month', registration_date)
),
monthly_anc AS (
    SELECT 
        DATE_TRUNC('month', registration_date) as month,
        COUNT(*) as anc_registrations
    FROM antenatal_registration
    WHERE registration_date >= CURRENT_DATE - INTERVAL '12 months'
      AND ($region IS NULL OR region = $region)
      AND ($district IS NULL OR district = $district)
      AND ($subdistrict IS NULL OR sub_district = $subdistrict)
    GROUP BY DATE_TRUNC('month', registration_date)
),
monthly_visits AS (
    SELECT 
        DATE_TRUNC('month', visit_date) as month,
        COUNT(*) as visits
    FROM antenatal_visits
    WHERE visit_date >= CURRENT_DATE - INTERVAL '12 months'
      AND ($region IS NULL OR region = $region)
      AND ($district IS NULL OR district = $district)
      AND ($subdistrict IS NULL OR sub_district = $subdistrict)
    GROUP BY DATE_TRUNC('month', visit_date)
),
monthly_referrals AS (
    SELECT 
        DATE_TRUNC('month', date_created) as month,
        COUNT(*) as referrals
    FROM case_files
    WHERE date_created >= CURRENT_DATE - INTERVAL '12 months'
      AND ($region IS NULL OR region = $region)
      AND ($district IS NULL OR district = $district)
      AND ($subdistrict IS NULL OR sub_district = $subdistrict)
    GROUP BY DATE_TRUNC('month', date_created)
),
monthly_kit_usage AS (
    SELECT 
        DATE_TRUNC('month', usage_date) as month,
        COUNT(*) as kits_used
    FROM kit_usage_log
    WHERE usage_date >= CURRENT_DATE - INTERVAL '12 months'
      AND ($region IS NULL OR region = $region)
      AND ($district IS NULL OR district = $district)
      AND ($subdistrict IS NULL OR sub_district = $subdistrict)
    GROUP BY DATE_TRUNC('month', usage_date)
)
SELECT 
    TO_CHAR(COALESCE(mp.month, ma.month, mv.month, mr.month, mku.month), 'Mon') as month,
    COALESCE(mp.patients, 0) as patients,
    COALESCE(ma.anc_registrations, 0) as anc_registrations,
    COALESCE(mv.visits, 0) as visits,
    COALESCE(mr.referrals, 0) as referrals,
    COALESCE(mku.kits_used, 0) as kits_used
FROM monthly_patients mp
FULL OUTER JOIN monthly_anc ma ON mp.month = ma.month
FULL OUTER JOIN monthly_visits mv ON COALESCE(mp.month, ma.month) = mv.month
FULL OUTER JOIN monthly_referrals mr ON COALESCE(mp.month, ma.month, mv.month) = mr.month
FULL OUTER JOIN monthly_kit_usage mku ON COALESCE(mp.month, ma.month, mv.month, mr.month) = mku.month
ORDER BY COALESCE(mp.month, ma.month, mv.month, mr.month, mku.month);
```
```

### 9. Advanced Analytics Endpoints

#### Age Distribution (`GET /api/dashboard/age-distribution`)
```sql
SELECT 
    CASE 
        WHEN (EXTRACT(YEAR FROM CURRENT_DATE) - year_of_birth) < 20 THEN 'Under 20'
        WHEN (EXTRACT(YEAR FROM CURRENT_DATE) - year_of_birth) < 25 THEN '20-24'
        WHEN (EXTRACT(YEAR FROM CURRENT_DATE) - year_of_birth) < 30 THEN '25-29'
        WHEN (EXTRACT(YEAR FROM CURRENT_DATE) - year_of_birth) < 35 THEN '30-34'
        ELSE '35+'
    END as age_group,
    COUNT(*) as count
FROM patient_bio
WHERE 1=1
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict)
GROUP BY age_group
ORDER BY 
    CASE age_group
        WHEN 'Under 20' THEN 1
        WHEN '20-24' THEN 2
        WHEN '25-29' THEN 3
        WHEN '30-34' THEN 4
        WHEN '35+' THEN 5
    END;
```

#### Insurance Coverage Distribution (`GET /api/dashboard/insurance-coverage`)
```sql
SELECT 
    COALESCE(insurance_status, 'unknown') as status,
    COUNT(*) as count
FROM patient_bio
WHERE 1=1
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict)
GROUP BY insurance_status;
```

#### Risk Level Distribution (`GET /api/dashboard/risk-distribution`)
```sql
SELECT 
    priority_level,
    COUNT(*) as count
FROM case_files
WHERE 1=1
  AND ($region IS NULL OR region = $region)
  AND ($district IS NULL OR district = $district)
  AND ($subdistrict IS NULL OR sub_district = $subdistrict)
GROUP BY priority_level;
```

#### ANC Performance Metrics (`GET /api/dashboard/anc-performance`)
```sql
WITH anc_stats AS (
    SELECT 
        COUNT(DISTINCT ar.antenatal_registration_id) as total_registrations,
        COUNT(DISTINCT av.antenatal_visit_id) as total_visits,
        AVG(ar.gestation_weeks) as avg_gestation_at_registration,
        COUNT(CASE WHEN ar.gestation_weeks <= 12 THEN 1 END) as first_trimester_registrations,
        COUNT(CASE WHEN ar.gestation_weeks BETWEEN 13 AND 24 THEN 1 END) as second_trimester_registrations,
        COUNT(CASE WHEN ar.gestation_weeks >= 25 THEN 1 END) as third_trimester_registrations
    FROM antenatal_registration ar
    LEFT JOIN antenatal_visits av ON ar.antenatal_registration_id = av.antenatal_registration_id
    WHERE 1=1
      AND ($region IS NULL OR ar.region = $region)
      AND ($district IS NULL OR ar.district = $district)
      AND ($subdistrict IS NULL OR ar.sub_district = $subdistrict)
),
visit_frequency AS (
    SELECT 
        patient_id,
        COUNT(*) as visit_count
    FROM antenatal_visits
    WHERE 1=1
      AND ($region IS NULL OR region = $region)
      AND ($district IS NULL OR district = $district)
      AND ($subdistrict IS NULL OR sub_district = $subdistrict)
    GROUP BY patient_id
)
SELECT 
    total_registrations,
    total_visits,
    ROUND(avg_gestation_at_registration, 1) as avg_gestation_at_registration,
    ROUND((total_visits::float / NULLIF(total_registrations, 0)) * 100, 1) as completion_rate,
    first_trimester_registrations,
    second_trimester_registrations,
    third_trimester_registrations,
    (SELECT COUNT(*) FROM visit_frequency WHERE visit_count = 1) as single_visit_patients,
    (SELECT COUNT(*) FROM visit_frequency WHERE visit_count = 2) as two_visit_patients,
    (SELECT COUNT(*) FROM visit_frequency WHERE visit_count = 3) as three_visit_patients,
    (SELECT COUNT(*) FROM visit_frequency WHERE visit_count >= 4) as four_plus_visit_patients
FROM anc_stats;
```

#### Kit Performance Metrics (`GET /api/dashboard/kit-performance`)
```sql
WITH kit_stats AS (
    SELECT 
        SUM(quantity) as total_distributed,
        COUNT(DISTINCT distro_id) as distribution_events,
        COUNT(CASE WHEN vol_user_confirm AND adm_user_confirm THEN 1 END) as confirmed_distributions
    FROM kit_distro_log
    WHERE 1=1
      AND ($region IS NULL OR region = $region)
      AND ($district IS NULL OR district = $district)
      AND ($subdistrict IS NULL OR sub_district = $subdistrict)
),
usage_stats AS (
    SELECT 
        COUNT(*) as total_used,
        COUNT(CASE WHEN result = 'positive' THEN 1 END) as positive_results,
        COUNT(CASE WHEN result = 'negative' THEN 1 END) as negative_results,
        COUNT(DISTINCT user_id) as active_volunteers
    FROM kit_usage_log
    WHERE 1=1
      AND ($region IS NULL OR region = $region)
      AND ($district IS NULL OR district = $district)
      AND ($subdistrict IS NULL OR sub_district = $subdistrict)
)
SELECT 
    k.total_distributed,
    k.distribution_events,
    k.confirmed_distributions,
    u.total_used,
    u.positive_results,
    u.negative_results,
    u.active_volunteers,
    ROUND((u.total_used::float / NULLIF(k.total_distributed, 0)) * 100, 1) as utilization_rate,
    ROUND((u.positive_results::float / NULLIF(u.total_used, 0)) * 100, 1) as positive_rate
FROM kit_stats k, usage_stats u;
```

#### Volunteer Performance (`GET /api/dashboard/volunteer-performance`)
```sql
WITH volunteer_stats AS (
    SELECT 
        vol_user_id,
        COUNT(*) as distributions_received,
        SUM(quantity) as total_kits_received,
        COUNT(CASE WHEN vol_user_confirm THEN 1 END) as confirmed_receipts,
        MAX(distro_date) as last_distribution_date
    FROM kit_distro_log
    WHERE 1=1
      AND ($region IS NULL OR region = $region)
      AND ($district IS NULL OR district = $district)
      AND ($subdistrict IS NULL OR sub_district = $subdistrict)
    GROUP BY vol_user_id
),
usage_by_volunteer AS (
    SELECT 
        user_id,
        COUNT(*) as kits_used,
        COUNT(CASE WHEN result = 'positive' THEN 1 END) as positive_tests
    FROM kit_usage_log
    WHERE 1=1
      AND ($region IS NULL OR region = $region)
      AND ($district IS NULL OR district = $district)
      AND ($subdistrict IS NULL OR sub_district = $subdistrict)
    GROUP BY user_id
)
SELECT 
    vs.vol_user_id,
    vs.distributions_received,
    vs.total_kits_received,
    vs.confirmed_receipts,
    vs.last_distribution_date,
    COALESCE(uv.kits_used, 0) as kits_used,
    COALESCE(uv.positive_tests, 0) as positive_tests,
    ROUND((vs.confirmed_receipts::float / NULLIF(vs.distributions_received, 0)) * 100, 1) as confirmation_rate,
    ROUND((COALESCE(uv.kits_used, 0)::float / NULLIF(vs.total_kits_received, 0)) * 100, 1) as usage_rate
FROM volunteer_stats vs
LEFT JOIN usage_by_volunteer uv ON vs.vol_user_id = uv.user_id
ORDER BY vs.total_kits_received DESC
LIMIT 20;
```

#### Regional Performance Comparison (`GET /api/dashboard/regional-performance`)
```sql
WITH regional_stats AS (
    SELECT 
        region,
        district,
        COUNT(DISTINCT pb.patient_id) as total_patients,
        COUNT(DISTINCT ar.antenatal_registration_id) as anc_registrations,
        COUNT(DISTINCT av.antenatal_visit_id) as anc_visits,
        COUNT(DISTINCT cf.case_file_id) as referral_cases,
        COUNT(CASE WHEN cf.priority_level = 'high' THEN 1 END) as high_risk_cases,
        COALESCE(SUM(kdl.quantity), 0) as kits_distributed,
        COUNT(DISTINCT kul.kit_id) as kits_used
    FROM patient_bio pb
    LEFT JOIN antenatal_registration ar ON pb.patient_id = ar.patient_id
    LEFT JOIN antenatal_visits av ON ar.antenatal_registration_id = av.antenatal_registration_id
    LEFT JOIN case_files cf ON pb.patient_id = cf.patient_id
    LEFT JOIN kit_distro_log kdl ON pb.region = kdl.region AND pb.district = kdl.district
    LEFT JOIN kit_usage_log kul ON pb.region = kul.region AND pb.district = kul.district
    WHERE 1=1
      AND ($region IS NULL OR pb.region = $region)
      AND ($district IS NULL OR pb.district = $district)
    GROUP BY region, district
)
SELECT 
    region,
    district,
    total_patients,
    anc_registrations,
    anc_visits,
    referral_cases,
    high_risk_cases,
    kits_distributed,
    kits_used,
    ROUND((anc_registrations::float / NULLIF(total_patients, 0)) * 100, 1) as anc_coverage_rate,
    ROUND((anc_visits::float / NULLIF(anc_registrations, 0)) * 100, 1) as visit_completion_rate,
    ROUND((referral_cases::float / NULLIF(total_patients, 0)) * 100, 1) as referral_rate,
    ROUND((high_risk_cases::float / NULLIF(referral_cases, 0)) * 100, 1) as high_risk_rate,
    ROUND((kits_used::float / NULLIF(kits_distributed, 0)) * 100, 1) as kit_utilization_rate
FROM regional_stats
ORDER BY total_patients DESC;
```

### Access Level Filtering

The dashboard automatically applies access level filtering based on the user's permissions:

1. **Community Level (0)**: See only data from their specific community
2. **Subdistrict Level (1)**: See data from their subdistrict and all communities within it
3. **District Level (2)**: See data from their district and all subdistricts/communities within it
4. **Region Level (3)**: See data from their region and all districts/subdistricts/communities within it
5. **National Level (4)**: See all data

### Parameter Binding

All queries use parameterized statements to prevent SQL injection:
- `$region` - Region filter (nullable)
- `$district` - District filter (nullable)
- `$subdistrict` - Subdistrict filter (nullable)
- `$limit` - Pagination limit
- `$offset` - Pagination offset

### API Response Format

Each endpoint should return data in this format:
```json
{
  "data": [...],
  "meta": {
    "total": 123,
    "page": 1,
    "limit": 50,
    "filtered": true,
    "filter_level": "district"
  }
}
```

### Error Handling

- Return appropriate HTTP status codes
- Handle database connection errors gracefully
- Validate input parameters
- Log errors for debugging

### Performance Considerations

1. Add indexes on frequently queried columns:
   - `patient_bio(region, district, sub_district)`
   - `antenatal_registration(region, district, registration_date)`
   - `antenatal_visits(region, district, visit_date)`
   - `case_files(region, district, status, priority_level)`
   - `kit_distro_log(region, district, distro_date)`
   - `kit_usage_log(region, district, usage_date)`

2. Consider caching for frequently accessed statistics
3. Use connection pooling for database connections
4. Implement query timeouts

### Testing

Test each endpoint with:
1. Different access levels
2. Various filter combinations
3. Edge cases (empty results, invalid parameters)
4. Performance with large datasets

This implementation provides a comprehensive dashboard that tracks the key metrics for the ENCOMPAS project while respecting user access levels and providing real-time insights into project performance.
