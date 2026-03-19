// Core types for the Prompter system

export interface Slot {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  colors: string[];
  style_preferences: string[];
}

export interface Geo {
  id: string;
  country: string;
  language: string;
  currency: string;
  cultural_elements: string[];
  forbidden_elements: string[];
}

export type AggressionLevel = 'easy' | 'medium' | 'hard';
export type Format = '1080x1080' | '9:16';
export type ApiType = 'nano_banana_pro' | 'recraft';

export interface PromptGenerationInput {
  slot: Slot;
  geo: Geo;
  aggression_level: AggressionLevel;
  format: Format;
  variations_count: number;
  reference_description?: string; // From SCANNER
  api_type: ApiType;
}

export interface GeneratedPrompt {
  id: string;
  prompt_text: string;
  style: string;
  composition: string;
  colors: string[];
  cta_text: string;
  api_specific_params: Record<string, any>;
  metadata: {
    slot_id: string;
    geo_id: string;
    aggression_level: AggressionLevel;
    format: Format;
    generated_at: string;
  };
}

export interface PromptGenerationResult {
  prompts: GeneratedPrompt[];
  total_generated: number;
  generation_time_ms: number;
}

// Style definitions for different aggression levels
export interface StyleTemplate {
  name: string;
  description: string;
  colors: string[];
  composition_rules: string[];
  typography: string;
  visual_elements: string[];
  aggression_modifiers: {
    easy: string[];
    medium: string[];
    hard: string[];
  };
}

// CTA templates for localization
export interface CTATemplate {
  key: string;
  aggression_level: AggressionLevel;
  templates: Record<string, string>; // language -> template
}