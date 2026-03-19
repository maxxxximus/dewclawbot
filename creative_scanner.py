#!/usr/bin/env python3
"""
Creative Scanner - analyzes gambling/slot creative assets.
Accepts image input, returns structured JSON with creative characteristics.
"""

import base64
import json
import sys
from pathlib import Path
from typing import Optional
import os

from anthropic import Anthropic
from pydantic import BaseModel, Field


class CreativeAnalysis(BaseModel):
    """Structured output of creative analysis"""
    slot: str = Field(..., description="Slot name (e.g., 'Sweet Bonanza')")
    style: str = Field(..., description="Visual style: realistic, cartoon, or 3d")
    colors: list[str] = Field(..., description="Dominant colors as hex codes")
    cta_text: str = Field(..., description="Call-to-action text")
    cta_position: str = Field(..., description="Position of CTA: top/bottom, left/center/right")
    elements: list[str] = Field(..., description="Visual elements present (e.g., slot_machine, coins, fruits)")
    aggression_level: str = Field(..., description="Aggression level: easy, medium, or hard")
    format: str = Field(..., description="Image format (e.g., '1080x1080')")
    background: str = Field(..., description="Background type (solid, gradient, image, etc)")
    has_person: bool = Field(..., description="Whether human/character is present")
    has_phone_mockup: bool = Field(..., description="Whether phone mockup/frame is present")


class CreativeScanner:
    """Scanner for analyzing gambling/slot creative assets using Claude Vision"""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize scanner with Anthropic client"""
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")
        self.client = Anthropic(api_key=self.api_key)

    def analyze(self, image_path: str) -> CreativeAnalysis:
        """
        Analyze a creative image and return structured data.
        
        Args:
            image_path: Path to JPG/PNG image
            
        Returns:
            CreativeAnalysis object with structured creative data
        """
        # Read and encode image
        image_data = self._read_image(image_path)
        
        # Call Claude with vision
        response = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": self._get_media_type(image_path),
                                "data": image_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": self._get_analysis_prompt(),
                        },
                    ],
                }
            ],
        )
        
        # Parse response
        result = self._parse_response(response.content[0].text)
        return result

    def _read_image(self, image_path: str) -> str:
        """Read image file and return base64 encoded string"""
        with open(image_path, "rb") as f:
            return base64.standard_b64encode(f.read()).decode("utf-8")

    def _get_media_type(self, image_path: str) -> str:
        """Get MIME type based on file extension"""
        ext = Path(image_path).suffix.lower()
        if ext in [".jpg", ".jpeg"]:
            return "image/jpeg"
        elif ext == ".png":
            return "image/png"
        elif ext == ".webp":
            return "image/webp"
        elif ext == ".gif":
            return "image/gif"
        else:
            raise ValueError(f"Unsupported image format: {ext}")

    def _get_analysis_prompt(self) -> str:
        """Get detailed analysis prompt for Claude"""
        return """Analyze this gambling/slot machine creative asset and extract these details in JSON format:

{
  "slot": "Name of the slot game (e.g., 'Sweet Bonanza', 'Gates of Olympus')",
  "style": "Visual style - one of: realistic, cartoon, 3d, minimalist, pixel-art",
  "colors": ["List of 3-5 dominant hex colors used in the creative, e.g. #FF6B35"],
  "cta_text": "The call-to-action text visible in the creative (e.g., 'WIN BIG NOW', 'PLAY NOW')",
  "cta_position": "Position of CTA as 'vertical-horizontal' (e.g., 'top-center', 'bottom-right', 'center-center')",
  "elements": ["List of visual elements: slot_machine, coins, fruits, cards, stars, diamonds, fire, lightning, etc"],
  "aggression_level": "One of: easy (subtle, calm), medium (moderate energy), hard (intense, flashy)",
  "format": "Image dimensions if detectable (e.g., '1080x1080', '1200x628', 'unknown')",
  "background": "Background type: solid_color, gradient, image, pattern, none, etc",
  "has_person": true/false,
  "has_phone_mockup": true/false
}

Respond ONLY with valid JSON, no additional text. Be precise and analytical. For unknown fields, provide your best estimate based on visual analysis."""

    def _parse_response(self, text: str) -> CreativeAnalysis:
        """Parse Claude response into CreativeAnalysis"""
        try:
            # Extract JSON from response
            data = json.loads(text)
            return CreativeAnalysis(**data)
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse Claude response as JSON: {e}\nResponse: {text}")
        except Exception as e:
            raise ValueError(f"Failed to validate response data: {e}")


def main():
    """CLI interface for creative scanner"""
    if len(sys.argv) < 2:
        print("Usage: python creative_scanner.py <image_path>")
        print("Example: python creative_scanner.py creative.png")
        sys.exit(1)

    image_path = sys.argv[1]
    
    if not Path(image_path).exists():
        print(f"Error: Image file not found: {image_path}")
        sys.exit(1)

    try:
        scanner = CreativeScanner()
        analysis = scanner.analyze(image_path)
        print(json.dumps(analysis.model_dump(), indent=2))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
