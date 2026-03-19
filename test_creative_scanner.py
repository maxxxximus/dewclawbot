#!/usr/bin/env python3
"""
Tests for creative scanner
"""

import json
import os
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from creative_scanner import CreativeScanner, CreativeAnalysis


@pytest.fixture
def sample_analysis_json():
    """Sample JSON response from Claude"""
    return {
        "slot": "Sweet Bonanza",
        "style": "realistic",
        "colors": ["#FF6B35", "#FFD700", "#4A90E2"],
        "cta_text": "WIN BIG NOW",
        "cta_position": "bottom-center",
        "elements": ["slot_machine", "coins", "fruits"],
        "aggression_level": "hard",
        "format": "1080x1080",
        "background": "gradient_dark",
        "has_person": False,
        "has_phone_mockup": True,
    }


def test_creative_analysis_model(sample_analysis_json):
    """Test that CreativeAnalysis model validates correctly"""
    analysis = CreativeAnalysis(**sample_analysis_json)
    assert analysis.slot == "Sweet Bonanza"
    assert analysis.aggression_level == "hard"
    assert analysis.has_phone_mockup is True


def test_creative_analysis_json_serialization(sample_analysis_json):
    """Test JSON serialization of CreativeAnalysis"""
    analysis = CreativeAnalysis(**sample_analysis_json)
    serialized = analysis.model_dump()
    assert serialized == sample_analysis_json


@patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test-key"})
def test_scanner_initialization():
    """Test scanner initializes with API key"""
    scanner = CreativeScanner()
    assert scanner.api_key == "test-key"


@patch.dict(os.environ, {}, clear=True)
def test_scanner_missing_api_key():
    """Test scanner raises error when API key missing"""
    with pytest.raises(ValueError, match="ANTHROPIC_API_KEY"):
        CreativeScanner()


@patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test-key"})
def test_get_media_type(tmp_path):
    """Test media type detection"""
    scanner = CreativeScanner()
    
    assert scanner._get_media_type("test.jpg") == "image/jpeg"
    assert scanner._get_media_type("test.png") == "image/png"
    assert scanner._get_media_type("test.webp") == "image/webp"
    assert scanner._get_media_type("test.gif") == "image/gif"
    
    with pytest.raises(ValueError):
        scanner._get_media_type("test.bmp")


@patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test-key"})
def test_parse_response(sample_analysis_json):
    """Test response parsing"""
    scanner = CreativeScanner()
    json_str = json.dumps(sample_analysis_json)
    result = scanner._parse_response(json_str)
    
    assert isinstance(result, CreativeAnalysis)
    assert result.slot == "Sweet Bonanza"


@patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test-key"})
def test_parse_response_invalid_json():
    """Test parsing invalid JSON raises error"""
    scanner = CreativeScanner()
    with pytest.raises(ValueError, match="Failed to parse"):
        scanner._parse_response("not valid json")


@patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test-key"})
def test_parse_response_missing_fields():
    """Test parsing with missing required fields"""
    scanner = CreativeScanner()
    incomplete_json = json.dumps({"slot": "Sweet Bonanza"})
    with pytest.raises(ValueError, match="Failed to validate"):
        scanner._parse_response(incomplete_json)
