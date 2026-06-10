"""
Unit tests for ThinkingModeParser

Tests Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
"""

import sys
import os

# Add parent directory to path to import the module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.thinking_parser import ThinkingModeParser


def test_parse_with_thinking_tokens():
    """Test parsing when thinking tokens are present"""
    print("Test 1: Parse with thinking tokens...")
    
    generated_text = "<|think|>I need to greet the user politely<|/think|>Xin chào! Tôi có thể giúp gì cho bạn?"
    response, thinking = ThinkingModeParser.parse_response(generated_text)
    
    assert response == "Xin chào! Tôi có thể giúp gì cho bạn?", f"Expected Vietnamese greeting, got: {response}"
    assert thinking == "I need to greet the user politely", f"Expected thinking content, got: {thinking}"
    
    print("✓ Pass: Correctly extracted thinking and response")


def test_parse_without_thinking_tokens():
    """Test parsing when no thinking tokens are present"""
    print("\nTest 2: Parse without thinking tokens...")
    
    generated_text = "Xin chào! Tôi có thể giúp gì cho bạn?"
    response, thinking = ThinkingModeParser.parse_response(generated_text)
    
    assert response == "Xin chào! Tôi có thể giúp gì cho bạn?", f"Expected full text as response, got: {response}"
    assert thinking is None, f"Expected None for thinking, got: {thinking}"
    
    print("✓ Pass: Correctly handled text without thinking tokens")


def test_parse_with_whitespace():
    """Test that whitespace is properly stripped"""
    print("\nTest 3: Parse with extra whitespace...")
    
    generated_text = "  <|think|>  some reasoning  <|/think|>  final answer  "
    response, thinking = ThinkingModeParser.parse_response(generated_text)
    
    assert response == "final answer", f"Expected stripped response, got: '{response}'"
    assert thinking == "some reasoning", f"Expected stripped thinking, got: '{thinking}'"
    
    print("✓ Pass: Whitespace correctly stripped")


def test_parse_empty_string():
    """Test parsing empty string"""
    print("\nTest 4: Parse empty string...")
    
    response, thinking = ThinkingModeParser.parse_response("")
    
    assert response == "", f"Expected empty string, got: '{response}'"
    assert thinking is None, f"Expected None, got: {thinking}"
    
    print("✓ Pass: Empty string handled correctly")


def test_parse_malformed_tokens():
    """Test parsing with incomplete or malformed tokens"""
    print("\nTest 5: Parse with malformed tokens...")
    
    # Only start token
    generated_text = "<|think|>reasoning without end"
    response, thinking = ThinkingModeParser.parse_response(generated_text)
    assert thinking is None, "Should treat malformed tokens as regular text"
    
    # Only end token
    generated_text = "text before <|/think|>"
    response, thinking = ThinkingModeParser.parse_response(generated_text)
    assert thinking is None, "Should treat malformed tokens as regular text"
    
    # Reversed order
    generated_text = "<|/think|>wrong order<|think|>"
    response, thinking = ThinkingModeParser.parse_response(generated_text)
    assert thinking is None, "Should treat reversed tokens as regular text"
    
    print("✓ Pass: Malformed tokens handled correctly")


def test_format_history_removes_thinking():
    """Test that format_history_for_generation removes thinking content from assistant messages"""
    print("\nTest 6: Format history removes thinking content...")
    
    history = [
        {"role": "user", "content": "Xin chào"},
        {"role": "assistant", "content": "<|think|>User greeted me<|/think|>Xin chào! Bạn khỏe không?"},
        {"role": "user", "content": "Tôi khỏe, cảm ơn"},
        {"role": "assistant", "content": "Tốt quá!"}
    ]
    
    cleaned = ThinkingModeParser.format_history_for_generation(history)
    
    assert len(cleaned) == 4, f"Expected 4 messages, got {len(cleaned)}"
    assert cleaned[0]["content"] == "Xin chào", "User message should be unchanged"
    assert cleaned[1]["content"] == "Xin chào! Bạn khỏe không?", f"Assistant thinking should be removed, got: {cleaned[1]['content']}"
    assert cleaned[2]["content"] == "Tôi khỏe, cảm ơn", "User message should be unchanged"
    assert cleaned[3]["content"] == "Tốt quá!", "Assistant message without thinking should be unchanged"
    
    print("✓ Pass: Thinking content removed from history")


def test_format_history_preserves_system_messages():
    """Test that system messages are preserved in history formatting"""
    print("\nTest 7: Format history preserves system messages...")
    
    history = [
        {"role": "system", "content": "Bạn là trợ lý AI tiếng Việt"},
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "<|think|>thinking<|/think|>Response"}
    ]
    
    cleaned = ThinkingModeParser.format_history_for_generation(history)
    
    assert cleaned[0]["role"] == "system", "System role should be preserved"
    assert cleaned[0]["content"] == "Bạn là trợ lý AI tiếng Việt", "System content should be unchanged"
    
    print("✓ Pass: System messages preserved correctly")


def test_format_history_empty():
    """Test formatting empty history"""
    print("\nTest 8: Format empty history...")
    
    cleaned = ThinkingModeParser.format_history_for_generation([])
    
    assert cleaned == [], "Empty history should return empty list"
    
    print("✓ Pass: Empty history handled correctly")


def test_round_trip_property():
    """Test round-trip property: parse → format → parse preserves user-facing content"""
    print("\nTest 9: Round-trip property test...")
    
    # Start with a conversation history
    history = [
        {"role": "user", "content": "Test message"},
        {"role": "assistant", "content": "<|think|>internal reasoning<|/think|>User-facing response"}
    ]
    
    # Format to remove thinking
    formatted = ThinkingModeParser.format_history_for_generation(history)
    
    # Parse the formatted assistant message
    parsed_response, parsed_thinking = ThinkingModeParser.parse_response(formatted[1]["content"])
    
    # The user-facing response should be preserved
    assert parsed_response == "User-facing response", f"Round-trip should preserve user-facing content, got: {parsed_response}"
    assert parsed_thinking is None, "Thinking content should be removed after formatting"
    
    print("✓ Pass: Round-trip preserves user-facing content (Requirement 4.6)")


def test_multiple_thinking_blocks():
    """Test handling of multiple thinking blocks (edge case)"""
    print("\nTest 10: Multiple thinking blocks...")
    
    # Only the first complete thinking block should be processed
    generated_text = "<|think|>first thinking<|/think|>response <|think|>second thinking<|/think|>more text"
    response, thinking = ThinkingModeParser.parse_response(generated_text)
    
    # Should extract first thinking block and everything after it as response
    assert thinking == "first thinking", f"Expected first thinking block, got: {thinking}"
    assert "response" in response, f"Response should contain text after first thinking block, got: {response}"
    
    print("✓ Pass: Multiple thinking blocks handled (uses first block)")


def run_all_tests():
    """Run all tests"""
    print("=" * 60)
    print("Running ThinkingModeParser Tests")
    print("=" * 60)
    
    try:
        test_parse_with_thinking_tokens()
        test_parse_without_thinking_tokens()
        test_parse_with_whitespace()
        test_parse_empty_string()
        test_parse_malformed_tokens()
        test_format_history_removes_thinking()
        test_format_history_preserves_system_messages()
        test_format_history_empty()
        test_round_trip_property()
        test_multiple_thinking_blocks()
        
        print("\n" + "=" * 60)
        print("✓ All tests passed!")
        print("=" * 60)
        return True
        
    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
        return False
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
