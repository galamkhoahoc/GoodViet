/**
 * Test script for audio upload with GridFS
 * Prerequisites: Run test-registration.js and test-login.js first
 * Run: node test-audio-upload.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Helper to get token
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

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve(json.token || null);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

// Create sample WAV file (minimal valid WAV header + silence)
const createSampleWAVFile = () => {
  const sampleRate = 44100;
  const numChannels = 1;
  const bitsPerSample = 16;
  const duration = 1; // 1 second
  const numSamples = sampleRate * duration;
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  
  // WAV file header (44 bytes)
  const buffer = Buffer.alloc(44 + dataSize);
  
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  
  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // audio format (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // byte rate
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // block align
  buffer.writeUInt16LE(bitsPerSample, 34);
  
  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Fill with silence (all zeros)
  buffer.fill(0, 44);
  
  return buffer;
};

// Upload file with multipart/form-data
const uploadFile = async (token, fileBuffer, filename, metadata = {}) => {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  
  // Build multipart form data
  const parts = [];
  
  // Add file part
  parts.push(Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="audio"; filename="${filename}"\r\n` +
    `Content-Type: audio/wav\r\n\r\n`
  ));
  parts.push(fileBuffer);
  parts.push(Buffer.from('\r\n'));
  
  // Add metadata fields
  for (const [key, value] of Object.entries(metadata)) {
    parts.push(Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${key}"\r\n\r\n` +
      `${value}\r\n`
    ));
  }
  
  // Add closing boundary
  parts.push(Buffer.from(`--${boundary}--\r\n`));
  
  const body = Buffer.concat(parts);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/audio/upload',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length
    }
  };

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
    req.write(body);
    req.end();
  });
};

// Download file
const downloadFile = async (fileId) => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/audio/${fileId}`,
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => { chunks.push(chunk); });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: Buffer.concat(chunks)
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
};

const runTests = async () => {
  console.log('🚀 Testing audio upload with GridFS...\n');

  // Get valid token
  console.log('Step 1: Getting valid token...');
  let token;
  try {
    token = await getValidToken();
    if (!token) throw new Error('No token returned');
    console.log('✅ Got valid token:', token.substring(0, 20) + '...\n');
  } catch (error) {
    console.log('❌ Failed to get token:', error.message);
    console.log('💡 Make sure you have registered a user first:');
    console.log('   node test-registration.js\n');
    return;
  }

  // Test 1: Upload audio file
  console.log('Test 1: Upload Audio File');
  console.log('-------------------------');
  
  const sampleFile = createSampleWAVFile();
  console.log(`Created sample WAV file: ${sampleFile.length} bytes`);
  
  let fileId;
  try {
    const result = await uploadFile(token, sampleFile, 'test-audio.wav', {
      assessmentId: '507f1f77bcf86cd799439011',
      phase: 'phase_1',
      sentenceId: 'sentence-1'
    });
    
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 201) {
      console.log('✅ Successfully uploaded file!');
      console.log('Recording ID:', result.data.recording?.id);
      console.log('File ID:', result.data.recording?.fileId);
      console.log('Filename:', result.data.recording?.filename);
      console.log('Size:', result.data.recording?.size, 'bytes');
      console.log('Format:', result.data.recording?.format);
      
      fileId = result.data.recording?.fileId;
    } else {
      console.log('❌ Upload failed');
      console.log('Response:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n');

  // Test 2: Download audio file
  if (fileId) {
    console.log('Test 2: Download/Stream Audio File');
    console.log('-----------------------------------');
    
    try {
      const result = await downloadFile(fileId);
      
      console.log('Status Code:', result.statusCode);
      console.log('Content-Type:', result.headers['content-type']);
      console.log('Content-Length:', result.headers['content-length']);
      
      if (result.statusCode === 200) {
        console.log('✅ Successfully downloaded file!');
        console.log('Downloaded size:', result.data.length, 'bytes');
        
        // Verify file integrity
        if (result.data.length === sampleFile.length) {
          console.log('✅ File size matches original');
        } else {
          console.log('⚠️  File size mismatch');
        }
      } else {
        console.log('❌ Download failed');
      }
    } catch (error) {
      console.log('❌ Request failed:', error.message);
    }
  }

  console.log('\n');

  // Test 3: Upload without token
  console.log('Test 3: Upload Without Authentication');
  console.log('-------------------------------------');
  
  try {
    const result = await uploadFile(null, sampleFile, 'test-audio-2.wav');
    
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 401) {
      console.log('✅ Correctly rejected upload without token');
      console.log('Message:', result.data.message);
    } else {
      console.log('❌ Unexpected status code');
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n📝 Summary:');
  console.log('- GridFS stores files directly in MongoDB Atlas');
  console.log('- No need for separate S3/GCS credentials');
  console.log('- Files are chunked automatically for large sizes');
  console.log('- Supports streaming for efficient playback');
  console.log('- AudioRecording model tracks metadata');
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
