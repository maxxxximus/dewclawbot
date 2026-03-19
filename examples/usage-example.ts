import { prompter, PromptGenerationInput } from '../src';

// Example slot data (would come from database)
const exampleSlots = [
  {
    id: 'slot_001',
    name: 'Lucky Casino Slots',
    category: 'casino',
    keywords: ['jackpot', 'lucky', 'win', 'casino'],
    colors: ['#FFD700', '#FF0080', '#00FFFF'],
    style_preferences: ['neon_casino', 'luxury_gold']
  },
  {
    id: 'slot_002', 
    name: 'Sports Betting Pro',
    category: 'sports',
    keywords: ['football', 'bet', 'win', 'champion'],
    colors: ['#FF6B35', '#004E98', '#00A8CC'],
    style_preferences: ['sport_energy', 'minimal_modern']
  }
];

// Example geo data (would come from database)
const exampleGeos = [
  {
    id: 'geo_001',
    country: 'UA',
    language: 'uk',
    currency: 'UAH',
    cultural_elements: ['Ukrainian flags', 'traditional colors'],
    forbidden_elements: ['Russian symbols']
  },
  {
    id: 'geo_002',
    country: 'DE',
    language: 'de', 
    currency: 'EUR',
    cultural_elements: ['German efficiency', 'premium quality'],
    forbidden_elements: ['illegal gambling symbols']
  }
];

// Example usage function
export async function demonstratePromptGeneration() {
  console.log('🎯 DEWCLAWBOT PROMPTER - Demonstration\n');

  // Example 1: Generate prompts for Ukrainian casino audience
  const input1: PromptGenerationInput = {
    slot: exampleSlots[0],
    geo: exampleGeos[0],
    aggression_level: 'medium',
    format: '1080x1080',
    variations_count: 3,
    api_type: 'nano_banana_pro'
  };

  console.log('📱 Generating prompts for Ukrainian casino audience...');
  const result1 = await prompter.generatePrompts(input1);
  console.log(`Generated ${result1.total_generated} prompts in ${result1.generation_time_ms}ms`);
  
  result1.prompts.forEach((prompt, index) => {
    console.log(`\n--- Prompt ${index + 1} ---`);
    console.log(`Style: ${prompt.style}`);
    console.log(`CTA: ${prompt.cta_text}`);
    console.log(`Colors: ${prompt.colors.join(', ')}`);
    console.log(`Prompt: ${prompt.prompt_text.substring(0, 100)}...`);
  });

  // Example 2: Generate vertical format for German sports betting
  const input2: PromptGenerationInput = {
    slot: exampleSlots[1],
    geo: exampleGeos[1], 
    aggression_level: 'hard',
    format: '9:16',
    variations_count: 2,
    api_type: 'recraft',
    reference_description: 'Modern sports betting app interface with live scores'
  };

  console.log('\n\n📱 Generating vertical prompts for German sports betting...');
  const result2 = await prompter.generatePrompts(input2);
  console.log(`Generated ${result2.total_generated} prompts in ${result2.generation_time_ms}ms`);

  result2.prompts.forEach((prompt, index) => {
    console.log(`\n--- Vertical Prompt ${index + 1} ---`);
    console.log(`Style: ${prompt.style}`);
    console.log(`CTA: ${prompt.cta_text}`);
    console.log(`Format: ${prompt.metadata.format}`);
    console.log(`API Params:`, JSON.stringify(prompt.api_specific_params, null, 2));
  });

  // Example 3: Preview mode
  console.log('\n\n👁️  Preview mode (no full generation)...');
  const preview = prompter.previewPrompt(input1, 'neon_casino');
  console.log(`Preview prompt: ${preview}`);

  // Example 4: Batch generation
  console.log('\n\n🔄 Batch generation example...');
  const batchInputs = [input1, input2];
  const batchResults = await prompter.batchGenerate(batchInputs);
  console.log(`Batch generated total: ${batchResults.reduce((sum, r) => sum + r.total_generated, 0)} prompts`);

  // Example 5: Available styles
  console.log('\n\n🎨 Available styles:');
  const availableStyles = prompter.getAvailableStyles();
  availableStyles.forEach(style => {
    console.log(`- ${style.name}: ${style.description}`);
  });

  console.log('\n✅ Demonstration complete!');
}

// Run if executed directly
if (require.main === module) {
  demonstratePromptGeneration()
    .catch(console.error);
}