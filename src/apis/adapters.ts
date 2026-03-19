import { ApiType, Format, GeneratedPrompt, StyleTemplate, AggressionLevel } from '../types';

export interface ApiAdapter {
  formatPrompt(
    style: StyleTemplate,
    aggression: AggressionLevel,
    format: Format,
    colors: string[],
    reference?: string
  ): string;
  
  getApiParams(format: Format): Record<string, any>;
  
  formatCTA(text: string, style: StyleTemplate): string;
}

export class NanoBananaProAdapter implements ApiAdapter {
  formatPrompt(
    style: StyleTemplate,
    aggression: AggressionLevel,
    format: Format,
    colors: string[],
    reference?: string
  ): string {
    const aspectRatio = format === '1080x1080' ? 'square' : 'portrait';
    const aggressionModifiers = style.aggression_modifiers[aggression];
    
    // Nano Banana Pro style formatting
    let prompt = `Create a ${style.description} in ${aspectRatio} format. `;
    
    // Style and composition
    prompt += `Style: ${style.name}, featuring ${style.visual_elements.slice(0, 3).join(', ')}. `;
    prompt += `Composition: ${style.composition_rules.join(', ')}. `;
    
    // Colors (Nano Banana Pro prefers specific color descriptions)
    prompt += `Color palette: ${colors.map(c => this.colorToName(c)).join(', ')}. `;
    
    // Aggression modifiers
    prompt += `Mood: ${aggressionModifiers.join(', ')}. `;
    
    // Typography (if applicable)
    if (style.typography) {
      prompt += `Typography: ${style.typography}. `;
    }
    
    // Reference integration
    if (reference) {
      prompt += `Reference style: ${reference}. `;
    }
    
    // Nano Banana Pro specific instructions
    prompt += 'High quality, professional composition, suitable for advertising creative. ';
    prompt += 'Avoid text overlays, focus on visual impact.';
    
    return prompt.trim();
  }

  getApiParams(format: Format): Record<string, any> {
    const dimensions = format === '1080x1080' ? 
      { width: 1080, height: 1080 } : 
      { width: 1080, height: 1920 };
      
    return {
      ...dimensions,
      steps: 30,
      guidance_scale: 7.5,
      quality: 'high',
      style_preset: 'photographic',
      seed: Math.floor(Math.random() * 1000000)
    };
  }

  formatCTA(text: string, style: StyleTemplate): string {
    // Nano Banana Pro expects CTA as separate parameter
    return text; // No special formatting needed
  }

  private colorToName(hex: string): string {
    const colorNames: Record<string, string> = {
      '#FF0080': 'bright magenta',
      '#00FFFF': 'cyan',
      '#FFD700': 'gold',
      '#FF4500': 'orange red',
      '#8A2BE2': 'blue violet',
      '#FF6B35': 'vermillion',
      '#004E98': 'navy blue',
      '#00A8CC': 'sky blue',
      '#00FF41': 'electric green',
      '#0080FF': 'azure',
      '#8B0000': 'dark red',
      '#DAA520': 'goldenrod',
      '#F5DEB3': 'wheat',
      '#654321': 'dark brown',
      '#FF4757': 'red',
      '#2F3542': 'dark gray',
      '#A4B0BE': 'light gray'
    };
    
    return colorNames[hex] || hex;
  }
}

export class RecraftAdapter implements ApiAdapter {
  formatPrompt(
    style: StyleTemplate,
    aggression: AggressionLevel,
    format: Format,
    colors: string[],
    reference?: string
  ): string {
    const aggressionModifiers = style.aggression_modifiers[aggression];
    
    // Recraft prefers more structured prompts
    let prompt = `[STYLE] ${style.name} advertising creative\n`;
    
    // Main subject and composition
    prompt += `[SUBJECT] ${style.visual_elements.slice(0, 2).join(' and ')}\n`;
    prompt += `[COMPOSITION] ${style.composition_rules[0]}\n`;
    
    // Visual details
    prompt += `[COLORS] ${colors.join(', ')}\n`;
    prompt += `[MOOD] ${aggressionModifiers.slice(0, 2).join(', ')}\n`;
    
    // Typography
    if (style.typography) {
      prompt += `[TYPOGRAPHY] ${style.typography}\n`;
    }
    
    // Format specific instructions
    const formatInstructions = format === '1080x1080' ? 
      'Square format, centered composition' : 
      'Vertical format, suitable for mobile display';
    prompt += `[FORMAT] ${formatInstructions}\n`;
    
    // Reference integration
    if (reference) {
      prompt += `[REFERENCE] Inspired by: ${reference}\n`;
    }
    
    // Recraft specific quality instructions
    prompt += '[QUALITY] High resolution, professional advertising quality, clean execution';
    
    return prompt;
  }

  getApiParams(format: Format): Record<string, any> {
    return {
      width: format === '1080x1080' ? 1080 : 1080,
      height: format === '1080x1080' ? 1080 : 1920,
      style: 'realistic',
      substyle: 'advertising',
      controls: {
        structure: 0.7,
        style: 0.8,
        color: 0.6
      },
      iterations: 25
    };
  }

  formatCTA(text: string, style: StyleTemplate): string {
    // Recraft can include text in the prompt
    const textStyle = style.name.includes('luxury') ? 'elegant' : 
                     style.name.includes('neon') ? 'glowing' :
                     style.name.includes('minimal') ? 'clean' : 'bold';
                     
    return `${textStyle} text overlay: "${text}"`;
  }
}

export class ApiAdapterFactory {
  static create(apiType: ApiType): ApiAdapter {
    switch (apiType) {
      case 'nano_banana_pro':
        return new NanoBananaProAdapter();
      case 'recraft':
        return new RecraftAdapter();
      default:
        throw new Error(`Unsupported API type: ${apiType}`);
    }
  }
}

// Composition templates for different formats
export class CompositionHelper {
  static getCompositionRules(format: Format, style: StyleTemplate): string[] {
    const base = style.composition_rules;
    
    if (format === '1080x1080') {
      // Square format specific rules
      return [
        ...base,
        'Centered focal point',
        'Balanced element distribution',
        'Equal margins on all sides'
      ];
    } else {
      // Vertical format specific rules
      return [
        ...base,
        'Top-to-bottom visual hierarchy',
        'Vertical flow of elements',
        'Mobile-optimized layout'
      ];
    }
  }
  
  static getFormatSpecificInstructions(format: Format): string {
    if (format === '1080x1080') {
      return 'Square Instagram post format, optimized for social media feed display';
    } else {
      return 'Vertical story format, optimized for mobile screens and story feeds';
    }
  }
}