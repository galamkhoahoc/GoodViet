import axios, { AxiosInstance } from 'axios';

/**
 * Gemma4Client - HTTP client for Python AI Service
 * 
 * Provides interface to communicate with the Gemma 4 Python service
 * for chat responses and audio analysis.
 * 
 * Requirements: 1.2, 1.3, 1.4, 7.6
 */

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

interface HealthResponse {
  status: string;
  model: string;
  assistant_model: string;
  device: string;
  variant: string;
}

export class Gemma4Client {
  private client: AxiosInstance;
  private host: string;
  private timeout: number;

  constructor(host: string = 'http://localhost:5000', timeout: number = 30000) {
    this.host = host;
    this.timeout = timeout;
    
    this.client = axios.create({
      baseURL: host,
      timeout: timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`[Gemma4Client] Initialized with host: ${host}, timeout: ${timeout}ms`);
  }

  /**
   * Health check endpoint
   * 
   * Verifies the Python service is running and returns model information.
   * 
   * @returns Promise with health status and model info
   * @throws Error if service is unavailable
   * 
   * Requirements: 1.4
   */
  async healthCheck(): Promise<HealthResponse> {
    try {
      const response = await this.client.get<HealthResponse>('/health');
      console.log(`[Gemma4Client] Health check OK - Model: ${response.data.model}, Device: ${response.data.device}`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Gemma4 service - is it running on ' + this.host + '?');
      }
      throw new Error(`Gemma4 health check failed: ${error.message}`);
    }
  }

  /**
   * Generate chat response
   * 
   * Sends a message with conversation history to the Python service
   * and returns the generated response with optional thinking content.
   * 
   * @param message - User message to respond to
   * @param history - Conversation history (optional)
   * @returns Promise with generated response text
   * @throws Error if generation fails or times out
   * 
   * Requirements: 1.2, 1.4, 7.6
   */
  async generateChatResponse(
    message: string,
    history: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    try {
      console.log(`[Gemma4Client] Generating chat response for: "${message.substring(0, 50)}..."`);
      
      const request: ChatRequest = {
        message,
        history,
      };

      const response = await this.client.post<ChatResponse>('/chat', request);
      
      console.log(`[Gemma4Client] Response received: "${response.data.response.substring(0, 50)}..."`);
      if (response.data.thinking) {
        console.log(`[Gemma4Client] Thinking: "${response.data.thinking.substring(0, 50)}..."`);
      }
      
      return response.data.response;
      
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Gemma4 service');
      }
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        throw new Error('Gemma4 request timeout');
      }
      if (error.response?.status === 408) {
        throw new Error('Gemma4 request timeout');
      }
      if (error.response?.status === 503) {
        throw new Error('Gemma4 service unavailable');
      }
      
      console.error(`[Gemma4Client] Chat generation failed:`, error.message);
      throw new Error(`Gemma4 chat failed: ${error.message}`);
    }
  }

  /**
   * Analyze audio pronunciation
   * 
   * Sends audio data (base64 encoded) to the Python service for
   * pronunciation analysis and returns scores with detected issues.
   * 
   * @param audioBase64 - Base64 encoded audio data
   * @param mimeType - Audio MIME type (e.g., "audio/wav")
   * @param expectedText - Expected Vietnamese text
   * @returns Promise with audio analysis result
   * @throws Error if analysis fails
   * 
   * Requirements: 1.3, 1.4
   */
  async analyzeAudio(
    audioBase64: string,
    mimeType: string,
    expectedText: string
  ): Promise<AudioAnalysisResponse> {
    try {
      console.log(`[Gemma4Client] Analyzing audio - Type: ${mimeType}, Text: "${expectedText.substring(0, 30)}..."`);
      
      const request: AudioAnalysisRequest = {
        audio_data: audioBase64,
        mime_type: mimeType,
        expected_text: expectedText,
      };

      const response = await this.client.post<AudioAnalysisResponse>(
        '/analyze-audio',
        request
      );
      
      console.log(`[Gemma4Client] Audio analysis complete - Score: ${response.data.overallScore}, Issues: ${response.data.issues.length}`);
      
      return response.data;
      
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Gemma4 service');
      }
      if (error.response?.status === 503) {
        throw new Error('Gemma4 service unavailable');
      }
      
      console.error(`[Gemma4Client] Audio analysis failed:`, error.message);
      throw new Error(`Gemma4 audio analysis failed: ${error.message}`);
    }
  }

  /**
   * Get the configured host URL
   */
  getHost(): string {
    return this.host;
  }

  /**
   * Get the configured timeout
   */
  getTimeout(): number {
    return this.timeout;
  }
}

// Export singleton instance with environment configuration
export const gemma4Client = new Gemma4Client(
  process.env.GEMMA4_HOST || 'http://localhost:5000',
  parseInt(process.env.GEMMA4_TIMEOUT || '30000')
);
