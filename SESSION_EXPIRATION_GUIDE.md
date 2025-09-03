# Session Expiration and 401 Handling Guide

## Overview

This implementation provides a comprehensive session management system that gracefully handles session expiration and 401 unauthorized errors. When a user's session expires, they are presented with a user-friendly modal dialog that explains the situation and guides them to log back in.

## Features

### 1. Enhanced Session Expiration Handling
- **User-friendly modal dialogs** instead of immediate redirects
- **Clear explanations** of why the session expired
- **Graceful logout process** with proper cleanup
- **Toast notifications** on the login page with context

### 2. Multiple Expiration Detection Methods
- **API 401 responses** - Detects when server rejects expired tokens
- **Periodic token validation** - Checks JWT expiration every 2 hours
- **Route-based validation** - Validates tokens when accessing protected routes

### 3. Context-Aware Messaging
- **Different messages for different scenarios** (expired, unauthorized, manual logout)
- **Persistent messaging** using sessionStorage to survive page reloads
- **Visual feedback** with appropriate icons and colors

## Implementation Components

### Core Components

#### 1. SessionExpiredModal
**Location**: `src/components/SessionExpiredModal.tsx`

A modal dialog that appears when sessions expire, providing:
- Clear explanation of the issue
- Appropriate icons for different scenarios
- "Go to Login" button that handles cleanup and navigation

#### 2. SessionContext
**Location**: `src/contexts/SessionContext.tsx`

Global state management for session expiration:
- `showSessionExpired()` - Displays the expiration modal
- `hideSessionExpired()` - Hides the modal
- Manages modal state and expiration reasons

#### 3. Enhanced AuthContext
**Location**: `src/contexts/AuthContext.tsx`

Updated authentication context with:
- Enhanced `logout()` function that accepts reason and message
- Improved periodic token validation
- Better session storage integration

### Utility Components

#### 4. useSessionManager Hook
**Location**: `src/hooks/useSessionManager.ts`

Provides convenient methods for session management:
- `handleSessionExpired()` - Shows expiration modal
- `handleDirectLogout()` - Immediate logout with toast
- `handleForceLogout()` - Silent logout with navigation

#### 5. Enhanced useApi Hook
**Location**: `src/lib/useApi.ts`

Updated API hook that:
- Detects 401 responses with token authentication
- Triggers session expiration modal
- Preserves existing API key authentication behavior

#### 6. Enhanced ProtectedRoute
**Location**: `src/components/ProtectedRoute.tsx`

Route protection with:
- Token validation on route access
- Automatic expiration detection
- Session modal integration

## Usage Examples

### Basic Session Expiration
When the system detects an expired session, it automatically:

1. **Shows the modal** with appropriate message
2. **Provides clear explanation** of what happened
3. **Guides user to login page** when they click "Go to Login"
4. **Shows toast notification** on login page with context

### Manual Session Handling
You can manually trigger session expiration handling:

```typescript
import { useSession } from '@/contexts/SessionContext';

const { showSessionExpired } = useSession();

// Show expiration modal
showSessionExpired('expired');

// Show unauthorized modal
showSessionExpired('unauthorized');

// Show invalid session modal
showSessionExpired('invalid');
```

### Enhanced Logout
The logout function now accepts optional parameters:

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { logout } = useAuth();

// Manual logout
logout();

// Logout with reason
logout({ 
  reason: 'expired', 
  message: 'Your session has expired due to inactivity.' 
});
```

## Configuration

### Session Timeout Settings
**Location**: `src/contexts/AuthContext.tsx`

```typescript
// Current settings optimized for poor network conditions
const IDLE_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
const TOKEN_CHECK_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours
const TOKEN_WARNING_THRESHOLD = 1800; // 30 minutes
```

### Toast Suppression
You can control toast notifications in API requests:

```typescript
// Suppress error toasts (for optional data)
const data = await request({ 
  path: 'data', 
  method: 'GET',
  suppressToast: { error: true }
});

// Suppress all toasts
const data = await request({ 
  path: 'background-sync', 
  method: 'POST',
  suppressToast: { all: true }
});
```

## Testing

### Manual Testing
Use the provided test script:

**Location**: `test-session-expiration.js`

```javascript
// Load the script in browser console
// Then run test functions:

testSessionExpiration(); // Simulate 401 error
testSessionModal();     // Test modal display
testTokenExpiration();  // Check token status
```

### Testing Scenarios

1. **Session Expiration via API**
   - Make API request with expired/invalid token
   - Verify modal appears with correct message
   - Verify logout and redirect to login page

2. **Periodic Token Check**
   - Wait for periodic check interval
   - Verify expired tokens trigger logout
   - Verify toast appears on login page

3. **Route-Based Validation**
   - Navigate to protected route with expired token
   - Verify immediate expiration detection
   - Verify modal display

## Error Handling

### Different Expiration Scenarios

#### Expired Token
- **Trigger**: JWT token past expiration time
- **Message**: "Your session has expired. Please log in again to continue."
- **Icon**: Warning triangle (amber)

#### Unauthorized Access
- **Trigger**: Server rejects token (401 with token)
- **Message**: "You are not authorized to access this resource..."
- **Icon**: Logout icon (red)

#### Invalid Session
- **Trigger**: Malformed or corrupted token
- **Message**: "Your session is no longer valid..."
- **Icon**: Warning triangle (red)

### Fallback Behavior
If any component fails:
- **Default logout behavior** ensures user is logged out
- **ProtectedRoute** ensures unauthorized users are redirected
- **Login page** shows generic expiration message

## Migration Notes

### From Previous Implementation
The new system is backward compatible:
- **Existing logout calls** continue to work
- **Existing API error handling** is preserved
- **No breaking changes** to component interfaces

### New Features Available
- **Enhanced user experience** with explanatory modals
- **Better error messaging** with context
- **Improved session monitoring** with multiple validation methods

## Best Practices

### For Developers
1. **Use the session context** for expiration handling
2. **Provide clear messages** when manually triggering logout
3. **Test with actual expired tokens** not just network errors
4. **Consider network conditions** when adjusting timeouts

### For Users
1. **Save work frequently** as sessions can expire
2. **Expect session warnings** in poor network conditions
3. **Use the "Go to Login" button** when modal appears
4. **Check for toast messages** after being redirected to login

## Troubleshooting

### Common Issues

#### Modal Not Appearing
- Check if `SessionProvider` is properly wrapped around the app
- Verify browser console for JavaScript errors
- Ensure `useSession` hook is called within the provider

#### Logout Not Working
- Check browser console for authentication errors
- Verify localStorage is being cleared properly
- Check if navigation to login page is blocked

#### Token Validation Issues
- Verify JWT token format in localStorage
- Check server-side token expiration settings
- Ensure system clock is synchronized

### Debug Tools
Use the browser console commands:
```javascript
// Check current session state
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));

// Check logout reasons
console.log('Logout reason:', sessionStorage.getItem('logout_reason'));
console.log('Logout message:', sessionStorage.getItem('logout_message'));
```

## Future Enhancements

### Potential Improvements
1. **Token refresh functionality** - Automatically refresh near-expired tokens
2. **Session warnings** - Warn users before expiration
3. **Activity tracking** - Better idle detection methods
4. **Progressive timeouts** - Different timeouts for different user types
5. **Session analytics** - Track session patterns and optimize timeouts
