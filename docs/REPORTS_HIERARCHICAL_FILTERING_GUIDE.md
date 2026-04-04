# Reports Hierarchical Filtering Guide

## Overview
The Reports page filtering system has been refactored to provide a simpler, hierarchical filtering experience based on user access levels. Users now choose **what level** they want to filter by (Region, District, or Subdistrict), and then select from **only the options available at their access level**.

## Problem Solved
**Before:** Users saw all three filter dropdowns (Region, District, Subdistrict) at once, which was:
- Confusing (which one should I use?)
- Showed options the user couldn't actually access
- Required cascading logic across multiple selects

**After:** Users:
1. Choose their filter level (Region, District, or Subdistrict)
2. See only one dropdown with options they can actually access
3. Get a simpler, more intuitive filtering experience

## Access Level Hierarchy

### Access Levels (from lowest to highest)
```
0 - COMMUNITY      (Can see: Only their community data)
1 - SUBDISTRICT    (Can see: Their subdistrict data)
2 - DISTRICT       (Can see: Their district data, can filter by subdistrict)
3 - REGION         (Can see: Their region data, can filter by district or subdistrict)
4 - NATIONAL       (Can see: All data, can filter by region, district, or subdistrict)
```

### Filter Availability by Access Level

| User Access Level | Can Filter By | Description |
|------------------|---------------|-------------|
| **NATIONAL (4)** | Region, District, Subdistrict | Can filter at any level across all locations |
| **REGION (3)** | District, Subdistrict | Can filter districts/subdistricts within their region |
| **DISTRICT (2)** | Subdistrict | Can filter subdistricts within their district |
| **SUBDISTRICT (1)** | None | Already seeing only their subdistrict data |
| **COMMUNITY (0)** | None | Already seeing only their community data |

## Implementation Details

### New State Structure

```typescript
type FilterLevel = 'none' | 'region' | 'district' | 'subdistrict';

const [filterLevel, setFilterLevel] = useState<FilterLevel>('none');
const [selectedRegion, setSelectedRegion] = useState<string>("");
const [selectedDistrict, setSelectedDistrict] = useState<string>("");
const [selectedSubdistrict, setSelectedSubdistrict] = useState<string>("");
```

### Available Filter Levels Logic

```typescript
const availableFilterLevels = useMemo((): FilterLevel[] => {
  const levels: FilterLevel[] = ['none'];
  
  switch (userAccessLevel) {
    case AccessLevel.NATIONAL: // 4
      levels.push('region', 'district', 'subdistrict');
      break;
    case AccessLevel.REGION: // 3
      levels.push('district', 'subdistrict');
      break;
    case AccessLevel.DISTRICT: // 2
      levels.push('subdistrict');
      break;
    case AccessLevel.SUBDISTRICT: // 1
    case AccessLevel.COMMUNITY: // 0
      // No additional filtering needed
      break;
  }
  
  return levels;
}, [userAccessLevel]);
```

### Filtered Options by Access Level

#### Available Regions
- **NATIONAL users:** See all regions
- **REGION users:** See only their region
- **Others:** No region filter available

#### Available Districts
- **NATIONAL users:** See all districts (or filtered by selected region)
- **REGION users:** See districts only in their region
- **DISTRICT users:** See only their district
- **Others:** No district filter available

#### Available Subdistricts
- **NATIONAL users:** See all subdistricts (or filtered by selected district)
- **REGION users:** See subdistricts only in their region
- **DISTRICT users:** See subdistricts only in their district
- **SUBDISTRICT users:** See only their subdistrict (but filter not shown)
- **COMMUNITY users:** No subdistrict filter available

## User Experience Flow

### Example: NATIONAL User
1. Sees "Filter By" dropdown with options: "No Location Filter", "Region", "District", "Subdistrict"
2. Chooses "District"
3. New dropdown appears: "Select District" with all available districts
4. Selects "Wa West"
5. Data filters to show only Wa West district data

### Example: REGION User (Upper West Region)
1. Sees "Filter By" dropdown with options: "No Location Filter", "District", "Subdistrict"
2. Chooses "District"
3. New dropdown appears: "Select District" with only districts in Upper West Region
4. Selects "Wa West"
5. Data filters to show only Wa West district data within Upper West Region

### Example: DISTRICT User (Wa West District)
1. Sees "Filter By" dropdown with options: "No Location Filter", "Subdistrict"
2. Chooses "Subdistrict"
3. New dropdown appears: "Select Subdistrict" with only subdistricts in Wa West District
4. Selects "Gurungu"
5. Data filters to show only Gurungu subdistrict data within Wa West District

### Example: SUBDISTRICT or COMMUNITY User
1. Cannot use location filter (already seeing only their data)
2. Can still use date range filters
3. See their access level displayed: "Subdistrict: Gurungu" or "Community: Busa"

## UI Changes

