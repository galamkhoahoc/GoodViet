/**
 * Test script for user profile endpoints
 * Prerequisites: Run test-registration.js and test-login.js first
 * Run: node test-user-profile.js
 */

const http = require('http');

// Helper function to make HTTP requests
const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(responseData) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

// Get valid token by logging in
const getValidToken = async () => {
  const data = JSON.stringify({
    email: 'test@example.com',
    password: 'Password123'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const result = await makeRequest(options, data);
  if (result.data.token) {
    return result.data.token;
  }
  throw new Error('Failed to get token');
};

// Test GET profile
const testGetProfile = async (token) => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/profile',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  return makeRequest(options);
};

// Test PATCH profile
const testUpdateProfile = async (token, updates) => {
  const data = JSON.stringify(updates);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/profile',
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return makeRequest(options, data);
};

const runTests = async () => {
  console.log('🚀 Testing user profile endpoints...\n');

  // Get valid token
  console.log('Step 1: Getting valid token...');
  let token;
  try {
    token = await getValidToken();
    console.log('✅ Got valid token:', token.substring(0, 20) + '...\n');
  } catch (error) {
    console.log('❌ Failed to get token:', error.message);
    console.log('💡 Make sure you have registered a user first:');
    console.log('   node test-registration.js\n');
    return;
  }

  // Test 1: GET profile
  console.log('Test 1: GET /api/users/profile');
  console.log('-------------------------------');
  try {
    const result = await testGetProfile(token);
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 200) {
      console.log('✅ Successfully retrieved profile!');
      console.log('\nProfile Data:');
      console.log('  ID:', result.data.user?.id);
      console.log('  Email:', result.data.user?.email);
      console.log('  Full Name:', result.data.user?.fullName);
      console.log('  Phone:', result.data.user?.phoneNumber);
      console.log('  Gender:', result.data.user?.gender || '(not set)');
      console.log('  Target Goals:', result.data.user?.targetGoals || '(not set)');
      console.log('  Assessment Completed:', result.data.user?.assessmentCompleted);
      console.log('  Created At:', result.data.user?.createdAt);
      console.log('  Last Login:', result.data.user?.lastLoginAt);
    } else {
      console.log('❌ Failed to get profile');
      console.log('Response:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n');

  // Test 2: GET profile without token
  console.log('Test 2: GET profile without token');
  console.log('----------------------------------');
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/users/profile',
      method: 'GET',
      headers: {}
    };
    
    const result = await makeRequest(options);
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 401) {
      console.log('✅ Correctly rejected request without token');
      console.log('Message:', result.data.message);
    } else {
      console.log('❌ Unexpected status code');
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n');

  // Test 3: PATCH profile - Update full name
  console.log('Test 3: PATCH profile - Update full name');
  console.log('-----------------------------------------');
  try {
    const updates = {
      fullName: 'Nguyễn Văn Updated',
      targetGoals: 'Cải thiện phát âm L/N và TR/CH'
    };
    
    const result = await testUpdateProfile(token, updates);
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 200) {
      console.log('✅ Successfully updated profile!');
      console.log('\nUpdated Data:');
      console.log('  Full Name:', result.data.user?.fullName);
      console.log('  Target Goals:', result.data.user?.targetGoals);
      console.log('  Updated At:', result.data.user?.updatedAt);
    } else {
      console.log('❌ Failed to update profile');
      console.log('Response:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n');

  // Test 4: PATCH profile - Update phone number
  console.log('Test 4: PATCH profile - Update phone number');
  console.log('--------------------------------------------');
  try {
    const updates = {
      phoneNumber: '0987654321'
    };
    
    const result = await testUpdateProfile(token, updates);
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 200) {
      console.log('✅ Successfully updated phone number!');
      console.log('  Phone Number:', result.data.user?.phoneNumber);
    } else {
      console.log('❌ Failed to update profile');
      console.log('Response:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n');

  // Test 5: PATCH profile - Invalid phone format
  console.log('Test 5: PATCH profile - Invalid phone format');
  console.log('---------------------------------------------');
  try {
    const updates = {
      phoneNumber: '123' // Invalid format
    };
    
    const result = await testUpdateProfile(token, updates);
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 400) {
      console.log('✅ Correctly rejected invalid phone format');
      console.log('Validation Errors:');
      result.data.details?.forEach(err => {
        console.log(`  - ${err.field}: ${err.message}`);
      });
    } else {
      console.log('❌ Unexpected status code');
      console.log('Response:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n');

  // Test 6: Verify updated profile
  console.log('Test 6: Verify updated profile');
  console.log('-------------------------------');
  try {
    const result = await testGetProfile(token);
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 200) {
      console.log('✅ Final profile state:');
      console.log('  Full Name:', result.data.user?.fullName);
      console.log('  Phone Number:', result.data.user?.phoneNumber);
      console.log('  Target Goals:', result.data.user?.targetGoals);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n📝 Summary:');
  console.log('- GET /api/users/profile (with token): Returns user profile');
  console.log('- GET /api/users/profile (without token): Returns 401');
  console.log('- PATCH /api/users/profile (valid data): Updates profile');
  console.log('- PATCH /api/users/profile (invalid data): Returns 400 with validation errors');
};

// Main execution
(async () => {
  try {
    await runTests();
  } catch (error) {
    console.log('❌ Test execution failed:', error.message);
    console.log('\n💡 Make sure the backend server is running:');
    console.log('   cd backend && npm run dev\n');
  }
})();
