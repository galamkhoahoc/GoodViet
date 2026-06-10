# Hướng dẫn tích hợp Ollama với Gemma Model

## Bước 1: Cài đặt Ollama

### Windows:
1. Tải Ollama từ: https://ollama.com/download
2. Chạy installer
3. Mở Command Prompt và test: `ollama --version`

### Cài đặt model Gemma:
```bash
# Gemma 2B (nhẹ, nhanh - khuyến nghị cho chatbot)
ollama pull gemma:2b

# Hoặc Gemma 7B (chất lượng cao hơn nhưng chậm hơn)
ollama pull gemma:7b
```

## Bước 2: Chạy Ollama Server

```bash
# Ollama tự động chạy như service sau khi cài đặt
# API endpoint: http://localhost:11434
```

## Bước 3: Cài đặt Ollama client cho Node.js

```bash
cd backend
npm install ollama
```

## Bước 4: Tạo Ollama Service

**File: `backend/src/services/ollama.service.ts`**

```typescript
import { Ollama } from 'ollama';

/**
 * Service to handle interactions with Ollama (Local Gemma model)
 */
export class OllamaService {
  private ollama: Ollama;
  private model: string = 'gemma:2b';

  constructor() {
    this.ollama = new Ollama({
      host: 'http://localhost:11434'
    });
    this.testConnection();
  }

  private async testConnection() {
    try {
      const response = await this.ollama.list();
      console.log('✅ Ollama connected. Available models:', response.models.map(m => m.name));
    } catch (error) {
      console.warn('⚠️ Ollama not available. Make sure Ollama is running.');
    }
  }

  /**
   * Generate a response for a chat message given conversation history
   */
  async generateChatResponse(message: string, history: any[] = []): Promise<string> {
    try {
      console.log('[Ollama] Generating response for message:', message);
      
      // Format conversation history
      const messages = [
        {
          role: 'system',
          content: `Bạn là trợ lý hỗ trợ người dùng cải thiện giọng nói tiếng Việt trên nền tảng GOODVIET. Hãy động viên, kiên nhẫn và chuyên nghiệp. Luôn trả lời bằng tiếng Việt, ngắn gọn và thân thiện. Không đưa ra chẩn đoán y khoa.`
        },
        // Add history
        ...history.map(msg => ({
          role: msg.senderType === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        // Add current message
        {
          role: 'user',
          content: message
        }
      ];

      const response = await this.ollama.chat({
        model: this.model,
        messages: messages,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500, // max tokens
        }
      });

      const text = response.message.content;
      console.log('[Ollama] Response received, length:', text.length);
      
      return text;
    } catch (error: any) {
      console.error('[Ollama] Error:', error.message);
      throw new Error('Ollama service error: ' + error.message);
    }
  }

  /**
   * Stream response (for future use)
   */
  async *streamChatResponse(message: string, history: any[] = []) {
    const messages = [
      {
        role: 'system',
        content: `Bạn là trợ lý hỗ trợ người dùng cải thiện giọng nói tiếng Việt trên nền tảng GOODVIET.`
      },
      ...history.map(msg => ({
        role: msg.senderType === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const stream = await this.ollama.chat({
      model: this.model,
      messages: messages,
      stream: true,
    });

    for await (const chunk of stream) {
      yield chunk.message.content;
    }
  }
}

export const ollamaService = new OllamaService();
```

## Bước 5: Cập nhật Chat Controller

**File: `backend/src/controllers/chat.controller.ts`**

Thay thế:
```typescript
import { geminiService } from '../services/gemini.service';
```

Bằng:
```typescript
import { ollamaService } from '../services/ollama.service';
```

Và thay:
```typescript
const botResponseContent = await geminiService.generateChatResponse(content, formattedHistory);
```

Bằng:
```typescript
const botResponseContent = await ollamaService.generateChatResponse(content, formattedHistory);
```

## Bước 6: Cập nhật .env

```env
# AI Service Configuration
AI_SERVICE=ollama  # hoặc 'gemini'
OLLAMA_MODEL=gemma:2b
OLLAMA_HOST=http://localhost:11434

# Giữ lại Gemini API key cho future use
GEMINI_API_KEY=AIzaSy...
```

## Bước 7: Test

```bash
# Trong terminal riêng, check Ollama đang chạy:
ollama list

# Restart backend
npm run dev

# Test chat endpoint
curl -X POST http://localhost:3000/api/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content": "Xin chào"}'
```

## So sánh Gemma models:

| Model | Size | RAM | Speed | Quality |
|-------|------|-----|-------|---------|
| gemma:2b | 1.4GB | 8GB | ⚡⚡⚡ Fast | ⭐⭐⭐ Good |
| gemma:7b | 4.8GB | 16GB | ⚡⚡ Medium | ⭐⭐⭐⭐ Very Good |

**Khuyến nghị:** Dùng `gemma:2b` cho chatbot - đủ tốt và nhanh.

## Lưu ý:

1. **Ollama phải chạy** trước khi start backend
2. **Lần đầu pull model** sẽ mất thời gian (download 1-5GB)
3. **Response sẽ chậm hơn** so với Gemini API (3-10 giây)
4. **Có thể chạy offline** hoàn toàn

## Troubleshooting:

**Nếu lỗi "Ollama not available":**
```bash
# Check Ollama service
ollama serve

# Hoặc restart Ollama service trên Windows
```

**Nếu model không có:**
```bash
ollama pull gemma:2b
```

**Nếu response chậm:**
- Dùng model nhỏ hơn (gemma:2b thay vì 7b)
- Giảm `num_predict` xuống 200-300
- Tăng RAM cho máy
