# DEWCLAWBOT PROMPTER

Автоматичний генератор промптів для створення креативів на основі параметрів слотів, ГЕО та рівня агресії.

## 🎯 Основні можливості

- ✅ Генерація 5-10 різних промптів за один запит
- ✅ Адаптація під API Nano Banana Pro та Recraft
- ✅ Автоматична локалізація CTA текстів
- ✅ Різні стилі без повторень
- ✅ Підтримка форматів 1080x1080 та 9:16
- ✅ Інтеграція з референсами від СКАНЕРА

## 🚀 Швидкий старт

```typescript
import { prompter } from './src';

const result = await prompter.generatePrompts({
  slot: {
    id: '1',
    name: 'Casino Slots',
    category: 'casino',
    keywords: ['jackpot'],
    colors: ['#FFD700'],
    style_preferences: ['neon']
  },
  geo: {
    id: '2', 
    country: 'DE',
    language: 'de-DE',
    currency: 'EUR',
    cultural_elements: [],
    forbidden_elements: []
  },
  aggression_level: 'medium',
  format: '1080x1080',
  variations_count: 5,
  api_type: 'nano_banana_pro'
});
```

## 📋 Структура проекту

```
src/
├── types/           # TypeScript типи
├── prompter/        # Основна логіка та стилі
├── localization/    # CTA шаблони та локалізація
├── apis/           # Адаптери для різних API
├── utils/          # Допоміжні утиліти
└── index.ts        # Entry point
```

## 🎨 Доступні стилі

1. **neon_casino** - яскравий неоновий стиль з підсвіткою
2. **luxury_gold** - преміум стиль з золотими акцентами
3. **sport_energy** - динамічний спортивний стиль з ефектами руху
4. **digital_tech** - сучасний технічний стиль з цифровими елементами
5. **retro_classic** - вінтажний казино стиль з ретро елементами
6. **minimal_modern** - чистий мінімалістичний стиль

## 🌍 Підтримувані ГЕО (14)

- 🇳🇱 **NL** - Netherlands (nl-NL, EUR)
- 🇩🇪 **DE** - Germany (de-DE, EUR)
- 🇵🇱 **PL** - Poland (pl-PL, PLN)
- 🇬🇧 **UK** - United Kingdom (en-GB, GBP)
- 🇮🇹 **IT** - Italy (it-IT, EUR)
- 🇫🇷 **FR** - France (fr-FR, EUR)
- 🇪🇸 **ES** - Spain (es-ES, EUR)
- 🇵🇹 **PT** - Portugal (pt-PT, EUR)
- 🇨🇿 **CZ** - Czech Republic (cs-CZ, CZK)
- 🇭🇺 **HU** - Hungary (hu-HU, HUF)
- 🇸🇮 **SL** - Slovenia (sl-SI, EUR)
- 🇸🇰 **SK** - Slovakia (sk-SK, EUR)
- 🇦🇹 **AT** - Austria (de-AT, EUR)
- 🇧🇪 **BE** - Belgium (nl-BE, EUR)

## 🌐 Підтримувані мови

- 🇩🇪 Німецька (de)
- 🇳🇱 Нідерландська (nl)
- 🇵🇱 Польська (pl)
- 🇬🇧 Англійська (en)
- 🇮🇹 Італійська (it)
- 🇫🇷 Французька (fr)
- 🇪🇸 Іспанська (es)
- 🇵🇹 Португальська (pt)
- 🇨🇿 Чеська (cs)
- 🇭🇺 Угорська (hu)
- 🇸🇮 Словенська (sl)
- 🇸🇰 Словацька (sk)

## ⚡ Рівні агресії

### Easy (м'який)
- Делікатний підхід
-Soft CTAs: "Спробувати", "Почати Гру"
- Елегантна візуалізація

### Medium (середній)
- Більш переконливий підхід
- CTAs: "Виграй Великі Гроші!", "Отримати Бонус"
- Яскрава візуалізація

### Hard (агресивний)
- Ургентний підхід
- CTAs: "ДЖЕКПОТ ЧЕКАЄ!", "ОСТАННІЙ ШАНС!"
- Інтенсивна візуалізація

## 🔌 API Адаптери

### Nano Banana Pro
```typescript
{
  width: 1080,
  height: 1080,
  steps: 30,
  guidance_scale: 7.5,
  quality: 'high',
  style_preset: 'photographic'
}
```

### Recraft
```typescript
{
  width: 1080,
  height: 1920,
  style: 'realistic',
  substyle: 'advertising',
  controls: {
    structure: 0.7,
    style: 0.8,
    color: 0.6
  }
}
```

## 📊 Приклад результату

```typescript
{
  prompts: [
    {
      id: "prompt_1710853245123_abc123def",
      prompt_text: "Create a bright neon casino style in square format...",
      style: "neon_casino",
      composition: "Central focal point with radiating glow, Multiple light sources creating depth",
      colors: ["#FFD700", "#FF0080", "#00FFFF"],
      cta_text: "Виграй Великі Гроші!",
      api_specific_params: {
        width: 1080,
        height: 1080,
        steps: 30,
        guidance_scale: 7.5
      },
      metadata: {
        slot_id: "slot_001",
        geo_id: "geo_001", 
        aggression_level: "medium",
        format: "1080x1080",
        generated_at: "2024-03-19T13:54:05.123Z"
      }
    }
  ],
  total_generated: 5,
  generation_time_ms: 45
}
```

## 🛠️ Встановлення та запуск

```bash
# Встановлення залежностей
npm install

# Білд проекту
npm run build

# Запуск прикладу
npm run dev

# Запуск тестів
npm test
```

## 🔄 Batch генерація

```typescript
const batchResults = await prompter.batchGenerate([
  input1, input2, input3
]);
```

## 👁️ Preview режим

```typescript
const preview = prompter.previewPrompt(input, 'neon_casino');
```

## 📈 Моніторинг продуктивності

```typescript
import { PerformanceMonitor } from './src/utils/helpers';

const { result, duration } = PerformanceMonitor.measure('generation', () => {
  return prompter.generatePrompts(input);
});
```

## 🎯 Acceptance Criteria Status

- ✅ Генерує 5-10 різних промптів за раз
- ✅ Промпти адаптовані під конкретний API (Nano Banana vs Recraft)
- ✅ CTA текст автоматично локалізований на мову ГЕО  
- ✅ Різні стилі в межах одного запиту (не повторюється)

## 🤝 Інтеграція з СКАНЕРОМ

Система підтримує опціональний параметр `reference_description` від СКАНЕРА для кращої адаптації промптів під референс.

## 📞 Використання в проекті

```typescript
// Імпорт основних компонентів
import { 
  prompter,
  PromptGenerationInput,
  GeneratedPrompt 
} from './src/prompter';

// Генерація промптів
const generateCreatives = async (slotData, geoData) => {
  const input: PromptGenerationInput = {
    slot: slotData,
    geo: geoData, 
    aggression_level: 'medium',
    format: '1080x1080',
    variations_count: 7,
    api_type: 'nano_banana_pro'
  };

  return await prompter.generatePrompts(input);
};
```