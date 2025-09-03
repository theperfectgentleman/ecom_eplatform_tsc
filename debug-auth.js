// Browser debugging script for authentication
// Open browser console and paste this

console.log('🔍 Authentication Debug Information');
console.log('=====================================');

// Check localStorage
const token = localStorage.getItem('encompas_token');
const user = localStorage.getItem('encompas_user');

console.log('📱 LocalStorage Check:');
console.log('Token exists:', !!token);
if (token) {
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 30) + '...');
  
  // Try to decode JWT token if it's a JWT
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('JWT payload:', payload);
      console.log('Expires:', payload.exp ? new Date(payload.exp * 1000) : 'No expiry');
      console.log('Is expired:', payload.exp ? Date.now() / 1000 > payload.exp : 'Cannot determine');
    }
  } catch (e) {
    console.log('Token is not a valid JWT');
  }
} else {
  console.log('❌ No token found in localStorage');
}

console.log('User exists:', !!user);
if (user) {
  try {
    const userData = JSON.parse(user);
    console.log('User data:', userData);
  } catch (e) {
    console.log('User data parse error:', e);
  }
} else {
  console.log('❌ No user data found in localStorage');
}

// Check sessionStorage as backup
console.log('\n📱 SessionStorage Check:');
const sessionToken = sessionStorage.getItem('encompas_token');
const sessionUser = sessionStorage.getItem('encompas_user');
console.log('Session token exists:', !!sessionToken);
console.log('Session user exists:', !!sessionUser);

// Test API call manually
console.log('\n🔧 Manual API Test:');
if (token) {
  console.log('Testing API call with current token...');
  
  fetch('https://api.encompas.org/api/dashboard/aggregates', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
    return response.text();
  })
  .then(data => {
    console.log('API Response Body:', data);
  })
  .catch(error => {
    console.error('API Test Error:', error);
  });
} else {
  console.log('⚠️ Cannot test API - no token available');
}

// Check if user is on login page
console.log('\n🌐 Current Page Info:');
console.log('Current URL:', window.location.href);
console.log('Current path:', window.location.pathname);

console.log('\n💡 Troubleshooting Tips:');
console.log('1. If no token/user found, you need to log in first');
console.log('2. If token exists but API fails, token may be expired');
console.log('3. Check Network tab in DevTools for detailed error info');
console.log('4. Make sure you are logged in before enabling live data');
