# Session Management Debug Guide

## Common Logout Issues Fixed:

### ✅ **Issue 1: Aggressive 401 Handling**
- **Problem**: Any 401 response immediately logged out users
- **Fix**: Now only logs out when using JWT tokens, not API keys
- **Impact**: Prevents false logouts during API key authentication

### ✅ **Issue 2: Optimized for Poor Network Conditions** 
- **Problem**: Frequent network calls and short timeouts unsuitable for poor connectivity
- **Fix**: Extended to 2-hour timeouts and reduced periodic checks
- **Impact**: Minimized network usage while maintaining session security

### ✅ **Issue 3: Optimized Activity Detection**
- **Problem**: Too many event listeners causing CPU overhead
- **Fix**: Reduced to essential events with 30-second throttling
- **Impact**: Better performance and battery life on mobile devices

### ✅ **Issue 4: No Token Validation**
- **Problem**: No proactive token expiration checking
- **Fix**: Added JWT token expiration validation and periodic checks
- **Impact**: Graceful handling of expired tokens with user warnings

## Debugging Steps:

### If you still get logged out frequently:

1. **Check Browser Console** for these messages:
   ```
   "Token expired during periodic check - logging out"
   "401 received with token - logging out due to expired session"
   "Token expires in X seconds"
   ```

2. **Check Network Tab** for:
   - Multiple 401 responses
   - Failed authentication requests
   - Missing authorization headers

3. **Check Application Tab > Local Storage** for:
   - `user` key with valid JSON
   - `token` key with JWT token
   - Verify token is not being cleared unexpectedly

### Current Settings:
- **Idle Timeout**: 2 hours (optimized for poor network conditions)
- **Token Check Interval**: Every 2 hours (reduced network usage)
- **Activity Events**: mousedown, keydown, touchstart (throttled to 30-second intervals)
- **Token Warning**: 30 minutes before expiration

### If issues persist:
1. Clear browser storage: `localStorage.clear()`
2. Re-login and monitor console for token expiration messages
3. Check if backend API is returning proper JWT tokens with expiration claims
