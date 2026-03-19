/**
 * DEWCLAWBOT PROMPTER - Main Entry Point
 * 
 * Generates creative prompts for image generation based on slots, geo, and aggression level.
 * Supports Nano Banana Pro and Recraft APIs with localized CTAs.
 */

export { Prompter, prompter } from './prompter';
export { StyleSelector, STYLE_TEMPLATES } from './prompter/style-templates';
export { CTALocalizer, CTA_TEMPLATES } from './localization/cta-templates';
export { ApiAdapterFactory } from './apis/adapters';

// Export types
export {
  Slot,
  Geo,
  AggressionLevel,
  Format,
  ApiType,
  PromptGenerationInput,
  PromptGenerationResult,
  GeneratedPrompt,
  StyleTemplate,
  CTATemplate
} from './types';

// Export utilities
export {
  generateId,
  validateGeo,
  validateSlot,
  getSupportedLanguages,
  PerformanceMonitor,
  Logger
} from './utils/helpers';

/**
 * Quick usage example:
 * 
 * ```typescript
 * import { prompter } from './src';
 * 
 * const result = await prompter.generatePrompts({
 *   slot: { id: '1', name: 'Casino Slots', category: 'casino', keywords: ['jackpot'], colors: ['#FFD700'], style_preferences: ['neon'] },
 *   geo: { id: '2', country: 'DE', language: 'de-DE', currency: 'EUR', cultural_elements: [], forbidden_elements: [] },
 *   aggression_level: 'medium',
 *   format: '1080x1080',
 *   variations_count: 5,
 *   api_type: 'nano_banana_pro'
 * });
 * ```
 */