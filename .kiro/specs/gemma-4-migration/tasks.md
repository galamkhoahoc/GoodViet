# Implementation Plan: Gemma 4 Migration

## Overview

This implementation plan guides the migration from Gemma 2B (Ollama) to Gemma 4 models using the Transformers library. The approach follows a phased strategy: first establishing the Python infrastructure and model loading, then implementing core AI features (thinking mode, speculative decoding, multi-modal), and finally integrating with the existing Node.js backend through a Python HTTP bridge. Each task builds incrementally to enable early testing and validation of core functionality.

## Tasks

- [x] 1. Set up Python project structure and dependencies
  - Create `backend/python-ai-service/` directory structure
  - Create `requirements.txt` with transformers, torch, flask, flask-cors, python-dotenv
  - Create `.env.example` with GEMMA4_TARGET_MODEL, GEMMA4_ASSISTANT_MODEL, GEMMA4_DEVICE, PORT, ALLOWED_ORIGINS
  - Create `README.md` with installation and setup instructions
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 2. Implement core Gemma 4 model loading
  - [x] 2.1 Create `services/gemma4_service.py` with Gemma4Service class
    - Implement `__init__` method to load target and assistant models using AutoModelForCausalLM
    - Implement device auto-detection (CUDA if available, else CPU with warning)
    - Implement `get_model_info()` method returning ModelInfo dataclass
    - Add model warming on first load for consistent performance
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 10.1, 10.2_
  
  - [ ]* 2.2 Write unit tests for Gemma4Service model loading
    - Test successful model loading on CPU
    - Test device auto-detection logic
    - Test error handling for invalid model names
    - Test model info retrieval
    - _Requirements: 2.1, 2.4, 2.5, 2.7_

- [x] 3. Implement thinking mode parsing
  - [x] 3.1 Create `utils/thinking_parser.py` with ThinkingModeParser class
    - Implement `parse_response()` static method to extract thinking content between `<|think|>` and `<|/think|>` tokens
    - Implement `format_history_for_generation()` static method to remove thinking content from assistant messages
    - Handle cases with no thinking tokens (return entire text as response)
    - Strip whitespace from extracted thinking and response text
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 3.2 Write unit tests for ThinkingModeParser
    - Test parsing with thinking tokens present
    - Test parsing without thinking tokens
    - Test history formatting removes thinking content
    - Test round-trip property: parse → format → parse preserves user-facing content
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_

- [x] 4. Implement chat response generation with thinking mode
  - [x] 4.1 Add `generate_chat_response()` method to Gemma4Service
    - Format Vietnamese system prompt with conversation history
    - Include `<|think|>` token to enable thinking mode
    - Generate response with configured sampling parameters (temperature=1.0, top_p=0.95, top_k=64)
    - Use ThinkingModeParser to extract thinking content and user-facing response
    - Limit response length to approximately 2-3 sentences
    - Return tuple of (user_facing_response, thinking_content)
    - _Requirements: 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 9.1, 9.2, 9.3_
  
  - [ ]* 4.2 Write unit tests for chat response generation
    - Test Vietnamese system prompt formatting
    - Test thinking mode token inclusion
    - Test response length limiting
    - Test error handling for generation failures
    - _Requirements: 3.1, 3.2, 3.7, 3.9_

- [x] 5. Implement speculative decoding optimization
  - [x] 5.1 Create `utils/speculative_decoding.py` with SpeculativeDecodingCoordinator class
    - Implement `__init__` to accept target model, assistant model, and lookahead parameter
    - Implement `generate()` method coordinating assistant model predictions with target model verification
    - Assistant model predicts next K tokens (lookahead=5)
    - Target model verifies predictions and accepts matching tokens
    - On mismatch, use target model output and continue
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 5.2 Integrate SpeculativeDecodingCoordinator into Gemma4Service.generate_chat_response()
    - Replace standard generation with speculative decoding when assistant model is available
    - Maintain fallback to target-only generation if assistant model fails
    - _Requirements: 8.1, 8.2, 8.6_
  
  - [ ]* 5.3 Write performance tests for speculative decoding
    - Measure generation latency with and without speculative decoding
    - Verify 20% latency reduction target
    - Verify output quality equivalence
    - _Requirements: 8.6, 8.7_

- [ ] 6. Checkpoint - Test core AI functionality
  - Ensure model loading works on target environment
  - Verify thinking mode parsing correctly extracts responses
  - Test chat generation produces Vietnamese responses
  - Ask the user if questions arise

