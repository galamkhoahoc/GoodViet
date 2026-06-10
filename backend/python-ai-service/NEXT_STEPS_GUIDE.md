# Next Steps: Gemma 4 Migration Implementation Guide

## 📊 Current Progress

**Completed**: 9/49 tasks (18%)  
**Status**: Rate limit on automated execution - continuing with manual implementation guide

## ✅ What's Already Done

### Wave 1-3 (Completed)
1. ✅ **Task 1**: Python project structure with dependencies
2. ✅ **Task 2.1**: Gemma4Service class with model loading
3. ✅ **Task 3.1**: ThinkingModeParser for response parsing
4. ✅ **Task 4.1**: generate_chat_response() method with thinking mode
5. ✅ **Task 5.1**: SpeculativeDecodingCoordinator implementation
6. ✅ **Task 7.1**: MultiModalProcessor with format validation

### Wave 4 (In Progress)
- 🚧 **Task 5.2**: Integrate speculative decoding into generate_chat_response()
- 🚧 **Task 7.2**: Implement analyze_audio() method

## 🎯 Critical Path Forward

To get a working MVP, implement these tasks in order:

### Priority 1: Complete Wave 4 (Audio Analysis Foundation)

#### Task 5.2: Integrate Speculative Decoding
**File**: `backend/python-ai-service/services/gemma4_service.py`

**What to do**:
Update the `generate_chat_response()` method to use SpeculativeDecodingCoordinator when assistant model is available.

**Code to add**:
```python
# In Gemma4Service class, update generate_chat_response():

from utils.speculative_decoding import SpeculativeDecodingCoordinator

def generate_chat_response(self, message, history, system_prompt=None):
    # ... existing code up to generation ...
    
    # Check if we should use speculative decoding
    use_speculative = self.assistant_model is not None and self._models_loaded
    
    if use_speculative:
        try:
            logger.info("Using speculative decoding for generation")
            coordinator = SpeculativeDecodingCoordinator(
                target_model=self.target_model,
                assistant_model=self.assistant_model,
                lookahead=5
            )
            
            outputs = coordinator.generate(
                input_ids=inputs.input_ids,
                attention_mask=inputs.attention_mask,
                generation_config=generation_config,
                tokenizer=self.tokenizer
            )
        except Exception as e:
            logger.warning(f"Speculative decoding failed, falling back to standard: {str(e)}")
            # Fallback to standard generation
            with torch.no_grad():
                outputs = self.target_model.generate(
                    **inputs,
                    generation_config=generation_config
                )
    else:
        # Standard generation without speculative decoding
        logger.info("Using standard generation (no assistant model)")
        with torch.no_grad():
            outputs = self.target_model.generate(
                **inputs,
                generation_config=generation_config
            )
    
    # ... rest of existing code ...
```

**Test**: Run existing chat response tests to verify it still works.

---

#### Task 7.2: Implement analyze_audio() Method
**File**: `backend/python-ai-service/services/multimodal_processor.py`

**What to do**:
Add the `analyze_audio()` method to MultiModalProcessor class.

