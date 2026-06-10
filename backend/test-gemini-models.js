const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyAvgVxHx_wbHlMHZgmlsh0ttrDhrCEH15Q';

async function listModels() {
  try {
    console.log('🔍 Testing Gemini API Key...\n');
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Try to list available models
    console.log('📋 Attempting to list available models...');
    
    // Test different model names
    const modelsToTest = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro',
      'gemma-2-9b-it',
      'gemma-2-27b-it',
      'text-embedding-004'
    ];
    
    for (const modelName of modelsToTest) {
      try {
        console.log(`\n🧪 Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Xin chào');
        const response = await result.response;
        const text = response.text();
        console.log(`✅ SUCCESS - ${modelName}`);
        console.log(`   Response: ${text.substring(0, 100)}...`);
        break; // Found a working model
      } catch (error) {
        console.log(`❌ FAILED - ${modelName}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Possible issues:');
    console.error('   1. API key is invalid or expired');
    console.error('   2. API key does not have access to Gemini models');
    console.error('   3. API quota exceeded');
    console.error('   4. Need to enable Generative Language API in Google Cloud Console');
  }
}

listModels();