- [ ] 7. Implement multi-modal audio analysis
  - [x] 7.1 Create `services/multimodal_processor.py` with MultiModalProcessor class
    - Implement `__init__` accepting model and model_variant parameters
    - Implement `validate_input_format()` checking MIME type against variant capabilities (E2B: audio/image, E4B: audio/image/video)
    - Implement audio-to-base64 encoding utility
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 7.2 Implement `analyze_audio()` method in MultiModalProcessor
    - Convert audio bytes to base64 encoding
    - Create Vietnamese analysis prompt with expected text for comparison
    - Format multi-modal input for Gemma 4 model
    - Generate analysis using target model
    - Parse JSON output for pronunciation scores (overall, clarity, fluency)
    - Extract pronunciation issues with phoneme type, severity, detected vs expected words
    - Return AudioAnalysis dataclass with scores and issues
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 9.4, 9.5_
  
  - [ ]* 7.3 Write unit tests for MultiModalProcessor
    - Test audio format validation for E2B and E4B variants
    - Test base64 encoding conversion
    - Test Vietnamese prompt generation
    - Test error handling returns mock analysis with low confidence
    - _Requirements: 5.1, 5.8, 10.3, 10.4_

- [x] 8. Implement Python HTTP bridge with Flask
  - [x] 8.1 Create `app.py` with Flask application
    - Initialize Flask app with CORS middleware for Node.js backend origin
    - Initialize Gemma4Service with models from environment variables
    - Configure request timeout of 30 seconds
    - _Requirements: 1.1, 1.7, 6.6, 6.7_
  
  - [x] 8.2 Implement `/health` GET endpoint
    - Return JSON with status, model name, and device
    - _Requirements: 1.1_
  
  - [x] 8.3 Implement `/chat` POST endpoint
    - Accept JSON with message and history parameters
    - Call Gemma4Service.generate_chat_response()
    - Format history to exclude thinking content using ThinkingModeParser
    - Return JSON with response, thinking, and model fields
    - Handle errors with HTTP 500 status and error details
    - _Requirements: 1.2, 1.3, 1.4, 1.6, 4.5, 11.1, 11.2, 11.4_
  
  - [x] 8.4 Implement `/analyze-audio` POST endpoint
    - Accept JSON with audio_data (base64), mime_type, and expected_text
    - Call MultiModalProcessor.analyze_audio()
    - Return JSON matching existing AudioAnalysis schema
    - Handle errors with HTTP 500 status and error details
    - _Requirements: 1.3, 1.4, 1.6, 5.7_
  
  - [ ]* 8.5 Write integration tests for Flask endpoints
    - Test health check returns correct status
    - Test chat endpoint with valid request
    - Test audio analysis endpoint with valid request
    - Test error handling for invalid requests
    - Test request timeout handling
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 7.6, 7.7_

- [ ] 9. Checkpoint - Test Python bridge independently
  - Start Flask server locally
  - Test health endpoint with curl/Postman
  - Test chat endpoint with sample Vietnamese message
  - Test audio analysis endpoint with sample audio file
  - Verify error responses and timeout handling
  - Ask the user if questions arise

- [x] 10. Implement TypeScript Gemma4Client for Node.js integration
  - [x] 10.1 Create `backend/src/services/gemma4.client.ts` with Gemma4Client class
    - Implement constructor accepting host and timeout parameters
    - Implement `healthCheck()` method calling GET /health endpoint
    - Implement `generateChatResponse()` method calling POST /chat endpoint
    - Implement `analyzeAudio()` method calling POST /analyze-audio endpoint
    - Add error handling for network errors, timeouts, HTTP 4xx/5xx responses
    - Use axios for HTTP requests with configured timeout
    - _Requirements: 1.2, 1.3, 1.4, 7.6_
  
  - [ ]* 10.2 Write unit tests for Gemma4Client
    - Test successful health check
    - Test successful chat response
    - Test successful audio analysis
    - Test error handling for network failures
    - Test timeout error handling
    - _Requirements: 1.4, 7.6, 7.7_

- [x] 11. Update AI Service Orchestrator for Gemma4 integration
  - [x] 11.1 Update `backend/src/services/ai.service.ts` to add Gemma4Client
    - Import Gemma4Client and initialize with GEMMA4_HOST and GEMMA4_TIMEOUT from environment
    - Add provider selection logic: check AI_SERVICE environment variable
    - If AI_SERVICE=gemma4, set gemma4 as primary provider
    - If AI_SERVICE not set, implement auto-detection: try Gemma4 healthCheck() first
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.8_
  
  - [x] 11.2 Implement fallback chain in generateChatResponse()
    - Try Gemma4Client.generateChatResponse() first
    - On error, log and fallback to OllamaService
    - On error, log and fallback to GeminiService
    - If all fail, throw error "All AI services unavailable"
    - Log each fallback attempt with provider name and error
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 11.3 Update analyzeAudio() method to support Gemma4
    - Try Gemma4Client.analyzeAudio() if provider is gemma4
    - Fallback to GeminiService.analyzeAudio() on error
    - Ensure response format matches existing AudioAnalysis interface
    - _Requirements: 5.7, 7.1, 7.2_
  
  - [ ]* 11.4 Write integration tests for AI Service Orchestrator
    - Test provider selection based on AI_SERVICE environment variable
    - Test fallback chain from Gemma4 to Ollama to Gemini
    - Test error handling when all services fail
    - Test logging of fallback attempts
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 12. Implement conversation history management
  - [x] 12.1 Update ChatController to limit conversation history to 10 messages
    - Fetch conversation history from database
    - Slice to most recent 10 messages
    - Format as array of {role, content} objects
    - Ensure thinking content is excluded from assistant messages
    - Pass formatted history to AI Service Orchestrator
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.7_
  
  - [ ]* 12.2 Write unit tests for conversation history management
    - Test history limiting to 10 messages
    - Test thinking content exclusion
    - Test history formatting
    - Test token limit handling
    - _Requirements: 11.3, 11.4, 11.7_

