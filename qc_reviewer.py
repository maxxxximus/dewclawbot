#!/usr/bin/env python3
"""
QC Reviewer - quality control for generated gambling creative assets.
Analyzes creatives and classifies them as pass/fail with detailed feedback.
"""

import base64
import json
import sys
import shutil
from pathlib import Path
from typing import Optional, Tuple
import os

from anthropic import Anthropic
from pydantic import BaseModel, Field


class QCResult(BaseModel):
    """Structured output of QC analysis"""
    status: str = Field(..., description="Overall status: 'pass' or 'fail'")
    score: float = Field(..., description="Quality score from 0.0 to 1.0")
    text_readable: bool = Field(..., description="Text on image is readable and not cropped/distorted")
    slot_matches_request: bool = Field(..., description="Slot game matches the request")
    format_correct: bool = Field(..., description="Format is correct (1080x1080 or 9:16)")
    no_artifacts: bool = Field(..., description="No generation artifacts present")
    aggression_appropriate: bool = Field(..., description="Aggression level matches request")
    colors_balanced: bool = Field(..., description="Colors are not too dim or overly bright")
    issues: list[str] = Field(..., description="List of specific issues found")
    feedback: str = Field(..., description="Detailed feedback explaining the decision")


class QCReviewer:
    """Quality Control reviewer for gambling/slot creative assets using Claude Vision"""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize QC reviewer with Anthropic client"""
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")
        self.client = Anthropic(api_key=self.api_key)

    def review(self, image_path: str, slot_request: Optional[str] = None, 
               target_format: str = "1080x1080", target_aggression: str = "medium") -> QCResult:
        """
        Review a creative image for quality control.
        
        Args:
            image_path: Path to JPG/PNG image
            slot_request: Expected slot name (optional)
            target_format: Expected format (e.g., "1080x1080", "9:16")
            target_aggression: Expected aggression level ("easy", "medium", "hard")
            
        Returns:
            QCResult object with pass/fail decision and detailed feedback
        """
        # Read and encode image
        image_data = self._read_image(image_path)
        
        # Call Claude with vision for QC analysis
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
                            "text": self._get_qc_prompt(slot_request, target_format, target_aggression),
                        },
                    ],
                }
            ],
        )
        
        # Parse response
        result = self._parse_response(response.content[0].text)
        return result

    def process_batch(self, input_dir: str, approved_dir: str = "approved", 
                     rejected_dir: str = "rejected", **review_kwargs) -> dict:
        """
        Process a batch of creatives for QC.
        
        Args:
            input_dir: Directory containing images to review
            approved_dir: Directory to move approved images
            rejected_dir: Directory to move rejected images
            **review_kwargs: Additional arguments for review()
            
        Returns:
            Dictionary with batch processing statistics
        """
        input_path = Path(input_dir)
        approved_path = Path(approved_dir)
        rejected_path = Path(rejected_dir)
        
        # Create output directories
        approved_path.mkdir(exist_ok=True)
        rejected_path.mkdir(exist_ok=True)
        
        results = {
            "total": 0,
            "approved": 0,
            "rejected": 0,
            "details": []
        }
        
        # Process each image
        for image_file in input_path.glob("*.{jpg,jpeg,png,webp}"):
            if image_file.is_file():
                try:
                    # Review the image
                    qc_result = self.review(str(image_file), **review_kwargs)
                    results["total"] += 1
                    
                    # Move based on result
                    if qc_result.status == "pass":
                        destination = approved_path / image_file.name
                        results["approved"] += 1
                    else:
                        destination = rejected_path / image_file.name
                        results["rejected"] += 1
                    
                    shutil.move(str(image_file), str(destination))
                    
                    # Save feedback alongside rejected images
                    if qc_result.status == "fail":
                        feedback_file = rejected_path / f"{image_file.stem}_feedback.json"
                        with open(feedback_file, 'w') as f:
                            json.dump(qc_result.model_dump(), f, indent=2)
                    
                    results["details"].append({
                        "filename": image_file.name,
                        "status": qc_result.status,
                        "score": qc_result.score,
                        "issues": qc_result.issues
                    })
                    
                except Exception as e:
                    print(f"Error processing {image_file.name}: {e}")
                    results["details"].append({
                        "filename": image_file.name,
                        "status": "error",
                        "error": str(e)
                    })
        
        return results

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

    def _get_qc_prompt(self, slot_request: Optional[str], target_format: str, target_aggression: str) -> str:
        """Get detailed QC analysis prompt for Claude"""
        request_info = f"Expected slot: {slot_request}" if slot_request else "Slot name not specified"
        
        return f"""Perform quality control analysis on this gambling/slot creative asset.

CONTEXT:
- {request_info}
- Target format: {target_format}
- Target aggression level: {target_aggression}

