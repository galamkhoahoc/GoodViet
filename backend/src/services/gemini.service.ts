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
      // Use gemini-1.5-flash for chat interactions
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      // Use gemini-3.1-flash-tts-preview specifically for audio/pronunciation recognition
      this.audioModel = this.genAI.getGenerativeModel({ model: "gemini-3.1-flash-tts-preview" });
    } else {
      console.warn('GEMINI_API_KEY is not set. Gemini Service will run in mock mode.');
    }
  }

  /**
   * Generate a response for a chat message given conversation history
   */
  async generateChatResponse(message: string, history: any[] = []): Promise<string> {
    if (!this.model) {
      return this.generateMockResponse(message);
    }

    try {
      const systemPrompt = `You are a motivational speech therapy companion for the GOODVIET platform. 
GOODVIET helps Vietnamese speakers correct common pronunciation issues like L/N, TR/CH, and S/X.
Your personality is encouraging, patient, and knowledgeable.
Important: 
- Avoid medical diagnoses.
- Stay within the speech therapy domain.
- Politely redirect off-topic questions.
- Keep responses concise and natural.
- Respond in Vietnamese.`;

      // Format history for Gemini API
      const formattedHistory = history.map(msg => ({
        role: msg.senderType === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const chat = this.model.startChat({
        history: formattedHistory,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      // Send the system prompt first if this is the start of the conversation
      if (history.length === 0) {
        // Since system instruction is supported differently in newer SDKs, we prepend it to the first message
        const result = await chat.sendMessage(`${systemPrompt}\n\nNgười dùng: ${message}`);
        const response = await result.response;
        return response.text();
      } else {
        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate response from AI');
    }
  }

  /**
   * Temporary mock response generator
   */
  private async generateMockResponse(message: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('l/n') || lowerMsg.includes('chữ l') || lowerMsg.includes('chữ n')) {
      return 'Lỗi phát âm L/N là rất phổ biến ở một số vùng miền. Bí quyết là: với âm L, bạn hãy cong lưỡi chạm ngạc cứng; với âm N, hãy thẳng lưỡi và để hơi thoát qua mũi nhé. Cố lên!';
    }
    
    if (lowerMsg.includes('chào') || lowerMsg.includes('hello')) {
      return 'Chào bạn! Mình là trợ lý AI của GOODVIET. Hôm nay bạn muốn luyện tập phát âm hay cần mình tư vấn lộ trình học nào?';
    }

    return 'Mình hiểu ý bạn. Hãy kiên trì luyện tập mỗi ngày 15 phút, chắc chắn bạn sẽ cải thiện được giọng nói của mình. GOODVIET luôn đồng hành cùng bạn!';
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
