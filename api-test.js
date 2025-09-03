#!/usr/bin/env node

// API Test Script for EnComPAS Dashboard
const https = require('https');

// Test API endpoint connectivity
async function testApiConnectivity() {
  console.log('🔍 Testing API connectivity...\n');
  
  const testUrl = 'https://api.encompas.org/api/dashboard/aggregates';
  
  return new Promise((resolve, reject) => {
    const req = https.get(testUrl, (res) => {
      console.log(`📡 API Response Status: ${res.statusCode}`);
      console.log(`📋 Response Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📄 Response length: ${data.length} characters`);
        if (res.statusCode === 401) {
          console.log('🔐 Authentication required (401) - This is expected without token');
        } else if (res.statusCode === 200) {
          console.log('✅ API endpoint accessible');
        } else {
          console.log(`⚠️  Unexpected status: ${res.statusCode}`);
        }
        console.log(`📝 Response preview: ${data.substring(0, 200)}...`);
        resolve(res.statusCode);
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ API connectivity error:', error.message);
      if (error.code === 'ENOTFOUND') {
        console.log('🌐 DNS resolution failed - check internet connection');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('🚫 Connection refused - API server may be down');
      }
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      console.log('⏰ Request timeout after 10 seconds');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Test CORS and preflight
async function testCors() {
  console.log('\n🔄 Testing CORS...');
  
  // Simulate a CORS preflight request
  const testUrl = 'https://api.encompas.org/api/dashboard/aggregates';
  
  return new Promise((resolve) => {
    const postData = '';
    const options = {
      hostname: 'api.encompas.org',
      port: 443,
      path: '/api/dashboard/aggregates',
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,content-type'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📡 CORS Preflight Status: ${res.statusCode}`);
      console.log(`🔗 CORS Headers:`, {
        'Access-Control-Allow-Origin': res.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': res.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': res.headers['access-control-allow-headers']
      });
      resolve(res.statusCode);
    });

    req.on('error', (error) => {
      console.error('❌ CORS test error:', error.message);
      resolve(null);
    });

    req.end();
  });
}

// Main test function
async function runApiTests() {
  console.log('🚀 EnComPAS API Diagnostic Tool\n');
  console.log('================================\n');
  
  try {
    await testApiConnectivity();
    await testCors();
    
    console.log('\n📊 Summary:');
    console.log('- If you see 401 (Unauthorized), the API is working but needs authentication');
    console.log('- If you see connection errors, check your internet connection');
    console.log('- If CORS headers are missing, the API may not support browser requests');
    console.log('\n💡 Next steps:');
    console.log('1. Check browser console for detailed error messages');
    console.log('2. Verify authentication token is properly stored');
    console.log('3. Test login functionality first');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the tests
runApiTests();
