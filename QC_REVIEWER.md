# QC Reviewer

Automated quality control system for gambling creative assets. Analyzes generated creatives and classifies them as pass/fail with detailed feedback.

## Features

- **Automated QC**: Pass/fail classification based on multiple quality criteria
- **Detailed Feedback**: Specific issues and recommendations for improvements
- **Batch Processing**: Process entire directories and automatically sort results
- **Vision AI**: Uses Claude 3.5 Vision for accurate quality assessment
- **High Accuracy**: Target >85% accuracy compared to manual review

## Quality Checks

1. **Text Readability**: All text is clearly readable, not cropped or distorted
2. **Slot Matching**: Creative matches the requested slot game
3. **Format Compliance**: Correct aspect ratio (1080x1080, 9:16, etc)
4. **Artifact Detection**: No generation artifacts or impossible elements
5. **Aggression Level**: Visual intensity matches the request (easy/medium/hard)
6. **Color Balance**: Colors are not too dim/washed out or overly saturated

## Installation

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=your_api_key
```

## Usage

### Single Image Review

```bash
# Basic review
python qc_reviewer.py single creative.png

# With specific requirements
python qc_reviewer.py single creative.png --slot "Sweet Bonanza" --format "1080x1080" --aggression medium
```

**Example Output:**
```json
{
  "status": "pass",
  "score": 0.92,
  "text_readable": true,
  "slot_matches_request": true,
  "format_correct": true,
  "no_artifacts": true,
  "aggression_appropriate": true,
  "colors_balanced": true,
  "issues": [],
  "feedback": "All quality checks passed. Creative meets high standards."
}
```

### Batch Processing

```bash
# Process entire directory
python qc_reviewer.py batch ./generated_creatives

# Custom output directories
python qc_reviewer.py batch ./generated_creatives --approved ./good --rejected ./bad

# With specific requirements for all images
python qc_reviewer.py batch ./generated_creatives --slot "Gates of Olympus" --format "9:16" --aggression hard
```

**Batch Output Structure:**
```
approved/
├── creative1.png
├── creative3.png
└── creative5.png

rejected/
├── creative2.png
├── creative2_feedback.json
├── creative4.png
└── creative4_feedback.json
```

**Batch Results:**
```json
{
  "total": 5,
  "approved": 3,
  "rejected": 2,
  "details": [
    {
      "filename": "creative1.png",
      "status": "pass",
      "score": 0.95,
      "issues": []
    },
    {
      "filename": "creative2.png", 
      "status": "fail",
      "score": 0.67,
      "issues": ["Text partially cropped", "Colors too dim"]
    }
  ]
}
```

## Python API

```python
from qc_reviewer import QCReviewer

# Initialize reviewer
reviewer = QCReviewer()

# Review single image
result = reviewer.review(
    "creative.png",
    slot_request="Sweet Bonanza",
    target_format="1080x1080", 
    target_aggression="medium"
)

print(f"Status: {result.status}")
print(f"Score: {result.score}")
print(f"Issues: {result.issues}")

# Batch processing
results = reviewer.process_batch(
    input_dir="./generated",
    approved_dir="./approved",
    rejected_dir="./rejected",
    slot_request="Gates of Olympus"
)

print(f"Approved: {results['approved']}/{results['total']}")
```

## Quality Scoring

The QC system uses a weighted scoring approach:

- Each quality check is binary: pass (1.0) or fail (0.0)
- Overall score = (passed_checks / total_checks)
- **Pass threshold: ≥85% (0.85)**
- **Fail threshold: <85% (0.85)**

## Quality Criteria Details

### Text Readability
- All text elements are fully visible
- No text cut off at edges
- Font size appropriate for format
- Good contrast against background
- No overlapping text elements

### Slot Matching
- Game title matches requested slot
- Visual style consistent with slot theme
- Appropriate symbols/elements for the game

### Format Compliance
- Correct aspect ratio for target format
- No black bars or unexpected padding
- Proper resolution for intended use

### Artifact Detection
- No AI generation artifacts
- No impossible/physically incorrect elements
- No distorted faces or objects
- Consistent art style throughout

### Aggression Level
- **Easy**: Calm, subtle, pastel colors, gentle messaging
- **Medium**: Moderate energy, balanced colors, standard casino aesthetics
- **Hard**: Intense, flashy, bright colors, aggressive messaging

### Color Balance
- Colors are vibrant but not oversaturated
- Good contrast between elements
- Not too dark or washed out
- Appropriate for gambling creative standards

## Exit Codes

When using CLI:
- `0`: Review passed (single mode) or completed successfully (batch mode)
- `1`: Review failed (single mode) or error occurred

## Performance

- **Speed**: ~2-3 seconds per image
- **Accuracy**: >85% vs manual review
- **Supported formats**: JPG, PNG, WebP, GIF
- **Recommended batch size**: 50-100 images

## Error Handling

The system handles various error conditions:
- Invalid image formats
- Missing API keys
- Network issues
- Invalid responses from AI

All errors include detailed messages and suggestions for resolution.

## Integration

Easy to integrate into existing workflows:

```bash
# In your creative generation pipeline
python generate_creatives.py --output ./generated
python qc_reviewer.py batch ./generated --approved ./ready --rejected ./needs_work
python deploy_creatives.py --input ./ready
```

## Contributing

To improve QC accuracy:
1. Test with diverse creative samples
2. Adjust prompts in `_get_qc_prompt()` method
3. Update scoring thresholds based on performance data
4. Add new quality checks as needed

## License

Same as project license.