#!/usr/bin/env node

import { Command } from 'commander';
import { CreativeLocalizer, LocalizationInput } from './localizer';
import * as path from 'path';
import * as fs from 'fs/promises';

const program = new Command();

program
  .name('creative-localizer')
  .description('Localize gambling/casino creatives for multiple GEOs')
  .version('1.0.0');

program
  .command('localize')
  .description('Localize a creative for all 10 supported GEOs')
  .requiredOption('-i, --input <path>', 'Path to input creative image')
  .requiredOption('-s, --slot <name>', 'Slot identifier (for filename)')
  .requiredOption('-o, --output <dir>', 'Output directory for localized variants')
  .option('-c, --cta <text>', 'CTA text to localize')
  .option('-k, --api-key <key>', 'LLM API key for translation')
  .option('-p, --provider <provider>', 'LLM provider (anthropic|openai)', 'anthropic')
  .action(async (options) => {
    try {
      // Validate input file
      await fs.access(options.input);
      
      const localizer = new CreativeLocalizer(options.apiKey, options.provider);
      
      const input: LocalizationInput = {
        creativeImagePath: path.resolve(options.input),
        slot: options.slot,
        outputDir: path.resolve(options.output),
        ctaText: options.cta,
        llmApiKey: options.apiKey,
        llmProvider: options.provider
      };

      console.log('🎯 Starting localization process...');
      console.log(`📁 Source: ${input.creativeImagePath}`);
      console.log(`🌍 GEOs: All 10 supported regions`);
      console.log(`💾 Output: ${input.outputDir}`);
      
      const result = await localizer.localizeCreative(input);
      
      console.log('\n✅ Localization completed!');
      console.log(`📊 Generated: ${result.totalGenerated} variants`);
      console.log(`⏱️  Processing time: ${result.processingTimeMs}ms`);
      
      console.log('\n🌍 Generated variants:');
      result.variants.forEach(variant => {
        console.log(`  ${variant.geoCode}: ${variant.outputFilename}`);
        console.log(`    Language: ${variant.language}`);
        console.log(`    Currency: ${variant.currency}`);
        console.log(`    CTA: "${variant.localizedCtaText}"`);
        console.log(`    Bank: ${variant.suggestedBank}`);
        console.log(`    Payment: ${variant.suggestedPaymentMethod}`);
        console.log('');
      });
      
    } catch (error) {
      console.error('❌ Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('localize-specific')
  .description('Localize for specific GEOs only')
  .requiredOption('-i, --input <path>', 'Path to input creative image')
  .requiredOption('-s, --slot <name>', 'Slot identifier (for filename)')
  .requiredOption('-o, --output <dir>', 'Output directory for localized variants')
  .requiredOption('-g, --geos <geos>', 'Comma-separated list of GEO IDs (1-10)')
  .option('-c, --cta <text>', 'CTA text to localize')
  .option('-k, --api-key <key>', 'LLM API key for translation')
  .option('-p, --provider <provider>', 'LLM provider (anthropic|openai)', 'anthropic')
  .action(async (options) => {
    try {
      await fs.access(options.input);
      
      const geoIds = options.geos.split(',').map((id: string) => id.trim());
      
      if (geoIds.some((id: string) => isNaN(Number(id)) || Number(id) < 1 || Number(id) > 10)) {
        throw new Error('Invalid GEO IDs. Must be numbers between 1-10');
      }

      const localizer = new CreativeLocalizer(options.apiKey, options.provider);
      
      const input: LocalizationInput = {
        creativeImagePath: path.resolve(options.input),
        slot: options.slot,
        outputDir: path.resolve(options.output),
        ctaText: options.cta,
        llmApiKey: options.apiKey,
        llmProvider: options.provider
      };

      console.log('🎯 Starting targeted localization...');
      console.log(`📁 Source: ${input.creativeImagePath}`);
      console.log(`🌍 GEOs: ${geoIds.join(', ')}`);
      console.log(`💾 Output: ${input.outputDir}`);
      
      const result = await localizer.localizeForSpecificGeos(input, geoIds);
      
      console.log('\n✅ Targeted localization completed!');
      console.log(`📊 Generated: ${result.totalGenerated} variants`);
      console.log(`⏱️  Processing time: ${result.processingTimeMs}ms`);
      
    } catch (error) {
      console.error('❌ Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('list-geos')
  .description('List all available GEOs')
  .action(async () => {
    try {
      const localizer = new CreativeLocalizer();
      await localizer.initialize();
      
      const geos = localizer.getAvailableGeos();
      
      console.log('🌍 Available GEOs for localization:\n');
      
      geos.forEach((geo, index) => {
        console.log(`${geo.id}. ${geo.country}`);
        console.log(`   Language: ${geo.language}`);
        console.log(`   Currency: ${geo.currency}`);
        console.log(`   Cultural elements: ${geo.cultural_elements.join(', ') || 'None'}`);
        console.log('');
      });
      
      console.log(`Total: ${geos.length} GEOs supported`);
      
    } catch (error) {
      console.error('❌ Error:', (error as Error).message);
      process.exit(1);
    }
  });

// Help examples
program.addHelpText('after', `
Examples:
  $ creative-localizer localize -i "./creative.png" -s "slots_fire" -o "./output" -c "WIN BIG!"
  
  $ creative-localizer localize-specific -i "./creative.png" -s "poker_king" -o "./localized" -g "1,2,3" -c "PLAY NOW"
  
  $ creative-localizer list-geos
  
  $ creative-localizer localize -i "./bonus.png" -s "bonus_weekend" -o "./variants" -c "Claim Bonus" -k "sk-..." -p "openai"
`);

if (require.main === module) {
  program.parse();
}

export { program };