**Code to add**:
```python
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class PronunciationIssue:
    phoneme: str  # "L/N", "TR/CH", or "S/X"
    severity: str  # "mild", "moderate", or "severe"
    description: str
    detected_word: str
    expected_word: str

@dataclass
class AudioAnalysis:
    overall_score: int  # 0-100
    clarity_score: int  # 0-100
    fluency_score: int  # 0-100
    confidence_level: str  # "high", "medium", or "low"
    issues: List[PronunciationIssue]

class MultiModalProcessor:
    # ... existing methods ...
    
    def analyze_audio(
        self,
        audio_bytes: bytes,
        mime_type: str,
        expected_text: str,
        tokenizer
    ) -> AudioAnalysis:
        """
        Analyze pronunciation from audio recording.
        
        Args:
            audio_bytes: Raw audio data
            mime_type: Audio MIME type (e.g., "audio/wav")
            expected_text: Expected Vietnamese text for comparison
            tokenizer: Tokenizer for the model
        
        Returns:
            AudioAnalysis with scores and identified issues
        """
        try:
            # Validate MIME type
            if not self.validate_input_format(mime_type):
                logger.warning(f"Unsupported audio format: {mime_type}, returning mock analysis")
                return self._mock_analysis(expected_text)
            
            # Convert audio to base64
            audio_base64 = self.audio_to_base64(audio_bytes)
            
            # Create Vietnamese analysis prompt
            prompt = f"""Bạn là chuyên gia phân tích phát âm tiếng Việt. 
Hãy phân tích file âm thanh và so sánh với văn bản gốc: "{expected_text}".

Tập trung vào các lỗi phát âm phổ biến:
- L/N: Nhầm lẫn giữa âm "L" và "N"
- TR/CH: Nhầm lẫn giữa âm "TR" và "CH"  
- S/X: Nhầm lẫn giữa âm "S" và "X"

Trả về JSON với cấu trúc:
{{
  "overallScore": <số 0-100>,
  "clarityScore": <số 0-100>,
  "fluencyScore": <số 0-100>,
  "confidenceLevel": "high|medium|low",
  "issues": [
    {{
      "phoneme": "L/N|TR/CH|S/X",
      "severity": "mild|moderate|severe",
      "description": "<mô tả lỗi>",
      "detectedWord": "<từ phát hiện>",
      "expectedWord": "<từ đúng>"
    }}
  ]
}}"""
            
            # Format multi-modal input (simplified - adjust based on actual Gemma 4 API)
            # This is a placeholder - actual implementation depends on how Gemma 4 accepts audio
            logger.info(f"Analyzing audio for text: {expected_text}")
            logger.warning("Audio analysis with Gemma 4 is not fully implemented yet")
            
            # For now, return mock analysis
            # TODO: Replace with actual Gemma 4 multi-modal API call
            return self._mock_analysis(expected_text)
            
        except Exception as e:
            logger.error(f"Audio analysis failed: {str(e)}")
            return self._mock_analysis(expected_text, confidence="low")
    
    def _mock_analysis(
        self,
        expected_text: str,
        confidence: str = "high"
    ) -> AudioAnalysis:
        """Generate mock analysis data for testing"""
        import random
        
        # Generate random scores
        overall = random.randint(70, 95)
        clarity = random.randint(70, 95)
        fluency = random.randint(70, 95)
        
        # Check for common Vietnamese phonemes in expected text
        issues = []
        if "l" in expected_text.lower():
            issues.append(PronunciationIssue(
                phoneme="L/N",
                severity="mild",
                description="Phát âm L hơi yếu, gần giống N",
                detected_word="núa",
                expected_word="lúa"
            ))
        
        if "tr" in expected_text.lower():
            issues.append(PronunciationIssue(
                phoneme="TR/CH",
                severity="mild",
                description="Âm TR cần phát âm rõ ràng hơn",
                detected_word="chời",
                expected_word="trời"
            ))
        
        return AudioAnalysis(
            overall_score=overall,
            clarity_score=clarity,
            fluency_score=fluency,
            confidence_level=confidence,
            issues=issues
        )
```

**Note**: The actual multi-modal API for Gemma 4 audio input may require specific formatting. Check HuggingFace documentation for the exact implementation once models are available.

---

### Priority 2: Flask HTTP Server (Wave 5-6)

#### Task 8.1: Create Flask app.py
**File**: `backend/python-ai-service/app.py`

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from services.gemma4_service import Gemma4Service
from services.multimodal_processor import MultiModalProcessor
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.getenv('LOG_LEVEL', 'INFO'),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, origins=allowed_origins)

# Initialize Gemma4 service (lazy loading on first request)
gemma4_service = None
multimodal_processor = None

