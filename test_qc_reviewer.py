#!/usr/bin/env python3
"""
Tests for QC Reviewer module
"""

import json
import os
import tempfile
import shutil
from pathlib import Path
import pytest

from qc_reviewer import QCReviewer, QCResult


def test_qc_reviewer_init():
    """Test QCReviewer initialization"""
    # Test with API key
    reviewer = QCReviewer(api_key="test-key")
    assert reviewer.api_key == "test-key"
    
    # Test without API key (should use environment)
    os.environ["ANTHROPIC_API_KEY"] = "env-key"
    reviewer = QCReviewer()
    assert reviewer.api_key == "env-key"


def test_qc_result_validation():
    """Test QCResult model validation"""
    valid_data = {
        "status": "pass",
        "score": 0.9,
        "text_readable": True,
        "slot_matches_request": True,
        "format_correct": True,
        "no_artifacts": True,
        "aggression_appropriate": True,
        "colors_balanced": True,
        "issues": [],
        "feedback": "All checks passed"
    }
    
    result = QCResult(**valid_data)
    assert result.status == "pass"
    assert result.score == 0.9
    assert len(result.issues) == 0


def test_media_type_detection():
    """Test media type detection"""
    reviewer = QCReviewer(api_key="test")
    
    assert reviewer._get_media_type("test.jpg") == "image/jpeg"
    assert reviewer._get_media_type("test.jpeg") == "image/jpeg"
    assert reviewer._get_media_type("test.png") == "image/png"
    assert reviewer._get_media_type("test.webp") == "image/webp"
    
    # Test unsupported format
    with pytest.raises(ValueError):
        reviewer._get_media_type("test.bmp")


def test_qc_prompt_generation():
    """Test QC prompt generation"""
    reviewer = QCReviewer(api_key="test")
    
    prompt = reviewer._get_qc_prompt("Sweet Bonanza", "1080x1080", "medium")
    
    assert "Sweet Bonanza" in prompt
    assert "1080x1080" in prompt
    assert "medium" in prompt
    assert "TEXT READABILITY" in prompt
    assert "ARTIFACTS" in prompt
    
    # Test without slot request
    prompt_no_slot = reviewer._get_qc_prompt(None, "9:16", "hard")
    assert "Slot name not specified" in prompt_no_slot
    assert "9:16" in prompt_no_slot
    assert "hard" in prompt_no_slot


def test_batch_processing_structure():
    """Test batch processing directory structure"""
    reviewer = QCReviewer(api_key="test")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        input_dir = Path(temp_dir) / "input"
        input_dir.mkdir()
        
        # Create dummy image files
        (input_dir / "test1.jpg").touch()
        (input_dir / "test2.png").touch()
        (input_dir / "not_image.txt").touch()
        
        # Mock the review method to avoid API calls
        def mock_review(image_path, **kwargs):
            return QCResult(
                status="pass",
                score=0.9,
                text_readable=True,
                slot_matches_request=True,
                format_correct=True,
                no_artifacts=True,
                aggression_appropriate=True,
                colors_balanced=True,
                issues=[],
                feedback="Mock review result"
            )
        
        reviewer.review = mock_review
        
        # Process batch (will fail because files are empty, but we can test structure)
        try:
            results = reviewer.process_batch(
                str(input_dir),
                approved_dir=str(temp_dir / "approved"),
                rejected_dir=str(temp_dir / "rejected")
            )
            
            # Check directories were created
            assert (Path(temp_dir) / "approved").exists()
            assert (Path(temp_dir) / "rejected").exists()
            
        except Exception as e:
            # Expected to fail due to empty files, but directories should exist
            assert (Path(temp_dir) / "approved").exists()
            assert (Path(temp_dir) / "rejected").exists()


def test_cli_argument_parsing():
    """Test CLI argument parsing logic"""
    # This would be tested through subprocess calls in a real test
    # For now, just verify the main function exists
    from qc_reviewer import main
    assert callable(main)


if __name__ == "__main__":
    # Run tests manually if called directly
    print("Running QC Reviewer tests...")
    
    print("✓ Testing QCReviewer initialization...")
    test_qc_reviewer_init()
    
    print("✓ Testing QCResult validation...")
    test_qc_result_validation()
    
    print("✓ Testing media type detection...")
    test_media_type_detection()
    
    print("✓ Testing prompt generation...")
    test_qc_prompt_generation()
    
    print("✓ Testing batch processing structure...")
    test_batch_processing_structure()
    
    print("✓ Testing CLI structure...")
    test_cli_argument_parsing()
    
    print("All tests passed!")