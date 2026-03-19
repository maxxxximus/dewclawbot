#!/usr/bin/env node

/**
 * Example usage of the Creative Localizer
 * 
 * This example demonstrates how to:
 * 1. Initialize the localizer
 * 2. Localize a creative for all 10 GEOs
 * 3. Localize for specific GEOs only
 * 4. Handle results and errors
 */

import { CreativeLocalizer, LocalizationInput } from '../src/localization/localizer';
import * as path from 'path';

async function basicExample() {
  console.log('🎯 Basic Localization Example');
  console.log('================================\n');

  const localizer = new CreativeLocalizer();

  try {
    // Example input
    const input: LocalizationInput = {
      creativeImagePath: path.join(__dirname, '../examples/sample-creative.png'),
      slot: 'slots_fire_bonus',
      outputDir: path.join(__dirname, '../output/localized'),
      ctaText: 'WIN JACKPOT!',
      // Note: Add your LLM API key for better translations
      // llmApiKey: 'your-api-key-here',
      // llmProvider: 'anthropic'
    };

    console.log('Input parameters:');
    console.log(`📁 Creative: ${input.creativeImagePath}`);
    console.log(`🎰 Slot: ${input.slot}`);
    console.log(`💾 Output: ${input.outputDir}`);
    console.log(`📢 CTA: "${input.ctaText}"`);
    console.log('');

    // Perform localization
    console.log('Starting localization...');
    const result = await localizer.localizeCreative(input);

    // Display results
    console.log('✅ Localization completed!');
    console.log(`📊 Generated: ${result.totalGenerated} variants`);
    console.log(`⏱️  Processing time: ${result.processingTimeMs}ms\n`);

    console.log('🌍 Generated variants:');
    result.variants.forEach((variant, index) => {
      console.log(`${index + 1}. ${variant.geoCode} - ${variant.language}`);
      console.log(`   File: ${variant.outputFilename}`);
      console.log(`   CTA: "${variant.localizedCtaText}"`);
      console.log(`   Bank: ${variant.suggestedBank}`);
      console.log(`   Payment: ${variant.suggestedPaymentMethod}`);
      console.log(`   Currency: ${variant.currency}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error in basic example:', error);
  }
}

async function specificGeosExample() {
  console.log('\n🎯 Specific GEOs Example');
  console.log('==========================\n');

  const localizer = new CreativeLocalizer();

  try {
    const input: LocalizationInput = {
      creativeImagePath: path.join(__dirname, '../examples/sample-creative.png'),
      slot: 'poker_premium',
      outputDir: path.join(__dirname, '../output/specific-geos'),
      ctaText: 'PLAY PREMIUM POKER',
    };

    // Localize only for Brazil, India, and Turkey
    const targetGeoIds = ['1', '2', '6']; // BR, IN, TR

    console.log(`Localizing for specific GEOs: ${targetGeoIds.join(', ')}`);
    
    const result = await localizer.localizeForSpecificGeos(input, targetGeoIds);

    console.log('✅ Targeted localization completed!');
    console.log(`📊 Generated: ${result.totalGenerated} variants`);

    result.variants.forEach(variant => {
      console.log(`${variant.geoCode}: ${variant.localizedCtaText} (${variant.currency})`);
    });

  } catch (error) {
    console.error('❌ Error in specific GEOs example:', error);
  }
}

async function listGeosExample() {
  console.log('\n🌍 Available GEOs');
  console.log('==================\n');

  const localizer = new CreativeLocalizer();

  try {
    await localizer.initialize();
    const geos = localizer.getAvailableGeos();

    console.log('Supported GEOs for localization:\n');
    
    geos.forEach((geo, index) => {
      console.log(`${geo.id}. ${geo.country} (${geo.language})`);
      console.log(`   Currency: ${geo.currency}`);
      console.log(`   Preferences: ${geo.cultural_elements.join(', ') || 'None'}`);
      console.log('');
    });

    console.log(`Total: ${geos.length} GEOs supported`);

  } catch (error) {
    console.error('❌ Error listing GEOs:', error);
  }
}

async function withLLMExample() {
  console.log('\n🤖 LLM Translation Example');
  console.log('============================\n');

  // This example requires an API key
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️  No LLM API key found in environment variables.');
    console.log('   Set ANTHROPIC_API_KEY or OPENAI_API_KEY to test LLM translation.');
    console.log('   For now, using default translations.\n');
  }

  const localizer = new CreativeLocalizer(apiKey, 'anthropic');

  try {
    const input: LocalizationInput = {
      creativeImagePath: path.join(__dirname, '../examples/sample-creative.png'),
      slot: 'casino_royal',
      outputDir: path.join(__dirname, '../output/llm-localized'),
      ctaText: 'Join the Royal Casino!',
      llmApiKey: apiKey,
      llmProvider: 'anthropic'
    };

    console.log('Using LLM for advanced CTA translation...');
    
    // Localize just for Latin American markets
    const result = await localizer.localizeForSpecificGeos(input, ['3', '4', '5']); // PE, MX, CL

    console.log('✅ LLM localization completed!');
    
    result.variants.forEach(variant => {
      console.log(`${variant.geoCode}: "${variant.localizedCtaText}"`);
    });

  } catch (error) {
    console.error('❌ Error in LLM example:', error);
  }
}

async function errorHandlingExample() {
  console.log('\n⚠️  Error Handling Example');
  console.log('===========================\n');

  const localizer = new CreativeLocalizer();

  try {
    // Try to localize with invalid input
    const badInput: LocalizationInput = {
      creativeImagePath: '/nonexistent/file.png',
      slot: 'test_error',
      outputDir: '/tmp/test-output',
      ctaText: 'This will fail!'
    };

    console.log('Testing error handling with invalid file path...');
    
    await localizer.localizeCreative(badInput);

  } catch (error) {
    console.log('✅ Error properly caught and handled:');
    console.log(`   ${(error as Error).message}`);
  }

  try {
    // Test invalid GEO IDs
    const input: LocalizationInput = {
      creativeImagePath: path.join(__dirname, '../examples/sample-creative.png'),
      slot: 'test_invalid_geo',
      outputDir: '/tmp/test-output'
    };

    console.log('\nTesting invalid GEO ID handling...');
    
    await localizer.localizeForSpecificGeos(input, ['99', '100']);

  } catch (error) {
    console.log('✅ Invalid GEO error properly caught:');
    console.log(`   ${(error as Error).message}`);
  }
}

// Run all examples
async function runExamples() {
  console.log('🎨 Creative Localizer Examples');
  console.log('===============================\n');
  
  console.log('Note: These examples assume you have a sample creative file.');
  console.log('Create a PNG file at examples/sample-creative.png to test properly.\n');

  await basicExample();
  await specificGeosExample();
  await listGeosExample();
  await withLLMExample();
  await errorHandlingExample();

  console.log('\n🎉 All examples completed!');
  console.log('\nNext steps:');
  console.log('1. Create a real creative image file');
  console.log('2. Set up LLM API keys for better translations');
  console.log('3. Use the CLI: npm run localize -- --help');
}

// Run if called directly
if (require.main === module) {
  runExamples().catch(console.error);
}

export { runExamples };