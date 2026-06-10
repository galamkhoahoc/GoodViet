"""
MultiModalProcessor - Handle audio, image, and video inputs for Gemma 4 E2B/E4B variants.

This processor provides:
- Input format validation based on model variant capabilities
- Audio-to-base64 encoding for model input
- Support for E2B (audio/image) and E4B (audio/image/video) variants
- Audio pronunciation analysis with Vietnamese language support

Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5
"""

import base64
import logging
import json
import re
from dataclasses import dataclass
from typing import List, Optional, Literal

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class PronunciationIssue:
    """Single pronunciation issue detected in audio analysis"""
    phoneme: Literal["L/N", "TR/CH", "S/X"]
    severity: Literal["mild", "moderate", "severe"]
    description: str
    detected_word: str
    expected_word: str


@dataclass
class AudioAnalysis:
    """Audio pronunciation analysis result"""
    overall_score: int  # 0-100
    clarity_score: int  # 0-100
    fluency_score: int  # 0-100
    confidence_level: Literal["high", "medium", "low"]
    issues: List[PronunciationIssue]


class MultiModalProcessor:
    """
    Multi-modal input processor for Gemma 4 E2B and E4B variants.
    
    Handles validation and preprocessing of audio, image, and video inputs
    based on the capabilities of the selected model variant.
    """
    
    # Supported MIME types by variant
    E2B_SUPPORTED_FORMATS = {
        # Audio formats
        "audio/wav",
        "audio/mp3",
        "audio/mpeg",  # Alternative MIME for MP3
        "audio/webm",
        # Image formats
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp"
    }
    
    E4B_SUPPORTED_FORMATS = E2B_SUPPORTED_FORMATS | {
        # Video formats (in addition to E2B formats)
        "video/mp4",
        "video/webm",
        "video/mpeg",
        "video/quicktime"
    }
    
    def __init__(self, model, model_variant: str):
        """
        Initialize processor with model and variant.
        
        Args:
            model: Loaded Gemma 4 model instance
            model_variant: "e2b" or "e4b" indicating model capabilities
        
        Raises:
            ValueError: If model_variant is not "e2b" or "e4b"
        
        Requirements: 10.1, 10.2
        """
        # Validate model variant
        if model_variant.lower() not in ["e2b", "e4b"]:
            raise ValueError(
                f"Invalid model_variant: {model_variant}. Must be 'e2b' or 'e4b'."
            )
        
        self.model = model
        self.model_variant = model_variant.lower()
        
        # Select supported formats based on variant
        if self.model_variant == "e2b":
            self.supported_formats = self.E2B_SUPPORTED_FORMATS
            logger.info("MultiModalProcessor initialized with E2B variant (audio/image support)")
        else:  # e4b
            self.supported_formats = self.E4B_SUPPORTED_FORMATS
            logger.info("MultiModalProcessor initialized with E4B variant (audio/image/video support)")
        
        logger.info(f"Supported MIME types: {sorted(self.supported_formats)}")
    
    def validate_input_format(self, mime_type: str) -> bool:
        """
        Validate if MIME type is supported for current variant.
        
        Checks the provided MIME type against the supported formats for the
        model variant. E2B supports audio and image formats, while E4B adds
        video format support.
        
        Args:
            mime_type: MIME type string to validate (e.g., "audio/wav", "image/png")
        
        Returns:
            True if MIME type is supported, False otherwise
        
        Examples:
            >>> processor = MultiModalProcessor(model, "e2b")
            >>> processor.validate_input_format("audio/wav")
            True
            >>> processor.validate_input_format("video/mp4")
            False
            
            >>> processor = MultiModalProcessor(model, "e4b")
            >>> processor.validate_input_format("video/mp4")
            True
        
        Requirements: 10.3, 10.4
        """
        # Normalize MIME type to lowercase for case-insensitive comparison
        normalized_mime = mime_type.lower().strip()
        
        is_supported = normalized_mime in self.supported_formats
        
        if is_supported:
            logger.debug(f"MIME type '{mime_type}' is supported by {self.model_variant.upper()} variant")
        else:
            logger.warning(
                f"MIME type '{mime_type}' is not supported by {self.model_variant.upper()} variant. "
                f"Supported formats: {sorted(self.supported_formats)}"
            )
        
        return is_supported
    
    def audio_to_base64(self, audio_data: bytes) -> str:
        """
        Convert audio bytes to base64 encoding for model input.
        
        This utility encodes raw audio data into base64 format, which is required
        for passing audio inputs to the Gemma 4 multi-modal models.
        
        Args:
            audio_data: Raw audio data as bytes
        
        Returns:
            Base64-encoded string representation of the audio data
        
        Raises:
            ValueError: If audio_data is None or empty
            TypeError: If audio_data is not bytes
        
        Examples:
            >>> processor = MultiModalProcessor(model, "e2b")
            >>> audio_bytes = b"audio data here"
            >>> encoded = processor.audio_to_base64(audio_bytes)
            >>> isinstance(encoded, str)
            True
        
        Requirements: 10.5
        """
        # Validate input
        if audio_data is None:
            raise ValueError("audio_data cannot be None")
        
        if not isinstance(audio_data, bytes):
            raise TypeError(f"audio_data must be bytes, got {type(audio_data).__name__}")
        
        if len(audio_data) == 0:
            raise ValueError("audio_data cannot be empty")
        
        try:
            # Encode to base64
            encoded = base64.b64encode(audio_data).decode('utf-8')
            
            logger.debug(f"Encoded {len(audio_data)} bytes of audio data to base64 ({len(encoded)} characters)")
            
            return encoded
            
        except Exception as e:
            error_msg = f"Failed to encode audio data to base64: {str(e)}"
            logger.error(error_msg)
            raise ValueError(error_msg)
    
    def get_supported_formats(self) -> set:
        """
        Get the set of supported MIME types for the current variant.
        
        Returns:
            Set of supported MIME type strings
        """
        return self.supported_formats.copy()
    
    def get_variant(self) -> str:
        """
        Get the current model variant.
        
        Returns:
            Model variant string ("e2b" or "e4b")
        """
        return self.model_variant
    
    def analyze_audio(
        self,
        audio_data: bytes,
        mime_type: str,
        expected_text: str
    ) -> AudioAnalysis:
        """
        Analyze pronunciation from audio recording using Gemma 4 multi-modal model.
        
        This method:
        1. Converts audio bytes to base64 encoding
        2. Creates Vietnamese analysis prompt with expected text for comparison
        3. Formats multi-modal input for Gemma 4 model
        4. Generates analysis using target model
        5. Extracts pronunciation scores (overall, clarity, fluency)
        6. Identifies pronunciation issues with phoneme type, severity, detected vs expected words
        7. Returns AudioAnalysis dataclass with scores and issues
        
        Args:
            audio_data: Raw audio data as bytes
            mime_type: MIME type of audio (e.g., "audio/wav", "audio/mp3", "audio/webm")
            expected_text: Expected Vietnamese text that should have been pronounced
        
        Returns:
            AudioAnalysis with scores (0-100) and detected pronunciation issues
            If analysis fails, returns mock data with "low" confidence level
        
        Raises:
            ValueError: If mime_type is not supported or audio_data is invalid
        
        Examples:
            >>> processor = MultiModalProcessor(model, "e2b")
            >>> audio_bytes = open("recording.wav", "rb").read()
            >>> analysis = processor.analyze_audio(audio_bytes, "audio/wav", "xin chào")
            >>> analysis.overall_score
            85
            >>> analysis.issues[0].phoneme
            "L/N"
        
        Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 9.4, 9.5
        """
        # Validate input format
        if not self.validate_input_format(mime_type):
            raise ValueError(
                f"MIME type '{mime_type}' is not supported by {self.model_variant.upper()} variant. "
                f"Supported formats: {sorted(self.supported_formats)}"
            )
        
        try:
            # Convert audio bytes to base64 encoding
            logger.info(f"Converting {len(audio_data)} bytes of audio to base64...")
            audio_base64 = self.audio_to_base64(audio_data)
            
            # Create Vietnamese analysis prompt with expected text for comparison
            vietnamese_prompt = self._create_vietnamese_analysis_prompt(expected_text)
            logger.info(f"Created Vietnamese analysis prompt for text: '{expected_text}'")
            
            # Format multi-modal input for Gemma 4 model
            # Note: The exact format depends on the model's API, but typically includes
            # text prompt and base64-encoded audio data
            multimodal_input = {
                "text": vietnamese_prompt,
                "audio": audio_base64,
                "mime_type": mime_type
            }
            
            logger.info("Generating pronunciation analysis using Gemma 4 model...")
            
            # Generate analysis using target model
            # This is a placeholder for actual model inference
            # In a real implementation, this would call the model with multimodal inputs
            analysis_result = self._generate_pronunciation_analysis(multimodal_input, expected_text)
            
            logger.info(f"Analysis completed - Overall score: {analysis_result.overall_score}")
            
            return analysis_result
            
        except Exception as e:
            error_msg = f"Audio analysis failed: {str(e)}"
            logger.error(error_msg)
            
            # Return mock analysis data with low confidence on failure (Requirement 5.8)
            logger.warning("Returning mock analysis data with low confidence due to failure")
            return self._create_mock_analysis(expected_text)
    
    def _create_vietnamese_analysis_prompt(self, expected_text: str) -> str:
        """
        Create Vietnamese prompt for pronunciation analysis.
        
        Args:
            expected_text: Expected Vietnamese text for comparison
        
        Returns:
            Vietnamese prompt string for pronunciation analysis
        
        Requirements: 9.4
        """
        prompt = f"""Phân tích phát âm tiếng Việt từ file âm thanh này.

Văn bản dự kiến: "{expected_text}"

Hãy đánh giá các khía cạnh sau:
1. Điểm tổng thể (0-100): Đánh giá chất lượng phát âm tổng thể
2. Điểm rõ ràng (0-100): Độ rõ ràng của các âm tiết
3. Điểm trôi chảy (0-100): Độ trôi chảy và tự nhiên của lời nói

Xác định các vấn đề phát âm cụ thể:
- Loại âm vị: L/N (lẫn lộn L và N), TR/CH (lẫn lộn TR và CH), S/X (lẫn lộn S và X)
- Mức độ nghiêm trọng: mild (nhẹ), moderate (vừa), severe (nghiêm trọng)
- Mô tả chi tiết
- Từ phát hiện được vs từ dự kiến

Trả về kết quả dưới dạng JSON với định dạng:
{{
    "overall_score": <số từ 0-100>,
    "clarity_score": <số từ 0-100>,
    "fluency_score": <số từ 0-100>,
    "confidence_level": "high|medium|low",
    "issues": [
        {{
            "phoneme": "L/N|TR/CH|S/X",
            "severity": "mild|moderate|severe",
            "description": "mô tả chi tiết",
            "detected_word": "từ phát hiện",
            "expected_word": "từ dự kiến"
        }}
    ]
}}"""
        
        return prompt
    
    def _generate_pronunciation_analysis(
        self,
        multimodal_input: dict,
        expected_text: str
    ) -> AudioAnalysis:
        """
        Generate pronunciation analysis using the Gemma 4 model.
        
        This method processes the multimodal input and generates structured
        analysis output. Currently returns mock data as model inference
        integration is pending.
        
        Args:
            multimodal_input: Dictionary with text prompt, audio base64, and mime_type
            expected_text: Expected Vietnamese text
        
        Returns:
            AudioAnalysis with parsed scores and issues
        
        Requirements: 5.4, 5.5, 5.6
        """
        # TODO: Implement actual model inference with multimodal inputs
        # This requires integration with the Gemma 4 model's multimodal API
        # For now, we'll simulate analysis based on the expected text
        
        logger.warning("Using simulated analysis - actual model inference not yet implemented")
        
        # Simulate model output (in production, this would be actual model inference)
        mock_json_output = self._simulate_model_output(expected_text)
        
        # Parse JSON output for pronunciation scores and issues
        try:
            analysis_data = json.loads(mock_json_output)
            
            # Extract pronunciation scores
            overall_score = int(analysis_data.get("overall_score", 75))
            clarity_score = int(analysis_data.get("clarity_score", 70))
            fluency_score = int(analysis_data.get("fluency_score", 80))
            confidence_level = analysis_data.get("confidence_level", "medium")
            
            # Extract pronunciation issues
            issues = []
            for issue_data in analysis_data.get("issues", []):
                issue = PronunciationIssue(
                    phoneme=issue_data["phoneme"],
                    severity=issue_data["severity"],
                    description=issue_data["description"],
                    detected_word=issue_data["detected_word"],
                    expected_word=issue_data["expected_word"]
                )
                issues.append(issue)
            
            logger.info(f"Parsed {len(issues)} pronunciation issues from analysis")
            
            return AudioAnalysis(
                overall_score=overall_score,
                clarity_score=clarity_score,
                fluency_score=fluency_score,
                confidence_level=confidence_level,
                issues=issues
            )
            
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            logger.error(f"Failed to parse model output: {str(e)}")
            return self._create_mock_analysis(expected_text)
    
    def _simulate_model_output(self, expected_text: str) -> str:
        """
        Simulate model output for testing purposes.
        
        This generates realistic-looking analysis data based on the expected text.
        In production, this would be replaced by actual model inference.
        
        Args:
            expected_text: Expected Vietnamese text
        
        Returns:
            JSON string with simulated analysis results
        """
        # Check for common Vietnamese pronunciation challenges
        has_l_n_issue = any(char in expected_text.lower() for char in ['l', 'n'])
        has_tr_ch_issue = any(pattern in expected_text.lower() for pattern in ['tr', 'ch'])
        has_s_x_issue = any(char in expected_text.lower() for char in ['s', 'x'])
        
        issues = []
        
        # Simulate finding issues based on text content
        if has_l_n_issue and 'l' in expected_text.lower():
            issues.append({
                "phoneme": "L/N",
                "severity": "mild",
                "description": "Phát âm âm 'l' có thể cải thiện để tránh nhầm với âm 'n'",
                "detected_word": expected_text.split()[0] if expected_text.split() else expected_text,
                "expected_word": expected_text.split()[0] if expected_text.split() else expected_text
            })
        
        if has_tr_ch_issue and 'tr' in expected_text.lower():
            issues.append({
                "phoneme": "TR/CH",
                "severity": "moderate",
                "description": "Âm 'tr' cần phát âm rõ ràng hơn để phân biệt với âm 'ch'",
                "detected_word": "trà",
                "expected_word": "trà"
            })
        
        # Base scores - higher if fewer issues
        base_score = 85 if len(issues) == 0 else 75 if len(issues) == 1 else 65
        
        return json.dumps({
            "overall_score": base_score,
            "clarity_score": base_score - 5,
            "fluency_score": base_score + 5,
            "confidence_level": "medium",
            "issues": issues
        }, ensure_ascii=False, indent=2)
    
    def _create_mock_analysis(self, expected_text: str) -> AudioAnalysis:
        """
        Create mock analysis data with low confidence when analysis fails.
        
        Args:
            expected_text: Expected Vietnamese text
        
        Returns:
            AudioAnalysis with mock data and low confidence level
        
        Requirements: 5.8
        """
        logger.info("Creating mock analysis with low confidence")
        
        return AudioAnalysis(
            overall_score=50,
            clarity_score=50,
            fluency_score=50,
            confidence_level="low",
            issues=[
                PronunciationIssue(
                    phoneme="L/N",
                    severity="mild",
                    description="Không thể phân tích chi tiết - dữ liệu âm thanh có thể không đầy đủ",
                    detected_word=expected_text.split()[0] if expected_text.split() else expected_text,
                    expected_word=expected_text.split()[0] if expected_text.split() else expected_text
                )
            ]
        )
