/**
 * Test script for JWT authentication middleware
 * Prerequisites: Run test-login.js to get a valid token
 * Run: node test-auth-middleware.js <token>
 */

const http = require('http');

const testAuthEndpoint = (token) => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/profile',
    method: 'GET',
    headers: {}
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: json });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

const getValidToken = () => {
  return new Promise((resolve, reject) => {
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

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          if (json.token) {
            resolve(json.token);
          } else {
            reject(new Error('No token in response'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

const runTests = async () => {
  console.log('🚀 Testing JWT authentication middleware...');
  console.log('Endpoint: GET http://localhost:3000/api/users/profile\n');

  // Get a valid token first
  console.log('Step 1: Getting valid token...');
  let validToken;
  try {
    validToken = await getValidToken();
    console.log('✅ Got valid token:', validToken.substring(0, 20) + '...\n');
  } catch (error) {
    console.log('❌ Failed to get token:', error.message);
    console.log('💡 Make sure you have registered a user first:');
    console.log('   node test-registration.js\n');
    return;
  }

  // Test 1: No token
  console.log('Test 1: No Authorization Header');
  console.log('--------------------------------');
  try {
    const result = await testAuthEndpoint(null);
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 401) {
      console.log('✅ Correctly rejected request without token');
      console.log('Message:', result.data.message);
    } else {
      console.log('❌ Unexpected status code');
      console.log('Response:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n');

  // Test 2: Invalid token
  console.log('Test 2: Invalid Token');
  console.log('---------------------');
  try {
    const result = await testAuthEndpoint('invalid.token.here');
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 401) {
      console.log('✅ Correctly rejected invalid token');
      console.log('Message:', result.data.message);
    } else {
      console.log('❌ Unexpected status code');
      console.log('Response:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n');

  // Test 3: Valid token
  console.log('Test 3: Valid Token');
  console.log('-------------------');
  try {
    const result = await testAuthEndpoint(validToken);
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 200) {
      console.log('✅ Successfully authenticated!');
      console.log('User ID:', result.data.user?.id);
      console.log('Email:', result.data.user?.email);
      console.log('Full Name:', result.data.user?.fullName);
      console.log('Assessment Completed:', result.data.user?.assessmentCompleted);
    } else {
      console.log('❌ Authentication failed');
      console.log('Response:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n');

  // Test 4: Malformed token (missing Bearer prefix)
  console.log('Test 4: Malformed Authorization Header');
  console.log('---------------------------------------');
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/users/profile',
      method: 'GET',
      headers: {
        'Authorization': validToken // Missing "Bearer " prefix
      }
    };

    const result = await new Promise((resolve, reject) => {
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
      req.end();
    });

    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 401) {
      console.log('✅ Correctly rejected malformed header');
      console.log('Message:', result.data.message);
    } else {
      console.log('❌ Unexpected status code');
      console.log('Response:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n📝 Summary:');
  console.log('- No token: Should return 401');
  console.log('- Invalid token: Should return 401');
  console.log('- Valid token: Should return 200 with user data');
  console.log('- Malformed header: Should return 401');
};

// Main execution
(async () => {
  try {
    await runTests();
  } catch (error) {
    console.log('❌ Test execution failed:', error.message);
  }
})();
