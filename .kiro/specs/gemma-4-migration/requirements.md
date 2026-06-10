# Requirements Document

## Introduction

This document specifies requirements for migrating the GOODVIET application from Gemma 2B (via Ollama) to Gemma 4 models using the Transformers library. The migration involves replacing the Ollama-based AI service with a Python-based Transformers service, implementing thinking mode for improved response quality, adding multi-modal support for audio analysis, and establishing a Node.js-to-Python bridge for seamless integration. The system must maintain Vietnamese language support for pronunciation coaching while improving performance and capabilities through Gemma 4's advanced features including speculative decoding, thinking mode, and multi-modal processing.

## Glossary

- **GOODVIET_System**: The complete GOODVIET application including Node.js backend, TypeScript services, and Python AI components
- **AI_Service_Orchestrator**: The TypeScript service (ai.service.ts) that routes requests between different AI providers
- **Ollama_Service**: The current TypeScript service (ollama.service.ts) that interfaces with Gemma 2B via Ollama
- **Gemini_Service**: The existing TypeScript service (gemini.service.ts) that uses Google Gemini API for fallback and audio analysis
- **Gemma4_Service**: The new Python-based service that implements Gemma 4 models using Transformers library
- **Python_Bridge**: The HTTP server component that exposes Python Gemma4_Service to Node.js backend
- **Thinking_Mode**: Gemma 4 feature using &lt;|think|&gt; token for internal reasoning before generating responses
- **Speculative_Decoding**: Gemma 4 optimization technique using target model + assistant model for faster inference
- **Multi_Modal_Processor**: Component that handles audio, image, and video inputs for Gemma 4 E2B and E4B variants
- **Chat_Response_Generator**: Component that generates conversational responses for Vietnamese pronunciation coaching
- **Audio_Analyzer**: Component that analyzes pronunciation quality from audio recordings
- **Conversation_History**: The stored sequence of user and assistant messages in a chat session
- **Thinking_Content**: Internal reasoning text generated between &lt;|think|&gt; and &lt;|/think|&gt; tokens that should be excluded from conversation history
- **Sampling_Parameters**: Configuration values for model generation including temperature, top_p, and top_k
- **Model_Variant**: Specific Gemma 4 model type (E2B, E4B) with different capabilities
- **Fallback_Mechanism**: System behavior when primary AI service fails, attempting alternative services
- **Vietnamese_Language_Support**: System capability to process and generate Vietnamese text correctly

## Requirements

### Requirement 1: Python-Node.js Bridge Architecture

**User Story:** As a system architect, I want a Python HTTP service that exposes Gemma 4 functionality to the Node.js backend, so that we can use Python-based Transformers library while maintaining the existing TypeScript architecture.

#### Acceptance Criteria

1. THE Python_Bridge SHALL expose an HTTP endpoint at port 5000 for health checks
2. THE Python_Bridge SHALL expose an HTTP endpoint for chat response generation accepting message and history parameters
3. THE Python_Bridge SHALL expose an HTTP endpoint for audio analysis accepting audio data, MIME type, and expected text
4. WHEN the Node.js backend sends a request to Python_Bridge, THE Python_Bridge SHALL return responses in JSON format within 30 seconds
5. WHEN Python_Bridge fails to start, THE GOODVIET_System SHALL log an error message and activate the Fallback_Mechanism
6. THE Python_Bridge SHALL include error handling that returns HTTP 500 status codes with error details when processing fails
7. THE Python_Bridge SHALL support CORS requests from the Node.js backend origin

### Requirement 2: Gemma 4 Model Integration

**User Story:** As a developer, I want to integrate Gemma 4 models using the Transformers library, so that users benefit from improved language understanding and generation capabilities.

#### Acceptance Criteria

1. THE Gemma4_Service SHALL load the Gemma 4 target model using Transformers library with model_name parameter
2. THE Gemma4_Service SHALL load the Gemma 4 assistant model for Speculative_Decoding
3. THE Gemma4_Service SHALL configure Sampling_Parameters with temperature=1.0, top_p=0.95, and top_k=64
4. WHEN loading models, IF GPU is available, THEN THE Gemma4_Service SHALL use CUDA device for acceleration
5. WHEN loading models, IF GPU is not available, THEN THE Gemma4_Service SHALL use CPU with a warning message logged
6. THE Gemma4_Service SHALL support selection between Model_Variant options through environment configuration
7. WHEN model loading fails, THE Gemma4_Service SHALL raise an exception with descriptive error message

### Requirement 3: Chat Response Generation with Thinking Mode

**User Story:** As a user, I want to receive high-quality Vietnamese pronunciation coaching responses, so that I get accurate and helpful feedback on my speech practice.

#### Acceptance Criteria

