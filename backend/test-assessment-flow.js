const http = require('http');

// Helper to make API requests
const apiRequest = async (method, path, data = null, token = null) => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path,
    method,
    headers: {}
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  let body = '';
  if (data) {
    body = JSON.stringify(data);
    options.headers['Content-Type'] = 'application/json';
    options.headers['Content-Length'] = Buffer.byteLength(body);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          if (responseData) {
            resolve({ statusCode: res.statusCode, data: JSON.parse(responseData) });
          } else {
            resolve({ statusCode: res.statusCode, data: null });
          }
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
};

// Create sample WAV file
const createSampleWAVFile = () => {
  const sampleRate = 44100, numChannels = 1, bitsPerSample = 16, duration = 1;
  const numSamples = sampleRate * duration;
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(36 + dataSize, 4); buffer.write('WAVE', 8);
  buffer.write('fmt ', 12); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22); buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36); buffer.writeUInt32LE(dataSize, 40);
  buffer.fill(0, 44);
  return buffer;
};

const uploadFile = async (token, fileBuffer, filename, metadata = {}) => {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const parts = [];
  parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="audio"; filename="${filename}"\r\nContent-Type: audio/wav\r\n\r\n`));
  parts.push(fileBuffer);
  parts.push(Buffer.from('\r\n'));
  
  for (const [key, value] of Object.entries(metadata)) {
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`));
  }
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
        try { resolve({ statusCode: res.statusCode, data: JSON.parse(responseData) }); } 
        catch (e) { resolve({ statusCode: res.statusCode, data: responseData }); }
      });
    });
    req.on('error', reject); req.write(body); req.end();
  });
};

const runFlow = async () => {
  console.log('🚀 Bắt đầu Mock Test Assessment Flow...');

  // 1. Đăng nhập
  console.log('\n1. Đang đăng nhập (quicktest@goodviet.com)...');
  const loginRes = await apiRequest('POST', '/api/users/login', {
    email: 'quicktest@goodviet.com', password: 'Test1234'
  });
  
  if (loginRes.statusCode !== 200 || !loginRes.data.token) {
    console.error('❌ Đăng nhập thất bại. Chạy node create-test-account.js trước.');
    return;
  }
  const token = loginRes.data.token;
  console.log('✅ Đăng nhập thành công!');

  // 2. Bắt đầu đánh giá
  console.log('\n2. Bắt đầu Assessment...');
  const startRes = await apiRequest('POST', '/api/assessments/start', {}, token);
  
  if (startRes.statusCode === 409) {
    console.log('⚠️ Tài khoản này đã làm bài test rồi. Không thể làm lại.');
    return;
  }
  
  if (startRes.statusCode !== 201 && startRes.statusCode !== 200) {
    console.error('❌ Lỗi khi bắt đầu:', startRes.data);
    return;
  }
  const assessmentId = startRes.data.assessmentId;
  let phase = startRes.data.phase;
  let sentences = startRes.data.sentences;
  console.log(`✅ Khởi tạo ID: ${assessmentId} (Giai đoạn: ${phase})`);

  const sampleFile = createSampleWAVFile();

  // 3. Thực hiện Phase 1, 2, 3
  while (phase && phase !== 'completed' && phase !== 'processing' && phase !== 'not_started') {
    console.log(`\n▶️ Bắt đầu ${phase}...`);
    
    // Upload audio cho 1 câu hỏi giả định
    const sentenceId = sentences && sentences.length > 0 ? sentences[0].id : 'test-id';
    console.log(`- Đang upload audio cho câu: ${sentenceId}...`);
    const uploadRes = await uploadFile(token, sampleFile, 'test.wav', {
      assessmentId, phase, sentenceId
    });
    
    if (uploadRes.statusCode === 200 || uploadRes.statusCode === 201) {
      console.log('✅ Upload thành công!');
    } else {
      console.error('❌ Upload thất bại:', uploadRes.data);
      return;
    }

    // Hoàn thành Phase
    console.log(`- Gửi yêu cầu hoàn thành ${phase}...`);
    const completeRes = await apiRequest('POST', `/api/assessments/${assessmentId}/complete-phase`, { phase }, token);
    
    if (completeRes.statusCode === 200 || completeRes.statusCode === 202) {
      console.log(`✅ Chuyển phase:`, completeRes.data.nextPhase || completeRes.data.message);
      phase = completeRes.data.nextPhase;
      sentences = completeRes.data.sentences;
      if (completeRes.statusCode === 202) phase = 'processing';
      if (phase === 'restart') {
         console.log('🔄 Bị mâu thuẫn đánh giá, hệ thống yêu cầu làm lại. (Test success)');
         return;
      }
    } else {
      console.error('❌ Hoàn thành phase thất bại:', completeRes.data);
      return;
    }
  }

  // 4. Polling trạng thái (Processing)
  if (phase === 'processing') {
    console.log('\n⏳ Hệ thống đang AI Processing (Chờ 30s)...');
    let status = 'processing';
    let attempts = 0;
    while (status === 'processing' && attempts < 10) {
      await new Promise(r => setTimeout(r, 5000));
      const statusRes = await apiRequest('GET', `/api/assessments/${assessmentId}/status`, null, token);
      status = statusRes.data.status;
      console.log(`- Trạng thái hiện tại: ${status}`);
      attempts++;
    }
  }

  // 5. Lấy kết quả
  console.log('\n🎉 Đang lấy kết quả cuối cùng...');
  const resultRes = await apiRequest('GET', '/api/assessments/result', null, token);
  if (resultRes.statusCode === 200) {
    console.log('✅ Kết quả đánh giá:');
    console.log(`- Điểm tổng: ${resultRes.data.overallScore}`);
    console.log(`- Lộ trình đề xuất: ${resultRes.data.recommendedPathway?.name}`);
  } else {
    console.error('❌ Lỗi lấy kết quả:', resultRes.data);
  }
};

runFlow();
