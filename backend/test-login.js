/**
 * Test script for user login endpoint
 * Prerequisites: Run test-registration.js first to create a test user
 * Run: node test-login.js
 */

const http = require('http');

const testLogin = (email, password, testName) => {
  const data = JSON.stringify({ email, password });

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

    req.write(data);
    req.end();
  });
};

const runTests = async () => {
  console.log('🚀 Testing login endpoint...');
  console.log('Endpoint: POST http://localhost:3000/api/users/login\n');

  // Test 1: Valid login
  console.log('Test 1: Valid Login');
  console.log('-------------------');
  try {
    const result = await testLogin('test@example.com', 'Password123', 'Valid login');
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 200) {
      console.log('✅ Login successful!');
      console.log('User ID:', result.data.user?.id);
      console.log('Email:', result.data.user?.email);
      console.log('Assessment Completed:', result.data.user?.assessmentCompleted);
      console.log('Token:', result.data.token?.substring(0, 20) + '...');
      console.log('Last Login:', result.data.user?.lastLoginAt);
    } else {
      console.log('❌ Login failed');
      console.log('Response:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n');

  // Test 2: Invalid password
  console.log('Test 2: Invalid Password');
  console.log('------------------------');
  try {
    const result = await testLogin('test@example.com', 'WrongPassword', 'Invalid password');
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 401) {
      console.log('✅ Correctly rejected invalid password');
      console.log('Message:', result.data.message);
    } else {
      console.log('❌ Unexpected status code');
      console.log('Response:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n');

  // Test 3: Non-existent user
  console.log('Test 3: Non-existent User');
  console.log('-------------------------');
  try {
    const result = await testLogin('nonexistent@example.com', 'Password123', 'Non-existent user');
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 401) {
      console.log('✅ Correctly rejected non-existent user');
      console.log('Message:', result.data.message);
    } else {
      console.log('❌ Unexpected status code');
      console.log('Response:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n');

  // Test 4: Rate limiting (5 failed attempts)
  console.log('Test 4: Rate Limiting (5 failed attempts)');
  console.log('------------------------------------------');
  console.log('Attempting 6 failed logins to trigger rate limit...\n');
  
  for (let i = 1; i <= 6; i++) {
    try {
      const result = await testLogin('test@example.com', 'WrongPassword' + i, `Rate limit test ${i}`);
      console.log(`Attempt ${i}: Status ${result.statusCode}`);
      
      if (result.statusCode === 429) {
        console.log('✅ Rate limit triggered after', i, 'attempts');
        console.log('Message:', result.data.message);
        console.log('Retry After:', result.data.retryAfter, 'seconds');
        break;
      }
    } catch (error) {
      console.log(`Attempt ${i}: Error -`, error.message);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n💡 Note: If you already used the email for testing, the rate limit may trigger earlier.');
  console.log('💡 Rate limit: 5 failed login attempts per 15 minutes per email.');
};

// Check if server is running
const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/health', (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.end();
  });
};

// Main execution
(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Backend server is not running!');
    console.log('\n💡 Please start the server first:');
    console.log('   cd backend && npm run dev\n');
    return;
  }

  await runTests();
})();
