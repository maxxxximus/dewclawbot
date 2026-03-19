#!/usr/bin/env python3
"""
Demo script showing QC Reviewer usage and expected workflow.
This script shows the integration patterns without requiring actual dependencies.
"""

def demo_single_review():
    """Demonstrate single image review"""
    print("=== Перевірка одного зображення ===")
    print()
    print("Команда:")
    print("python qc_reviewer.py single creative.png --slot 'Sweet Bonanza' --format '1080x1080' --aggression medium")
    print()
    print("Очікуваний вихід:")
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
  "feedback": "Усі перевірки якості пройдено. Текст чіткий і читабельний, слот відповідає 'Sweet Bonanza', формат правильний 1080x1080, артефактів генерації не виявлено, рівень агресії підходящий для medium налаштування, кольори добре збалансовані."
}""")
    print()
    print("Код виходу: 0 (пройшов)")
    print()


def demo_single_review_fail():
    """Demonstrate failed review"""
    print("=== Провалена перевірка якості ===")
    print()
    print("Команда:")
    print("python qc_reviewer.py single bad_creative.png --slot 'Gates of Olympus' --format '9:16' --aggression hard")
    print()
    print("Очікуваний вихід:")
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
    "Текст частково обрізаний по нижньому краю",
    "Рівень агресії занадто низький для налаштування 'hard' - потрібні більш інтенсивні візуальні ефекти",
    "Кольори виглядають вицвілими і занадто тьмяними"
  ],
  "feedback": "Креатив не пройшов QC з рейтингом 0.67. Основні проблеми: проблеми читабельності тексту з обрізанням нижнього тексту, недостатній рівень візуальної агресії для вимог 'hard', та проблеми балансу кольорів із загальною тьмяністю."
}""")
    print()
    print("Код виходу: 1 (провалено)")
    print()


def demo_batch_processing():
    """Demonstrate batch processing workflow"""
    print("=== Пакетна обробка ===")
    print()
    print("Структура директорії до:")
    print("""generated/
├── creative1.png
├── creative2.png
├── creative3.png
├── creative4.png
└── creative5.png""")
    print()
    print("Команда:")
    print("python qc_reviewer.py batch generated --approved good_creatives --rejected needs_work --slot 'Sweet Bonanza' --format '1080x1080' --aggression medium")
    print()
    print("Очікуваний вихід:")
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
      "issues": ["Текст трохи розмитий", "Формат не точно 1080x1080"]
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
      "issues": ["Неправильна назва слоту", "Занадто яскраві кольори"]
    },
    {
      "filename": "creative5.png",
      "status": "pass",
      "score": 0.92,
      "issues": []
    }
  ]
}

Підсумок: 3 схвалено, 2 відхилено, 5 всього""")
    print()
    print("Структура директорії після:")
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
(порожня)""")
    print()


def demo_integration():
    """Demonstrate integration into creative generation pipeline"""
    print("=== Інтеграція в пайплайн ===")
    print()
    print("Пайплайн генерації креативів:")
    print("1. python generate_creatives.py --slot 'Sweet Bonanza' --count 50 --output ./generated")
    print("2. python qc_reviewer.py batch ./generated --approved ./approved --rejected ./rejected")
    print("3. python deploy_creatives.py --input ./approved --platform facebook")
    print("4. python analyze_rejections.py --input ./rejected --report ./qc_report.json")
    print()
    print("Це забезпечує, що лише високоякісні креативи потрапляють у production!")
    print()


def demo_python_api():
    """Demonstrate Python API usage"""
    print("=== Python API ===")
    print()
    print("Код:")
    print("""from qc_reviewer import QCReviewer

# Ініціалізація ревʼюєра
reviewer = QCReviewer()

# Перевірка одного зображення
result = reviewer.review(
    "creative.png",
    slot_request="Sweet Bonanza",
    target_format="1080x1080",
    target_aggression="medium"
)

print(f"Статус: {result.status}")
print(f"Рейтинг: {result.score:.2f}")
if result.issues:
    print("Знайдені проблеми:")
    for issue in result.issues:
        print(f"  - {issue}")

# Пакетна обробка
results = reviewer.process_batch(
    input_dir="./generated",
    approved_dir="./approved", 
    rejected_dir="./rejected",
    slot_request="Gates of Olympus",
    target_format="9:16",
    target_aggression="hard"
)

print(f"Результати пакету: {results['approved']}/{results['total']} схвалено")""")
    print()


def main():
    """Run all demos"""
    print("QC REVIEWER ДЕМОНСТРАЦІЯ")
    print("=" * 50)
    print()
    
    demo_single_review()
    demo_single_review_fail()
    demo_batch_processing()
    demo_integration()
    demo_python_api()
    
    print("=== Інструкції з встановлення ===")
    print("1. Встановити залежності:")
    print("   pip install -r requirements.txt")
    print()
    print("2. Встановити API ключ:")
    print("   export ANTHROPIC_API_KEY=your_key_here")
    print()
    print("3. Тестувати з зразком зображення:")
    print("   python qc_reviewer.py single test_creative.png")
    print()
    print("4. Обробити пакет:")
    print("   python qc_reviewer.py batch ./my_creatives")
    print()
    print("Готовий забезпечити відповідність ваших креативів високим стандартам якості! 🎯")


if __name__ == "__main__":
    main()