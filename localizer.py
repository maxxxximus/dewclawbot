#!/usr/bin/env python3
"""
Creative Localizer - адаптує креативи на різні ГЕО.
Автоматично перекладає CTA тексти, змінює банки/валюти, зберігає локалізовані варіанти.
"""

import json
import sys
import os
from pathlib import Path
from typing import Dict, List, Optional, Union
import base64
from PIL import Image, ImageDraw, ImageFont
import re

from anthropic import Anthropic
from pydantic import BaseModel, Field
from creative_scanner import CreativeScanner, CreativeAnalysis


class LocalizationConfig(BaseModel):
    """Конфігурація для локалізації креативу"""
    geo: Dict = Field(..., description="ГЕО дані з geos.json")
    cta_translation: str = Field(..., description="Переклад CTA тексту")
    bank_name: str = Field(..., description="Локальний банк")
    payment_method: str = Field(..., description="Локальний платіжний метод")
    currency_symbol: str = Field(..., description="Символ валюти")


class CreativeLocalizer:
    """Локалізатор креативів для різних ГЕО"""

    def __init__(self, api_key: Optional[str] = None):
        """Ініціалізація локалізатора"""
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")
        
        self.client = Anthropic(api_key=self.api_key)
        self.scanner = CreativeScanner(api_key)
        self.geos = self._load_geos()
        
    def _load_geos(self) -> List[Dict]:
        """Завантажити дані ГЕО"""
        with open("config/geos.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            return data["geos"]

    def localize_creative(self, image_path: str, target_geos: Optional[List[str]] = None, 
                         output_dir: str = "output/localized") -> Dict[str, str]:
        """
        Локалізувати креатив для вказаних ГЕО
        
        Args:
            image_path: Шлях до оригінального креативу
            target_geos: Список country_code ГЕО (якщо None - усі 10)
            output_dir: Директорія для збереження
            
        Returns:
            Словник з результатами {geo_code: output_path}
        """
        if not Path(image_path).exists():
            raise FileNotFoundError(f"Creative not found: {image_path}")

        # Аналіз оригінального креативу
        print(f"🔍 Аналізую креатив: {image_path}")
        original_analysis = self.scanner.analyze(image_path)
        print(f"📊 Виявлено: {original_analysis.slot}, CTA: '{original_analysis.cta_text}'")

        # Вибір ГЕО для локалізації
        if target_geos is None:
            target_geos = [geo["country_code"] for geo in self.geos]
        
        # Створити директорію для виводу
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        results = {}
        
        for geo_data in self.geos:
            if geo_data["country_code"] not in target_geos:
                continue
                
            print(f"\n🌍 Локалізую для {geo_data['name']} ({geo_data['country_code']})")
            
            try:
                # Переклад CTA
                cta_translation = self._translate_cta(
                    original_analysis.cta_text, 
                    geo_data["language"],
                    original_analysis.aggression_level
                )
                
                # Конфігурація локалізації
                config = LocalizationConfig(
                    geo=geo_data,
                    cta_translation=cta_translation,
                    bank_name=geo_data["top_banks"][0],  # Перший банк зі списку
                    payment_method=geo_data["payment_methods"][0],  # Перший метод
                    currency_symbol=self._get_currency_symbol(geo_data["currency"])
                )
                
                # Створити локалізований креатив
                output_path = self._create_localized_creative(
                    image_path, original_analysis, config, output_dir
                )
                
                results[geo_data["country_code"]] = output_path
                print(f"✅ Збережено: {output_path}")
                
            except Exception as e:
                print(f"❌ Помилка для {geo_data['country_code']}: {e}")
                continue
        
        return results

    def _translate_cta(self, original_cta: str, target_language: str, aggression_level: str) -> str:
        """Переклад CTA тексту через LLM"""
        prompt = f"""Переклади gambling CTA текст "{original_cta}" на мову {target_language}.

Вимоги:
- Рівень агресії: {aggression_level}
- Збережи емоційний тон оригіналу
- Використай локальні gambling терміни
- Максимум 3-4 слова
- Відповідь ТІЛЬКИ переклад, без додаткового тексту

Мова: {target_language}
Оригінал: {original_cta}
Переклад:"""

        response = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=50,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
        translation = response.content[0].text.strip().strip('"').strip("'")
        return translation

    def _get_currency_symbol(self, currency_code: str) -> str:
        """Отримати символ валюти"""
        symbols = {
            "BRL": "R$", "INR": "₹", "PEN": "S/", "MXN": "$",
            "CLP": "$", "TRY": "₺", "PHP": "₱", "NGN": "₦",
            "THB": "฿", "IDR": "Rp", "USD": "$", "EUR": "€"
        }
        return symbols.get(currency_code, currency_code)

    def _create_localized_creative(self, image_path: str, analysis: CreativeAnalysis, 
                                 config: LocalizationConfig, output_dir: str) -> str:
        """Створити локалізований креатив"""
        # Відкрити оригінальне зображення
        image = Image.open(image_path)
        width, height = image.size
        
        # Створити копію для редагування
        localized_image = image.copy()
        draw = ImageDraw.Draw(localized_image)
        
        # Спробувати завантажити шрифт (fallback до базового)
        try:
            # Використати системний шрифт для unicode
            font_size = max(24, min(width, height) // 30)
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            font = ImageFont.load_default()
        
        # Визначити позицію для нового тексту
        text_position = self._calculate_text_position(analysis.cta_position, width, height)
        
        # Очистити стару область тексту (простий підхід - закрасити прямокутник)
        self._clear_text_area(draw, text_position, analysis.cta_text, font, width, height)
        
        # Додати новий CTA текст
        self._add_localized_text(draw, config.cta_translation, text_position, font)
        
        # Додати банк/валюту як watermark (опціонально)
        self._add_localization_info(draw, config, width, height)
        
        # Зберегти результат
        geo_code = config.geo["country_code"].lower()
        lang = config.geo["language"].split("-")[0]  # Взяти основну мову
        
        # Формат імені: {slot}_{geo}_{lang}_1.png
        slot_name = analysis.slot.lower().replace(" ", "_").replace("'", "")
        filename = f"{slot_name}_{geo_code}_{lang}_1.png"
        output_path = Path(output_dir) / filename
        
        localized_image.save(output_path, "PNG", quality=95)
        return str(output_path)

    def _calculate_text_position(self, cta_position: str, width: int, height: int) -> tuple:
        """Обчислити позицію тексту на основі cta_position"""
        # Парсинг позиції у форматі "vertical-horizontal"
        if "-" in cta_position:
            vertical, horizontal = cta_position.split("-")
        else:
            vertical, horizontal = "bottom", "center"
        
        # Вертикальна позиція
        if vertical == "top":
            y = height // 8
        elif vertical == "center":
            y = height // 2
        else:  # bottom
            y = height * 7 // 8
            
        # Горизонтальна позиція
        if horizontal == "left":
            x = width // 8
        elif horizontal == "right":
            x = width * 7 // 8
        else:  # center
            x = width // 2
            
        return (x, y)

    def _clear_text_area(self, draw: ImageDraw.Draw, position: tuple, old_text: str, 
                        font: ImageFont, width: int, height: int):
        """Очистити область старого тексту"""
        x, y = position
        
        # Оцінити розмір старого тексту
        try:
            text_bbox = draw.textbbox((0, 0), old_text, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]
        except:
            # Fallback для старих версій Pillow
            text_width = len(old_text) * 15
            text_height = 20
        
        # Додати відступи
        padding = 10
        
        # Обчислити прямокутник для очищення
        left = max(0, x - text_width // 2 - padding)
        top = max(0, y - text_height // 2 - padding)
        right = min(width, x + text_width // 2 + padding)
        bottom = min(height, y + text_height // 2 + padding)
        
        # Закрасити білим (простий підхід)
        draw.rectangle([left, top, right, bottom], fill="white", outline=None)

    def _add_localized_text(self, draw: ImageDraw.Draw, text: str, position: tuple, font: ImageFont):
        """Додати локалізований текст"""
        x, y = position
        
        # Додати текст з обводкою для кращої видимості
        # Спочатку чорна обводка
        for adj in range(-2, 3):
            for adj2 in range(-2, 3):
                if adj != 0 or adj2 != 0:
                    draw.text((x + adj, y + adj2), text, font=font, fill="black", anchor="mm")
        
        # Потім основний текст
        draw.text((x, y), text, font=font, fill="white", anchor="mm")

    def _add_localization_info(self, draw: ImageDraw.Draw, config: LocalizationConfig, 
                             width: int, height: int):
        """Додати інформацію про банк/валюту як watermark"""
        # Простий watermark у правому нижньому куті
        info_text = f"{config.currency_symbol} | {config.bank_name}"
        
        try:
            small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
        except:
            small_font = ImageFont.load_default()
        
        # Позиція watermark
        x = width - 20
        y = height - 20
        
        # Додати з напівпрозорістю (імітація)
        draw.text((x, y), info_text, font=small_font, fill="gray", anchor="rb")

    def localize_batch(self, input_dir: str, output_dir: str = "output/localized", 
                      target_geos: Optional[List[str]] = None) -> Dict[str, Dict[str, str]]:
        """Пакетна локалізація всіх креативів у директорії"""
        input_path = Path(input_dir)
        if not input_path.exists():
            raise FileNotFoundError(f"Input directory not found: {input_dir}")
        
        # Знайти всі зображення
        image_extensions = {".png", ".jpg", ".jpeg", ".webp"}
        images = [f for f in input_path.iterdir() 
                 if f.suffix.lower() in image_extensions]
        
        if not images:
            print(f"❌ Зображення не знайдено в {input_dir}")
            return {}
        
        print(f"📂 Знайдено {len(images)} креативів для локалізації")
        
        all_results = {}
        
        for image_path in images:
            print(f"\n" + "="*50)
            print(f"🎯 Обробляю: {image_path.name}")
            
            try:
                results = self.localize_creative(str(image_path), target_geos, output_dir)
                all_results[image_path.name] = results
                print(f"✅ Локалізовано для {len(results)} ГЕО")
                
            except Exception as e:
                print(f"❌ Помилка з {image_path.name}: {e}")
                all_results[image_path.name] = {}
        
        return all_results


def main():
    """CLI інтерфейс для локалізатора"""
    if len(sys.argv) < 2:
        print("Використання:")
        print("  python localizer.py <image_path> [geo1,geo2,...]")
        print("  python localizer.py --batch <input_dir> [geo1,geo2,...]")
        print("")
        print("Приклади:")
        print("  python localizer.py creative.png")
        print("  python localizer.py creative.png BR,IN,PE")
        print("  python localizer.py --batch input/ BR,IN")
        sys.exit(1)

    try:
        localizer = CreativeLocalizer()
        
        if sys.argv[1] == "--batch":
            # Пакетна обробка
            if len(sys.argv) < 3:
                print("❌ Вкажіть директорію для пакетної обробки")
                sys.exit(1)
                
            input_dir = sys.argv[2]
            target_geos = sys.argv[3].split(",") if len(sys.argv) > 3 else None
            
            results = localizer.localize_batch(input_dir, target_geos=target_geos)
            print(f"\n📊 Результат: {len(results)} креативів оброблено")
            
        else:
            # Одиночна обробка
            image_path = sys.argv[1]
            target_geos = sys.argv[2].split(",") if len(sys.argv) > 2 else None
            
            results = localizer.localize_creative(image_path, target_geos=target_geos)
            print(f"\n📊 Результат: {len(results)} локалізацій створено")
            
            for geo, path in results.items():
                print(f"  {geo}: {path}")
                
    except Exception as e:
        print(f"❌ Помилка: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()