/**
 * Verify Backend is Working
 * Tests backend connection and creates a test account
 */

const fetch = require('node-fetch');

const BACKEND_URL = 'https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app';

async function verifyBackend() {
  console.log('🧪 Verifying Backend...');
  console.log('Backend URL:', BACKEND_URL);
  console.log('');

  // Test 1: Health Check
  console.log('[1/3] Testing /health endpoint...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  console.log('');

  // Test 2: Root Endpoint
  console.log('[2/3] Testing / endpoint...');
  try {
    const response = await fetch(`${BACKEND_URL}/`);
    const data = await response.json();
    console.log('✅ Root endpoint:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Root endpoint failed:', error.message);
  }
  console.log('');

  // Test 3: Login with Demo Account
  console.log('[3/3] Testing login with demo account...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'demo@goodviet.com',
        password: 'Demo123!',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log('User:', data.user.email, data.user.fullName);
      console.log('Token:', data.token.substring(0, 20) + '...');
    } else {
      const error = await response.json();
      console.log('❌ Login failed:', response.status, JSON.stringify(error, null, 2));
    }
  } catch (error) {
    console.log('❌ Login request failed:', error.message);
  }
  console.log('');

  console.log('═══════════════════════════════════════');
  console.log('Done!');
  console.log('═══════════════════════════════════════');
}

verifyBackend();
