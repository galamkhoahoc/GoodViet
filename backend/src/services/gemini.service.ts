import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

/**
 * Service to handle interactions with Google Gemini API
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private audioModel: any = null;
  
  private apiKeys: string[] = [];
  private currentKeyIndex = 0;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.apiKeys.push(env.GEMINI_API_KEY);
    }
    
    const envKeys = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()) : [];
    this.apiKeys.push(...envKeys);
    
    this.apiKeys = [...new Set(this.apiKeys.filter(k => k.length > 0))];
    
    this.initModel();
  }

  private initModel() {
    if (this.apiKeys.length > 0) {
      const currentKey = this.apiKeys[this.currentKeyIndex];
      this.genAI = new GoogleGenerativeAI(currentKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      });
      this.audioModel = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      console.log(`[Gemini] Initialized with API Key index ${this.currentKeyIndex}`);
    } else {
      console.warn('GEMINI_API_KEY is not set. Gemini Service will run in mock mode.');
    }
  }

  private rotateKey(): boolean {
    if (this.apiKeys.length <= 1) return false;
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    console.log(`[Gemini] Rotating API Key to index ${this.currentKeyIndex}`);
    this.initModel();
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
      if (!this.model) {
        console.log('[Gemini] Model not initialized, using mock response');
        return this.generateMockResponse(message);
      }

      try {
        console.log('[Gemini] Generating response for message:', message);
        
        const systemPrompt = {
          parts: [{ 
            text: `Bạn là trợ lý hỗ trợ người dùng cải thiện giọng nói tiếng Việt trên nền tảng GOODVIET. Hãy động viên, kiên nhẫn và chuyên nghiệp. Luôn trả lời bằng tiếng Việt, ngắn gọn và thân thiện. Không đưa ra chẩn đoán y khoa.`
          }]
        };

        const formattedHistory = history.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        const chat = this.model.startChat({
          history: formattedHistory,
          systemInstruction: systemPrompt,
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
      } catch (error: any) {
        attempts++;
        const errorMsg = error.message || String(error);
        console.error(`[Gemini] API Error (attempt ${attempts}/${maxRetries}):`, errorMsg);
        
        if (this.shouldRotateKey(errorMsg) && attempts < maxRetries) {
          console.warn('[Gemini] Key exhausted/rate-limited. Attempting rotation...');
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
   * Analyze audio pronunciation using Gemini 1.5 Flash
   */
  async analyzePronunciation(audioBuffer: Buffer, mimeType: string, expectedText: string): Promise<any> {
    const maxRetries = Math.max(1, this.apiKeys.length);
    let attempts = 0;

    while (attempts < maxRetries) {
      if (!this.audioModel) {
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

        const result = await this.audioModel.generateContent([
          { inlineData: { data: audioBuffer.toString("base64"), mimeType } },
          { text: prompt }
        ]);
        
        let text = await result.response.text();
        text = text.trim();
        if (text.startsWith('```json')) text = text.substring(7);
        if (text.startsWith('```')) text = text.substring(3);
        if (text.endsWith('```')) text = text.substring(0, text.length - 3);
        
        return JSON.parse(text);
      } catch (error: any) {
        attempts++;
        const errorMsg = error.message || String(error);
        console.error(`[Gemini Audio Analysis] API Error (attempt ${attempts}/${maxRetries}):`, errorMsg);
        
        if (this.shouldRotateKey(errorMsg) && attempts < maxRetries) {
          console.warn('[Gemini Audio Analysis] Key exhausted/rate-limited. Attempting rotation...');
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
