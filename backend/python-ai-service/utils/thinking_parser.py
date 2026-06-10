"""
Thinking Mode Parser for Gemma 4 Models

This module provides utilities for parsing and formatting responses from Gemma 4 models
that use thinking mode with <|think|> and <|/think|> tokens.

Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
"""

from typing import Tuple, Optional, List, Dict


class ThinkingModeParser:
    """
    Parser for extracting thinking content and user-facing responses from Gemma 4 outputs.
    
    Gemma 4 models can generate internal reasoning between <|think|> and <|/think|> tokens.
    This class provides methods to:
    1. Extract thinking content and user-facing responses from generated text
    2. Clean conversation history by removing thinking content from assistant messages
    """
    
    THINK_START_TOKEN = "<|think|>"
    THINK_END_TOKEN = "<|/think|>"
    
    @staticmethod
    def parse_response(generated_text: str) -> Tuple[str, Optional[str]]:
        """
        Parse generated text to extract thinking content and user-facing response.
        
        This method identifies <|think|> and <|/think|> token boundaries and extracts:
        - Thinking content: Text between the thinking tokens (internal reasoning)
        - User-facing response: Text after the closing token (visible to user)
        
        Args:
            generated_text: Raw model output potentially containing <|think|>...<|/think|> tokens
        
        Returns:
            Tuple of (user_facing_response, thinking_content):
            - user_facing_response: Text to show to the user (stripped of whitespace)
            - thinking_content: Internal reasoning text or None if no thinking tokens present
        
        Examples:
            >>> ThinkingModeParser.parse_response("<|think|>reasoning<|/think|>response")
            ("response", "reasoning")
            
            >>> ThinkingModeParser.parse_response("response without thinking")
            ("response without thinking", None)
            
            >>> ThinkingModeParser.parse_response("  <|think|>  thinking  <|/think|>  answer  ")
            ("answer", "thinking")
        
        Requirements: 4.1, 4.2, 4.3, 4.4
        """
        if not generated_text:
            return ("", None)
        
        # Check if thinking tokens are present
        think_start_idx = generated_text.find(ThinkingModeParser.THINK_START_TOKEN)
        think_end_idx = generated_text.find(ThinkingModeParser.THINK_END_TOKEN)
        
        # If no thinking tokens found, return entire text as response
        if think_start_idx == -1 or think_end_idx == -1:
            return (generated_text.strip(), None)
        
        # Validate token order
        if think_start_idx >= think_end_idx:
            # Invalid token order, treat as regular text
            return (generated_text.strip(), None)
        
        # Extract thinking content between tokens
        thinking_start = think_start_idx + len(ThinkingModeParser.THINK_START_TOKEN)
        thinking_content = generated_text[thinking_start:think_end_idx].strip()
        
        # Extract user-facing response after closing token
        response_start = think_end_idx + len(ThinkingModeParser.THINK_END_TOKEN)
        user_facing_response = generated_text[response_start:].strip()
        
        return (user_facing_response, thinking_content)
    
    @staticmethod
    def format_history_for_generation(
        history: List[Dict[str, str]]
    ) -> List[Dict[str, str]]:
        """
        Remove thinking content from assistant messages in conversation history.
        
        This ensures that when conversation history is used for generating new responses,
        the model doesn't see previous thinking content, only the user-facing messages.
        This maintains a clean conversation context without internal reasoning artifacts.
        
        Args:
            history: List of conversation messages in format [{"role": str, "content": str}]
                    where role is "system", "user", or "assistant"
        
        Returns:
            Cleaned history with thinking content removed from assistant messages.
            System and user messages are preserved unchanged.
        
        Examples:
            >>> history = [
            ...     {"role": "user", "content": "Hello"},
            ...     {"role": "assistant", "content": "<|think|>reasoning<|/think|>Hi there!"}
            ... ]
            >>> ThinkingModeParser.format_history_for_generation(history)
            [
                {"role": "user", "content": "Hello"},
                {"role": "assistant", "content": "Hi there!"}
            ]
        
        Requirements: 4.5
        """
        if not history:
            return []
        
        cleaned_history = []
        
        for message in history:
            # Validate message structure
            if not isinstance(message, dict) or "role" not in message or "content" not in message:
                # Skip invalid messages
                continue
            
            role = message["role"]
            content = message["content"]
            
            # Only process assistant messages for thinking content removal
            if role == "assistant":
                # Parse the content to extract only user-facing response
                user_facing_response, _ = ThinkingModeParser.parse_response(content)
                cleaned_history.append({
                    "role": role,
                    "content": user_facing_response
                })
            else:
                # Keep system and user messages unchanged
                cleaned_history.append({
                    "role": role,
                    "content": content
                })
        
        return cleaned_history
