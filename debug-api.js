// Quick API debugging script
const apiBaseUrl = 'https://api.encompas.org/api';

// Test API endpoints
async function testEndpoints() {
  console.log('Testing API endpoints...');
  
  // Simulate getting token from localStorage (you'll need to replace with actual token)
  const token = localStorage.getItem('encompas_token') || 'test-token';
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const endpoints = [
    '/dashboard/aggregates',
    '/dashboard/volunteer-performance'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n--- Testing ${endpoint} ---`);
      const response = await fetch(`${apiBaseUrl}${endpoint}`, { headers });
      
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Data preview:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
      } else {
        const errorText = await response.text();
        console.log('Error response:', errorText);
      }
    } catch (error) {
      console.error(`Error testing ${endpoint}:`, error);
    }
  }
}

// Check authentication
async function checkAuth() {
  const token = localStorage.getItem('encompas_token');
  const user = localStorage.getItem('encompas_user');
  
  console.log('=== Authentication Check ===');
  console.log('Token exists:', !!token);
  console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'None');
  console.log('User exists:', !!user);
  console.log('User preview:', user ? JSON.parse(user) : 'None');
}

// Run tests
checkAuth();
testEndpoints();
