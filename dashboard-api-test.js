// Dashboard API Debug Test Script
// Run this in your browser console while on the dashboard page

console.log('🔧 Dashboard API Debug Test Starting...');

// Get the auth token from localStorage or context
const getAuthToken = () => {
  try {
    const token = localStorage.getItem('auth_token') || 
                  localStorage.getItem('token') ||
                  JSON.parse(localStorage.getItem('auth') || '{}').token;
    return token;
  } catch (e) {
    console.error('Could not get auth token:', e);
    return null;
  }
};

// Test function for individual endpoints
const testEndpoint = async (endpoint, label) => {
  const token = getAuthToken();
  const apiBaseUrl = 'https://api.encompas.org/api';
  const url = `${apiBaseUrl}/dashboard/${endpoint}`;
  
  console.log(`\n🧪 Testing ${label}...`);
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${label} SUCCESS:`, data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ ${label} FAILED:`, errorText);
      return { success: false, error: errorText, status: response.status };
    }
  } catch (error) {
    console.log(`💥 ${label} ERROR:`, error);
    return { success: false, error: error.message };
  }
};

// Test all endpoints
const runAllTests = async () => {
  const endpoints = [
    { path: 'patient-bio', label: 'Patient Bio Stats' },
    { path: 'antenatal-registration', label: 'ANC Registration' },
    { path: 'antenatal-visits', label: 'ANC Visits' },
    { path: 'case-files', label: 'Case Files' },
    { path: 'kit-distribution', label: 'Kit Distribution' },
    { path: 'kit-usage', label: 'Kit Usage' },
    { path: 'geographic-distribution', label: 'Geographic Data' },
    { path: 'monthly-trends', label: 'Monthly Trends' },
    { path: 'age-distribution', label: 'Age Distribution' },
    { path: 'insurance-coverage', label: 'Insurance Coverage' },
    { path: 'risk-distribution', label: 'Risk Distribution' },
    { path: 'anc-performance', label: 'ANC Performance' },
    { path: 'kit-performance', label: 'Kit Performance' },
    { path: 'volunteer-performance', label: 'Volunteer Performance' }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.path, endpoint.label);
    results.push({
      endpoint: endpoint.path,
      label: endpoint.label,
      ...result
    });
    
    // Wait a bit between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 SUMMARY REPORT:');
  console.log('==================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed Endpoints:');
    failed.forEach(f => {
      console.log(`  - ${f.label} (${f.endpoint}): ${f.error || 'Unknown error'}`);
    });
  }
  
  if (successful.length > 0) {
    console.log('\n✅ Working Endpoints:');
    successful.forEach(s => {
      console.log(`  - ${s.label} (${s.endpoint})`);
    });
  }
  
  return results;
};

// Run the test
console.log('Auth token found:', getAuthToken() ? 'Yes' : 'No');
console.log('Starting endpoint tests...');

runAllTests().then(results => {
  console.log('\n🎯 Test completed. Check results above.');
  window.dashboardTestResults = results; // Save to global for inspection
});

// Also test the auth context directly
try {
  // This assumes you're on the dashboard page with React DevTools
  console.log('\n🔑 Auth Context Check:');
  console.log('Current user:', window.React?.findFiberByHostInstance?.(document.body)?.memoizedProps?.children?.props?.value?.user);
} catch (e) {
  console.log('Could not access React context:', e);
}
