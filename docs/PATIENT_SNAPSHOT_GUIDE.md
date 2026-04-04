# Patient Snapshot Feature Documentation

## Overview

The Patient Snapshot page provides a comprehensive view of patient status and priorities in an easy-to-grasp card format. This feature enables healthcare workers to quickly identify patients who need immediate attention and take appropriate action.

## Features

### 🎯 **Quick Patient Overview**
- **Mini patient cards** with essential information
- **Color-coded priority status** (overdue, due soon, on track)
- **Visual indicators** for ANC registration and visit status
- **Contact information** readily available

### 📊 **Summary Statistics**
- **Total Patients** - Overall patient count
- **Overdue Patients** - Those requiring immediate attention
- **Due Soon** - Patients with upcoming appointments
- **On Track** - Patients following their care schedule
- **ANC Registered** - Patients enrolled in antenatal care

### 🔍 **Advanced Filtering**
- **Search functionality** - Find patients by name, ID, or phone
- **Priority filtering** - Filter by overdue, due soon, or on track status
- **ANC status filtering** - Show registered vs unregistered patients
- **Clear filter indicators** - Easy to see and remove active filters

### 📄 **Flexible Pagination**
- **Customizable page sizes** - 15, 25, 35, or 50 patients per page
- **Smart pagination controls** - First, previous, next, last navigation
- **Page number display** - Shows current position in results
- **Results summary** - Clear indication of total items and current range

## API Integration

### Endpoint: `/api/patients/summary`
**Method:** POST

### Request Structure
```typescript
interface PatientSummaryRequest {
  patient_ids?: string[];           // Optional: specific patient IDs
  patients?: (string | { patient_id: string })[];  // Alternative format
  page?: number;                    // Page number (default: 1)
  limit?: number;                   // Items per page (default: 25)
}
```

### Response Structure
```typescript
interface PatientSummaryResponse {
  data: PatientSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface PatientSummary {
  patient_id: string;
  name: string;
  othernames?: string;
  dob?: string;
  contact_number?: string;
  patient_code?: string;
  
  // ANC Registration Status
  anc_registered: boolean;
  registration_date?: string;
  next_appointment_date?: string;
  
  // Visit Information
  visits_attended: string[];        // Array of visit dates
  total_visits: number;
  last_visit_date?: string;
  
  // Priority Flags
  priority_status: 'overdue' | 'due_soon' | 'on_track';
  days_overdue?: number;
  days_until_due?: number;
}
```

## Component Architecture

### 📁 **File Structure**
```
src/
├── pages/
│   └── PatientSnapshot.tsx              # Main page component
├── components/
│   └── patient-snapshot/
│       ├── PatientSnapshotCard.tsx      # Individual patient card
│       ├── PaginationControls.tsx       # Pagination component
│       └── SnapshotFilters.tsx          # Search and filter controls
└── types/
    └── index.ts                         # Type definitions
```

### 🧩 **Component Breakdown**

#### PatientSnapshot (Main Page)
- **Data management** - Fetching, filtering, pagination
- **State management** - Search, filters, pagination state
- **Summary statistics** - Calculates and displays overview metrics
- **Mock data generation** - For development (remove when API ready)

#### PatientSnapshotCard
- **Patient information display** - Name, age, contact details
- **Priority visualization** - Color-coded status with icons
- **ANC status** - Registration and visit information
- **Action buttons** - View details and schedule appointments
- **Responsive design** - Works on mobile and desktop

#### PaginationControls
- **Page navigation** - First, previous, next, last buttons
- **Page size selection** - Dropdown for items per page
- **Results summary** - Shows current range and total items
- **Smart page number display** - Ellipsis for large page counts

#### SnapshotFilters
- **Search input** - Real-time patient search
- **Filter dropdowns** - Priority and ANC status filters
- **Active filter display** - Shows current filter state
- **Clear filters** - One-click filter reset

## Usage Guide

### 🚀 **Getting Started**
1. Navigate to **Patient Snapshot** from the main menu
2. View the **summary statistics** at the top for quick insights
3. Use **filters** to narrow down patient list based on needs
4. **Click on patient cards** to view details or schedule appointments

### 🔧 **Customization Options**