QUALITY CHECKS:
1. TEXT READABILITY: Is all text clearly readable, not cropped, distorted, or overlapping?
2. SLOT MATCHING: If expected slot specified, does the creative match it correctly?
3. FORMAT: Is the aspect ratio correct for the target format?
4. ARTIFACTS: Are there any generation artifacts (weird text, distorted faces, impossible objects)?
5. AGGRESSION: Does the visual aggression/intensity match the target level?
6. COLORS: Are colors well-balanced (not too dim/washed out or overly saturated/bright)?

SCORING:
- Each check: 1 point if pass, 0 if fail
- Overall score = (passed_checks / total_checks)
- Status: "pass" if score >= 0.85, "fail" if < 0.85

Respond ONLY with valid JSON:

{{
  "status": "pass or fail",
  "score": 0.0-1.0,
  "text_readable": true/false,
  "slot_matches_request": true/false (true if no specific slot requested),
  "format_correct": true/false,
  "no_artifacts": true/false,
  "aggression_appropriate": true/false,
  "colors_balanced": true/false,
  "issues": ["List specific problems found, or empty array if none"],
  "feedback": "Detailed explanation of the decision and any issues"
}}

Be strict but fair. This is for commercial gambling creatives so quality standards are high."""

    def _parse_response(self, text: str) -> QCResult:
        """Parse Claude response into QCResult"""
        try:
            # Extract JSON from response
            data = json.loads(text)
            return QCResult(**data)
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse Claude response as JSON: {e}\nResponse: {text}")
        except Exception as e:
            raise ValueError(f"Failed to validate response data: {e}")


def main():
    """CLI interface for QC reviewer"""
    if len(sys.argv) < 2:
        print("Usage: python qc_reviewer.py <command> [args...]")
        print("")
        print("Commands:")
        print("  single <image_path> [--slot NAME] [--format FORMAT] [--aggression LEVEL]")
        print("    Review a single image")
        print("")
        print("  batch <input_dir> [--approved DIR] [--rejected DIR] [--slot NAME] [--format FORMAT] [--aggression LEVEL]")
        print("    Review all images in a directory")
        print("")
        print("Examples:")
        print("  python qc_reviewer.py single creative.png")
        print("  python qc_reviewer.py single creative.png --slot 'Sweet Bonanza' --format '1080x1080' --aggression medium")
        print("  python qc_reviewer.py batch ./generated --approved ./approved --rejected ./rejected")
        sys.exit(1)

    command = sys.argv[1]
    
    try:
        reviewer = QCReviewer()
        
        if command == "single":
            if len(sys.argv) < 3:
                print("Error: Image path required for single command")
                sys.exit(1)
            
            image_path = sys.argv[2]
            if not Path(image_path).exists():
                print(f"Error: Image file not found: {image_path}")
                sys.exit(1)
            
            # Parse additional arguments
            kwargs = {}
            for i in range(3, len(sys.argv), 2):
                if i + 1 < len(sys.argv):
                    if sys.argv[i] == "--slot":
                        kwargs["slot_request"] = sys.argv[i + 1]
                    elif sys.argv[i] == "--format":
                        kwargs["target_format"] = sys.argv[i + 1]
                    elif sys.argv[i] == "--aggression":
                        kwargs["target_aggression"] = sys.argv[i + 1]
            
            result = reviewer.review(image_path, **kwargs)
            print(json.dumps(result.model_dump(), indent=2))
            
            # Exit with non-zero code if failed
            sys.exit(0 if result.status == "pass" else 1)
        
        elif command == "batch":
            if len(sys.argv) < 3:
                print("Error: Input directory required for batch command")
                sys.exit(1)
            
            input_dir = sys.argv[2]
            if not Path(input_dir).exists():
                print(f"Error: Input directory not found: {input_dir}")
                sys.exit(1)
            
            # Parse additional arguments
            kwargs = {
                "approved_dir": "approved",
                "rejected_dir": "rejected"
            }
            for i in range(3, len(sys.argv), 2):
                if i + 1 < len(sys.argv):
                    if sys.argv[i] == "--approved":
                        kwargs["approved_dir"] = sys.argv[i + 1]
                    elif sys.argv[i] == "--rejected":
                        kwargs["rejected_dir"] = sys.argv[i + 1]
                    elif sys.argv[i] == "--slot":
                        kwargs["slot_request"] = sys.argv[i + 1]
                    elif sys.argv[i] == "--format":
                        kwargs["target_format"] = sys.argv[i + 1]
                    elif sys.argv[i] == "--aggression":
                        kwargs["target_aggression"] = sys.argv[i + 1]
            
            results = reviewer.process_batch(input_dir, **kwargs)
            print(json.dumps(results, indent=2))
            
            print(f"\nSummary: {results['approved']} approved, {results['rejected']} rejected, {results['total']} total")
            
        else:
            print(f"Error: Unknown command: {command}")
            sys.exit(1)
    
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()