import { Ollama } from 'ollama';

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

  /**
   * Generate a response for a chat message given conversation history
   */
  async generateChatResponse(message: string, history: any[] = []): Promise<string> {
    if (!this.ollama || !this.isAvailable) {
      console.log('[LocalEngine] Service not available, using mock response');
      return this.generateMockResponse(message);
    }

    try {
      console.log('[LocalEngine] Generating response for message:', message);
      
      // Format conversation history
      const messages = [
        {
          role: 'system',
          content: `Bạn là trợ lý hỗ trợ người dùng cải thiện giọng nói tiếng Việt trên nền tảng GOODVIET. Hãy động viên, kiên nhẫn và chuyên nghiệp. Luôn trả lời bằng tiếng Việt, ngắn gọn và thân thiện (2-3 câu). Không đưa ra chẩn đoán y khoa.`
        },
        // Add last 10 messages from history
        ...history.slice(-10).map(msg => ({
          role: msg.senderType === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        // Add current message
        {
          role: 'user',
          content: message
        }
      ];

      console.log('[LocalEngine] Starting chat with history length:', history.length);
      console.log('[LocalEngine] Sending message to model:', this.model);

      const response = await this.ollama.chat({
        model: this.model,
        messages: messages,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 300, // max tokens for shorter responses
          top_p: 0.9,
        }
      });

      console.log('[LocalEngine] Raw response:', JSON.stringify(response).substring(0, 200));
      
      const text = response.message.content.trim();
      console.log('[LocalEngine] Response received, length:', text.length);
      console.log('[LocalEngine] First 100 chars:', text.substring(0, 100));
      console.log('[LocalEngine] Full response:', text);
      
      return text;
    } catch (error: any) {
      console.error('[LocalEngine] Error:', error.message);
      console.error('[LocalEngine] Error details:', error);
      
      // Fallback to mock response
      return this.generateMockResponse(message);
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
