#!/usr/bin/env node

import { Command } from 'commander';
import { prompter } from '../prompter';
import { imageGenerator, ImageGenerationConfig } from './image-generator';
import { 
  PromptGenerationInput, 
  ApiType, 
  Format, 
  AggressionLevel,
  Slot,
  Geo 
} from '../types';
import { promises as fs } from 'fs';
import { join } from 'path';

const program = new Command();

// Mock data for testing - в реальному проекті це буде з бази даних
const MOCK_SLOTS: Slot[] = [
  {
    id: 'casino_classic',
    name: 'Classic Casino',
    category: 'casino',
    keywords: ['casino', 'cards', 'chips', 'gambling'],
    colors: ['#FFD700', '#8B0000', '#000000'],
    style_preferences: ['luxury', 'classic', 'elegant']
  },
  {
    id: 'sports_betting',
    name: 'Sports Betting',
    category: 'sports',
    keywords: ['sports', 'betting', 'football', 'victory'],
    colors: ['#00FF00', '#0080FF', '#FFFFFF'],
    style_preferences: ['dynamic', 'energetic', 'modern']
  }
];

const MOCK_GEOS: Geo[] = [
  {
    id: 'ua',
    country: 'Ukraine',
    language: 'uk',
    currency: 'UAH',
    cultural_elements: ['trident', 'blue-yellow', 'traditional'],
    forbidden_elements: ['red-stars', 'hammer-sickle']
  },
  {
    id: 'de',
    country: 'Germany',
    language: 'de',
    currency: 'EUR',
    cultural_elements: ['efficiency', 'quality', 'precision'],
    forbidden_elements: ['certain-symbols', 'historical-references']
  }
];

interface BatchConfig {
  slots: string[];
  geos: string[];
  aggressionLevels: AggressionLevel[];
  formats: Format[];
  apiTypes: ApiType[];
  variationsPerCombination: number;
  outputDir: string;
  maxRetries: number;
  batchSize: number;
}

program
  .name('image-generator')
  .description('Генератор зображень для DeWClawBot')
  .version('1.0.0');

program
  .command('generate')
  .description('Генерувати зображення з промптів')
  .option('-s, --slot <slot>', 'ID слоту для генерації')
  .option('-g, --geo <geo>', 'ID геозони для генерації')
  .option('-a, --aggression <level>', 'Рівень агресії (easy|medium|hard)', 'medium')
  .option('-f, --format <format>', 'Формат зображення (1080x1080|9:16)', '1080x1080')
  .option('-t, --api-type <type>', 'Тип API (nano_banana_pro|recraft|gemini)', 'nano_banana_pro')
  .option('-c, --count <count>', 'Кількість варіацій', '5')
  .option('-o, --output <dir>', 'Директорія для збереження', 'output/pending_review')
  .option('--max-retries <retries>', 'Максимальна кількість повторних спроб', '3')
  .option('--batch-size <size>', 'Розмір batch для обробки', '5')
  .action(async (options) => {
    try {
      // Validate inputs
      const slot = MOCK_SLOTS.find(s => s.id === options.slot);
      const geo = MOCK_GEOS.find(g => g.id === options.geo);
      
      if (!slot) {
        console.error('❌ Невірний ID слоту. Доступні:', MOCK_SLOTS.map(s => s.id).join(', '));
        process.exit(1);
      }
      
      if (!geo) {
        console.error('❌ Невірний ID геозони. Доступні:', MOCK_GEOS.map(g => g.id).join(', '));
        process.exit(1);
      }

      console.log(`🎯 Генерація зображень для ${slot.name} (${geo.country})`);
      
      // Generate prompts
      const input: PromptGenerationInput = {
        slot,
        geo,
        aggression_level: options.aggression as AggressionLevel,
        format: options.format as Format,
        variations_count: parseInt(options.count),
        api_type: options.apiType as ApiType
      };

      console.log('📝 Генерація промптів...');
      const promptResult = await prompter.generatePrompts(input);
      console.log(`✅ Згенеровано ${promptResult.prompts.length} промптів за ${promptResult.generation_time_ms}ms`);

      // Configure image generator
      const config: Partial<ImageGenerationConfig> = {
        outputDir: options.output,
        maxRetries: parseInt(options.maxRetries),
        batchSize: parseInt(options.batchSize)
      };

      const { ImageGenerator } = await import('./image-generator');
      const generator = new ImageGenerator(config);
      
      // Check API keys
      const apiKeys = generator.validateApiKeys();
      const hasRequiredKey = apiKeys[options.apiType as ApiType];
      
      if (!hasRequiredKey) {
        console.error(`❌ API ключ для ${options.apiType} не знайдено. Перевірте environment variables:`);
        console.error('NANO_BANANA_API_KEY для nano_banana_pro');
        console.error('RECRAFT_API_KEY для recraft');
        console.error('GEMINI_API_KEY для gemini');
        process.exit(1);
      }

      console.log(`🎨 Генерація ${promptResult.prompts.length} зображень через ${options.apiType}...`);
      
      // Generate images
      const imageResult = await generator.generateImages(promptResult.prompts);
      
      // Report results
      console.log('\n📊 Результати генерації:');
      console.log(`✅ Успішно: ${imageResult.successful}`);
      console.log(`❌ Помилки: ${imageResult.failed}`);
      console.log(`⏱️  Загальний час: ${imageResult.total_time_ms}ms`);
      
      if (imageResult.failed > 0) {
        console.log('\n❌ Помилки:');
        imageResult.errors.forEach(error => {
          console.log(`  - ${error.prompt_id}: ${error.error}`);
        });
      }

      console.log(`\n💾 Зображення збережено в: ${options.output}`);
      console.log('🎯 Готово!');

    } catch (error) {
      console.error('❌ Помилка:', error.message);
      process.exit(1);
    }
  });

