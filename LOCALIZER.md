# ЛОКАЛІЗАТОР — Creative Localizer

Автоматична адаптація креативів на 10 ГЕО з підтримкою переклад CTA через LLM, заміни банків та валют.

## Можливості

✅ **10 ГЕО одночасно**: Бразилія, Індія, Перу, Мексика, Чілі, Туреччина, Філіппіни, Нігерія, Таїланд, Індонезія  
✅ **LLM переклад**: Anthropic/OpenAI для якісного переклад CTA  
✅ **Локальні банки**: Автовибір популярних банків для кожного ГЕО  
✅ **Правильна валюта**: Автоматична заміна валют (BRL, INR, PEN, MXN, CLP, TRY, PHP, NGN, THB, IDR)  
✅ **Збереження якості**: Копіювання з метаданими, без втрат  
✅ **Batch processing**: Масова обробка креативів  

## Швидкий старт

```bash
# Встановлення залежностей
npm install

# Локалізація на всі 10 ГЕО
npm run localize -- -i "./creative.png" -s "slots_fire" -o "./output" -c "WIN BIG!"

# Локалізація на конкретні ГЕО
npm run localize:specific -- -i "./bonus.png" -s "bonus_weekend" -o "./localized" -g "1,2,3" -c "CLAIM BONUS"

# Список доступних ГЕО
npm run localize:geos
```

## Використання через код

```typescript
import { CreativeLocalizer } from './src/localization/localizer';

const localizer = new CreativeLocalizer('your-llm-api-key', 'anthropic');

const result = await localizer.localizeCreative({
  creativeImagePath: './source-creative.png',
  slot: 'poker_royal',
  outputDir: './localized-variants',
  ctaText: 'JOIN THE ROYAL GAME!',
  llmApiKey: 'sk-...',
  llmProvider: 'anthropic'
});

console.log(`Generated ${result.totalGenerated} variants in ${result.processingTimeMs}ms`);
```

## Підтримувані ГЕО

| ID | Країна | Мова | Валюта | Топ Банк | Топ Платіжка |
|----|---------|------|--------|----------|--------------|
| 1 | Brazil | pt-BR | BRL | Itaú Unibanco | PIX |
| 2 | India | hi-IN | INR | State Bank of India | UPI |
| 3 | Peru | es-PE | PEN | BCP | Yape |
| 4 | Mexico | es-MX | MXN | BBVA México | SPEI |
| 5 | Chile | es-CL | CLP | Banco de Chile | Khipu |
| 6 | Turkey | tr-TR | TRY | Ziraat Bankası | Papara |
| 7 | Philippines | en-PH | PHP | BDO | GCash |
| 8 | Nigeria | en-NG | NGN | First Bank | Flutterwave |
| 9 | Thailand | th-TH | THB | Siam Commercial Bank | PromptPay |
| 10 | Indonesia | id-ID | IDR | Bank Mandiri | OVO |

## Структура виходів

Кожен локалізований креатив зберігається як:

```
{slot}_{geo}_{lang}_{n}.png
{slot}_{geo}_{lang}_{n}.json  // метадані
```

**Приклад**: `slots_fire_brazil_pt_1234.png`

### Метадані (JSON)

```json
{
  "sourceImage": "/path/to/original.png",
  "localization": {
    "ctaText": "JOGUE AGORA",
    "currency": "BRL",
    "bank": "Itaú Unibanco",
    "paymentMethod": "PIX",
    "language": "pt-BR"
  },
  "generatedAt": "2024-03-19T15:30:00.000Z",
  "version": "1.0"
}
```

## CLI команди

### Повна локалізація (всі 10 ГЕО)

```bash
npm run localize -- [опції]

Опції:
  -i, --input <path>      Шлях до вхідного креативу
  -s, --slot <name>       Ідентифікатор слоту (для файлів)
  -o, --output <dir>      Папка для збереження варіантів
  -c, --cta <text>        CTA текст для локалізації
  -k, --api-key <key>     API ключ для LLM перекладу
  -p, --provider <type>   LLM провайдер (anthropic|openai)
```

### Вибіркова локалізація

```bash
npm run localize:specific -- [опції] -g "1,2,3"

Додаткова опція:
  -g, --geos <ids>        Список ID ГЕО через кому (1-10)
```

### Список ГЕО

```bash
npm run localize:geos
```

## Приклади

### Базовий приклад

```bash
# Локалізувати слот креатив на всі ГЕО
npm run localize -- \
  -i "./assets/fire_slots.png" \
  -s "fire_slots_promo" \
  -o "./output/localized" \
  -c "🔥 JACKPOT AWAITS!"
```

### З LLM перекладом

```bash
# Використати Anthropic для якісного перекладу
npm run localize -- \
  -i "./creatives/bonus_weekend.png" \
  -s "weekend_special" \
  -o "./variants" \
  -c "CLAIM YOUR WEEKEND BONUS!" \
  -k "sk-ant-api03-..." \
  -p "anthropic"
```

### Тільки латинська Америка

```bash
# Бразилія, Перу, Мексика, Чілі
npm run localize:specific -- \
  -i "./poker_royal.png" \
  -s "poker_vip" \
  -o "./latam" \
  -g "1,3,4,5" \
  -c "ROYAL POKER TOURNAMENT"
```

### Азійські ринки

```bash
# Індія, Філіппіни, Таїланд, Індонезія
npm run localize:specific -- \
  -i "./casino_live.png" \
  -s "live_casino" \
  -o "./asia" \
  -g "2,7,9,10" \
  -c "LIVE CASINO ACTION"
```

## LLM Конфігурація

### Anthropic

```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
npm run localize -- -i "./creative.png" -s "test" -o "./output" -c "WIN NOW" -k "$ANTHROPIC_API_KEY" -p "anthropic"
```

### OpenAI

```bash
export OPENAI_API_KEY="sk-..."
npm run localize -- -i "./creative.png" -s "test" -o "./output" -c "WIN NOW" -k "$OPENAI_API_KEY" -p "openai"
```

## Тестування

```bash
# Запустити всі тести
npm test

# Тести локалізатора
npm test -- --testPathPattern=localizer

# Приклад використання
npm run example:localizer
```

## Технічні деталі

### Архітектура

- **`CreativeLocalizer`**: Основний клас для локалізації
- **`LocalizationInput`**: Параметри вводу
- **`LocalizedVariant`**: Результат для одного ГЕО
- **CLI**: Командний інтерфейс через Commander.js

### Алгоритм

1. **Ініціалізація**: Завантаження конфігу ГЕО
2. **Обробка**: Для кожного ГЕО:
   - Переклад CTA (LLM або дефолт)
   - Вибір банку/платіжки
   - Генерація імені файлу
   - Копіювання + метадані
3. **Результат**: Масив варіантів з метриками

### Обробка помилок

- Продовження при помилці одного ГЕО
- Fallback на дефолтні CTA при провалі LLM
- Валідація вхідних параметрів
- Детальні логи помилок

### Розширення

- Додавання нових ГЕО: оновити `config/geos.json`
- Нові LLM провайдери: розширити методи перекладу
- Кастомні CTA шаблони: додати в `cta-templates.ts`

## Ліцензія

MIT