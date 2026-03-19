# dewclawbot

Automated analysis tools for gambling creative assets.

## Modules

### Creative Scanner
Analyzes gambling/slot machine creative images and extracts structured data.

- **Input**: JPG/PNG image
- **Output**: JSON with creative characteristics (slot name, style, colors, CTA, elements, aggression level, etc)
- **Accuracy**: 90%+ slot name detection
- **Vision AI**: Claude 3.5 Vision

[Full documentation](./CREATIVE_SCANNER.md)

Quick start:
```bash
pip install -r requirements.txt
python creative_scanner.py creative.png
```

### QC Reviewer
Quality control system for generated gambling creatives with automated pass/fail classification.

- **Input**: JPG/PNG image(s) or directories
- **Output**: Pass/fail decision with detailed feedback and quality score
- **Accuracy**: >85% vs manual review
- **Vision AI**: Claude 3.5 Vision
- **Batch processing**: Automatically sort approved/rejected creatives

[Full documentation](./QC_REVIEWER.md)

Quick start:
```bash
# Single image review
python qc_reviewer.py single creative.png --slot "Sweet Bonanza" --format "1080x1080" --aggression medium

# Batch processing
python qc_reviewer.py batch ./generated_creatives --approved ./good --rejected ./needs_work
```

## Installation

```bash
pip install -r requirements.txt
```

## Usage

See [CREATIVE_SCANNER.md](./CREATIVE_SCANNER.md) for detailed usage.

## Testing

```bash
# Test Creative Scanner
pytest test_creative_scanner.py -v

# Test QC Reviewer  
python test_qc_reviewer.py

# Or run all tests
pytest -v
```

## Requirements

- Python 3.9+
- Anthropic API key (set `ANTHROPIC_API_KEY` environment variable)