1. WHEN a user sends a chat message, THE Chat_Response_Generator SHALL format the message with Vietnamese system prompt and Conversation_History
2. THE Chat_Response_Generator SHALL enable Thinking_Mode by including &lt;|think|&gt; token in the generation prompt
3. THE Chat_Response_Generator SHALL generate a response using Gemma4_Service with configured Sampling_Parameters
4. THE Chat_Response_Generator SHALL extract Thinking_Content from between &lt;|think|&gt; and &lt;|/think|&gt; tokens
5. THE Chat_Response_Generator SHALL extract user-facing response text excluding Thinking_Content
6. WHEN storing messages in Conversation_History, THE GOODVIET_System SHALL exclude Thinking_Content from stored assistant messages
7. THE Chat_Response_Generator SHALL generate responses in Vietnamese language
8. THE Chat_Response_Generator SHALL limit response length to approximately 2-3 sentences for conversational flow
9. WHEN generation fails, THE Chat_Response_Generator SHALL return an error message in Vietnamese

### Requirement 4: Parse and Format Chat Messages

**User Story:** As a developer, I want to correctly parse thinking mode outputs, so that internal reasoning is separated from user-facing responses.

#### Acceptance Criteria

1. THE Message_Parser SHALL identify &lt;|think|&gt; and &lt;|/think|&gt; token boundaries in generated text
2. WHEN Thinking_Content is present, THE Message_Parser SHALL extract text between thinking tokens as internal reasoning
3. WHEN Thinking_Content is present, THE Message_Parser SHALL extract text after &lt;|/think|&gt; token as user-facing response
4. WHEN no thinking tokens are present, THE Message_Parser SHALL treat entire generated text as user-facing response
5. THE Message_Formatter SHALL format Conversation_History by excluding Thinking_Content from previous assistant messages
6. FOR ALL valid chat responses, parsing then formatting then parsing SHALL preserve the user-facing message content (round-trip property)

### Requirement 5: Multi-Modal Audio Analysis

**User Story:** As a user, I want my pronunciation recordings analyzed using advanced AI, so that I receive accurate feedback on my Vietnamese speech patterns.

#### Acceptance Criteria

1. WHERE Model_Variant is E2B or E4B, THE Multi_Modal_Processor SHALL accept audio input in WAV, MP3, or WEBM formats
2. WHEN audio data is received, THE Audio_Analyzer SHALL convert audio to base64 encoding for model input
3. THE Audio_Analyzer SHALL generate an analysis prompt in Vietnamese including expected text for comparison
4. THE Audio_Analyzer SHALL process audio using Gemma4_Service with multi-modal inputs
5. THE Audio_Analyzer SHALL extract pronunciation scores including overall score, clarity score, and fluency score from model output
6. THE Audio_Analyzer SHALL identify pronunciation issues with phoneme type (L/N, TR/CH, S/X), severity level, and detected vs expected words
7. THE Audio_Analyzer SHALL return analysis results in JSON format matching the existing schema used by Gemini_Service
8. WHEN audio analysis fails, THE Audio_Analyzer SHALL return mock analysis data with confidence level set to "low"

### Requirement 6: Service Integration and Configuration

**User Story:** As a system administrator, I want to configure which AI service to use, so that I can control the system's AI provider based on environment and requirements.

#### Acceptance Criteria

1. THE GOODVIET_System SHALL read AI_SERVICE environment variable to determine active provider
2. WHEN AI_SERVICE is set to "gemma4", THE AI_Service_Orchestrator SHALL route requests to Python_Bridge
3. WHEN AI_SERVICE is set to "ollama", THE AI_Service_Orchestrator SHALL route requests to Ollama_Service
4. WHEN AI_SERVICE is set to "gemini", THE AI_Service_Orchestrator SHALL route requests to Gemini_Service
5. WHEN AI_SERVICE is not set, THE AI_Service_Orchestrator SHALL attempt to connect to Python_Bridge, then Ollama_Service, then Gemini_Service in order
6. THE GOODVIET_System SHALL read GEMMA4_HOST environment variable for Python_Bridge endpoint configuration
7. THE GOODVIET_System SHALL read GEMMA4_MODEL_VARIANT environment variable to select Model_Variant for Gemma4_Service
8. THE GOODVIET_System SHALL log the active AI provider on startup

### Requirement 7: Fallback and Error Handling

**User Story:** As a user, I want the system to remain functional even when the primary AI service fails, so that I can continue using the application without interruption.

#### Acceptance Criteria

1. WHEN Python_Bridge request fails, THE AI_Service_Orchestrator SHALL attempt to use Ollama_Service as fallback
2. WHEN both Python_Bridge and Ollama_Service fail, THE AI_Service_Orchestrator SHALL attempt to use Gemini_Service as fallback
3. WHEN all AI services fail, THE AI_Service_Orchestrator SHALL throw an error with message "All AI services unavailable"
4. THE AI_Service_Orchestrator SHALL log each fallback attempt with provider name and error message
5. WHEN Fallback_Mechanism is activated, THE GOODVIET_System SHALL continue processing the request without returning errors to the user until all options are exhausted
6. THE Gemma4_Service SHALL implement request timeout of 30 seconds for model generation
7. WHEN request timeout occurs, THE Python_Bridge SHALL return HTTP 408 status code with timeout error message

