// Test script to verify API connection
// Run with: node test-api-connection.js

const API_BASE_URL = 'https://api.encompass.org/api';
const API_KEY = 'ab6dd734ad8cf02ca3711483155e8561cb7acb9eebf7fb3a9bc76669a412a060';

async function testApiConnection() {
  console.log('Testing API connection...');
  console.log('API Base URL:', API_BASE_URL);
  console.log('Using API Key:', API_KEY);
  
  try {
    // Test basic connectivity
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.text();
      console.log('Response Data:', data);
      console.log('✅ API connection successful!');
    } else {
      console.log('❌ API connection failed');
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

// Test specific endpoint
async function testSpecificEndpoint() {
  console.log('\nTesting specific endpoint: /accounts');
  
  try {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });
    
    console.log('Accounts endpoint - Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Accounts endpoint working!');
      console.log('Data preview:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
    } else {
      console.log('❌ Accounts endpoint failed');
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Accounts endpoint error:', error.message);
  }
}

// Run the tests
testApiConnection().then(() => testSpecificEndpoint());
