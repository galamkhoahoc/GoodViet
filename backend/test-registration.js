/**
 * Test script for user registration endpoint
 * Run: node test-registration.js
 */

const http = require('http');

const testRegistration = () => {
  const data = JSON.stringify({
    email: 'test@example.com',
    password: 'Password123',
    fullName: 'Nguyễn Văn Test',
    phoneNumber: '0123456789'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/register',
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
      console.log('\n📝 Registration Test Result:');
      console.log('Status Code:', res.statusCode);
      console.log('Headers:', res.headers);
      console.log('\nResponse Body:');
      try {
        const json = JSON.parse(responseData);
        console.log(JSON.stringify(json, null, 2));
        
        if (res.statusCode === 201) {
          console.log('\n✅ Registration successful!');
          console.log('User ID:', json.user?.id);
          console.log('Email:', json.user?.email);
          console.log('Token:', json.token?.substring(0, 20) + '...');
        } else if (res.statusCode === 409) {
          console.log('\n⚠️  Email already registered (expected for subsequent runs)');
        } else {
          console.log('\n❌ Registration failed');
        }
      } catch (error) {
        console.log(responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
    console.log('\n💡 Make sure the backend server is running:');
    console.log('   cd backend && npm run dev');
  });

  req.write(data);
  req.end();
};

console.log('🚀 Testing registration endpoint...');
console.log('Endpoint: POST http://localhost:3000/api/users/register\n');

testRegistration();
