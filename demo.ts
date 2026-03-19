#!/usr/bin/env ts-node

/**
 * DEWCLAWBOT PROMPTER - Quick Demo
 * Run: npx ts-node demo.ts
 */

import { prompter, PromptGenerationInput } from './src';

async function runDemo() {
  console.log('🚀 DEWCLAWBOT PROMPTER - Quick Demo\n');

  // Test data
  const slot = {
    id: 'demo_slot_001',
    name: 'Mega Casino Jackpot',
    category: 'casino',
    keywords: ['jackpot', 'mega', 'win', 'casino', 'lucky'],
    colors: ['#FFD700', '#FF0080', '#00FFFF'],
    style_preferences: ['neon_casino', 'luxury_gold']
  };

  const geo = {
    id: 'geo_pl',
    country: 'PL',
    language: 'pl',
    currency: 'PLN',
    cultural_elements: ['Polish traditions', 'red and white colors', 'Catholic culture'],
    forbidden_elements: ['political content', 'religious mockery']
  };

  // Test different scenarios
  const scenarios = [
    {
      name: '🎰 Polish Casino - Medium Aggression - Square Format',
      input: {
        slot,
        geo,
        aggression_level: 'medium' as const,
        format: '1080x1080' as const,
        variations_count: 3,
        api_type: 'nano_banana_pro' as const
      }
    },
    {
      name: '📱 German Sports - High Aggression - Vertical Format',
      input: {
        slot: { ...slot, name: 'Sports Betting Pro', category: 'sports' },
        geo: { 
          id: 'geo_de',
          country: 'DE', 
          language: 'de', 
          currency: 'EUR',
          cultural_elements: ['German precision', 'beer culture', 'Oktoberfest', 'football'],
          forbidden_elements: ['political content', 'historical sensitive imagery']
        },
        aggression_level: 'hard' as const,
        format: '9:16' as const,
        variations_count: 2,
        api_type: 'recraft' as const,
        reference_description: 'Modern sports app with live match data'
      }
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n${scenario.name}`);
    console.log('='.repeat(60));

    try {
      const result = await prompter.generatePrompts(scenario.input);
      
      console.log(`✅ Generated ${result.total_generated} prompts in ${result.generation_time_ms}ms\n`);
      
      result.prompts.forEach((prompt, index) => {
        console.log(`--- Prompt ${index + 1} ---`);
        console.log(`Style: ${prompt.style}`);
        console.log(`CTA: "${prompt.cta_text}"`);
        console.log(`Colors: ${prompt.colors.join(', ')}`);
        console.log(`Format: ${prompt.metadata.format}`);
        console.log(`Composition: ${prompt.composition}`);
        console.log(`\nPrompt Text:`);
        console.log(`"${prompt.prompt_text}"`);
        console.log('\nAPI Parameters:');
        console.log(JSON.stringify(prompt.api_specific_params, null, 2));
        console.log('\n');
      });

    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }

  // Test preview mode
  console.log('\n👁️  Preview Mode Test');
  console.log('='.repeat(30));
  const preview = prompter.previewPrompt(scenarios[0].input, 'luxury_gold');
  console.log(`Preview: "${preview}"\n`);

  // Show available styles
  console.log('\n🎨 Available Styles');
  console.log('='.repeat(20));
  const styles = prompter.getAvailableStyles();
  styles.forEach(style => {
    console.log(`• ${style.name}: ${style.description}`);
    console.log(`  Colors: ${style.colors.join(', ')}`);
    console.log(`  Elements: ${style.visual_elements.slice(0, 3).join(', ')}\n`);
  });

  console.log('✨ Demo complete! PROMPTER is ready for production.\n');
}

// Run demo
runDemo().catch(error => {
  console.error('Demo failed:', error);
  process.exit(1);
});