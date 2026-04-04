# Access Level Filtering System Usage Guide

This guide explains how to implement and use the access level filtering system in your components.

## Overview

The access level filtering system provides client-side data filtering based on user access levels and geographic location. It ensures users only see data they have permission to access.

## Quick Start

### 1. Basic Hook Usage

```typescript
import { useAccessLevelFilter } from '@/hooks/useAccessLevelFilter';

const MyComponent = () => {
  const { filterByAccessLevel } = useAccessLevelFilter();
  
  // Your data must have location fields: region, district, subdistrict, community_name
  const myData = [
    { id: 1, name: "Item 1", region: "Greater Accra", district: "Accra Metropolitan", community_name: "Osu" },
    { id: 2, name: "Item 2", region: "Ashanti", district: "Kumasi Metropolitan", community_name: "Adum" }
  ];
  
  const filteredData = filterByAccessLevel(myData);
  
  return (
    <div>
      {filteredData.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

### 2. Higher-Order Component (HOC) Usage

For components that display lists of data with visual feedback:

```typescript
import { WithAccessFilter } from '@/components/WithAccessFilter';

const MyDataComponent = ({ data }) => (
  <WithAccessFilter data={data} emptyMessage="No accessible data found">
    {(filteredData, filterInfo) => (
      <div>
        {filterInfo.hasActiveFilter && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
            Showing data accessible at {filterInfo.scope} level
          </div>
        )}
        {filteredData.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
    )}
  </WithAccessFilter>
);
```

### 3. Enhanced API Hook Usage

For automatic filtering of API responses:

```typescript
import { useFilteredApi } from '@/hooks/useFilteredApi';

const MyComponent = () => {
  const { data, loading, error, filterInfo } = useFilteredApi('/api/cases');
  
  return (
    <div>
      {filterInfo.hasActiveFilter && (
        <div className="filter-indicator">
          Filtered to {filterInfo.scope} level ({filterInfo.originalCount - filterInfo.filteredCount} items hidden)
        </div>
      )}
      {data?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

## Data Structure Requirements

Your data objects must include location fields for filtering to work:

```typescript
interface FilterableData {
  // Primary location fields (recommended)
  region?: string;
  district?: string;
  subdistrict?: string;
  community_name?: string;
  
  // Alternative field names (for compatibility)
  Region?: string;
  District?: string;
  Subdistrict?: string;
  Community?: string;
  location?: string;
  area?: string;
}
```

## Access Level Hierarchy

The system uses a 5-tier geographic hierarchy:

1. **COMMUNITY (0)** - Lowest level, most restrictive
2. **SUBDISTRICT (1)** - Can see community + subdistrict data
3. **DISTRICT (2)** - Can see community + subdistrict + district data
4. **REGION (3)** - Can see all data in their region
5. **NATIONAL (4)** - Can see all data (no filtering)

## Real-World Example: Dashboard Implementation

See `src/pages/Dashboard.tsx` for a complete example that shows:

- Using `useAccessLevelFilter` hook
- Combining manual filters with access level filters
- Filtering both chart data and table data
- Proper data structure with location fields

Key parts of the implementation:

```typescript
const Dashboard = () => {
  const { filterByAccessLevel } = useAccessLevelFilter();
  
  // Apply manual filters first, then access level filters
  const manuallyFilteredCases = mockRecentCases.filter(c => 
    (selectedRegion === "All Regions" || c.region === selectedRegion) &&
    (selectedDistrict === "All Districts" || c.district === selectedDistrict)
  );
  const filteredCases = filterByAccessLevel(manuallyFilteredCases);
  
  // Same for chart data
  const manuallyFilteredChartData = mockChartData.filter(/* manual filters */);
  const filteredChartData = filterByAccessLevel(manuallyFilteredChartData);
  
  // Use filtered data in your components
  return (
    <div>
      <Chart data={filteredChartData} />
      <Table data={filteredCases} />
    </div>
  );
};
```

## Migration Guide

### Updating Existing Components

1. **Identify data that needs filtering**: Look for components that display location-based data
2. **Add location fields**: Ensure your data includes region, district, subdistrict, community_name
3. **Replace manual filtering**: 
   ```typescript
   // Before
   const data = useApi('/api/data');
   
   // After
   const data = useFilteredApi('/api/data');
   ```
4. **Add visual feedback**: Use `WithAccessFilter` for components that display lists

### Common Patterns

#### Pattern 1: Simple List Component
```typescript
// Before
const { data } = useApi('/api/items');

// After
const { data } = useFilteredApi('/api/items');
```

#### Pattern 2: Complex Component with Multiple Data Sources
```typescript
const { filterByAccessLevel } = useAccessLevelFilter();
const cases = filterByAccessLevel(useApi('/api/cases').data || []);
const appointments = filterByAccessLevel(useApi('/api/appointments').data || []);
```

#### Pattern 3: Component with Search/Filter
```typescript
const { filterByAccessLevel } = useAccessLevelFilter();
const { data: rawData } = useApi('/api/data');

const filteredData = useMemo(() => {
  let result = rawData || [];
  
  // Apply search filter
  if (searchTerm) {
    result = result.filter(item => item.name.includes(searchTerm));
  }
  
  // Apply access level filter last
  return filterByAccessLevel(result);
}, [rawData, searchTerm, filterByAccessLevel]);
```

## Global Filter Indicator

The `FilterIndicator` component in the main layout shows users when data is being filtered based on their access level. This provides transparency about what data they can and cannot see.

## Performance Considerations

- Filtering is done in memory, so it's efficient for reasonably sized datasets
- Use `useMemo` for expensive filtering operations
- The `filterByAccessLevel` function is memoized and will not re-run unnecessarily

## Troubleshooting

### Data Not Being Filtered
- Check that your data objects include the required location fields
- Verify field names match the expected format (region, district, subdistrict, community_name)
- Ensure user has the required location information in their profile

### FilterIndicator Not Showing
- Make sure the user has an access level other than NATIONAL
- Check that the user has location information (region, district, etc.)
- Verify the FilterIndicator is imported in MainLayout

### TypeScript Errors
- Ensure your data objects extend the `FilterableData` interface
- Use proper generic types when calling `filterByAccessLevel<YourDataType>(data)`

## Best Practices

1. **Always filter after other operations**: Apply access level filtering as the last step
2. **Provide visual feedback**: Use `WithAccessFilter` or custom indicators to show when filtering is active
3. **Handle empty states**: Show appropriate messages when filtering results in empty datasets
4. **Test with different user types**: Verify filtering works correctly for all access levels
5. **Combine with existing filters**: Access level filtering should work alongside search, sort, and other filters
