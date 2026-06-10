"""
Unit tests for MultiModalProcessor

Tests cover:
- Initialization with different model variants
- MIME type validation for E2B and E4B variants
- Audio-to-base64 encoding utility
- Error handling for invalid inputs
- Audio pronunciation analysis with Vietnamese language support

Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5
"""

import pytest
import base64
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.multimodal_processor import MultiModalProcessor, AudioAnalysis, PronunciationIssue


class TestMultiModalProcessorInit:
    """Test MultiModalProcessor initialization"""
    
    def test_init_with_e2b_variant(self):
        """Test initialization with E2B variant"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        assert processor.model is mock_model
        assert processor.model_variant == "e2b"
        assert len(processor.supported_formats) > 0
    
    def test_init_with_e4b_variant(self):
        """Test initialization with E4B variant"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e4b")
        
        assert processor.model is mock_model
        assert processor.model_variant == "e4b"
        assert len(processor.supported_formats) > 0
    
    def test_init_case_insensitive_variant(self):
        """Test that variant parameter is case-insensitive"""
        mock_model = object()
        
        processor_upper = MultiModalProcessor(mock_model, "E2B")
        assert processor_upper.model_variant == "e2b"
        
        processor_mixed = MultiModalProcessor(mock_model, "E4b")
        assert processor_mixed.model_variant == "e4b"
    
    def test_init_with_invalid_variant(self):
        """Test initialization with invalid variant raises ValueError"""
        mock_model = object()
        
        with pytest.raises(ValueError) as exc_info:
            MultiModalProcessor(mock_model, "invalid")
        
        assert "Invalid model_variant" in str(exc_info.value)
        assert "Must be 'e2b' or 'e4b'" in str(exc_info.value)
    
    def test_e4b_has_more_formats_than_e2b(self):
        """Test that E4B supports more formats than E2B (video support)"""
        mock_model = object()
        
        processor_e2b = MultiModalProcessor(mock_model, "e2b")
        processor_e4b = MultiModalProcessor(mock_model, "e4b")
        
        # E4B should support all E2B formats plus additional video formats
        assert len(processor_e4b.supported_formats) > len(processor_e2b.supported_formats)
        
        # All E2B formats should be in E4B
        assert processor_e2b.supported_formats.issubset(processor_e4b.supported_formats)


