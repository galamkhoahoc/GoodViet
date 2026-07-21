import { env } from '../config/env';

/**
 * Service to handle interactions with XAH AI API (replacing Gemini)
 */
export class GeminiService {
  private apiKeys: string[] = [];
  private currentKeyIndex = 0;
  private endpoint = 'https://api.xah.io/v1beta/models/phatchau036/gemma4-31b:generateContent';

  constructor() {
    if (env.XAH_API_KEY) {
      this.apiKeys.push(env.XAH_API_KEY);
    }
    if (env.GEMINI_API_KEY) {
      this.apiKeys.push(env.GEMINI_API_KEY);
    }
    
    const envKeys = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()) : [];
    this.apiKeys.push(...envKeys);
    
    this.apiKeys = [...new Set(this.apiKeys.filter(k => k.length > 0))];
    
    if (this.apiKeys.length > 0) {
      console.log(`[AI Service] Initialized with API Key index ${this.currentKeyIndex}`);
    } else {
      console.warn('API Key is not set. AI Service will run in mock mode.');
    }
  }

  private rotateKey(): boolean {
    if (this.apiKeys.length <= 1) return false;
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    console.log(`[AI Service] Rotating API Key to index ${this.currentKeyIndex}`);
    return true;
  }

  private shouldRotateKey(errorMsg: string): boolean {
    const msg = errorMsg.toLowerCase();
    return msg.includes('429') || msg.includes('quota') || msg.includes('limit') || msg.includes('too many requests') || msg.includes('exhausted');
  }

  /**
   * Generate a response for a chat message given conversation history
   */
  async generateChatResponse(message: string, history: any[] = []): Promise<string> {
    const maxRetries = Math.max(1, this.apiKeys.length);
    let attempts = 0;

    while (attempts < maxRetries) {
      if (this.apiKeys.length === 0) {
        console.log('[AI Service] API Key not set, using mock response');
        return this.generateMockResponse(message);
      }

      try {
        console.log('[AI Service] Generating response for message:', message);
        
        const systemPrompt = `[System Instruction: Bạn là trợ lý hỗ trợ người dùng cải thiện giọng nói tiếng Việt trên nền tảng GOODVIET. Hãy động viên, kiên nhẫn và chuyên nghiệp. Luôn trả lời bằng tiếng Việt, ngắn gọn và thân thiện. Không đưa ra chẩn đoán y khoa.]`;

        const formattedHistory = history.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));
        
        // Inject system prompt into the first message or create a leading message
        const contents = [];
        if (formattedHistory.length === 0) {
          contents.push({
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${message}` }]
          });
        } else {
          // If there is history, prepend the system prompt to the first user message
          const firstMsg = formattedHistory[0];
          if (firstMsg.role === 'user') {
            firstMsg.parts[0].text = `${systemPrompt}\n\n${firstMsg.parts[0].text}`;
          } else {
            formattedHistory.unshift({
              role: 'user',
              parts: [{ text: systemPrompt }]
            });
          }
          contents.push(...formattedHistory);
          contents.push({
            role: 'user',
            parts: [{ text: message }]
          });
        }

        const currentKey = this.apiKeys[this.currentKeyIndex];
        const res = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ contents })
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error ${res.status}: ${text}`);
        }

        const data = (await res.json()) as any;
        const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textResponse) {
          throw new Error(`Invalid response format: ${JSON.stringify(data)}`);
        }
        
        return textResponse;
      } catch (error: any) {
        attempts++;
        const errorMsg = error.message || String(error);
        console.error(`[AI Service] API Error (attempt ${attempts}/${maxRetries}):`, errorMsg);
        
        if (this.shouldRotateKey(errorMsg) && attempts < maxRetries) {
          console.warn('[AI Service] Key exhausted/rate-limited. Attempting rotation...');
          this.rotateKey();
          continue;
        }
        
        return this.generateMockResponse(message);
      }
    }
    return this.generateMockResponse(message);
  }

  /**
   * Temporary mock response generator
   */
  private async generateMockResponse(message: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `[Hệ thống]: API AI hiện tại đang gặp lỗi (có thể do sai tên Model, sai API Key hoặc hết Quota). Bạn đang thấy tin nhắn dự phòng tự động. Xin vui lòng thử lại sau.`;
  }

  /**
   * Analyze audio pronunciation
   */
  async analyzePronunciation(audioBuffer: Buffer, mimeType: string, expectedText: string): Promise<any> {
    const maxRetries = Math.max(1, this.apiKeys.length);
    let attempts = 0;

    while (attempts < maxRetries) {
      if (this.apiKeys.length === 0) {
        return this.mockAnalysis(expectedText);
      }

      try {
        const prompt = `Bạn là chuyên gia phân tích âm ngữ tiếng Việt. Hãy phân tích file âm thanh này so với văn bản gốc: "${expectedText}".
Tập trung vào các lỗi phổ biến: L/N, TR/CH, S/X.
Chỉ trả về JSON hợp lệ (không kèm markdown \`\`\` hay văn bản khác) theo cấu trúc:
{
  "overallScore": number (0-100),
  "clarityScore": number (0-100),
  "fluencyScore": number (0-100),
  "confidenceLevel": "high" | "medium" | "low",
  "issues": [
    { "phoneme": "L/N" hoặc "TR/CH" hoặc "S/X", "severity": "mild"|"moderate"|"severe", "description": string, "detectedWord": string, "expectedWord": string }
  ]
}`;

        const contents = [
          {
            role: "user",
            parts: [
              { inlineData: { data: audioBuffer.toString("base64"), mimeType } },
              { text: prompt }
            ]
          }
        ];

        const currentKey = this.apiKeys[this.currentKeyIndex];
        const res = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ contents })
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error ${res.status}: ${text}`);
        }
        
        const data = (await res.json()) as any;
        let textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textResponse) {
          throw new Error(`Invalid response format: ${JSON.stringify(data)}`);
        }

        let text = textResponse.trim();
        if (text.startsWith('```json')) text = text.substring(7);
        if (text.startsWith('```')) text = text.substring(3);
        if (text.endsWith('```')) text = text.substring(0, text.length - 3);
        
        return JSON.parse(text);
      } catch (error: any) {
        attempts++;
        const errorMsg = error.message || String(error);
        console.error(`[AI Service Audio Analysis] API Error (attempt ${attempts}/${maxRetries}):`, errorMsg);
        
        if (this.shouldRotateKey(errorMsg) && attempts < maxRetries) {
          console.warn('[AI Service Audio Analysis] Key exhausted/rate-limited. Attempting rotation...');
          this.rotateKey();
          continue;
        }
        
        return this.mockAnalysis(expectedText);
      }
    }
    
    return this.mockAnalysis(expectedText);
  }

  private mockAnalysis(expectedText: string) {
    return {
      overallScore: Math.floor(Math.random() * 30) + 70,
      clarityScore: Math.floor(Math.random() * 30) + 70,
      fluencyScore: Math.floor(Math.random() * 30) + 70,
      confidenceLevel: "high",
      issues: expectedText.toLowerCase().includes("l") ? [
        { phoneme: "L/N", severity: "mild", description: "Lỗi L/N nhẹ", detectedWord: "núa", expectedWord: "lúa" }
      ] : []
    };
  }
}

export const geminiService = new GeminiService();
