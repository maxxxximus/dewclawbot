#!/usr/bin/env python3
"""
Тестовий скрипт для Creative Localizer
"""

import os
import json
from pathlib import Path
from localizer import CreativeLocalizer, LocalizationConfig


def test_localizer():
    """Основний тест локалізатора"""
    print("🧪 Тестуємо Creative Localizer")
    
    # Перевірити наявність API ключа
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("❌ ANTHROPIC_API_KEY не встановлено")
        return False
    
    try:
        # Ініціалізація
        localizer = CreativeLocalizer()
        print("✅ Локалізатор ініціалізовано")
        
        # Перевірити завантаження ГЕО
        print(f"📊 Завантажено {len(localizer.geos)} ГЕО:")
        for geo in localizer.geos[:3]:  # Показати перші 3
            print(f"  - {geo['name']} ({geo['country_code']}) - {geo['language']}")
        
        # Тест перекладу CTA
        test_translation = localizer._translate_cta(
            original_cta="WIN BIG NOW",
            target_language="es-MX",
            aggression_level="medium"
        )
        print(f"🔄 Тест перекладу: 'WIN BIG NOW' → '{test_translation}' (es-MX)")
        
        # Тест символу валюти
        currency_symbol = localizer._get_currency_symbol("BRL")
        print(f"💰 Тест валюти: BRL → {currency_symbol}")
        
        print("✅ Всі тести пройдено")
        return True
        
    except Exception as e:
        print(f"❌ Помилка в тестах: {e}")
        return False


def create_test_image():
    """Створити тестове зображення для демонстрації"""
    from PIL import Image, ImageDraw, ImageFont
    
    # Створити простий тестовий креатив
    width, height = 1080, 1080
    image = Image.new('RGB', (width, height), color='#FF6B9D')
    draw = ImageDraw.Draw(image)
    
    # Додати фон градієнт (імітація)
    for y in range(height):
        color_intensity = int(255 * (1 - y / height))
        color = (color_intensity, 100, 200)
        draw.line([(0, y), (width, y)], fill=color)
    
    # Додати текст
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
    except:
        font = ImageFont.load_default()
    
    # CTA текст
    cta_text = "WIN BIG NOW"
    text_bbox = draw.textbbox((0, 0), cta_text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    x = (width - text_width) // 2
    y = height * 3 // 4
    
    # Додати обводку
    for adj in range(-3, 4):
        for adj2 in range(-3, 4):
            if adj != 0 or adj2 != 0:
                draw.text((x + adj, y + adj2), cta_text, font=font, fill="black")
    
    # Основний текст
    draw.text((x, y), cta_text, font=font, fill="white")
    
    # Додати "слот" назву
    slot_text = "Sweet Bonanza"
    try:
        slot_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
    except:
        slot_font = font
    
    slot_bbox = draw.textbbox((0, 0), slot_text, font=slot_font)
    slot_width = slot_bbox[2] - slot_bbox[0]
    slot_x = (width - slot_width) // 2
    slot_y = height // 4
    
    draw.text((slot_x, slot_y), slot_text, font=slot_font, fill="white")
    
    # Зберегти тестове зображення
    test_dir = Path("test_input")
    test_dir.mkdir(exist_ok=True)
    test_path = test_dir / "test_creative.png"
    
    image.save(test_path, "PNG")
    print(f"🖼️  Тестовий креатив створено: {test_path}")
    
    return str(test_path)


def demo_localization():
    """Демонстрація локалізації"""
    print("\n" + "="*50)
    print("🎬 ДЕМОНСТРАЦІЯ ЛОКАЛІЗАЦІЇ")
    print("="*50)
    
    # Створити тестовий креатив
    test_image = create_test_image()
    
    try:
        # Ініціалізувати локалізатор
        localizer = CreativeLocalizer()
        
        # Локалізувати тільки для кількох ГЕО для демо
        target_geos = ["BR", "IN", "MX"]
        print(f"🎯 Локалізуємо для ГЕО: {', '.join(target_geos)}")
        
        results = localizer.localize_creative(
            image_path=test_image,
            target_geos=target_geos,
            output_dir="test_output"
        )
        
        print(f"\n📊 РЕЗУЛЬТАТИ ЛОКАЛІЗАЦІЇ:")
        for geo, path in results.items():
            print(f"  ✅ {geo}: {path}")
        
        print(f"\n🎉 Успішно створено {len(results)} локалізованих креативів!")
        
    except Exception as e:
        print(f"❌ Помилка в демо: {e}")


if __name__ == "__main__":
    # Запустити тести
    if test_localizer():
        # Якщо тести пройшли - показати демо
        demo_localization()
    else:
        print("❌ Тести не пройдено, демо скасовано")