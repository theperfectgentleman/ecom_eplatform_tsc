# Toast Suppression System for API Requests

## Overview
We've implemented a comprehensive toast suppression system for the `useApi` hook that allows fine-grained control over when toast notifications are shown for API responses.

## New Features

### 1. Enhanced API Request Options
- **suppressToast**: Object that controls which types of toasts to suppress
  - `error`: Suppress error toasts
  - `success`: Suppress success toasts  
  - `warning`: Suppress warning toasts
  - `info`: Suppress info toasts
  - `all`: Suppress all toast notifications

### 2. Helper Functions
- **`request()`**: Standard API request with full toast control
- **`quietRequest()`**: Suppresses error toasts only (ideal for optional data)
- **`silentRequest()`**: Suppresses all toasts (for background operations)
- **`backgroundRequest()`**: Alias for silentRequest (for semantic clarity)
- **`optionalRequest()`**: Suppresses error and warning toasts, returns null on failure

## Usage Examples

### Standard Request (shows all toasts)
```typescript
const { request } = useApi();
const users = await request({ path: 'users', method: 'GET' });
```

### Suppress Error Toasts Only
```typescript
const { quietRequest } = useApi();
const optionalData = await quietRequest({ path: 'optional-endpoint', method: 'GET' });
```

### Suppress All Toasts
```typescript
const { silentRequest } = useApi();
const backgroundData = await silentRequest({ path: 'background-sync', method: 'POST' });
```

### Optional Data Request (returns null on failure)
```typescript
const { optionalRequest } = useApi();
const antenatalData = await optionalRequest({ path: 'antenatal-visits/patient/123', method: 'GET' });
// antenatalData will be null if the request fails, no error toast shown
```

### Custom Toast Suppression
```typescript
const { request } = useApi();
const data = await request({ 
  path: 'data', 
  method: 'POST',
  suppressToast: { error: true, warning: true }
});
```

## Implementation Details

### Type Safety
- New `ToastSuppression` interface defines available suppression options
- `ApiRequestOptions` interface provides type-safe request configuration
- All helper functions are properly typed with TypeScript generics

### Backward Compatibility
- Existing code using `request()` without suppressToast options continues to work unchanged
- Default behavior remains the same (all toasts are shown)

## Use Cases

### 1. Optional Data Fetching
When fetching data that may not exist (like antenatal records for patients), use `optionalRequest()` or `quietRequest()` to avoid showing error toasts to users.

### 2. Background Operations
For operations that happen without user interaction, use `silentRequest()` or `backgroundRequest()` to avoid interrupting the user experience.

### 3. Progressive Enhancement
For features that enhance the UI but aren't critical, suppress error toasts to prevent overwhelming users with non-critical failures.

### 4. Retry Logic
When implementing retry mechanisms, suppress toasts for intermediate failures and only show them for final failures.

## Patient Overview Implementation
The Patient Overview page uses `optionalRequest()` for antenatal data fetching because:
- Antenatal data may not exist for all patients
- Missing data is not an error condition
- Users should see empty states instead of error messages
- The delay mechanism prevents rapid API calls when browsing patients

This creates a better user experience by treating missing data as a normal state rather than an error condition.
