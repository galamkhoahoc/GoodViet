"""
Simple test script for Gemma4Service basic functionality.

This script tests:
- Service initialization
- Device detection
- Model info retrieval
"""

import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.gemma4_service import Gemma4Service

def test_initialization():
    """Test basic service initialization"""
    print("=" * 60)
    print("Testing Gemma4Service Initialization")
    print("=" * 60)
    
    # Test with auto device detection
    print("\n1. Testing with auto device detection...")
    service = Gemma4Service(
        model_name="google/gemma-4-e2b",
        assistant_model_name="google/gemma-4-1b",
        device="auto",
        model_variant="e2b"
    )
    print(f"✓ Service initialized with device: {service.device}")
    
    # Test model info retrieval
    print("\n2. Testing model info retrieval...")
    model_info = service.get_model_info()
    print(f"✓ Model info retrieved:")
    print(f"  - Target model: {model_info.target_model}")
    print(f"  - Assistant model: {model_info.assistant_model}")
    print(f"  - Device: {model_info.device}")
    print(f"  - Variant: {model_info.variant}")
    
    # Test explicit CPU device
    print("\n3. Testing with explicit CPU device...")
    cpu_service = Gemma4Service(
        model_name="google/gemma-4-e2b",
        assistant_model_name="google/gemma-4-1b",
        device="cpu",
        model_variant="e2b"
    )
    print(f"✓ Service initialized with device: {cpu_service.device}")
    assert cpu_service.device == "cpu", "Device should be CPU"
    
    print("\n" + "=" * 60)
    print("All initialization tests passed! ✓")
    print("=" * 60)
    print("\nNote: Model loading tests are skipped to avoid downloading large models.")
    print("To test model loading, ensure you have the models downloaded and")
    print("sufficient memory, then call service.ensure_models_loaded()")

if __name__ == "__main__":
    try:
        test_initialization()
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        sys.exit(1)
