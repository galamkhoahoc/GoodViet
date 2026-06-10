# Gemma 4 Python AI Service

Python-based HTTP bridge providing Gemma 4 model capabilities for the GoodViet Vietnamese language learning platform.

## Features

- 🤖 **Gemma 4 Models**: Latest Google Gemma 4 (E2B/E4B) with thinking mode
- ⚡ **Speculative Decoding**: 20% faster inference using assistant model
- 🎙️ **Multi-Modal**: Audio analysis for pronunciation feedback (E2B/E4B)
- 🧠 **Thinking Mode**: Internal reasoning for better response quality
- 🌐 **REST API**: Simple HTTP endpoints for Node.js backend integration
- 🔄 **Fallback Support**: Part of AI service orchestrator with Ollama/Gemini fallback

## Requirements

### System Requirements
- **Python**: 3.9 or higher
- **RAM**: Minimum 8GB (16GB+ recommended for E4B model)
- **GPU**: CUDA-capable GPU recommended (optional, will use CPU if unavailable)
- **Disk Space**: ~10GB for model downloads

### Python Version

```bash
python --version  # Should be 3.9+
```

## Installation

### 1. Navigate to Service Directory

```bash
cd backend/python-ai-service
```

### 2. Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- `transformers` - Hugging Face Transformers library
- `torch` - PyTorch framework
- `flask` - Web framework
- `flask-cors` - CORS support
- `python-dotenv` - Environment variable management
- `accelerate` - Model acceleration utilities

### 4. GPU Setup (Optional but Recommended)

#### CUDA (NVIDIA GPU)

**Check CUDA availability:**
```bash
python -c "import torch; print('CUDA available:', torch.cuda.is_available())"
```

