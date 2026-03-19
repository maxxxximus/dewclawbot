import { 
  PromptGenerationInput, 
  PromptGenerationResult, 
  GeneratedPrompt,
  StyleTemplate,
  AggressionLevel,
  Format,
  ApiType
} from '../types';
import { StyleSelector, STYLE_TEMPLATES } from './style-templates';
import { CTALocalizer } from '../localization/cta-templates';
import { ApiAdapterFactory, CompositionHelper } from '../apis/adapters';
import { generateId } from '../utils/helpers';

export class Prompter {
  /**
   * Main method to generate multiple prompts based on input parameters
   */
  async generatePrompts(input: PromptGenerationInput): Promise<PromptGenerationResult> {
    const startTime = Date.now();
    
    try {
      // Validate input
      this.validateInput(input);
      
      // Select styles for variations (ensure no duplicates)
      const selectedStyles = this.selectStylesForGeneration(input);
      
      // Generate prompts
      const prompts = await this.createPromptVariations(input, selectedStyles);
      
      // Calculate generation time
      const generationTime = Date.now() - startTime;
      
      return {
        prompts,
        total_generated: prompts.length,
        generation_time_ms: generationTime
      };
    } catch (error) {
      throw new Error(`Prompt generation failed: ${error.message}`);
    }
  }

  /**
   * Generate a single prompt for testing
   */
  async generateSinglePrompt(input: PromptGenerationInput): Promise<GeneratedPrompt> {
    const style = StyleSelector.selectStyles(1)[0];
    return this.createSinglePrompt(input, style);
  }

  private validateInput(input: PromptGenerationInput): void {
    if (!input.slot || !input.geo) {
      throw new Error('Slot and Geo are required');
    }
    
    if (input.variations_count < 1 || input.variations_count > 10) {
      throw new Error('Variations count must be between 1 and 10');
    }
    
    if (!['easy', 'medium', 'hard'].includes(input.aggression_level)) {
      throw new Error('Invalid aggression level');
    }
    
    if (!['1080x1080', '9:16'].includes(input.format)) {
      throw new Error('Invalid format');
    }
  }

  private selectStylesForGeneration(input: PromptGenerationInput): StyleTemplate[] {
    const { slot, variations_count } = input;
    
    // Use slot category to guide style selection
    if (slot.category) {
      return StyleSelector.getStylesForSlot(slot.category, variations_count);
    }
    
    // Fallback to random selection
    return StyleSelector.selectStyles(variations_count, true);
  }

  private async createPromptVariations(
    input: PromptGenerationInput, 
    styles: StyleTemplate[]
  ): Promise<GeneratedPrompt[]> {
    const promises = styles.map(style => this.createSinglePrompt(input, style));
    return Promise.all(promises);
  }

  private async createSinglePrompt(
    input: PromptGenerationInput, 
    style: StyleTemplate
  ): Promise<GeneratedPrompt> {
    const { slot, geo, aggression_level, format, reference_description, api_type } = input;
    
    // Get API adapter
    const adapter = ApiAdapterFactory.create(api_type);
    
    // Select colors from style and slot preferences
    const colors = this.selectColors(style, slot);
    
    // Generate localized CTA
    const ctaText = CTALocalizer.getCTAText(
      aggression_level,
      geo.language,
      slot.category
    );
    
    // Get composition rules
    const composition = CompositionHelper.getCompositionRules(format, style).join(', ');
    
    // Generate main prompt text
    const promptText = adapter.formatPrompt(
      style,
      aggression_level,
      format,
      colors,
      reference_description
    );
    
    // Get API-specific parameters
    const apiParams = adapter.getApiParams(format);
    
    // Format CTA for API
    const formattedCTA = adapter.formatCTA(ctaText, style);
    
    return {
      id: generateId(),
      prompt_text: promptText,
      style: style.name,
      composition,
      colors,
      cta_text: formattedCTA,
      api_specific_params: apiParams,
      metadata: {
        slot_id: slot.id,
        geo_id: geo.id,
        aggression_level,
        format,
        generated_at: new Date().toISOString()
      }
    };
  }

  private selectColors(style: StyleTemplate, slot: any): string[] {
    // Start with style colors
    let colors = [...style.colors];
    
    // If slot has color preferences, try to incorporate them
    if (slot.colors && slot.colors.length > 0) {
      // Mix slot colors with style colors
      const slotColors = slot.colors.slice(0, 2); // Take max 2 slot colors
      colors = [...slotColors, ...colors.slice(0, 3)]; // Mix with 3 style colors
    }
    
    // Ensure we have 3-5 colors maximum
    return colors.slice(0, 5);
  }

  /**
   * Batch generation for multiple slot/geo combinations
   */
  async batchGenerate(
    inputs: PromptGenerationInput[]
  ): Promise<PromptGenerationResult[]> {
    const results: PromptGenerationResult[] = [];
    
    // Process in small batches to avoid overwhelming the system
    const batchSize = 3;
    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(input => this.generatePrompts(input))
      );
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < inputs.length) {
        await this.delay(100);
      }
    }
    
    return results;
  }

  /**
   * Get available styles for preview
   */
  getAvailableStyles(): StyleTemplate[] {
    return STYLE_TEMPLATES;
  }

  /**
   * Preview prompt without full generation
   */
  previewPrompt(input: PromptGenerationInput, styleName?: string): string {
    const style = styleName ? 
      StyleSelector.getStyleByName(styleName) || StyleSelector.selectStyles(1)[0] :
      StyleSelector.selectStyles(1)[0];
      
    const adapter = ApiAdapterFactory.create(input.api_type);
    const colors = this.selectColors(style, input.slot);
    
    return adapter.formatPrompt(
      style,
      input.aggression_level,
      input.format,
      colors,
      input.reference_description
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance for easy use
export const prompter = new Prompter();