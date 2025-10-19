# Patient Snapshot Filter Fix

## Issue
Patient Snapshot filters (search, priority, ANC status) were only working on the current page of data, not across the entire dataset. This meant:
- Searching for a patient would only find matches on the current page
- Filtering by priority status would only filter visible patients
- Pagination would reset filters unintentionally

## Root Cause
The application was using **server-side pagination** where:
1. API fetched only a subset of patients (paginated)
2. Filters were applied to this subset
3. Changing pages would fetch a new subset, losing filter context

## Solution
Refactored to use **client-side filtering and pagination**:

1. **Fetch all patients once** - Get complete dataset from API
2. **Store in `allPatients` state** - Keep full dataset in memory
3. **Apply filters to all patients** - Filter the complete dataset
4. **Paginate filtered results** - Show current page from filtered data

## Implementation Details

### State Changes
**Before:**
```typescript
const [patients, setPatients] = useState<PatientSummary[]>([]);
const [totalPages, setTotalPages] = useState<number>(0);
const [totalItems, setTotalItems] = useState<number>(0);
```

**After:**
```typescript
const [allPatients, setAllPatients] = useState<PatientSummary[]>([]);
// totalPages and totalItems removed - calculated from filtered data
```

### Fetch Function Changes
**Before:**
```typescript
const fetchPatients = useCallback(async (page: number = 1, limit: number = 12) => {
  // Fetch paginated subset of patients
  const paginatedIds = patientIds.slice(startIndex, endIndex);
  // Get summaries for current page only
  const response = await request({
    method: 'POST',
    path: 'patients/summary',
    body: { patient_ids: paginatedIds }
  });
  setPatients(summaries);
  setTotalPages(calculatedTotalPages);
  setTotalItems(totalPatientsCount);
}, [request, toast, user]);
```

**After:**
```typescript
const fetchPatients = useCallback(async (page: number = 1) => {
  // Fetch ALL patient summaries at once (no API-level pagination)
  const response = await request({
    method: 'POST',
    path: 'patients/summary',
    body: { patient_ids: patientIds } // All IDs
  });
  
  // Store complete dataset
  setAllPatients(summaries);
  
  // Calculate overall statistics from all patients
  setOverallStats({
    total: summaries.length,
    overdue: summaries.filter(s => s.priority_status === 'overdue').length,
    // ... other stats
  });
}, [request, toast, user]);
```

### Filtering Logic
**Before:**
```typescript
const filteredPatients = useMemo(() => {
  return patients.filter(patient => {
    // Filter current page only
  });
}, [patients, searchTerm, priorityFilter, ancStatusFilter]);
```

**After:**
```typescript
const filteredPatients = useMemo(() => {
  return allPatients.filter((patient: PatientSummary) => {
    // Filter ALL patients, not just current page
    const matchesSearch = !searchTerm || /* search logic */;
    const matchesPriority = priorityFilter === 'all' || /* priority logic */;
    const matchesAncStatus = ancStatusFilter === 'all' || /* ANC logic */;
    return matchesSearch && matchesPriority && matchesAncStatus;
  });
}, [allPatients, searchTerm, priorityFilter, ancStatusFilter]);
```

### Pagination Logic
**New approach - paginate AFTER filtering:**
```typescript
const { paginatedPatients, totalPages } = useMemo(() => {
  const total = filteredPatients.length;
  const pages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginated = filteredPatients.slice(startIndex, endIndex);
  
  return { 
    paginatedPatients: paginated,
    totalPages: pages
  };
}, [filteredPatients, currentPage, pageSize]);
```

### Page Change Handlers
**Before:**
```typescript
const handlePageChange = (page: number) => {
  setCurrentPage(page);
  fetchPatients(page, pageSize); // Refetch data
};

const handlePageSizeChange = (newPageSize: number) => {
  setPageSize(newPageSize);
  setCurrentPage(1);
  fetchPatients(1, newPageSize); // Refetch data
};
```

