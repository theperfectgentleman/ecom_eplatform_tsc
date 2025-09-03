/**
 * Session Expiration Test Script
 * 
 * This script can be run in the browser console to test the session expiration functionality.
 * 
 * Usage:
 * 1. Log into the application
 * 2. Open browser console
 * 3. Copy and paste this script
 * 4. Run the test functions
 */

console.log('🔒 Session Expiration Test Script Loaded');

// Test function to simulate session expiration
window.testSessionExpiration = () => {
  console.log('🧪 Testing session expiration...');
  
  // Get the current auth context (if available)
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('Current token exists:', !!token);
  console.log('Current user exists:', !!user);
  
  if (!token || !user) {
    console.log('❌ No active session found. Please log in first.');
    return;
  }
  
  // Simulate an expired token by making a request that will return 401
  fetch('https://api.encompas.org/api/dashboard/aggregates', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer invalid-token`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Test API response status:', response.status);
    if (response.status === 401) {
      console.log('✅ Successfully triggered 401 response');
      console.log('🔔 Check if session expiration modal appeared');
    } else {
      console.log('⚠️ Expected 401 but got:', response.status);
    }
  })
  .catch(error => {
    console.log('Test API error:', error);
  });
};

// Test function to manually trigger session expiration modal
window.testSessionModal = () => {
  console.log('🧪 Testing session expiration modal...');
  
  // Try to access the session context
  try {
    // Store logout reason to simulate expiration
    sessionStorage.setItem('logout_reason', 'expired');
    sessionStorage.setItem('logout_message', 'Test session expiration');
    
    console.log('✅ Logout reason stored. Navigate to login page to see the toast.');
    console.log('💡 You can also check sessionStorage to verify the values are set.');
    
  } catch (error) {
    console.log('❌ Error testing session modal:', error);
  }
};

// Test function to check token expiration
window.testTokenExpiration = () => {
  console.log('🧪 Testing token expiration check...');
  
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ No token found');
    return;
  }
  
  try {
    // Decode JWT token
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('❌ Invalid JWT token format');
      return;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    console.log('Token payload:', payload);
    
    if (payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < currentTime;
      const timeUntilExpiry = payload.exp - currentTime;
      
      console.log('Current time:', currentTime);
      console.log('Token expires at:', payload.exp);
      console.log('Is expired:', isExpired);
      console.log('Time until expiry (seconds):', timeUntilExpiry);
      console.log('Time until expiry (minutes):', Math.floor(timeUntilExpiry / 60));
      
      if (isExpired) {
        console.log('🔥 Token is expired - session should be terminated');
      } else if (timeUntilExpiry < 1800) {
        console.log('⚠️ Token expires soon (less than 30 minutes)');
      } else {
        console.log('✅ Token is valid');
      }
      
    } else {
      console.log('❌ Token has no expiration claim');
    }
    
  } catch (error) {
    console.log('❌ Error parsing token:', error);
  }
};

console.log('📋 Available test functions:');
console.log('  • testSessionExpiration() - Simulate 401 error');
console.log('  • testSessionModal() - Test logout reason storage');
console.log('  • testTokenExpiration() - Check current token expiration');
console.log('\n💡 Example: Run "testSessionExpiration()" to test the session handling');