**Install CUDA drivers:**
- Download from [NVIDIA CUDA Toolkit](https://developer.nvidia.com/cuda-downloads)
- Recommended: CUDA 11.8 or 12.1
- Verify installation: `nvcc --version`

**Install PyTorch with CUDA:**
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

## Configuration

### 1. Create Environment File

```bash
copy .env.example .env  # Windows
cp .env.example .env    # Linux/macOS
```

### 2. Configure Environment Variables

Edit `.env` file:

```env
# Server
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Model Selection
GEMMA4_TARGET_MODEL=google/gemma-4-e2b
GEMMA4_ASSISTANT_MODEL=google/gemma-4-1b
GEMMA4_DEVICE=auto  # auto, cuda, or cpu
GEMMA4_MODEL_VARIANT=e2b  # e2b or e4b

# Generation Parameters (per Gemma 4 best practices)
TEMPERATURE=1.0
TOP_P=0.95
TOP_K=64
MAX_NEW_TOKENS=256
```

### Model Variants

| Variant | Size | Capabilities | Use Case |
|---------|------|-------------|----------|
| `e2b` | 2B | Audio + Image | Recommended for most users |
| `e4b` | 4B | Audio + Image + Video | Higher quality, needs more RAM/GPU |

### Device Selection

- **`auto`** (recommended): Detects CUDA GPU, falls back to CPU
- **`cuda`**: Forces GPU usage (fails if GPU unavailable)
- **`cpu`**: Forces CPU usage (slower, for testing only)

## Running the Service

### Start Flask Server

```bash
python app.py
```

Expected output:
```
[2024-01-15 10:00:00] INFO: CORS enabled for origins: ['http://localhost:3000', 'http://localhost:5173']
[2024-01-15 10:00:00] INFO: Gemma4Service initialized successfully
[2024-01-15 10:00:00] INFO: Starting Flask server on port 5000
 * Running on http://0.0.0.0:5000
```

### First Run

**Model Download**: On first run, models will be downloaded from Hugging Face (~4-8GB). This may take 10-30 minutes depending on your connection.

**Model Loading**: After download, models load into memory (~5-10 seconds with GPU, longer with CPU).

**Ready**: Once you see "Gemma4Service initialized successfully", the service is ready.

## API Endpoints

### Health Check

**Request:**
```bash
GET http://localhost:5000/health
```

**Response:**
```json
{
  "status": "ok",
  "model": "google/gemma-4-e2b",
  "assistant_model": "google/gemma-4-1b",
  "device": "cuda",
  "variant": "e2b"
}
```

### Chat Generation

**Request:**
```bash
POST http://localhost:5000/chat
Content-Type: application/json

{
  "message": "Xin chào, bạn có thể giúp tôi học tiếng Việt không?",
  "history": [
    {"role": "user", "content": "Tôi muốn cải thiện phát âm"},
    {"role": "assistant", "content": "Tôi sẽ giúp bạn!"}
  ],
  "system_prompt": "Bạn là trợ lý dạy tiếng Việt." // Optional
}
```

**Response:**
```json
{
  "response": "Chào bạn! Tôi rất vui được giúp bạn học tiếng Việt...",
  "thinking": "User wants to improve Vietnamese pronunciation...",
  "model": "google/gemma-4-e2b"
}
```

### Audio Analysis

**Request:**
```bash
POST http://localhost:5000/analyze-audio
Content-Type: application/json

{
  "audio_data": "base64_encoded_audio_here",
  "mime_type": "audio/wav",
  "expected_text": "Xin chào"
}
```

**Response:**
```json
{
  "overallScore": 85,
  "clarityScore": 90,
  "fluencyScore": 80,
  "confidenceLevel": "high",
  "issues": [
    {
      "phoneme": "ch",
      "severity": "moderate",
      "description": "Âm 'ch' chưa rõ ràng",
      "detectedWord": "sin",
      "expectedWord": "xin"
    }
  ]
}
```

## Testing Endpoints

### Using curl

**Health check:**
```bash
curl http://localhost:5000/health
```

**Chat:**
```bash
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Xin chào!"}'
```

### Using Python

```python
import requests

# Health check
response = requests.get('http://localhost:5000/health')
print(response.json())

# Chat
response = requests.post('http://localhost:5000/chat', json={
    'message': 'Xin chào, bạn có thể giúp tôi học tiếng Việt không?',
    'history': []
})
print(response.json())
```

## Integration with Node.js Backend

The Python service is designed to work with the Node.js backend through the `Gemma4Client`:

1. **Start Python service** on port 5000
2. **Start Node.js backend** on port 3000
3. **Configure backend** `.env`:
   ```env
   AI_SERVICE=gemma4
   GEMMA4_HOST=http://localhost:5000
   GEMMA4_TIMEOUT=30000
   ```
4. **Fallback chain**: Gemma4 → Ollama → Gemini

## Troubleshooting

### Model Loading Issues

**Problem**: "CUDA out of memory"
- **Solution**: Use smaller model (E2B instead of E4B) or set `GEMMA4_DEVICE=cpu`

**Problem**: "Cannot download model"
- **Solution**: Check internet connection, verify Hugging Face access
- May need to login: `huggingface-cli login`

### Performance Issues

**Problem**: Slow response times
- **Solution 1**: Use GPU (`GEMMA4_DEVICE=cuda`)
- **Solution 2**: Enable speculative decoding (already enabled by default)
- **Solution 3**: Reduce `MAX_NEW_TOKENS`

**Problem**: High memory usage
- **Solution**: Use E2B model instead of E4B, close other applications

### Connection Issues

**Problem**: "Cannot connect to Gemma4 service"
- **Solution**: Verify Python service is running on port 5000
- Check firewall settings
- Verify `ALLOWED_ORIGINS` includes Node.js backend URL

## Performance Benchmarks

| Configuration | Latency (avg) | Throughput |
|--------------|---------------|------------|
| E2B + CPU | ~8-12s | 1-2 req/min |
| E2B + CUDA | ~2-3s | 10-15 req/min |
| E4B + CUDA | ~3-5s | 8-12 req/min |

*With speculative decoding: ~20% faster

## Development

### Run Tests

```bash
# Unit tests
pytest tests/test_thinking_parser.py
pytest tests/test_multimodal_processor.py

# Integration tests
python test_gemma4_service.py
python test_chat_response.py
```

### Debug Mode

Enable detailed logging:

```env
FLASK_DEBUG=true
LOG_LEVEL=DEBUG
```

## Production Deployment

### Recommended Configuration

```env
PORT=5000
FLASK_DEBUG=false
LOG_LEVEL=INFO
GEMMA4_DEVICE=cuda
GEMMA4_TARGET_MODEL=google/gemma-4-e2b
ENABLE_MODEL_WARMING=true
```

### Process Management

Use a process manager like `systemd`, `supervisor`, or `pm2`:

```bash
# Using gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker (Future)

*Docker support coming soon*

## Support

For issues or questions:
- Check logs: `LOG_LEVEL=DEBUG`
- Review [Gemma 4 documentation](https://ai.google.dev/gemma)
- Contact development team

## License

Part of GoodViet platform. See main project LICENSE.
