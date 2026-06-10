"""
Flask HTTP Bridge for Gemma 4 AI Service

This application exposes Gemma 4 model functionality via REST API endpoints
for the Node.js backend to consume.

Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 6.6, 6.7, 7.6, 7.7
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from services.gemma4_service import Gemma4Service
from services.multimodal_processor import MultiModalProcessor
import os
import logging
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.getenv('LOG_LEVEL', 'INFO'),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, origins=allowed_origins)

logger.info(f"CORS enabled for origins: {allowed_origins}")

# Initialize Gemma4Service (will load models lazily)
try:
    gemma4_service = Gemma4Service(
        model_name=os.getenv('GEMMA4_TARGET_MODEL', 'google/gemma-4-e2b'),
        assistant_model_name=os.getenv('GEMMA4_ASSISTANT_MODEL', 'google/gemma-4-1b'),
        device=os.getenv('GEMMA4_DEVICE', 'auto'),
        model_variant=os.getenv('GEMMA4_MODEL_VARIANT', 'e2b')
    )
    logger.info("Gemma4Service initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Gemma4Service: {str(e)}")
    gemma4_service = None

# Initialize MultiModalProcessor (will be created after models load)
multimodal_processor = None


def ensure_multimodal_processor():
    """Ensure multimodal processor is initialized"""
    global multimodal_processor
    if multimodal_processor is None and gemma4_service is not None:
        gemma4_service.ensure_models_loaded()
        multimodal_processor = MultiModalProcessor(
            model=gemma4_service.target_model,
            model_variant=gemma4_service.model_variant
        )
        logger.info("MultiModalProcessor initialized")


@app.route('/health', methods=['GET'])
def health():
    """
    Health check endpoint.
    
    Returns service status, model info, and device info.
    
    Requirements: 1.1
    """
    try:
        if gemma4_service is None:
            return jsonify({
                'status': 'error',
                'message': 'Gemma4Service not initialized'
            }), 503
        
        model_info = gemma4_service.get_model_info()
        
        return jsonify({
            'status': 'ok',
            'model': model_info.target_model,
            'assistant_model': model_info.assistant_model,
            'device': model_info.device,
            'variant': model_info.variant
        }), 200
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/chat', methods=['POST'])
def chat():
    """
    Chat endpoint for generating conversational responses.
    
    Request JSON:
    {
        "message": "User message",
        "history": [{"role": "user", "content": "..."}],  // Optional
        "system_prompt": "Custom system prompt"  // Optional
    }
    
    Response JSON:
    {
        "response": "Generated response",
        "thinking": "Internal thinking (optional)",
        "model": "Model name"
    }
    
    Requirements: 1.2, 1.3, 1.4, 1.6, 4.5, 11.1, 11.2, 11.4
    """
    try:
        # Validate service is available
        if gemma4_service is None:
            return jsonify({
                'error': 'Gemma4Service not initialized'
            }), 503
        
        # Parse request
        data = request.json
        if not data or 'message' not in data:
            return jsonify({
                'error': 'Missing required field: message'
            }), 400
        
        message = data.get('message')
        history = data.get('history', [])
        system_prompt = data.get('system_prompt')
        
        logger.info(f"Chat request received: {message[:50]}...")
        
        # Generate response
        response, thinking = gemma4_service.generate_chat_response(
            message=message,
            history=history,
            system_prompt=system_prompt
        )
        
        logger.info(f"Chat response generated: {response[:50]}...")
        
        return jsonify({
            'response': response,
            'thinking': thinking,
            'model': gemma4_service.model_name
        }), 200
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        return jsonify({
            'error': f'Không thể tạo phản hồi: {str(e)}'
        }), 500


@app.route('/analyze-audio', methods=['POST'])
def analyze_audio():
    """
    Audio analysis endpoint for pronunciation feedback.
    
    Request JSON:
    {
        "audio_data": "base64 encoded audio",
        "mime_type": "audio/wav",
        "expected_text": "Expected Vietnamese text"
    }
    
    Response JSON:
    {
        "overallScore": 85,
        "clarityScore": 90,
        "fluencyScore": 80,
        "confidenceLevel": "high",
        "issues": [...]
    }
    
    Requirements: 1.3, 1.4, 1.6, 5.7
    """
    try:
        # Validate service is available
        if gemma4_service is None:
            return jsonify({
                'error': 'Gemma4Service not initialized'
            }), 503
        
        # Ensure multimodal processor is initialized
        ensure_multimodal_processor()
        
        if multimodal_processor is None:
            return jsonify({
                'error': 'MultiModalProcessor not available'
            }), 503
        
        # Parse request
        data = request.json
        if not data:
            return jsonify({
                'error': 'Missing request body'
            }), 400
        
        required_fields = ['audio_data', 'mime_type', 'expected_text']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        audio_base64 = data.get('audio_data')
        mime_type = data.get('mime_type')
        expected_text = data.get('expected_text')
        
        logger.info(f"Audio analysis request: mime_type={mime_type}, expected_text={expected_text[:30]}...")
        
        # Decode base64 audio
        audio_bytes = base64.b64decode(audio_base64)
        
        # Analyze audio
        analysis = multimodal_processor.analyze_audio(
            audio_data=audio_bytes,
            mime_type=mime_type,
            expected_text=expected_text
        )
        
        logger.info(f"Audio analysis complete: score={analysis.overall_score}")
        
        # Convert to dict for JSON response
        return jsonify({
            'overallScore': analysis.overall_score,
            'clarityScore': analysis.clarity_score,
            'fluencyScore': analysis.fluency_score,
            'confidenceLevel': analysis.confidence_level,
            'issues': [
                {
                    'phoneme': issue.phoneme,
                    'severity': issue.severity,
                    'description': issue.description,
                    'detectedWord': issue.detected_word,
                    'expectedWord': issue.expected_word
                }
                for issue in analysis.issues
            ]
        }), 200
        
    except Exception as e:
        logger.error(f"Audio analysis endpoint error: {str(e)}")
        return jsonify({
            'error': f'Không thể phân tích âm thanh: {str(e)}'
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    
    logger.info(f"Starting Flask server on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
