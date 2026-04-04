# Patient Snapshot - Fixed Misleading Statistics

## Issue Identified
The Patient Snapshot page was showing statistics (Total Patients: 25, Overdue: 5, etc.) at the top that appeared to be overall totals, but they were actually **only for the current page** of paginated data. This was misleading to users who thought they were seeing system-wide statistics.

### The Problem
- Page shows 25 patients per page (pagination)
- Statistics showed counts for those 25 patients only
- Users thought "Total Patients: 25" was the overall total
- No clear indication that stats were page-specific

## Solution Implemented

### 1. Fetch ALL Patient Summaries for Statistics
Updated the `fetchPatients` function to make **two API calls**:
1. **Paginated summaries** - for displaying the current page of patient cards
2. **All summaries** - for calculating accurate overall statistics

```typescript
// Fetch ALL summaries for overall statistics (in background)
const allSummariesRequest = {
  patient_ids: patientIds, // All IDs, not just paginated
};

const allSummariesResponse = await request({
  method: 'POST',
  path: 'patients/summary',
  body: allSummariesRequest,
});

// Calculate overall stats from ALL patients
const allOverdue = allRawSummaries.filter(s => {
  const priority = toPriorityStatus(s.priority, s.overdue_days, s.next_visit_date);
  return priority === 'overdue';
}).length;
// ... (similar for dueSoon, onTrack, ancRegistered)

setOverallStats({
  total: totalPatientsCount,
  overdue: allOverdue,
  dueSoon: allDueSoon,
  onTrack: allOnTrack,
  ancRegistered: allAncRegistered
});
```

### 2. Added State for Overall Statistics
```typescript
const [overallStats, setOverallStats] = useState({
  total: 0,
  overdue: 0,
  dueSoon: 0,
  onTrack: 0,
  ancRegistered: 0
});
```

### 3. Updated UI with Clear Label
Added a clear heading above the statistics to indicate they represent the entire dataset:

```tsx
<h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
  Overall Statistics - All Patients
</h2>
```

### 4. Display Overall Stats
Changed the statistics cards to use `overallStats` instead of the previous page-only calculation.

## Result

### Before:
```
[Statistics Cards]
Total Patients: 25  ← Misleading! Only current page
Overdue: 5
Due Soon: 1
...

[Patient cards showing 25 patients]
Page 1 of 8  ← Contradicts the "25 total" above
```

### After:
```
OVERALL STATISTICS - ALL PATIENTS
[Statistics Cards]
Total Patients: 200  ← Clear! All patients across all pages
Overdue: 45
Due Soon: 12
...

[Patient cards showing 25 patients]
Page 1 of 8  ← Now makes sense!
```

## Performance Consideration

**Why this approach is acceptable:**
1. The snapshot already loads all patient IDs for pagination
2. The summary endpoint is optimized for batch requests
3. Stats are calculated once per page load, not on every filter
4. Users expect accurate overall statistics for decision-making

**Alternative considered but not chosen:**
- Show page-specific stats: Rejected because users need overall picture
- Cache stats separately: Over-engineered for current scale
- Server-side aggregation: Would require backend API changes

## User Experience Improvement

✅ **Clear labeling** - "OVERALL STATISTICS - ALL PATIENTS" heading
✅ **Accurate counts** - Statistics reflect entire dataset, not just current page
✅ **Consistent** - Total Patients count matches pagination context (e.g., "Page 1 of 8" for 200 patients)
✅ **Trustworthy** - Users can rely on these numbers for program management decisions

## Files Modified
- `/src/pages/PatientSnapshot.tsx` - Updated statistics calculation and display

## Testing Checklist
✅ Verify statistics show total across all pages, not just current page
✅ Check that "Total Patients" matches expected full dataset count
✅ Confirm pagination still works correctly
✅ Test with different page sizes
✅ Verify statistics update when data changes
✅ Check performance with large datasets (1000+ patients)

## Key Benefit
Users now see **accurate, system-wide statistics** at the top of the Patient Snapshot, making it a reliable tool for monitoring program health and identifying patients who need attention!
