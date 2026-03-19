import { Prompter } from '../prompter';
import { PromptGenerationInput, Slot, Geo } from '../types';

describe('Prompter', () => {
  let prompter: Prompter;
  let testSlot: Slot;
  let testGeo: Geo;

  beforeEach(() => {
    prompter = new Prompter();
    
    testSlot = {
      id: 'test_slot_001',
      name: 'Test Casino Slots',
      category: 'casino',
      keywords: ['jackpot', 'win', 'lucky'],
      colors: ['#FFD700', '#FF0080'],
      style_preferences: ['neon_casino']
    };

    testGeo = {
      id: 'test_geo_001',
      country: 'UA',
      language: 'uk',
      currency: 'UAH',
      cultural_elements: ['Ukrainian elements'],
      forbidden_elements: ['prohibited content']
    };
  });

  describe('generatePrompts', () => {
    it('should generate correct number of prompts', async () => {
      const input: PromptGenerationInput = {
        slot: testSlot,
        geo: testGeo,
        aggression_level: 'medium',
        format: '1080x1080',
        variations_count: 5,
        api_type: 'nano_banana_pro'
      };

      const result = await prompter.generatePrompts(input);
      
      expect(result.prompts).toHaveLength(5);
      expect(result.total_generated).toBe(5);
      expect(result.generation_time_ms).toBeGreaterThan(0);
    });

    it('should generate prompts with different styles', async () => {
      const input: PromptGenerationInput = {
        slot: testSlot,
        geo: testGeo,
        aggression_level: 'medium',
        format: '1080x1080',
        variations_count: 3,
        api_type: 'nano_banana_pro'
      };

      const result = await prompter.generatePrompts(input);
      
      // Check that styles are different (no duplicates)
      const styles = result.prompts.map(p => p.style);
      const uniqueStyles = new Set(styles);
      expect(uniqueStyles.size).toBe(styles.length);
    });

    it('should generate localized CTA text', async () => {
      const input: PromptGenerationInput = {
        slot: testSlot,
        geo: testGeo,
        aggression_level: 'medium',
        format: '1080x1080',
        variations_count: 2,
        api_type: 'nano_banana_pro'
      };

      const result = await prompter.generatePrompts(input);
      
      // Should contain Ukrainian text
      result.prompts.forEach(prompt => {
        expect(prompt.cta_text).toBeTruthy();
        expect(typeof prompt.cta_text).toBe('string');
      });
    });

    it('should adapt to different APIs', async () => {
      const inputNano: PromptGenerationInput = {
        slot: testSlot,
        geo: testGeo,
        aggression_level: 'medium',
        format: '1080x1080',
        variations_count: 1,
        api_type: 'nano_banana_pro'
      };

      const inputRecraft: PromptGenerationInput = {
        ...inputNano,
        api_type: 'recraft'
      };

      const resultNano = await prompter.generatePrompts(inputNano);
      const resultRecraft = await prompter.generatePrompts(inputRecraft);

      // Different API adapters should produce different prompt formats
      expect(resultNano.prompts[0].prompt_text).not.toBe(
        resultRecraft.prompts[0].prompt_text
      );

      // Check API-specific parameters
      expect(resultNano.prompts[0].api_specific_params).toHaveProperty('steps');
      expect(resultRecraft.prompts[0].api_specific_params).toHaveProperty('controls');
    });

    it('should handle different aggression levels', async () => {
      const baseInput: PromptGenerationInput = {
        slot: testSlot,
        geo: testGeo,
        format: '1080x1080',
        variations_count: 1,
        api_type: 'nano_banana_pro'
      };

      const easyResult = await prompter.generatePrompts({
        ...baseInput,
        aggression_level: 'easy'
      });

      const hardResult = await prompter.generatePrompts({
        ...baseInput, 
        aggression_level: 'hard'
      });

      // Different aggression levels should produce different prompts
      expect(easyResult.prompts[0].prompt_text).not.toBe(
        hardResult.prompts[0].prompt_text
      );
    });

    it('should handle different formats', async () => {
      const squareInput: PromptGenerationInput = {
        slot: testSlot,
        geo: testGeo,
        aggression_level: 'medium',
        format: '1080x1080',
        variations_count: 1,
        api_type: 'nano_banana_pro'
      };

      const verticalInput: PromptGenerationInput = {
        ...squareInput,
        format: '9:16'
      };

      const squareResult = await prompter.generatePrompts(squareInput);
      const verticalResult = await prompter.generatePrompts(verticalInput);

      // Check API parameters reflect format
      expect(squareResult.prompts[0].api_specific_params.width).toBe(1080);
      expect(squareResult.prompts[0].api_specific_params.height).toBe(1080);

      expect(verticalResult.prompts[0].api_specific_params.width).toBe(1080);
      expect(verticalResult.prompts[0].api_specific_params.height).toBe(1920);
    });

    it('should include reference description when provided', async () => {
      const input: PromptGenerationInput = {
        slot: testSlot,
        geo: testGeo,
        aggression_level: 'medium',
        format: '1080x1080',
        variations_count: 1,
        api_type: 'nano_banana_pro',
        reference_description: 'Modern minimalist design with blue accents'
      };

      const result = await prompter.generatePrompts(input);
      
      // Reference should be incorporated in prompt
      expect(result.prompts[0].prompt_text).toContain('Modern minimalist design');
    });

    it('should validate input parameters', async () => {
      const invalidInput: PromptGenerationInput = {
        slot: testSlot,
        geo: testGeo,
        aggression_level: 'medium',
        format: '1080x1080',
        variations_count: 15, // Too many
        api_type: 'nano_banana_pro'
      };

      await expect(prompter.generatePrompts(invalidInput))
        .rejects
        .toThrow('Variations count must be between 1 and 10');
    });
  });

  describe('generateSinglePrompt', () => {
    it('should generate a single prompt', async () => {
      const input: PromptGenerationInput = {
        slot: testSlot,
        geo: testGeo,
        aggression_level: 'medium',
        format: '1080x1080',
        variations_count: 1,
        api_type: 'nano_banana_pro'
      };

      const prompt = await prompter.generateSinglePrompt(input);
      
      expect(prompt).toBeTruthy();
      expect(prompt.id).toBeTruthy();
      expect(prompt.prompt_text).toBeTruthy();
      expect(prompt.style).toBeTruthy();
      expect(prompt.cta_text).toBeTruthy();
      expect(prompt.metadata.slot_id).toBe(testSlot.id);
      expect(prompt.metadata.geo_id).toBe(testGeo.id);
    });
  });

  describe('previewPrompt', () => {
    it('should generate preview without full processing', async () => {
      const input: PromptGenerationInput = {
        slot: testSlot,
        geo: testGeo,
        aggression_level: 'medium',
        format: '1080x1080',
        variations_count: 1,
        api_type: 'nano_banana_pro'
      };

      const preview = prompter.previewPrompt(input, 'neon_casino');
      
      expect(typeof preview).toBe('string');
      expect(preview.length).toBeGreaterThan(0);
    });
  });

  describe('batchGenerate', () => {
    it('should handle batch generation', async () => {
      const inputs: PromptGenerationInput[] = [
        {
          slot: testSlot,
          geo: testGeo,
          aggression_level: 'easy',
          format: '1080x1080',
          variations_count: 2,
          api_type: 'nano_banana_pro'
        },
        {
          slot: testSlot,
          geo: testGeo,
          aggression_level: 'hard',
          format: '9:16',
          variations_count: 2,
          api_type: 'recraft'
        }
      ];

      const results = await prompter.batchGenerate(inputs);
      
      expect(results).toHaveLength(2);
      expect(results[0].prompts).toHaveLength(2);
      expect(results[1].prompts).toHaveLength(2);
    });
  });

  describe('getAvailableStyles', () => {
    it('should return list of available styles', () => {
      const styles = prompter.getAvailableStyles();
      
      expect(Array.isArray(styles)).toBe(true);
      expect(styles.length).toBeGreaterThan(0);
      expect(styles[0]).toHaveProperty('name');
      expect(styles[0]).toHaveProperty('description');
      expect(styles[0]).toHaveProperty('colors');
    });
  });
});