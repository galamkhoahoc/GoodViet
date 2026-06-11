import { geminiService } from './gemini.service';
import { ollamaService } from './ollama.service';
import { gemma4Client } from './gemma4.client';

/**
 * Unified AI Service that can switch between Gemini, Ollama, and Gemma4
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.8, 7.1, 7.2, 7.3
 */
export class AIService {
  private provider: 'gemini' | 'ollama' | 'gemma4' = 'gemma4'; // Default to Gemma4

  constructor() {
    // Auto-detect which service to use based on environment
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
      this.autoDetectProvider();
    }
  }

  /**
   * Auto-detect available AI provider
   */
  private async autoDetectProvider() {
    // Try Gemma4 first
    try {
      await gemma4Client.healthCheck();
      this.provider = 'gemma4';
      console.log('🤖 AI Service: Auto-detected Gemma 4 (Python Bridge)');
      return;
    } catch (error) {
      // Gemma4 not available, try next
    }

    // Try Ollama
    if (ollamaService.isServiceAvailable()) {
      this.provider = 'ollama';
      console.log('🤖 AI Service: Auto-detected Ollama (Local Gemma)');
      return;
    }

    // Try Gemini
    if (process.env.GEMINI_API_KEY) {
      this.provider = 'gemini';
      console.log('🤖 AI Service: Auto-detected Google Gemini API');
      return;
    }

    // No service available, default to Gemma4 (will use fallback)
    this.provider = 'gemma4';
    console.log('⚠️ AI Service: No service available, will attempt all services on first request');
  }

  /**
   * Generate a response for a chat message given conversation history
   * 
   * Requirements: 7.1, 7.2, 7.4, 7.5
   */
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
      console.log(`[AI Service] Attempting fallback chain...`);
      
      // Implement fallback chain: gemma4 → ollama → gemini
      return await this.fallbackGenerateChatResponse(message, history);
    }
  }

  /**
   * Fallback chain for chat response generation
   * 
   * Tries all available providers in sequence until one succeeds.
   * Order: Gemma4 → Ollama → Gemini
   * 
   * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
   */
  private async fallbackGenerateChatResponse(message: string, history: any[]): Promise<string> {
    const errors: string[] = [];

    // Try Gemma4 if not already tried
    if (this.provider !== 'gemma4') {
      try {
        console.log('[AI Service] Attempting fallback to Gemma4...');
        const response = await gemma4Client.generateChatResponse(message, history);
        console.log('[AI Service] Gemma4 fallback successful ✓');
        return response;
      } catch (error: any) {
        console.error(`[AI Service] Gemma4 fallback failed: ${error.message}`);
        errors.push(`Gemma4: ${error.message}`);
      }
    }

    // Try Ollama if not already tried
    if (this.provider !== 'ollama') {
      try {
        console.log('[AI Service] Attempting fallback to Ollama...');
        const response = await ollamaService.generateChatResponse(message, history);
        console.log('[AI Service] Ollama fallback successful ✓');
        return response;
      } catch (error: any) {
        console.error(`[AI Service] Ollama fallback failed: ${error.message}`);
        errors.push(`Ollama: ${error.message}`);
      }
    }

    // Try Gemini if not already tried
    if (this.provider !== 'gemini') {
      try {
        console.log('[AI Service] Attempting fallback to Gemini...');
        const response = await geminiService.generateChatResponse(message, history);
        console.log('[AI Service] Gemini fallback successful ✓');
        return response;
      } catch (error: any) {
        console.error(`[AI Service] Gemini fallback failed: ${error.message}`);
        errors.push(`Gemini: ${error.message}`);
      }
    }

    // All services failed - return friendly mock response instead of throwing error
    console.error('[AI Service] All AI services unavailable');
    console.error('[AI Service] Errors:', errors);
    console.log('[AI Service] Returning mock response to maintain user experience');
    
    // Return a helpful mock response instead of throwing error
    return this.generateMockResponse(message);
  }

  /**
   * Generate a mock response when all AI services are unavailable
   */
  private async generateMockResponse(message: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const responses = [
      `Xin chào! Hiện tại hệ thống AI đang bảo trì. Tin nhắn của bạn đã được ghi nhận. Chúng tôi sẽ phản hồi sớm nhất có thể. 🙏`,
      `Cảm ơn bạn đã liên hệ! Hệ thống AI tạm thời không khả dụng, nhưng bạn vẫn có thể tiếp tục sử dụng các tính năng luyện tập và đánh giá trên GOODVIET. 💪`,
      `Xin lỗi vì sự bất tiện! Bot AI đang được nâng cấp. Trong thời gian này, hãy thử các bài luyện tập trong phần "Lộ trình" nhé! 🎯`,
    ];
    
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  /**
   * Analyze audio pronunciation
   * 
   * Requirements: 5.7, 7.1, 7.2
   */
  async analyzeAudio(audioBase64: string, mimeType: string, expectedText: string): Promise<any> {
    console.log(`[AI Service] Analyzing audio with provider: ${this.provider}`);
    
    try {
      // Try Gemma4 first if it's the primary provider or if E2B/E4B variants are available
      if (this.provider === 'gemma4') {
        return await gemma4Client.analyzeAudio(audioBase64, mimeType, expectedText);
      }
      
      // Fallback to Gemini for audio analysis
      // Note: Gemini expects Buffer, need to convert base64 to Buffer
      console.log('[AI Service] Using Gemini for audio analysis');
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      return await geminiService.analyzePronunciation(audioBuffer, mimeType, expectedText);
      
    } catch (error: any) {
      console.error(`[AI Service] ${this.provider} audio analysis failed:`, error.message);
      console.log(`[AI Service] Attempting fallback to Gemini...`);
      
      // Fallback to Gemini
      try {
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        return await geminiService.analyzePronunciation(audioBuffer, mimeType, expectedText);
      } catch (fallbackError: any) {
        console.error(`[AI Service] Gemini fallback failed:`, fallbackError.message);
        throw new Error('Audio analysis unavailable');
      }
    }
  }

  /**
   * Get current provider name
   */
  getProvider(): string {
    return this.provider;
  }

  /**
   * Get detailed status of all AI services
   * 
   * Requirements: 6.8
   */
  getStatus(): { provider: string; gemma4: boolean; ollama: boolean; gemini: boolean } {
    return {
      provider: this.provider,
      gemma4: true, // Will check on first request
      ollama: ollamaService.isServiceAvailable(),
      gemini: !!process.env.GEMINI_API_KEY,
    };
  }
}

export const aiService = new AIService();
