# CREATIVE LOCALIZER

Автоматична система адаптації gambling креативів на різні ГЕО. Перекладає CTA тексти, адаптує банки та валюти, зберігає якість.

## 🎯 Основні можливості

- **10 ГЕО одночасно**: Brazil, India, Peru, Mexico, Chile, Turkey, Philippines, Nigeria, Thailand, Indonesia
- **Розумний переклад**: через Claude (не Google Translate) з урахуванням gambling контексту 
- **Локальна адаптація**: банки, платіжні системи, валютні символи
- **Збереження якості**: обробка зображень через Pillow
- **Пакетна обробка**: локалізація цілих папок креативів

## 🚀 Швидкий старт

### Встановлення
```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY="your-api-key"
```

### Базове використання
```bash
# Локалізувати один креатив для всіх ГЕО
python localizer.py creative.png

# Локалізувати для конкретних ГЕО
python localizer.py creative.png BR,IN,MX

# Пакетна обробка папки
python localizer.py --batch input_folder/ BR,IN,PE,MX,CL
```

### Програмне використання
```python
from localizer import CreativeLocalizer

localizer = CreativeLocalizer()

# Локалізувати один креатив
results = localizer.localize_creative("creative.png", target_geos=["BR", "IN"])

# Пакетна обробка
batch_results = localizer.localize_batch("input/", target_geos=["BR", "IN", "MX"])
```

## 📊 Підтримувані ГЕО

| Код | Країна | Мова | Валюта | Топ банк | Топ платіжка |
|-----|--------|------|--------|----------|-------------|
| BR | Brazil | pt-BR | BRL (R$) | Itaú Unibanco | PIX |
| IN | India | hi-IN | INR (₹) | State Bank of India | UPI |
| PE | Peru | es-PE | PEN (S/) | BCP | Yape |
| MX | Mexico | es-MX | MXN ($) | BBVA México | SPEI |
| CL | Chile | es-CL | CLP ($) | Banco de Chile | Khipu |
| TR | Turkey | tr-TR | TRY (₺) | Ziraat Bankası | Havale/EFT |
| PH | Philippines | en-PH | PHP (₱) | BDO | GCash |
| NG | Nigeria | en-NG | NGN (₦) | First Bank | Bank Transfer |
| TH | Thailand | th-TH | THB (฿) | Siam Commercial Bank | PromptPay |
| ID | Indonesia | id-ID | IDR (Rp) | Bank Mandiri | OVO |

## 🔄 Алгоритм роботи

1. **Аналіз оригіналу**: CreativeScanner витягує метадані (CTA текст, позиція, стиль)
2. **Переклад CTA**: Claude перекладає з урахуванням рівня агресії та gambling термінології  
3. **Локальна адаптація**: вибір банку та платіжки з конфігу ГЕО
4. **Обробка зображення**: заміна тексту з збереженням стилю
5. **Збереження**: формат `{slot}_{geo}_{lang}_{n}.png`

## 📁 Структура виводу

```
output/localized/
├── sweet_bonanza_br_pt_1.png    # Бразилія
├── sweet_bonanza_in_hi_1.png    # Індія  
├── sweet_bonanza_mx_es_1.png    # Мексика
└── ...
```

## ⚙️ Конфігурація

Дані ГЕО зберігаються в `config/geos.json`:
```json
{
  "geos": [
    {
      "country_code": "BR",
      "name": "Brazil", 
      "language": "pt-BR",
      "currency": "BRL",
      "top_banks": ["Itaú Unibanco", "..."],
      "payment_methods": ["PIX", "..."]
    }
  ]
}
```

## 🧪 Тестування

```bash
# Запустити тести з демонстрацією
python test_localizer.py

# Створити тестовий креатив та локалізувати для BR, IN, MX
```

## 📝 Приклади результатів

**Оригінал**: "WIN BIG NOW"
- 🇧🇷 Brazil: "GANHE MUITO AGORA" 
- 🇮🇳 India: "अभी बड़ी जीत पाएं"
- 🇲🇽 Mexico: "GANA EN GRANDE AHORA"
- 🇹🇷 Turkey: "ŞİMDİ BÜYÜK KAZAN"

## 🔧 API Reference

### CreativeLocalizer

#### `__init__(api_key: Optional[str] = None)`
Ініціалізація з Anthropic API ключем

#### `localize_creative(image_path, target_geos=None, output_dir="output/localized")`
Локалізує один креатив
- **image_path**: Шлях до зображення
- **target_geos**: Список кодів ГЕО або None для всіх
- **output_dir**: Папка для збереження
- **Returns**: `{geo_code: output_path}`

#### `localize_batch(input_dir, output_dir="output/localized", target_geos=None)`
Пакетна локалізація папки
- **input_dir**: Папка з креативами
- **target_geos**: Список кодів ГЕО
- **Returns**: `{filename: {geo_code: output_path}}`

## 🎯 Acceptance Criteria ✅

- [x] **Підтримка 10 ГЕО одночасно** - Brazil, India, Peru, Mexico, Chile, Turkey, Philippines, Nigeria, Thailand, Indonesia
- [x] **Автоматичний переклад CTA через LLM** - Claude з gambling контекстом, не Google Translate  
- [x] **Правильна валюта для кожного ГЕО** - символи валют з `geos.json`
- [x] **Збереження якості при локалізації** - Pillow для обробки зображень

## 🚨 Обмеження

- Підтримка PNG, JPG, WEBP форматів
- Потребує ANTHROPIC_API_KEY
- Прості алгоритми заміни тексту (для складної графіки може потребувати доопрацювання)
- Розмір шрифту залежить від розміру зображення

## 🔮 Розширення

- Додавання нових ГЕО через `geos.json`
- Інтеграція з різними LLM провайдерами
- Більш складні алгоритми заміни тексту
- Підтримка відео креативів