#### Page Size Selection
- Choose from 15, 25, 35, or 50 patients per page
- Larger page sizes for better overview
- Smaller page sizes for focused review

#### Priority-Based Workflows
- **Red (Overdue)** - Immediate attention required
- **Amber (Due Soon)** - Schedule within next few days  
- **Green (On Track)** - Following normal schedule

#### Search Strategies
- **By name** - Full or partial patient names
- **By ID** - Patient codes or identifiers
- **By phone** - Contact numbers

### 📱 **Mobile Experience**
- **Responsive cards** - Stack vertically on mobile
- **Touch-friendly** - Large buttons and tap targets
- **Simplified pagination** - Optimized for small screens
- **Swipe navigation** - Natural mobile interaction

## Implementation Notes

### 🔄 **Current Status**
- **Mock data implementation** - Fully functional with sample data
- **Ready for API integration** - Commented code shows integration points
- **Responsive design** - Works across all device sizes
- **Accessibility features** - Screen reader friendly

### 🔌 **API Integration Steps**
1. **Remove mock data** - Delete `generateMockPatients` function
2. **Uncomment API calls** - Enable actual endpoint requests
3. **Add error handling** - Handle specific API error cases
4. **Test with real data** - Verify with actual patient information

### 🎨 **Styling Approach**
- **Tailwind CSS** - Utility-first styling
- **Consistent design system** - Matches existing app patterns
- **Color-coded priorities** - Intuitive visual hierarchy
- **Card-based layout** - Easy scanning and selection

## Performance Considerations

### ⚡ **Optimization Features**
- **Pagination** - Loads data in manageable chunks
- **Client-side filtering** - Fast search without server requests
- **Lazy loading** - Only renders visible cards
- **Efficient re-renders** - Memoized components and calculations

### 📊 **Scalability**
- **Handles large datasets** - Pagination prevents performance issues
- **Efficient filtering** - Fast client-side operations
- **Memory management** - Proper cleanup and state management

## Future Enhancements

### 🔮 **Planned Features**
1. **Bulk actions** - Select multiple patients for mass operations
2. **Export functionality** - Download patient lists as CSV/PDF
3. **Advanced sorting** - Sort by priority, date, visit count
4. **Real-time updates** - Live data refresh and notifications
5. **Custom views** - Save frequently used filter combinations
6. **Integration links** - Direct navigation to related pages

### 🎯 **Potential Improvements**
- **Keyboard shortcuts** - Quick navigation and actions
- **Drag and drop** - Reorder priorities or assignments
- **Advanced analytics** - Trend analysis and predictions
- **Notification system** - Alerts for overdue patients
- **Offline support** - Local storage for poor connectivity

## Testing

### 🧪 **Current Testing**
- **Mock data validation** - Ensures proper data structure
- **Responsive testing** - Multiple screen sizes verified
- **Filter functionality** - All combinations tested
- **Pagination edge cases** - First/last page scenarios

### ✅ **Testing Checklist**
- [ ] Search functionality works with various inputs
- [ ] Filters combine correctly (AND logic)
- [ ] Pagination handles boundary conditions
- [ ] Cards display all information correctly
- [ ] Mobile experience is smooth
- [ ] Performance with large datasets
- [ ] Error handling for API failures
- [ ] Accessibility compliance

## Troubleshooting

### 🔧 **Common Issues**

#### No Patients Displayed
- **Check filters** - Ensure they're not too restrictive
- **Verify API connection** - Check network requests
- **Review data format** - Ensure API response matches interface

#### Slow Performance
- **Reduce page size** - Use smaller pagination limits
- **Check network** - Verify API response times
- **Review filtering** - Optimize search algorithms

#### Filter Not Working
- **Clear browser cache** - Refresh component state
- **Check data types** - Verify filter value formats
- **Review filter logic** - Ensure proper matching

### 📞 **Support**
For technical issues or questions about the Patient Snapshot feature:
1. Check the browser console for error messages
2. Verify network connectivity and API availability
3. Review filter settings and search terms
4. Contact the development team with specific error details

---

**Note:** This feature is designed to complement the existing Patient Overview page by providing a more action-oriented, priority-focused view of patient data. It's optimized for quick decision-making and efficient patient management workflows.
