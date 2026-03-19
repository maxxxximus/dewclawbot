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

## Installation

```bash
pip install -r requirements.txt
```

## Usage

See [CREATIVE_SCANNER.md](./CREATIVE_SCANNER.md) for detailed usage.

## Testing

```bash
pytest test_creative_scanner.py -v
```

## Requirements

- Python 3.9+
- Anthropic API key (set `ANTHROPIC_API_KEY` environment variable)