program
  .command('batch')
  .description('Batch генерація для множини комбінацій')
  .option('-c, --config <file>', 'Файл конфігурації JSON для batch генерації')
  .option('--dry-run', 'Показати план без виконання')
  .action(async (options) => {
    try {
      let config: BatchConfig;
      
      if (options.config) {
        const configText = await fs.readFile(options.config, 'utf-8');
        config = JSON.parse(configText);
      } else {
        // Default batch config
        config = {
          slots: ['casino_classic', 'sports_betting'],
          geos: ['ua', 'de'],
          aggressionLevels: ['medium', 'hard'],
          formats: ['1080x1080', '9:16'],
          apiTypes: ['gemini', 'nano_banana_pro'],
          variationsPerCombination: 3,
          outputDir: 'output/pending_review',
          maxRetries: 3,
          batchSize: 5
        };
      }

      // Generate all combinations
      const combinations: PromptGenerationInput[] = [];
      
      for (const slotId of config.slots) {
        for (const geoId of config.geos) {
          for (const aggression of config.aggressionLevels) {
            for (const format of config.formats) {
              for (const apiType of config.apiTypes) {
                const slot = MOCK_SLOTS.find(s => s.id === slotId);
                const geo = MOCK_GEOS.find(g => g.id === geoId);
                
                if (slot && geo) {
                  combinations.push({
                    slot,
                    geo,
                    aggression_level: aggression,
                    format: format as Format,
                    variations_count: config.variationsPerCombination,
                    api_type: apiType
                  });
                }
              }
            }
          }
        }
      }

      console.log(`📋 Знайдено ${combinations.length} комбінацій для генерації`);
      
      if (options.dryRun) {
        console.log('\n📝 План генерації (dry run):');
        combinations.forEach((combo, i) => {
          console.log(`  ${i + 1}. ${combo.slot.name} → ${combo.geo.country} (${combo.aggression_level}, ${combo.format}, ${combo.api_type}) = ${combo.variations_count} варіацій`);
        });
        const totalImages = combinations.reduce((sum, c) => sum + c.variations_count, 0);
        console.log(`\n🎯 Загалом буде згенеровано ~${totalImages} зображень`);
        return;
      }

      // Execute batch generation
      console.log('🚀 Початок batch генерації...');
      
      const allPrompts: any[] = [];
      
      // Generate all prompts first
      for (const [index, combo] of combinations.entries()) {
        console.log(`📝 Генерація промптів ${index + 1}/${combinations.length}: ${combo.slot.name} → ${combo.geo.country}`);
        const result = await prompter.generatePrompts(combo);
        allPrompts.push(...result.prompts);
      }

      console.log(`✅ Згенеровано ${allPrompts.length} промптів`);

      // Configure image generator
      const { ImageGenerator } = await import('./image-generator');
      const generator = new ImageGenerator({
        outputDir: config.outputDir,
        maxRetries: config.maxRetries,
        batchSize: config.batchSize
      });

      // Generate all images
      console.log('🎨 Генерація зображень...');
      const imageResult = await generator.generateImages(allPrompts);
      
      // Final report
      console.log('\n🎯 Batch генерація завершена!');
      console.log(`✅ Успішно: ${imageResult.successful}`);
      console.log(`❌ Помилки: ${imageResult.failed}`);
      console.log(`⏱️  Загальний час: ${(imageResult.total_time_ms / 1000 / 60).toFixed(1)} хвилин`);

    } catch (error) {
      console.error('❌ Помилка batch генерації:', error.message);
      process.exit(1);
    }
  });

program
  .command('list-slots')
  .description('Показати доступні слоти')
  .action(() => {
    console.log('📋 Доступні слоти:');
    MOCK_SLOTS.forEach(slot => {
      console.log(`  ${slot.id}: ${slot.name} (${slot.category})`);
    });
  });

program
  .command('list-geos')
  .description('Показати доступні геозони')
  .action(() => {
    console.log('🌍 Доступні геозони:');
    MOCK_GEOS.forEach(geo => {
      console.log(`  ${geo.id}: ${geo.country} (${geo.language})`);
    });
  });

program
  .command('check-api')
  .description('Перевірити доступність API ключів')
  .action(() => {
    console.log('🔑 Перевірка API ключів:');
    const hasNano = !!process.env.NANO_BANANA_API_KEY;
    const hasRecraft = !!process.env.RECRAFT_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;
    const geminiProxyUrl = process.env.GEMINI_PROXY_URL;
    const geminiProxyEnabled = process.env.GEMINI_PROXY_ENABLED !== 'false';
    
    console.log(`  Nano Banana Pro: ${hasNano ? '✅' : '❌'}`);
    console.log(`  Recraft: ${hasRecraft ? '✅' : '❌'}`);
    console.log(`  Gemini: ${hasGemini ? '✅' : '❌'}`);
    
    if (hasGemini) {
      console.log(`    Proxy enabled: ${geminiProxyEnabled ? '✅' : '❌'}`);
      console.log(`    Proxy URL: ${geminiProxyUrl ? '✅' : '❌'}`);
    }
    
    if (!hasNano && !hasRecraft && !hasGemini) {
      console.log('\n⚠️  Не знайдено жодного API ключа. Встановіть environment variables:');
      console.log('export NANO_BANANA_API_KEY="your-key"');
      console.log('export RECRAFT_API_KEY="your-key"');
      console.log('export GEMINI_API_KEY="your-key"');
    }
  });

// Parse command line
program.parse();