### Requirement 8: Speculative Decoding Optimization

**User Story:** As a developer, I want to implement speculative decoding with target and assistant models, so that response generation is faster and more efficient.

#### Acceptance Criteria

1. THE Gemma4_Service SHALL load a smaller assistant model alongside the target model for speculative decoding
2. WHEN generating responses, THE Gemma4_Service SHALL use the assistant model to predict tokens speculatively
3. THE Gemma4_Service SHALL verify assistant model predictions using the target model
4. THE Gemma4_Service SHALL accept assistant model predictions when they match target model outputs
5. WHEN assistant model predictions diverge, THE Gemma4_Service SHALL use target model output and continue generation
6. THE Speculative_Decoding implementation SHALL maintain output quality equivalent to target-model-only generation
7. THE Speculative_Decoding implementation SHALL reduce average response generation time by at least 20% compared to target-model-only generation

### Requirement 9: Vietnamese Language Processing

**User Story:** As a Vietnamese user, I want the AI to understand and respond naturally in Vietnamese, so that I receive culturally appropriate and linguistically correct pronunciation coaching.

#### Acceptance Criteria

1. THE Chat_Response_Generator SHALL include a Vietnamese system prompt instructing the model to respond in Vietnamese
2. THE Chat_Response_Generator SHALL process Vietnamese diacritical marks correctly in user messages
3. THE Chat_Response_Generator SHALL generate responses with correct Vietnamese diacritical marks
4. THE Audio_Analyzer SHALL process Vietnamese text correctly when comparing expected vs detected pronunciation
5. THE Audio_Analyzer SHALL identify Vietnamese-specific phoneme issues (L/N, TR/CH, S/X)
6. WHEN users input Vietnamese text with mixed tone marks, THE GOODVIET_System SHALL normalize the text to standard Vietnamese encoding (NFC normalization)
7. THE GOODVIET_System SHALL handle Vietnamese text in UTF-8 encoding throughout all components

### Requirement 10: Model Variant Support

**User Story:** As a system administrator, I want to select appropriate Gemma 4 model variants based on feature requirements, so that I can optimize between performance and capabilities.

#### Acceptance Criteria

1. THE Gemma4_Service SHALL support loading E2B Model_Variant for audio and image processing
2. THE Gemma4_Service SHALL support loading E4B Model_Variant for audio, image, and video processing
3. WHERE Model_Variant is E2B, THE Multi_Modal_Processor SHALL accept audio and image inputs
4. WHERE Model_Variant is E4B, THE Multi_Modal_Processor SHALL accept audio, image, and video inputs
5. THE Gemma4_Service SHALL validate that selected Model_Variant is available before attempting to load
6. WHEN Model_Variant is not specified, THE Gemma4_Service SHALL default to E2B variant
7. WHEN selected Model_Variant is not available, THE Gemma4_Service SHALL log an error and attempt to load E2B variant as fallback

### Requirement 11: Conversation History Management

**User Story:** As a user, I want the chatbot to remember our conversation context, so that it provides relevant and coherent responses based on previous messages.

#### Acceptance Criteria

1. THE AI_Service_Orchestrator SHALL pass Conversation_History to Chat_Response_Generator for each request
2. THE Chat_Response_Generator SHALL format Conversation_History as a sequence of role and content pairs
3. THE Chat_Response_Generator SHALL limit Conversation_History to the most recent 10 messages for context window management
4. WHEN formatting Conversation_History, THE Chat_Response_Generator SHALL exclude Thinking_Content from assistant messages
5. THE Chat_Response_Generator SHALL include system prompt as the first message in formatted conversation
6. THE Chat_Response_Generator SHALL append the current user message after Conversation_History
7. WHEN Conversation_History exceeds token limits, THE Chat_Response_Generator SHALL truncate oldest messages first while preserving system prompt

### Requirement 12: Python Environment and Dependencies

**User Story:** As a developer, I want clear dependency management for the Python service, so that deployment and development environments are consistent and reproducible.

#### Acceptance Criteria

1. THE Gemma4_Service SHALL define Python package dependencies in a requirements.txt file
2. THE requirements.txt file SHALL specify transformers library version compatible with Gemma 4 models
3. THE requirements.txt file SHALL specify torch library version with CUDA support
4. THE requirements.txt file SHALL specify Flask or FastAPI library for Python_Bridge HTTP server
5. THE Gemma4_Service SHALL require Python version 3.9 or higher
6. THE GOODVIET_System SHALL provide installation instructions for Python dependencies in documentation
7. THE GOODVIET_System SHALL provide instructions for GPU driver and CUDA toolkit installation for optimal performance