- [x] 13. Add Vietnamese language normalization
  - [x] 13.1 Create `backend/src/utils/vietnamese.utils.ts` with text normalization functions
    - Implement NFC normalization for Vietnamese diacritical marks
    - Implement UTF-8 encoding validation
    - Export normalization utility for use in controllers
    - _Requirements: 9.6, 9.7_
  
  - [x] 13.2 Apply normalization in ChatController before sending to AI service
    - Normalize user message input
    - Normalize conversation history content
    - _Requirements: 9.2, 9.6, 9.7_
  
  - [x] 13.3 Apply normalization in AudioController for expected text
    - Normalize expected text before sending to audio analysis
    - _Requirements: 9.4, 9.6, 9.7_
  
  - [ ]* 13.4 Write unit tests for Vietnamese normalization
    - Test NFC normalization with mixed tone marks
    - Test UTF-8 encoding validation
    - Test normalization preserves correct Vietnamese text
    - _Requirements: 9.6, 9.7_

- [x] 14. Update environment configuration files
  - [x] 14.1 Update `backend/.env.example` with Gemma4 configuration
    - Add AI_SERVICE variable with options (gemma4, ollama, gemini)
    - Add GEMMA4_HOST variable (default: http://localhost:5000)
    - Add GEMMA4_TIMEOUT variable (default: 30000)
    - Add comments explaining each variable
    - _Requirements: 6.1, 6.6_
  
  - [x] 14.2 Create `backend/python-ai-service/.env.example`
    - Add PORT variable (default: 5000)
    - Add ALLOWED_ORIGINS variable
    - Add GEMMA4_TARGET_MODEL variable (default: google/gemma-4-e2b)
    - Add GEMMA4_ASSISTANT_MODEL variable (default: google/gemma-4-1b)
    - Add GEMMA4_DEVICE variable (options: auto, cuda, cpu)
    - Add GEMMA4_MODEL_VARIANT variable (options: e2b, e4b)
    - Add generation parameters: TEMPERATURE, TOP_P, TOP_K, MAX_NEW_TOKENS
    - Add comments explaining each variable
    - _Requirements: 2.3, 6.7, 10.6_

- [x] 15. Add deployment and documentation
  - [x] 15.1 Create `backend/python-ai-service/README.md` with setup instructions
    - Python version requirements (3.9+)
    - Dependencies installation (pip install -r requirements.txt)
    - GPU driver and CUDA toolkit installation instructions
    - Environment configuration guide
    - Running the Flask server (python app.py)
    - Testing endpoints with curl examples
    - _Requirements: 12.5, 12.6, 12.7_
  
  - [x] 15.2 Update main `backend/README.md` with Gemma4 migration information
    - Add section on AI service configuration
    - Document AI_SERVICE environment variable options
    - Link to Python service README
    - Add troubleshooting section for common issues
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 16. Final integration testing and verification
  - Start MongoDB database
  - Start Python AI service (Flask server)
  - Start Node.js backend
  - Test complete chat flow: send message → receive Vietnamese response
  - Test audio analysis flow: upload recording → receive pronunciation feedback
  - Test fallback mechanism: stop Python service → verify fallback to Ollama/Gemini
  - Test provider selection: set AI_SERVICE variable → verify correct provider used
  - Verify thinking content excluded from conversation history
  - Verify Vietnamese diacritical marks handled correctly
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation of core functionality before integration
- Python service runs independently on port 5000, Node.js backend on port 3000
- Testing can be done incrementally: Python service alone first, then integration with Node.js
- GPU (CUDA) is recommended but not required - system falls back to CPU with warning
- Model variants: E2B for audio/image, E4B for audio/image/video support
- Speculative decoding requires both target and assistant models loaded

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "4.1"] },
    { "id": 3, "tasks": ["4.2", "5.1", "7.1"] },
    { "id": 4, "tasks": ["5.2", "7.2"] },
    { "id": 5, "tasks": ["5.3", "7.3", "8.1"] },
    { "id": 6, "tasks": ["8.2", "8.3", "8.4"] },
    { "id": 7, "tasks": ["8.5", "10.1"] },
    { "id": 8, "tasks": ["10.2", "11.1"] },
    { "id": 9, "tasks": ["11.2", "11.3", "12.1", "13.1"] },
    { "id": 10, "tasks": ["11.4", "12.2", "13.2", "13.3"] },
    { "id": 11, "tasks": ["13.4", "14.1", "14.2"] },
    { "id": 12, "tasks": ["15.1", "15.2"] }
  ]
}
```
