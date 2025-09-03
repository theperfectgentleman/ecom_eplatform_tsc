// Test different endpoints to isolate the PostgreSQL issue
// Run this in browser console after logging in

console.log('🔧 PostgreSQL Error Diagnostic');
console.log('==============================');

const token = localStorage.getItem('encompas_token');
if (!token) {
  console.log('❌ No token found - please log in first');
} else {
  console.log('✅ Token found, testing endpoints...');
  
  const apiBaseUrl = 'https://api.encompas.org/api';
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Test 1: Dashboard aggregates with minimal params
  console.log('\n📊 Test 1: Basic aggregates endpoint');
  fetch(`${apiBaseUrl}/dashboard/aggregates`, { headers })
    .then(response => {
      console.log('Status:', response.status);
      return response.text();
    })
    .then(data => {
      console.log('Response:', data);
      if (data.includes('pg_catalog.extract')) {
        console.log('🐛 PostgreSQL extract function error detected');
        console.log('💡 This suggests a date/time extraction issue in the SQL query');
      }
    })
    .catch(error => console.error('Test 1 Error:', error));

  // Test 2: Try with specific date parameters
  console.log('\n📊 Test 2: Aggregates with specific parameters');
  fetch(`${apiBaseUrl}/dashboard/aggregates?days=7&weeks=4`, { headers })
    .then(response => {
      console.log('Status:', response.status);
      return response.text();
    })
    .then(data => {
      console.log('Response:', data);
    })
    .catch(error => console.error('Test 2 Error:', error));

  // Test 3: Try volunteer performance (simpler endpoint)
  console.log('\n👥 Test 3: Volunteer performance endpoint');
  fetch(`${apiBaseUrl}/dashboard/volunteer-performance`, { headers })
    .then(response => {
      console.log('Status:', response.status);
      return response.text();
    })
    .then(data => {
      console.log('Response:', data);
    })
    .catch(error => console.error('Test 3 Error:', error));

  // Test 4: Try other dashboard endpoints to see which work
  console.log('\n🔍 Test 4: Alternative dashboard endpoints');
  const testEndpoints = [
    '/dashboard/patients',
    '/dashboard/antenatal',
    '/dashboard/kits',
    '/dashboard/testing'
  ];

  testEndpoints.forEach((endpoint, index) => {
    setTimeout(() => {
      console.log(`\nTesting ${endpoint}...`);
      fetch(`${apiBaseUrl}${endpoint}`, { headers })
        .then(response => {
          console.log(`${endpoint} Status:`, response.status);
          if (response.ok) {
            return response.json();
          } else {
            return response.text();
          }
        })
        .then(data => {
          console.log(`${endpoint} Response:`, typeof data === 'string' ? data.substring(0, 100) : 'JSON data received');
        })
        .catch(error => console.error(`${endpoint} Error:`, error));
    }, index * 1000); // Stagger requests
  });
}

console.log('\n💡 Workaround options:');
console.log('1. Use individual endpoints instead of aggregates');
console.log('2. Add fallback data handling');
console.log('3. Contact backend team about PostgreSQL query');
console.log('4. Implement client-side aggregation from working endpoints');