def get_gemma4_service():
    """Get or initialize Gemma4 service"""
    global gemma4_service, multimodal_processor
    
    if gemma4_service is None:
        logger.info("Initializing Gemma4Service...")
        
        target_model = os.getenv('GEMMA4_TARGET_MODEL', 'google/gemma-4-e2b')
        assistant_model = os.getenv('GEMMA4_ASSISTANT_MODEL', 'google/gemma-4-1b')
        device = os.getenv('GEMMA4_DEVICE', 'auto')
        variant = os.getenv('GEMMA4_MODEL_VARIANT', 'e2b')
        
        gemma4_service = Gemma4Service(
            model_name=target_model,
            assistant_model_name=assistant_model,
            device=device,
            model_variant=variant
        )
        
        # Load models on initialization
        gemma4_service.ensure_models_loaded()
        
        # Initialize multimodal processor
        multimodal_processor = MultiModalProcessor(
            model=gemma4_service.target_model,
            model_variant=variant
        )
        
        logger.info("Gemma4Service initialized successfully")
    
    return gemma4_service, multimodal_processor

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        service, _ = get_gemma4_service()
        info = service.get_model_info()
        
        return jsonify({
            'status': 'ok',
            'model': info.target_model,
            'device': info.device,
            'variant': info.variant
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/chat', methods=['POST'])
def chat():
    """Chat response generation endpoint"""
    try:
        # Get request data
        data = request.json
        message = data.get('message')
        history = data.get('history', [])
        system_prompt = data.get('system_prompt')
        
        if not message:
            return jsonify({'error': 'Missing required field: message'}), 400
        
        # Get service and generate response
        service, _ = get_gemma4_service()
        
        logger.info(f"Generating response for message: {message[:50]}...")
        
        # Set timeout (handled by Flask)
        response, thinking = service.generate_chat_response(
            message=message,
            history=history,
            system_prompt=system_prompt
        )
        
        # Return response
        return jsonify({
            'response': response,
            'thinking': thinking,
            'model': service.model_name
        }), 200
        
    except Exception as e:
        logger.error(f"Chat generation failed: {str(e)}")
        return jsonify({
            'error': 'Failed to generate response',
            'details': str(e)
        }), 500

@app.route('/analyze-audio', methods=['POST'])
def analyze_audio():
    """Audio pronunciation analysis endpoint"""
    try:
        # Get request data
        data = request.json
        audio_base64 = data.get('audio_data')
        mime_type = data.get('mime_type')
        expected_text = data.get('expected_text')
        
        if not all([audio_base64, mime_type, expected_text]):
            return jsonify({
                'error': 'Missing required fields: audio_data, mime_type, expected_text'
            }), 400
        
        # Get service and processor
        service, processor = get_gemma4_service()
        
        # Decode base64 audio
        import base64
        audio_bytes = base64.b64decode(audio_base64)
        
        logger.info(f"Analyzing audio for text: {expected_text}")
        
        # Analyze audio
        analysis = processor.analyze_audio(
            audio_bytes=audio_bytes,
            mime_type=mime_type,
            expected_text=expected_text,
            tokenizer=service.tokenizer
        )
        
        # Convert to dict for JSON response
        return jsonify({
            'overallScore': analysis.overall_score,
            'clarityScore': analysis.clarity_score,
            'fluencyScore': analysis.fluency_score,
            'confidenceLevel': analysis.confidence_level,
            'issues': [
                {
                    'phoneme': issue.phoneme,
                    'severity': issue.severity,
                    'description': issue.description,
                    'detectedWord': issue.detected_word,
                    'expectedWord': issue.expected_word
                }
                for issue in analysis.issues
            ]
        }), 200
        
    except Exception as e:
        logger.error(f"Audio analysis failed: {str(e)}")
        return jsonify({
            'error': 'Failed to analyze audio',
            'details': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting Flask server on port {port}")
    logger.info(f"Allowed origins: {allowed_origins}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
```

**Test Flask Server**:
```bash
cd backend/python-ai-service

# Make sure .env is configured
python app.py

# In another terminal, test endpoints:
curl http://localhost:5000/health

curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Xin chào", "history": []}'
```

---

### Priority 3: TypeScript Integration (Wave 7-9)

#### Task 10.1: Create Gemma4Client
**File**: `backend/src/services/gemma4.client.ts`

```typescript
import axios, { AxiosInstance } from 'axios';

interface ChatRequest {
  message: string;
  history: Array<{ role: string; content: string }>;
  system_prompt?: string;
}

interface ChatResponse {
  response: string;
  thinking: string | null;
  model: string;
}

interface AudioAnalysisRequest {
  audio_data: string;  // base64
  mime_type: string;
  expected_text: string;
}

interface AudioAnalysisResponse {
  overallScore: number;
  clarityScore: number;
  fluencyScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  issues: Array<{
    phoneme: string;
    severity: string;
    description: string;
    detectedWord: string;
    expectedWord: string;
  }>;
}

export class Gemma4Client {
  private client: AxiosInstance;
  private host: string;

  constructor(host: string = 'http://localhost:5000', timeout: number = 30000) {
    this.host = host;
    this.client = axios.create({
      baseURL: host,
      timeout: timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async healthCheck(): Promise<{ status: string; model: string; device: string }> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error: any) {
      throw new Error(`Gemma4 health check failed: ${error.message}`);
    }
  }

  async generateChatResponse(
    message: string,
    history: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    try {
      const request: ChatRequest = {
        message,
        history,
      };

      const response = await this.client.post<ChatResponse>('/chat', request);
      return response.data.response;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Gemma4 service');
      }
      if (error.response?.status === 408) {
        throw new Error('Gemma4 request timeout');
      }
      throw new Error(`Gemma4 chat failed: ${error.message}`);
    }
  }

  async analyzeAudio(
    audioBase64: string,
    mimeType: string,
    expectedText: string
  ): Promise<AudioAnalysisResponse> {
    try {
      const request: AudioAnalysisRequest = {
        audio_data: audioBase64,
        mime_type: mimeType,
        expected_text: expectedText,
      };

      const response = await this.client.post<AudioAnalysisResponse>(
        '/analyze-audio',
        request
      );
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Gemma4 service');
      }
      throw new Error(`Gemma4 audio analysis failed: ${error.message}`);
    }
  }
}

export const gemma4Client = new Gemma4Client(
  process.env.GEMMA4_HOST || 'http://localhost:5000',
  parseInt(process.env.GEMMA4_TIMEOUT || '30000')
);
```

---

#### Task 11.1-11.3: Update AI Service
**File**: `backend/src/services/ai.service.ts`

Add Gemma4 to the service:

```typescript
import { geminiService } from './gemini.service';
import { ollamaService } from './ollama.service';
import { gemma4Client } from './gemma4.client';  // Add this

export class AIService {
  private provider: 'gemini' | 'ollama' | 'gemma4' = 'gemma4';  // Update default

  constructor() {
    const aiService = process.env.AI_SERVICE?.toLowerCase();
    
    if (aiService === 'gemma4') {
      this.provider = 'gemma4';
      console.log('🤖 AI Service: Using Gemma 4 (Python Bridge)');
    } else if (aiService === 'gemini') {
      this.provider = 'gemini';
      console.log('🤖 AI Service: Using Google Gemini API');
    } else if (aiService === 'ollama') {
      this.provider = 'ollama';
      console.log('🤖 AI Service: Using Ollama (Local Gemma)');
    } else {
      // Auto-detect: Try Gemma4 first, then Ollama, then Gemini
      this.autoDetect();
    }
  }

  private async autoDetect() {
    try {
      await gemma4Client.healthCheck();
      this.provider = 'gemma4';
      console.log('🤖 AI Service: Auto-detected Gemma 4');
      return;
    } catch (e) {
      // Gemma4 not available, try Ollama
    }

    if (ollamaService.isServiceAvailable()) {
      this.provider = 'ollama';
      console.log('🤖 AI Service: Auto-detected Ollama');
      return;
    }

    if (process.env.GEMINI_API_KEY) {
      this.provider = 'gemini';
      console.log('🤖 AI Service: Auto-detected Gemini API');
      return;
    }

    this.provider = 'gemma4'; // Default, will use fallback
    console.log('⚠️ AI Service: No service available, using fallback');
  }

  async generateChatResponse(message: string, history: any[] = []): Promise<string> {
    console.log(`[AI Service] Using provider: ${this.provider}`);
    
    try {
      // Try primary provider
      if (this.provider === 'gemma4') {
        return await gemma4Client.generateChatResponse(message, history);
      } else if (this.provider === 'ollama') {
        return await ollamaService.generateChatResponse(message, history);
      } else {
        return await geminiService.generateChatResponse(message, history);
      }
    } catch (error: any) {
      console.error(`[AI Service] ${this.provider} failed:`, error.message);
      
      // Fallback chain: gemma4 → ollama → gemini
      return await this.fallbackGenerate(message, history);
    }
  }

  private async fallbackGenerate(message: string, history: any[]): Promise<string> {
    // Try Gemma4
    if (this.provider !== 'gemma4') {
      try {
        console.log('[AI Service] Attempting fallback to Gemma4...');
        return await gemma4Client.generateChatResponse(message, history);
      } catch (e) {
        console.error('[AI Service] Gemma4 fallback failed');
      }
    }

    // Try Ollama
    if (this.provider !== 'ollama') {
      try {
        console.log('[AI Service] Attempting fallback to Ollama...');
        return await ollamaService.generateChatResponse(message, history);
      } catch (e) {
        console.error('[AI Service] Ollama fallback failed');
      }
    }

    // Try Gemini
    if (this.provider !== 'gemini') {
      try {
        console.log('[AI Service] Attempting fallback to Gemini...');
        return await geminiService.generateChatResponse(message, history);
      } catch (e) {
        console.error('[AI Service] Gemini fallback failed');
      }
    }

    throw new Error('All AI services unavailable');
  }

  getProvider(): string {
    return this.provider;
  }

  getStatus(): { provider: string; gemma4: boolean; ollama: boolean; gemini: boolean } {
    return {
      provider: this.provider,
      gemma4: true, // Check with healthCheck() for real status
      ollama: ollamaService.isServiceAvailable(),
      gemini: !!process.env.GEMINI_API_KEY,
    };
  }
}

export const aiService = new AIService();
```

---

### Priority 4: Environment Configuration (Wave 11)

#### Task 14.1: Update backend/.env.example

Add these lines:
```bash
# AI Service Configuration
AI_SERVICE=gemma4  # Options: gemma4, ollama, gemini

# Gemma 4 Python Bridge Configuration
GEMMA4_HOST=http://localhost:5000
GEMMA4_TIMEOUT=30000
```

#### Task 14.2: Verify python-ai-service/.env.example
Already created in Task 1 ✅

---

## 🧪 Testing Strategy

### 1. Test Python Service Independently
```bash
cd backend/python-ai-service
python app.py

# Test health
curl http://localhost:5000/health

# Test chat
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Xin chào", "history": []}'
```

### 2. Test Node.js Integration
```bash
cd backend
npm run dev

# The app should auto-detect Gemma4 and use it
# Check logs for: "🤖 AI Service: Using Gemma 4"
```

### 3. Test Fallback Chain
```bash
# Stop Python service
# Node.js should fallback to Ollama or Gemini
# Check logs for fallback messages
```

---

## 📚 Remaining Tasks Summary

**Wave 5** (1 task): Task 8.1 Flask app ← **START HERE**
**Wave 6** (3 tasks): Flask endpoints (already included in app.py above)
**Wave 7** (1 task): Task 10.1 Gemma4Client ← **THEN THIS**
**Wave 8** (1 task): Task 11.1 Update ai.service.ts ← **THEN THIS**
**Wave 9-12**: Optional tests, Vietnamese utils, documentation

---

## 🎯 Quick Win Path

If you want the fastest path to a working system:

1. **Add Task 5.2 code** to gemma4_service.py (speculative decoding integration)
2. **Add Task 7.2 code** to multimodal_processor.py (audio analysis - use mock for now)
3. **Create app.py** with Flask endpoints (code provided above)
4. **Test Python service** independently
5. **Create gemma4.client.ts** (code provided above)
6. **Update ai.service.ts** (code provided above)
7. **Update .env files** with Gemma4 configuration
8. **Test end-to-end**

Total time: ~2-3 hours of implementation

---

## 📞 Support Files

All detailed task descriptions are in:
`c:\Users\trand\Downloads\Web_proj\.kiro\specs\gemma-4-migration\tasks.md`

Current implementation status:
`c:\Users\trand\Downloads\Web_proj\backend\GEMMA4_IMPLEMENTATION_STATUS.md`

Good luck! 🚀