class TestValidateInputFormat:
    """Test MIME type validation"""
    
    def test_e2b_supports_audio_wav(self):
        """Test E2B variant supports audio/wav"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        assert processor.validate_input_format("audio/wav") is True
    
    def test_e2b_supports_audio_mp3(self):
        """Test E2B variant supports audio/mp3"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        assert processor.validate_input_format("audio/mp3") is True
    
    def test_e2b_supports_audio_webm(self):
        """Test E2B variant supports audio/webm"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        assert processor.validate_input_format("audio/webm") is True
    
    def test_e2b_supports_image_formats(self):
        """Test E2B variant supports common image formats"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        assert processor.validate_input_format("image/jpeg") is True
        assert processor.validate_input_format("image/png") is True
        assert processor.validate_input_format("image/gif") is True
    
    def test_e2b_does_not_support_video(self):
        """Test E2B variant does not support video formats"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        assert processor.validate_input_format("video/mp4") is False
        assert processor.validate_input_format("video/webm") is False
    
    def test_e4b_supports_audio_formats(self):
        """Test E4B variant supports audio formats"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e4b")
        
        assert processor.validate_input_format("audio/wav") is True
        assert processor.validate_input_format("audio/mp3") is True
        assert processor.validate_input_format("audio/webm") is True
    
    def test_e4b_supports_image_formats(self):
        """Test E4B variant supports image formats"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e4b")
        
        assert processor.validate_input_format("image/jpeg") is True
        assert processor.validate_input_format("image/png") is True
    
    def test_e4b_supports_video_formats(self):
        """Test E4B variant supports video formats"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e4b")
        
        assert processor.validate_input_format("video/mp4") is True
        assert processor.validate_input_format("video/webm") is True
        assert processor.validate_input_format("video/quicktime") is True
    
    def test_validate_case_insensitive(self):
        """Test MIME type validation is case-insensitive"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        assert processor.validate_input_format("AUDIO/WAV") is True
        assert processor.validate_input_format("Audio/Mp3") is True
        assert processor.validate_input_format("IMAGE/PNG") is True
    
    def test_validate_with_whitespace(self):
        """Test MIME type validation handles whitespace"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        assert processor.validate_input_format("  audio/wav  ") is True
        assert processor.validate_input_format("\taudio/mp3\n") is True
    
    def test_validate_unsupported_format(self):
        """Test validation returns False for unsupported formats"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        assert processor.validate_input_format("application/pdf") is False
        assert processor.validate_input_format("text/plain") is False
        assert processor.validate_input_format("invalid/format") is False


class TestAudioToBase64:
    """Test audio-to-base64 encoding utility"""
    
    def test_encode_simple_audio_data(self):
        """Test encoding simple audio data to base64"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        audio_data = b"test audio data"
        encoded = processor.audio_to_base64(audio_data)
        
        # Verify it's a string
        assert isinstance(encoded, str)
        
        # Verify it can be decoded back
        decoded = base64.b64decode(encoded)
        assert decoded == audio_data
    
    def test_encode_binary_audio_data(self):
        """Test encoding binary audio data"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        # Create binary data with various byte values
        audio_data = bytes([0, 1, 127, 128, 255] * 100)
        encoded = processor.audio_to_base64(audio_data)
        
        assert isinstance(encoded, str)
        
        # Verify round-trip encoding/decoding
        decoded = base64.b64decode(encoded)
        assert decoded == audio_data
    
    def test_encode_empty_audio_data_raises_error(self):
        """Test encoding empty audio data raises ValueError"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        with pytest.raises(ValueError) as exc_info:
            processor.audio_to_base64(b"")
        
        assert "cannot be empty" in str(exc_info.value)
    
    def test_encode_none_raises_error(self):
        """Test encoding None raises ValueError"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        with pytest.raises(ValueError) as exc_info:
            processor.audio_to_base64(None)
        
        assert "cannot be None" in str(exc_info.value)
    
    def test_encode_non_bytes_raises_error(self):
        """Test encoding non-bytes data raises TypeError"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        with pytest.raises(TypeError) as exc_info:
            processor.audio_to_base64("not bytes")
        
        assert "must be bytes" in str(exc_info.value)
    
    def test_encode_large_audio_data(self):
        """Test encoding large audio data"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        # Create 1MB of audio data
        audio_data = bytes([i % 256 for i in range(1024 * 1024)])
        encoded = processor.audio_to_base64(audio_data)
        
        assert isinstance(encoded, str)
        assert len(encoded) > 0
        
        # Verify round-trip
        decoded = base64.b64decode(encoded)
        assert decoded == audio_data


class TestGetSupportedFormats:
    """Test getting supported formats"""
    
    def test_get_supported_formats_returns_set(self):
        """Test get_supported_formats returns a set"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        formats = processor.get_supported_formats()
        
        assert isinstance(formats, set)
        assert len(formats) > 0
    
    def test_get_supported_formats_returns_copy(self):
        """Test that modifying returned set doesn't affect processor"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        formats = processor.get_supported_formats()
        original_length = len(formats)
        
        # Modify returned set
        formats.add("fake/format")
        
        # Verify processor's formats are unchanged
        assert len(processor.get_supported_formats()) == original_length


class TestGetVariant:
    """Test getting model variant"""
    
    def test_get_variant_e2b(self):
        """Test get_variant returns correct variant for E2B"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        assert processor.get_variant() == "e2b"
    
    def test_get_variant_e4b(self):
        """Test get_variant returns correct variant for E4B"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e4b")
        
        assert processor.get_variant() == "e4b"


class TestAnalyzeAudio:
    """Test audio pronunciation analysis functionality"""
    
    def test_analyze_audio_with_valid_wav_input(self):
        """Test analyze_audio with valid WAV audio data"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        audio_data = b"fake wav audio data"
        mime_type = "audio/wav"
        expected_text = "xin chào"
        
        result = processor.analyze_audio(audio_data, mime_type, expected_text)
        
        # Verify result is AudioAnalysis instance
        assert isinstance(result, AudioAnalysis)
        
        # Verify scores are in valid range (0-100)
        assert 0 <= result.overall_score <= 100
        assert 0 <= result.clarity_score <= 100
        assert 0 <= result.fluency_score <= 100
        
        # Verify confidence level is valid
        assert result.confidence_level in ["high", "medium", "low"]
        
        # Verify issues is a list
        assert isinstance(result.issues, list)
    
    def test_analyze_audio_with_mp3_input(self):
        """Test analyze_audio with MP3 audio format"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        audio_data = b"fake mp3 audio data"
        mime_type = "audio/mp3"
        expected_text = "tôi học tiếng Việt"
        
        result = processor.analyze_audio(audio_data, mime_type, expected_text)
        
        assert isinstance(result, AudioAnalysis)
        assert 0 <= result.overall_score <= 100
    
    def test_analyze_audio_with_webm_input(self):
        """Test analyze_audio with WEBM audio format"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        audio_data = b"fake webm audio data"
        mime_type = "audio/webm"
        expected_text = "trà xanh"
        
        result = processor.analyze_audio(audio_data, mime_type, expected_text)
        
        assert isinstance(result, AudioAnalysis)
        assert result.confidence_level in ["high", "medium", "low"]
    
    def test_analyze_audio_with_vietnamese_text_containing_l(self):
        """Test analyze_audio detects L/N pronunciation issues"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        audio_data = b"fake audio data"
        mime_type = "audio/wav"
        expected_text = "lớn lên"  # Contains 'l' characters
        
        result = processor.analyze_audio(audio_data, mime_type, expected_text)
        
        assert isinstance(result, AudioAnalysis)
        # Should detect L/N issue based on text content
        l_n_issues = [issue for issue in result.issues if issue.phoneme == "L/N"]
        assert len(l_n_issues) > 0
    
    def test_analyze_audio_with_vietnamese_text_containing_tr(self):
        """Test analyze_audio detects TR/CH pronunciation issues"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        audio_data = b"fake audio data"
        mime_type = "audio/wav"
        expected_text = "trà trung"  # Contains 'tr' pattern
        
        result = processor.analyze_audio(audio_data, mime_type, expected_text)
        
        assert isinstance(result, AudioAnalysis)
        # Should detect TR/CH issue based on text content
        tr_ch_issues = [issue for issue in result.issues if issue.phoneme == "TR/CH"]
        assert len(tr_ch_issues) > 0
    
    def test_analyze_audio_issues_have_required_fields(self):
        """Test that pronunciation issues have all required fields"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        audio_data = b"fake audio data"
        mime_type = "audio/wav"
        expected_text = "lớn trà"
        
        result = processor.analyze_audio(audio_data, mime_type, expected_text)
        
        for issue in result.issues:
            assert isinstance(issue, PronunciationIssue)
            assert issue.phoneme in ["L/N", "TR/CH", "S/X"]
            assert issue.severity in ["mild", "moderate", "severe"]
            assert isinstance(issue.description, str)
            assert len(issue.description) > 0
            assert isinstance(issue.detected_word, str)
            assert isinstance(issue.expected_word, str)
    
    def test_analyze_audio_with_unsupported_mime_type_raises_error(self):
        """Test analyze_audio raises ValueError for unsupported MIME type"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        audio_data = b"fake audio data"
        mime_type = "video/mp4"  # Not supported by E2B
        expected_text = "xin chào"
        
        with pytest.raises(ValueError) as exc_info:
            processor.analyze_audio(audio_data, mime_type, expected_text)
        
        assert "not supported" in str(exc_info.value)
    
    def test_analyze_audio_with_empty_audio_returns_mock_data(self):
        """Test analyze_audio returns mock data with low confidence for empty audio"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        # Empty audio should trigger error handling path
        audio_data = b""
        mime_type = "audio/wav"
        expected_text = "xin chào"
        
        # This should return mock analysis with low confidence due to error handling
        result = processor.analyze_audio(audio_data, mime_type, expected_text)
        
        assert isinstance(result, AudioAnalysis)
        assert result.confidence_level == "low"
        assert result.overall_score == 50
    
    def test_analyze_audio_e4b_variant(self):
        """Test analyze_audio works with E4B variant"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e4b")
        
        audio_data = b"fake audio data"
        mime_type = "audio/wav"
        expected_text = "học tiếng Việt"
        
        result = processor.analyze_audio(audio_data, mime_type, expected_text)
        
        assert isinstance(result, AudioAnalysis)
        assert 0 <= result.overall_score <= 100
    
    def test_create_vietnamese_analysis_prompt(self):
        """Test Vietnamese prompt creation contains expected text"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        expected_text = "xin chào bạn"
        prompt = processor._create_vietnamese_analysis_prompt(expected_text)
        
        # Verify prompt is in Vietnamese and contains expected text
        assert isinstance(prompt, str)
        assert expected_text in prompt
        assert "Phân tích" in prompt or "phân tích" in prompt
        assert "JSON" in prompt  # Should request JSON output
    
    def test_mock_analysis_has_correct_structure(self):
        """Test mock analysis returns correct data structure"""
        mock_model = object()
        processor = MultiModalProcessor(mock_model, "e2b")
        
        expected_text = "test text"
        mock_analysis = processor._create_mock_analysis(expected_text)
        
        assert isinstance(mock_analysis, AudioAnalysis)
        assert mock_analysis.overall_score == 50
        assert mock_analysis.clarity_score == 50
        assert mock_analysis.fluency_score == 50
        assert mock_analysis.confidence_level == "low"
        assert len(mock_analysis.issues) > 0


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v"])
