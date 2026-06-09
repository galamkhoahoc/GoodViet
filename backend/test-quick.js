/**
 * QUICK TEST - Bypasses rate limiting by using existing test account
 */

const axios = require('axios');
const BASE_URL = 'http://localhost:3000';

// Use a known test account to bypass registration rate limit
const TEST_EMAIL = 'quicktest@goodviet.com';
const TEST_PASSWORD = 'Test1234';

let authToken = '';
let userId = '';

async function quickTest() {
  console.log('\n🚀 QUICK TEST - Using existing account to bypass rate limit\n');
  
  try {
    // Try to login with existing account
    console.log('1. Attempting login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }).catch(async (error) => {
      // If login fails, account doesn't exist, try to register
      if (error.response?.status === 401) {
        console.log('   Account not found, creating new one...');
        const regResponse = await axios.post(`${BASE_URL}/api/users/register`, {
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          fullName: 'Quick Test User'
        });
        return regResponse;
      }
      throw error;
    });
    
    authToken = loginResponse.data.token;
    userId = loginResponse.data.user.id;
    console.log('   ✅ Authenticated successfully');
    console.log(`   Token: ${authToken.substring(0, 30)}...`);
    
    // Quick tests
    console.log('\n2. Testing core endpoints...');
    
    // Profile
    const profile = await axios.get(`${BASE_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`   ✅ GET /api/users/profile - ${profile.data.fullName}`);
    
    // Assessment start
    const assessment = await axios.post(`${BASE_URL}/api/assessments/start`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`   ✅ POST /api/assessments/start - ${assessment.data.assessmentId}`);
    
    // Pathways
    const pathways = await axios.get(`${BASE_URL}/api/practice/pathways`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`   ✅ GET /api/practice/pathways - ${pathways.data.pathways.length} pathways`);
    
    // Chat
    const chat = await axios.post(`${BASE_URL}/api/chat/messages`, {
      content: 'Xin chào!'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`   ✅ POST /api/chat/messages - Response: ${chat.data.response.substring(0, 50)}...`);
    
    // Experts
    const experts = await axios.get(`${BASE_URL}/api/experts`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`   ✅ GET /api/experts - ${experts.data.experts.length} experts`);
    
    // Notifications
    const notifications = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`   ✅ GET /api/notifications - ${notifications.data.notifications.length} notifications`);
    
    console.log('\n✅ ALL CORE ENDPOINTS WORKING!\n');
    console.log('💡 To run full test suite, wait 1 hour or restart MongoDB to clear rate limit.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data?.message || error.message);
    console.error('   Status:', error.response?.status);
  }
}

quickTest();