**After:**
```typescript
const handlePageChange = (page: number) => {
  setCurrentPage(page); // Just update page number, no refetch
};

const handlePageSizeChange = (newPageSize: number) => {
  setPageSize(newPageSize);
  setCurrentPage(1); // Reset to first page, no refetch
};
```

### Display Logic
**Before:**
```typescript
{filteredPatients.map((patient) => (
  <PatientSnapshotCard patient={patient} />
))}
```

**After:**
```typescript
{paginatedPatients.map((patient: PatientSummary) => (
  <PatientSnapshotCard patient={patient} />
))}
```

### Pagination Controls
**Before:**
```typescript
<PaginationControls
  totalItems={totalItems} // From API response
  totalPages={totalPages} // From API response
/>
```

**After:**
```typescript
<PaginationControls
  totalItems={filteredPatients.length} // From filtered data
  totalPages={totalPages} // Calculated from filtered data
/>
```

## Benefits

### 1. Consistent Filtering
- Filters now work across the entire dataset
- Search finds patients on any page
- Priority/ANC filters show all matching patients

### 2. Better User Experience
- No unexpected results when changing pages
- Filter results persist across pagination
- Clear indication of total matches vs total patients

### 3. Simplified Logic
- No need to sync pagination state with API
- Filtering and pagination are decoupled
- Easier to debug and maintain

### 4. Performance Considerations
- **Single API call** on load instead of one per page change
- Client-side filtering is fast for reasonable dataset sizes
- Statistics calculated once, not per page

## Trade-offs

### Memory Usage
- **Before:** Only one page of patients in memory (~12 records)
- **After:** All accessible patients in memory (~hundreds to thousands)
- **Mitigation:** Modern browsers handle this easily; React renders only current page

### Initial Load Time
- **Before:** Fast initial load (only one page)
- **After:** Slightly slower (loads all patients)
- **Mitigation:** Users see loading state; subsequent interactions are instant

### Scalability
- Works well for datasets up to ~10,000 patients
- For larger datasets, consider:
  - Server-side filtering with search parameters
  - Virtual scrolling instead of pagination
  - Progressive loading strategies

## Testing Checklist

- [x] Search across all pages works correctly
- [x] Priority filter shows all matching patients
- [x] ANC status filter works across pages
- [x] Pagination updates correctly after filtering
- [x] Statistics show accurate overall totals
- [x] Page size changes work without refetching
- [x] Clear filters button resets to all patients
- [x] Loading state displays correctly
- [x] Empty states show appropriate messages

## Files Modified

1. **`/src/pages/PatientSnapshot.tsx`**
   - Changed state from `patients` to `allPatients`
   - Removed `totalPages` and `totalItems` state
   - Updated `fetchPatients` to get all patients at once
   - Refactored `filteredPatients` to filter complete dataset
   - Added `paginatedPatients` useMemo for pagination
   - Updated all handlers to work without refetching
   - Updated JSX to use `paginatedPatients` for display

## Verification

To verify the fix works:

1. **Cross-page search:**
   - Note the name of a patient on page 2 or 3
   - Go back to page 1
   - Search for that patient's name
   - ✅ Should find and display the patient

2. **Filter persistence:**
   - Apply a priority filter (e.g., "Overdue")
   - Navigate through pages
   - ✅ Should only show overdue patients on all pages

3. **Statistics accuracy:**
   - Note the "OVERALL STATISTICS" numbers
   - Apply filters and check filtered count
   - ✅ Overall stats should remain constant, filtered count should change

4. **Performance:**
   - Load the page and note initial load time
   - Change pages multiple times
   - ✅ Page changes should be instant (no loading spinner)

## Next Steps (Optional Enhancements)

1. **Debounced Search:** Add debouncing to search input for better performance
2. **URL State:** Persist filters in URL query parameters
3. **Sort Options:** Add ability to sort by name, priority, etc.
4. **Export Filtered:** Allow exporting filtered patient list
5. **Advanced Filters:** Add date range, location, or other filters

---

**Date:** 2025-01-XX  
**Issue:** Filters only worked on current page  
**Solution:** Client-side filtering with server-side data fetch  
**Status:** ✅ Complete and tested
