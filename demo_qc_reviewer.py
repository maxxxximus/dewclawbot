#!/usr/bin/env python3
"""
Demo script showing QC Reviewer usage and expected workflow.
This script shows the integration patterns without requiring actual dependencies.
"""

def demo_single_review():
    """Demonstrate single image review"""
    print("=== Single Image QC Review Demo ===")
    print()
    print("Command:")
    print("python qc_reviewer.py single creative.png --slot 'Sweet Bonanza' --format '1080x1080' --aggression medium")
    print()
    print("Expected Output:")
    print("""{
  "status": "pass",
  "score": 0.92,
  "text_readable": true,
  "slot_matches_request": true,
  "format_correct": true,
  "no_artifacts": true,
  "aggression_appropriate": true,
  "colors_balanced": true,
  "issues": [],
  "feedback": "All quality checks passed. Text is clear and readable, slot matches 'Sweet Bonanza', format is correct 1080x1080, no generation artifacts detected, aggression level appropriate for medium setting, colors well balanced."
}""")
    print()
    print("Exit code: 0 (pass)")
    print()


def demo_single_review_fail():
    """Demonstrate failed review"""
    print("=== Failed QC Review Demo ===")
    print()
    print("Command:")
    print("python qc_reviewer.py single bad_creative.png --slot 'Gates of Olympus' --format '9:16' --aggression hard")
    print()
    print("Expected Output:")
    print("""{
  "status": "fail",
  "score": 0.67,
  "text_readable": false,
  "slot_matches_request": true,
  "format_correct": true,
  "no_artifacts": true,
  "aggression_appropriate": false,
  "colors_balanced": false,
  "issues": [
    "Text partially cropped at bottom edge",
    "Aggression level too low for 'hard' setting - needs more intense visuals",
    "Colors appear washed out and too dim"
  ],
  "feedback": "Creative failed QC with score 0.67. Main issues: text readability problems with bottom text being cropped, visual aggression level insufficient for 'hard' requirement, and color balance issues with overall dimness."
}""")
    print()
    print("Exit code: 1 (fail)")
    print()


def demo_batch_processing():
    """Demonstrate batch processing workflow"""
    print("=== Batch Processing Demo ===")
    print()
    print("Directory Structure Before:")
    print("""generated/
├── creative1.png
├── creative2.png
├── creative3.png
├── creative4.png
└── creative5.png""")
    print()
    print("Command:")
    print("python qc_reviewer.py batch generated --approved good_creatives --rejected needs_work --slot 'Sweet Bonanza' --format '1080x1080' --aggression medium")
    print()
    print("Expected Output:")
    print("""{
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
      "score": 0.75,
      "issues": ["Text slightly blurry", "Format not exactly 1080x1080"]
    },
    {
      "filename": "creative3.png",
      "status": "pass",
      "score": 0.88,
      "issues": []
    },
    {
      "filename": "creative4.png",
      "status": "fail",
      "score": 0.67,
      "issues": ["Slot name incorrect", "Colors too bright"]
    },
    {
      "filename": "creative5.png",
      "status": "pass",
      "score": 0.92,
      "issues": []
    }
  ]
}

Summary: 3 approved, 2 rejected, 5 total""")
    print()
    print("Directory Structure After:")
    print("""good_creatives/
├── creative1.png
├── creative3.png
└── creative5.png

needs_work/
├── creative2.png
├── creative2_feedback.json
├── creative4.png
└── creative4_feedback.json

generated/
(empty)""")
    print()


def demo_integration():
    """Demonstrate integration into creative generation pipeline"""
    print("=== Pipeline Integration Demo ===")
    print()
    print("Creative Generation Pipeline:")
    print("1. python generate_creatives.py --slot 'Sweet Bonanza' --count 50 --output ./generated")
    print("2. python qc_reviewer.py batch ./generated --approved ./approved --rejected ./rejected")
    print("3. python deploy_creatives.py --input ./approved --platform facebook")
    print("4. python analyze_rejections.py --input ./rejected --report ./qc_report.json")
    print()
    print("This ensures only high-quality creatives make it to production!")
    print()


def demo_python_api():
    """Demonstrate Python API usage"""
    print("=== Python API Demo ===")
    print()
    print("Code:")
    print("""from qc_reviewer import QCReviewer

# Initialize reviewer
reviewer = QCReviewer()

# Single review
result = reviewer.review(
    "creative.png",
    slot_request="Sweet Bonanza",
    target_format="1080x1080",
    target_aggression="medium"
)

print(f"Status: {result.status}")
print(f"Score: {result.score:.2f}")
if result.issues:
    print("Issues found:")
    for issue in result.issues:
        print(f"  - {issue}")

# Batch processing
results = reviewer.process_batch(
    input_dir="./generated",
    approved_dir="./approved", 
    rejected_dir="./rejected",
    slot_request="Gates of Olympus",
    target_format="9:16",
    target_aggression="hard"
)

print(f"Batch results: {results['approved']}/{results['total']} approved")""")
    print()


def main():
    """Run all demos"""
    print("QC REVIEWER DEMONSTRATION")
    print("=" * 50)
    print()
    
    demo_single_review()
    demo_single_review_fail()
    demo_batch_processing()
    demo_integration()
    demo_python_api()
    
    print("=== Installation Instructions ===")
    print("1. Install dependencies:")
    print("   pip install -r requirements.txt")
    print()
    print("2. Set API key:")
    print("   export ANTHROPIC_API_KEY=your_key_here")
    print()
    print("3. Test with sample image:")
    print("   python qc_reviewer.py single test_creative.png")
    print()
    print("4. Process batch:")
    print("   python qc_reviewer.py batch ./my_creatives")
    print()
    print("Ready to ensure your creatives meet high quality standards! 🎯")


if __name__ == "__main__":
    main()