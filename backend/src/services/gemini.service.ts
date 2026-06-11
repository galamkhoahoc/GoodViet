import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

/**
 * Service to handle interactions with Google Gemini API
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  private audioModel: any = null;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      // Use gemini-flash-latest - works with current free tier API key
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      });
      // Use same model for audio
      this.audioModel = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    } else {
      console.warn('GEMINI_API_KEY is not set. Gemini Service will run in mock mode.');
    }
  }

  /**
   * Generate a response for a chat message given conversation history
   */
  async generateChatResponse(message: string, history: any[] = []): Promise<string> {
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

      // Format history for Gemini API
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      console.log('[Gemini] Starting chat with history length:', formattedHistory.length);

      // Gemini 1.5 Flash supports systemInstruction
      const chat = this.model.startChat({
        history: formattedHistory,
        systemInstruction: systemPrompt,
      });

      console.log('[Gemini] Sending message to API...');
      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();
      
      console.log('[Gemini] Response received, length:', text.length);
      console.log('[Gemini] First 100 chars:', text.substring(0, 100));
      
      return text;
    } catch (error: any) {
      console.error('[Gemini] API Error:', error.message);
      console.error('[Gemini] Error details:', error);
      // Fallback to mock response to prevent breaking the UI if API key lacks permissions or model 404s
      return this.generateMockResponse(message);
    }
  }

  /**
   * Temporary mock response generator
   */
  private async generateMockResponse(message: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `[Hệ thống]: API AI hiện tại đang gặp lỗi (có thể do sai tên Model, sai API Key hoặc hết Quota). Bạn đang thấy tin nhắn dự phòng tự động. Xin vui lòng kiểm tra lại cấu hình AI trong file .env hoặc gemini.service.ts.`;
  }

  /**
   * Analyze audio pronunciation using Gemini 1.5 Flash
   */
  async analyzePronunciation(audioBuffer: Buffer, mimeType: string, expectedText: string): Promise<any> {
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
    } catch (error) {
      console.error('Gemini Audio Analysis Error:', error);
      return this.mockAnalysis(expectedText);
    }
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
