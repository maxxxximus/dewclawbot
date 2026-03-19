# Image Generator

Batch генератор зображень для DeWClawBot на основі промптів від ПРОМПТЕРА.

## Можливості

- ✅ Batch генерація 5-10 зображень за раз
- ✅ Підтримка двох API: Nano Banana Pro та Recraft
- ✅ Автоматичне іменування файлів: `{slot}_{geo}_{style}_{n}.png`
- ✅ Retry логіка при помилках API (до 3 спроб з exponential backoff)
- ✅ Збереження metadata (який промпт → яке зображення)
- ✅ CLI інтерфейс для зручного використання

## Встановлення та налаштування

### 1. API ключі

Створіть файл `.env` у корені проекту або встановіть environment variables:

```bash
export NANO_BANANA_API_KEY="your-nano-banana-api-key"
export RECRAFT_API_KEY="your-recraft-api-key"
```

### 2. Збірка проекту

```bash
npm install
npm run build
```

## Використання

### CLI команди

#### Перевірка API ключів

```bash
npx ts-node src/generator/cli.ts check-api
```

#### Список доступних слотів та гео

```bash
npx ts-node src/generator/cli.ts list-slots
npx ts-node src/generator/cli.ts list-geos
```

#### Генерація одного набору зображень

```bash
npx ts-node src/generator/cli.ts generate \
  --slot casino_classic \
  --geo ua \
  --aggression hard \
  --format 1080x1080 \
  --api-type nano_banana_pro \
  --count 5
```

Параметри:
- `--slot` - ID слоту (casino_classic, sports_betting)
- `--geo` - ID геозони (ua, de)
- `--aggression` - Рівень агресії (easy, medium, hard)
- `--format` - Формат (1080x1080, 9:16)
- `--api-type` - API (nano_banana_pro, recraft)
- `--count` - Кількість варіацій (1-10)
- `--output` - Директорія збереження (за замовчуванням: output/pending_review)

#### Batch генерація

```bash
# Використання конфігурації за замовчуванням
npx ts-node src/generator/cli.ts batch

# Попередній перегляд без виконання
npx ts-node src/generator/cli.ts batch --dry-run

# З власною конфігурацією
npx ts-node src/generator/cli.ts batch --config my-batch-config.json
```

Приклад `batch-config.json`:

```json
{
  "slots": ["casino_classic", "sports_betting"],
  "geos": ["ua", "de"],
  "aggressionLevels": ["medium", "hard"],
  "formats": ["1080x1080", "9:16"],
  "apiTypes": ["nano_banana_pro"],
  "variationsPerCombination": 3,
  "outputDir": "output/pending_review",
  "maxRetries": 3,
  "batchSize": 5
}
```

### Програмне використання

```typescript
import { prompter } from '../prompter';
import { ImageGenerator } from '../generator';

// Генерація промптів
const promptInput = {
  slot: mySlot,
  geo: myGeo,
  aggression_level: 'hard',
  format: '1080x1080',
  variations_count: 5,
  api_type: 'nano_banana_pro'
};

const promptResult = await prompter.generatePrompts(promptInput);

// Генерація зображень
const generator = new ImageGenerator({
  outputDir: 'output/pending_review',
  maxRetries: 3,
  batchSize: 5,
  timeout: 30000
});

const imageResult = await generator.generateImages(promptResult.prompts);

console.log(`Успішно згенеровано: ${imageResult.successful} зображень`);
```

## Структура вихідних файлів

### Зображення

Зберігаються в `output/pending_review/` з іменами:
```
{slot_id}_{geo_id}_{style}_{index}.png
```

Приклад:
```
casino_classic_ua_luxury_1.png
casino_classic_ua_neon_2.png
sports_betting_de_dynamic_1.png
```

### Metadata

Для кожної сесії генерації створюється JSON файл з метаданими:

```json
{
  "generation_session": "gen_xyz123",
  "timestamp": "2024-03-19T15:00:00.000Z",
  "total_images": 10,
  "total_errors": 1,
  "images": [
    {
      "filename": "casino_classic_ua_luxury_1.png",
      "prompt_id": "prompt_abc123",
      "style": "luxury",
      "slot_id": "casino_classic",
      "geo_id": "ua",
      "generation_time_ms": 2340,
      "api_type": "nano_banana_pro"
    }
  ],
  "errors": [
    {
      "prompt_id": "prompt_def456",
      "error": "API timeout",
      "retry_count": 3
    }
  ]
}
```

## API клієнти

### Nano Banana Pro

- Endpoint: `https://api.nano-banana.pro/v1/generate`
- Формат відповіді: URL зображення для завантаження
- Підтримувані параметри: dimensions, steps, guidance_scale, quality

### Recraft

- Endpoint: `https://api.recraft.ai/v1/images/generations`
- Формат відповіді: Base64 encoded зображення
- Підтримувані параметри: dimensions, style, controls, iterations

## Обробка помилок

- **Retry логіка**: До 3 спроб з exponential backoff (2s, 4s, 8s)
- **Timeout**: 30 секунд на API виклик
- **Rate limiting**: Пауза 1 секунда між batches
- **Збереження помилок**: Всі помилки логуються в metadata файл

## Масштабування

Для великих batch операцій:

1. Зменшіть `batchSize` до 3-5 для уникнення rate limiting
2. Збільшіть `timeout` для повільних API
3. Моніторьте використання API квот
4. Використовуйте `--dry-run` для планування

## Моніторинг

Генератор виводить в консоль:
- Прогрес batch обробки
- Статистику успіхів/помилок
- Час виконання для кожного batch
- Фінальний звіт з метриками

Приклад виходу:
```
🎯 Генерація зображень для Classic Casino (Ukraine)
📝 Генерація промптів...
✅ Згенеровано 5 промптів за 234ms
🎨 Генерація 5 зображень через nano_banana_pro...
Processing batch 1/1
📊 Результати генерації:
✅ Успішно: 4
❌ Помилки: 1
⏱️  Загальний час: 12340ms
💾 Зображення збережено в: output/pending_review
🎯 Готово!
```