### Filter Section Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Filters                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐    │
│ │ Start Date  │  │  End Date   │  │   Filter By      │    │
│ └─────────────┘  └─────────────┘  └──────────────────┘    │
│                                                             │
│ ┌──────────────────┐  ┌─────────────────────────────┐     │
│ │ Select District  │  │  Your Access Level          │     │
│ │ (or Region, or   │  │  Region: Upper West         │     │
│ │  Subdistrict)    │  └─────────────────────────────┘     │
│ └──────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Conditional Rendering
Only ONE location filter dropdown is shown at a time:
- If "Filter By" = "Region" → Show "Select Region" dropdown
- If "Filter By" = "District" → Show "Select District" dropdown
- If "Filter By" = "Subdistrict" → Show "Select Subdistrict" dropdown
- If "Filter By" = "No Location Filter" → No additional dropdown

## Query String Compatibility

The new system maintains backward compatibility with the API:
```typescript
// Legacy variables still used for API queries
const region = filterLevel === 'region' ? selectedRegion : ALL_REGIONS_LABEL;
const district = filterLevel === 'district' ? selectedDistrict : ALL_DISTRICTS_LABEL;
const subdistrict = filterLevel === 'subdistrict' ? selectedSubdistrict : ALL_SUBDISTRICTS_LABEL;

// API query string generation unchanged
const queryString = useMemo(() => {
  const params = new URLSearchParams();
  if (region !== ALL_REGIONS_LABEL) params.set("region", region);
  if (district !== ALL_DISTRICTS_LABEL) params.set("district", district);
  if (subdistrict !== ALL_SUBDISTRICTS_LABEL) params.set("subdistrict", subdistrict);
  return params.toString();
}, [region, district, subdistrict]);
```

## Applied Filters Display

Shows active filters in a cleaner format:
```typescript
const appliedFilters = useMemo(() => {
  const active: string[] = [];
  if (startDate) active.push(`Start: ${formatDateLabel(startDate)}`);
  if (endDate) active.push(`End: ${formatDateLabel(endDate)}`);
  
  // Show only the active location filter
  if (filterLevel === 'region' && selectedRegion) {
    active.push(`Region: ${selectedRegion}`);
  } else if (filterLevel === 'district' && selectedDistrict) {
    active.push(`District: ${selectedDistrict}`);
  } else if (filterLevel === 'subdistrict' && selectedSubdistrict) {
    active.push(`Subdistrict: ${selectedSubdistrict}`);
  }
  
  return active;
}, [startDate, endDate, filterLevel, selectedRegion, selectedDistrict, selectedSubdistrict]);
```

## Benefits

### 1. Simplified User Experience
- ✅ One decision: "What do I want to filter by?"
- ✅ One dropdown: See only relevant options
- ✅ Clear access level indicator

### 2. Access Control Enforcement
- ✅ Users can only see and filter data they have access to
- ✅ Options automatically filtered by user's location
- ✅ No confusion about unavailable options

### 3. Progressive Disclosure
- ✅ UI adapts to show only what's relevant
- ✅ No empty or disabled dropdowns
- ✅ Clear indication when no filters are available

### 4. Maintainability
- ✅ Centralized access level logic
- ✅ Clear separation of concerns
- ✅ Easy to extend for new filter types

## Testing Scenarios

### Test as NATIONAL User
1. ✅ Can select "Region" and see all regions
2. ✅ Can select "District" and see all districts
3. ✅ Can select "Subdistrict" and see all subdistricts
4. ✅ Each filter correctly limits the data shown

### Test as REGION User (Upper West)
1. ✅ Cannot select "Region" filter
2. ✅ Can select "District" and see only Upper West districts
3. ✅ Can select "Subdistrict" and see only Upper West subdistricts
4. ✅ Data always scoped to Upper West Region

### Test as DISTRICT User (Wa West)
1. ✅ Cannot select "Region" or "District" filters
2. ✅ Can select "Subdistrict" and see only Wa West subdistricts
3. ✅ Data always scoped to Wa West District

### Test as SUBDISTRICT User (Gurungu)
1. ✅ No location filter options available
2. ✅ Can still use date filters
3. ✅ Data always scoped to Gurungu Subdistrict
4. ✅ Access level clearly displayed

### Test as COMMUNITY User (Busa)
1. ✅ No location filter options available
2. ✅ Can still use date filters
3. ✅ Data always scoped to Busa Community
4. ✅ Access level clearly displayed

## Code Files Modified

1. **`/src/pages/Reports.tsx`**
   - Added `FilterLevel` type definition
   - Added hierarchical filter state variables
   - Added `availableFilterLevels` computed property
   - Updated `availableRegions`, `availableDistricts`, `availableSubdistricts` to filter by access level
   - Refactored filter UI to show conditional dropdown
   - Updated `appliedFilters` display logic
   - Removed old auto-selection useEffect
   - Imported `AccessLevel` enum from types

## Future Enhancements

1. **Community-level filtering:** For users with access to multiple communities
2. **Multi-select filters:** Allow filtering by multiple districts at once
3. **Saved filter presets:** Save and restore commonly used filter combinations
4. **URL state persistence:** Save filter state in URL for sharing/bookmarking
5. **Filter summary tooltip:** Show what data is visible at current access level

---

**Date:** January 2025  
**Issue:** Complex, confusing multi-level filter UI  
**Solution:** Hierarchical single-choice filtering based on access level  
**Status:** ✅ Complete and tested
