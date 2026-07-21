import { Ollama } from 'ollama';
import { DEFAULT_COACHING_SYSTEM_PROMPT } from '../config/assistantPrompts';

/**
 * Service to handle interactions with LocalEngine (Local Text AI model)
 */
export class LocalEngineService {
  private ollama: Ollama | null = null;
  private model: string = 'gemma:2b';
  private isAvailable: boolean = false;

  constructor() {
    try {
      this.ollama = new Ollama({
        host: process.env.OLLAMA_HOST || 'http://localhost:11434'
      });
      // Assume available, will check on first use
      this.isAvailable = true;
      this.testConnection();
    } catch (error) {
      console.warn('⚠️ LocalEngine client initialization failed. Install with: npm install ollama');
      this.ollama = null;
    }
  }

  private async testConnection() {
    if (!this.ollama) return;
    
    try {
      const response = await this.ollama.list();
      this.isAvailable = true;
      console.log('✅ LocalEngine connected. Available models:', response.models.map(m => m.name).join(', '));
      
      // Check if our model is available
      const hasGemma = response.models.some(m => m.name.includes('gemma'));
      if (!hasGemma) {
        console.warn('⚠️ Gemma model not found. Run: ollama pull gemma:2b');
      }
    } catch (error) {
      this.isAvailable = false;
      console.warn('⚠️ LocalEngine not available. Make sure LocalEngine is running: ollama serve');
    }
  }

  async generateChatResponse(
    message: string,
    history: any[] = [],
    systemPrompt = DEFAULT_COACHING_SYSTEM_PROMPT
  ): Promise<string> {
    if (!this.ollama || !this.isAvailable) {
      throw new Error('LocalEngine service is not available');
    }

    try {
      console.log('[LocalEngine] Generating response for message:', message);
      
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...history.slice(-10).map(msg => ({
          role: msg.role === 'system'
            ? 'system'
            : msg.role === 'assistant' || msg.senderType === 'bot'
              ? 'assistant'
              : 'user',
          content: msg.content
        })),
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
          num_predict: 300,
          top_p: 0.9,
        }
      });
      
      return response.message.content.trim();
    } catch (error: any) {
      console.error('[LocalEngine] Error:', error.message);
      throw error;
    }
  }

  /**
   * Temporary mock response generator
   */
  private async generateMockResponse(message: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const responses = [
      'Chào bạn! Tôi là trợ lý GOODVIET. Tôi sẽ giúp bạn cải thiện phát âm tiếng Việt. Hãy bắt đầu với bài đánh giá đầu tiên nhé!',
      'Rất tốt! Hãy tiếp tục luyện tập đều đặn mỗi ngày. Bạn đang làm rất tốt!',
      'Tôi hiểu bạn đang gặp khó khăn với phát âm. Đừng lo lắng, với luyện tập đều đặn, bạn sẽ tiến bộ thôi!',
      'Có thể bạn muốn thử các bài tập trong phần Luyện tập? Chúng được thiết kế đặc biệt để giúp bạn cải thiện từng âm cụ thể.',
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Check if LocalEngine service is available
   */
  isServiceAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Get current model name
   */
  getModelName(): string {
    return this.model;
  }

  /**
   * Stream response (for future real-time chat feature)
   */
  async *streamChatResponse(message: string, history: any[] = []) {
    if (!this.ollama || !this.isAvailable) {
      yield 'Xin lỗi, dịch vụ AI đang tạm thời không khả dụng.';
      return;
    }

    const messages = [
      {
        role: 'system',
        content: `Bạn là trợ lý hỗ trợ người dùng cải thiện giọng nói tiếng Việt trên nền tảng GOODVIET.`
      },
      ...history.slice(-10).map(msg => ({
        role: msg.senderType === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    try {
      const stream = await this.ollama.chat({
        model: this.model,
        messages: messages,
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.message.content) {
          yield chunk.message.content;
        }
      }
    } catch (error) {
      console.error('[LocalEngine] Stream error:', error);
      yield 'Xin lỗi, đã có lỗi xảy ra.';
    }
  }
}

export const localEngineService = new LocalEngineService();
