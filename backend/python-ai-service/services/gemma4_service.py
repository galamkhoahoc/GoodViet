"""
Gemma4Service - Core AI inference using Gemma 4 models with thinking mode and speculative decoding.

This service provides:
- Automatic device detection (CUDA if available, else CPU)
- Target and assistant model loading for speculative decoding
- Model warming for consistent performance
- Model information retrieval

Requirements: 2.1, 2.2, 2.4, 2.5, 10.1, 10.2
"""

import os
import logging
from dataclasses import dataclass
from typing import Optional, Tuple, List, Dict
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.thinking_parser import ThinkingModeParser
from utils.speculative_decoding import SpeculativeDecodingCoordinator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ModelInfo:
    """Information about loaded model"""
    target_model: str
    assistant_model: str
    device: str
    variant: str


class Gemma4Service:
    """
    Core AI inference service for Gemma 4 models.
    
    Handles model loading, device management, and provides inference capabilities
    with support for speculative decoding using target and assistant models.
    """
    
    def __init__(
        self,
        model_name: str,
        assistant_model_name: str,
        device: str = "auto",
        model_variant: str = "e2b"
    ):
        """
        Initialize Gemma 4 service with target and assistant models.
        
        Args:
            model_name: HuggingFace model ID for target model (e.g., "google/gemma-4-e2b")
            assistant_model_name: HuggingFace model ID for assistant model (e.g., "google/gemma-4-1b")
            device: "cuda", "cpu", or "auto" for automatic detection
            model_variant: Model variant selection ("e2b" or "e4b")
        
        Requirements: 2.1, 2.2, 2.4, 2.5, 10.1, 10.2
        """
        self.model_name = model_name
        self.assistant_model_name = assistant_model_name
        self.model_variant = model_variant
        
        # Auto-detect device if set to "auto"
        if device == "auto":
            self.device = self._detect_device()
        else:
            self.device = device
            
        # Initialize model references (lazy loading)
        self.target_model: Optional[AutoModelForCausalLM] = None
        self.assistant_model: Optional[AutoModelForCausalLM] = None
        self.tokenizer: Optional[AutoTokenizer] = None
        
        # Speculative decoding coordinator
        self.speculative_coordinator: Optional[SpeculativeDecodingCoordinator] = None
        
        # Model loaded flag
        self._models_loaded = False
        
        logger.info(f"Gemma4Service initialized with device: {self.device}")
        logger.info(f"Target model: {self.model_name}")
        logger.info(f"Assistant model: {self.assistant_model_name}")
        logger.info(f"Model variant: {self.model_variant}")
    
    def _detect_device(self) -> str:
        """
        Auto-detect device (CUDA if available, else CPU with warning).
        
        Returns:
            Device string ("cuda" or "cpu")
            
        Requirements: 2.4, 2.5
        """
        if torch.cuda.is_available():
            device = "cuda"
            logger.info(f"CUDA is available. Using GPU: {torch.cuda.get_device_name(0)}")
        else:
            device = "cpu"
            logger.warning(
                "CUDA is not available. Using CPU for inference. "
                "This will be significantly slower. Consider installing CUDA for GPU acceleration."
            )
        
        return device
    
    def _load_models(self):
        """
        Load target and assistant models from HuggingFace.
        
        Models are loaded lazily on first use to avoid unnecessary loading
        during initialization or health checks.
        
        Raises:
            Exception: If model loading fails with descriptive error message
            
        Requirements: 2.1, 2.2, 2.7
        """
        if self._models_loaded:
            return
            
        try:
            logger.info("Loading tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            
            logger.info(f"Loading target model: {self.model_name}")
            self.target_model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map=self.device,
                low_cpu_mem_usage=True
            )
            
            logger.info(f"Loading assistant model: {self.assistant_model_name}")
            self.assistant_model = AutoModelForCausalLM.from_pretrained(
                self.assistant_model_name,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map=self.device,
                low_cpu_mem_usage=True
            )
            
            # Initialize speculative decoding coordinator
            logger.info("Initializing speculative decoding coordinator...")
            self.speculative_coordinator = SpeculativeDecodingCoordinator(
                target_model=self.target_model,
                assistant_model=self.assistant_model,
                lookahead=5  # Predict 5 tokens speculatively
            )
            
            # Model warming - run a small inference to initialize CUDA kernels
            logger.info("Warming up models for consistent performance...")
            self._warm_models()
            
            self._models_loaded = True
            logger.info("Models loaded successfully")
            
        except Exception as e:
            error_msg = f"Failed to load models: {str(e)}"
            logger.error(error_msg)
            raise Exception(error_msg)
    
    def _warm_models(self):
        """
        Warm up models with a test inference for consistent performance.
        
        This initializes CUDA kernels and caches to avoid cold-start delays
        on the first real inference request.
        """
        try:
            test_input = self.tokenizer(
                "Test warming input",
                return_tensors="pt"
            ).to(self.device)
            
            with torch.no_grad():
                # Warm target model
                self.target_model.generate(
                    **test_input,
                    max_new_tokens=10,
                    do_sample=False
                )
                
                # Warm assistant model
                self.assistant_model.generate(
                    **test_input,
                    max_new_tokens=10,
                    do_sample=False
                )
            
            logger.info("Model warming completed")
            
        except Exception as e:
            logger.warning(f"Model warming failed (non-critical): {str(e)}")
    
    def get_model_info(self) -> ModelInfo:
        """
        Return loaded model information.
        
        Returns:
            ModelInfo dataclass containing target model, assistant model,
            device, and variant information
            
        Requirements: 2.1, 2.4, 2.5, 10.1, 10.2
        """
        return ModelInfo(
            target_model=self.model_name,
            assistant_model=self.assistant_model_name,
            device=self.device,
            variant=self.model_variant
        )
    
    def ensure_models_loaded(self):
        """
        Ensure models are loaded before use.
        
        This method should be called before any inference operations
        to trigger lazy loading if models haven't been loaded yet.
        """
        if not self._models_loaded:
            self._load_models()
    
    def generate_chat_response(
        self,
        message: str,
        history: List[Dict[str, str]],
        system_prompt: str = None
    ) -> Tuple[str, Optional[str]]:
        """
        Generate conversational response with thinking mode for Vietnamese pronunciation coaching.
        
        This method:
        1. Formats Vietnamese system prompt with conversation history
        2. Includes <|think|> token to enable thinking mode
        3. Generates response with configured sampling parameters
        4. Extracts thinking content and user-facing response using ThinkingModeParser
        5. Limits response length to approximately 2-3 sentences
        
        Args:
            message: Current user message to respond to
            history: Conversation history as list of {"role": str, "content": str}
                    Supports roles: "system", "user", "assistant"
            system_prompt: Vietnamese system prompt for pronunciation coaching context.
                          If None, uses default Vietnamese coaching prompt.
        
        Returns:
            Tuple of (user_facing_response, thinking_content):
            - user_facing_response: Vietnamese response text to show to user (2-3 sentences)
            - thinking_content: Internal reasoning text or None if no thinking generated
        
        Raises:
            Exception: If generation fails with descriptive error message in Vietnamese
        
        Requirements: 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 9.1, 9.2, 9.3
        """
        # Ensure models are loaded
        self.ensure_models_loaded()
        
        try:
            # Default Vietnamese system prompt for pronunciation coaching
            if system_prompt is None:
                system_prompt = (
                    "Bạn là trợ lý AI chuyên về phát âm tiếng Việt tại ứng dụng GoodViet. "
                    "Nhiệm vụ của bạn:\n"
                    "1. Trả lời câu hỏi về phát âm tiếng Việt một cách chi tiết và dễ hiểu\n"
                    "2. Đưa ra lời khuyên cụ thể, ví dụ minh họa rõ ràng\n"
                    "3. Khuyến khích và động viên người học\n"
                    "4. Giải thích sự khác biệt giữa các âm (như L/N, D/GI, S/X)\n"
                    "5. Đề xuất bài tập thực hành phù hợp\n\n"
                    "Phong cách trả lời:\n"
                    "- Thân thiện, nhiệt tình như một giáo viên tận tâm\n"
                    "- Sử dụng ngôn ngữ đơn giản, dễ hiểu\n"
                    "- Đưa ra ví dụ cụ thể từ cuộc sống hàng ngày\n"
                    "- Trả lời đầy đủ (3-5 câu) với thông tin hữu ích\n"
                    "- Luôn kết thúc bằng câu hỏi hoặc lời khuyến khích để tiếp tục hội thoại"
                )
            
            # Clean history to remove thinking content from previous assistant messages
            cleaned_history = ThinkingModeParser.format_history_for_generation(history)
            
            # Build conversation messages
            messages = []
            
            # Add system prompt
            messages.append({"role": "system", "content": system_prompt})
            
            # Add conversation history (limit to most recent 10 messages for context window)
            for msg in cleaned_history[-10:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
            
            # Add current user message
            messages.append({"role": "user", "content": message})
            
            # Format messages for the model
            # Create prompt with thinking mode token
            formatted_prompt = self._format_messages_for_generation(messages)
            
            # Add <|think|> token to enable thinking mode
            formatted_prompt += "\n<|think|>"
            
            logger.info(f"Generating response for message: {message[:50]}...")
            
            # Tokenize input
            inputs = self.tokenizer(
                formatted_prompt,
                return_tensors="pt",
                add_special_tokens=True
            ).to(self.device)
            
            # Configure generation parameters
            generation_config = GenerationConfig(
                temperature=1.0,
                top_p=0.95,
                top_k=64,
                max_new_tokens=256,  # Increase to allow more detailed responses (3-5 sentences)
                do_sample=True,
                pad_token_id=self.tokenizer.pad_token_id,
                eos_token_id=self.tokenizer.eos_token_id
            )
            
            # Generate response using speculative decoding if available, else fallback to target-only
            try:
                if self.speculative_coordinator is not None and self.assistant_model is not None:
                    logger.info("Using speculative decoding for generation")
                    outputs = self.speculative_coordinator.generate(
                        input_ids=inputs.input_ids,
                        attention_mask=inputs.attention_mask,
                        generation_config=generation_config,
                        tokenizer=self.tokenizer
                    )
                else:
                    logger.info("Speculative decoding unavailable, using target-only generation")
                    with torch.no_grad():
                        outputs = self.target_model.generate(
                            **inputs,
                            generation_config=generation_config
                        )
            except Exception as e:
                # Fallback to target-only generation if speculative decoding fails
                logger.warning(f"Speculative decoding failed: {str(e)}, falling back to target-only generation")
                with torch.no_grad():
                    outputs = self.target_model.generate(
                        **inputs,
                        generation_config=generation_config
                    )
            
            # Decode generated tokens
            generated_text = self.tokenizer.decode(
                outputs[0][inputs.input_ids.shape[1]:],  # Skip input tokens
                skip_special_tokens=False,  # Keep thinking tokens for parsing
                clean_up_tokenization_spaces=True
            )
            
            logger.info(f"Raw generated text: {generated_text[:100]}...")
            
            # Parse response to extract thinking and user-facing content
            user_facing_response, thinking_content = ThinkingModeParser.parse_response(generated_text)
            
            logger.info(f"User-facing response: {user_facing_response[:100]}...")
            if thinking_content:
                logger.info(f"Thinking content: {thinking_content[:100]}...")
            
            # Ensure response is not empty
            if not user_facing_response:
                logger.warning("Generated empty response, using fallback message")
                user_facing_response = "Xin lỗi, tôi không thể tạo phản hồi phù hợp. Vui lòng thử lại."
            
            return (user_facing_response, thinking_content)
            
        except Exception as e:
            error_msg = f"Không thể tạo phản hồi: {str(e)}"
            logger.error(error_msg)
            raise Exception(error_msg)
    
    def _format_messages_for_generation(self, messages: List[Dict[str, str]]) -> str:
        """
        Format conversation messages into a prompt string for model generation.
        
        This is a simple chat template formatter that converts messages into
        a readable format for the model.
        
        Args:
            messages: List of {"role": str, "content": str} messages
        
        Returns:
            Formatted prompt string
        """
        formatted_lines = []
        
        for msg in messages:
            role = msg["role"]
            content = msg["content"]
            
            if role == "system":
                formatted_lines.append(f"Hệ thống: {content}")
            elif role == "user":
                formatted_lines.append(f"Người dùng: {content}")
            elif role == "assistant":
                formatted_lines.append(f"Trợ lý: {content}")
        
        # Add final assistant prompt
        formatted_lines.append("Trợ lý:")
        
        return "\n".join(formatted_lines)
