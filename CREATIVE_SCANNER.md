# Creative Scanner

Automated analyzer for gambling/slot machine creative assets. Accepts image input, returns structured JSON analysis of creative characteristics.

## Overview

The Creative Scanner uses Claude 3.5 Vision API to analyze creative images and extract:
- Slot game name/type
- Visual style (realistic, cartoon, 3D, etc)
- Dominant colors
- Call-to-action text and position
- Visual elements present
- Aggression level (easy/medium/hard)
- Image format and background type
- Presence of people and phone mockups

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### Python API

```python
from creative_scanner import CreativeScanner

scanner = CreativeScanner()
analysis = scanner.analyze("creative.png")

print(analysis.slot)
print(analysis.aggression_level)
print(analysis.model_dump())  # Full JSON
```

### Command Line

```bash
python creative_scanner.py creative.png
```

## Output Format

```json
{
  "slot": "Sweet Bonanza",
  "style": "realistic",
  "colors": ["#FF6B35", "#FFD700", "#4A90E2"],
  "cta_text": "WIN BIG NOW",
  "cta_position": "bottom-center",
  "elements": ["slot_machine", "coins", "fruits"],
  "aggression_level": "hard",
  "format": "1080x1080",
  "background": "gradient_dark",
  "has_person": false,
  "has_phone_mockup": true
}
```

## Field Definitions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| slot | string | Slot game name | "Sweet Bonanza" |
| style | string | Visual style: realistic/cartoon/3d/minimalist/pixel-art | "realistic" |
| colors | list[string] | 3-5 dominant hex colors | ["#FF6B35", "#FFD700"] |
| cta_text | string | Call-to-action text | "WIN BIG NOW" |
| cta_position | string | CTA position: top/bottom/center + left/center/right | "bottom-center" |
| elements | list[string] | Visual elements | ["slot_machine", "coins", "fruits"] |
| aggression_level | string | easy/medium/hard | "hard" |
| format | string | Image dimensions | "1080x1080" |
| background | string | Background type | "gradient_dark" |
| has_person | bool | Human/character present | false |
| has_phone_mockup | bool | Phone frame present | true |

## Requirements

### Acceptance Criteria

- [x] Accepts image, returns JSON analysis
- [x] Works with Claude 3.5 Vision API
- [x] Handles JPG/PNG/WebP formats
- [x] Returns validated structured output
- [x] Detects slot names accurately
- [x] Determines aggression levels (easy/medium/hard)

## Testing

```bash
pytest test_creative_scanner.py -v
```

## Environment Variables

- `ANTHROPIC_API_KEY` - Required. Your Anthropic API key

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)

## Error Handling

The scanner validates:
- API key presence
- Image file existence
- Image format support
- JSON response validity
- Required fields in analysis

## Architecture

```
CreativeScanner
├── __init__(api_key)          # Initialize with Anthropic client
├── analyze(image_path)         # Main analysis method
├── _read_image()               # Base64 encode image
├── _get_media_type()           # Determine MIME type
├── _get_analysis_prompt()      # Detailed Claude prompt
└── _parse_response()           # Parse Claude JSON response
```

## Integration Notes

The scanner is designed to be:
- **Modular**: Easy to import into other projects
- **Typed**: Full Pydantic validation
- **Testable**: Unit tests included
- **CLI-friendly**: Command-line interface included
- **Error-handling**: Clear error messages for debugging
