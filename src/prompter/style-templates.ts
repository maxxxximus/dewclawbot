import { StyleTemplate, AggressionLevel } from '../types';

export const STYLE_TEMPLATES: StyleTemplate[] = [
  {
    name: 'neon_casino',
    description: 'Bright neon casino style with glowing effects',
    colors: ['#FF0080', '#00FFFF', '#FFD700', '#FF4500', '#8A2BE2'],
    composition_rules: [
      'Central focal point with radiating glow',
      'Multiple light sources creating depth',
      'High contrast between elements'
    ],
    typography: 'Bold, outlined fonts with neon glow effects',
    visual_elements: ['neon lights', 'casino chips', 'playing cards', 'dice', 'slot machine'],
    aggression_modifiers: {
      easy: ['soft glow', 'elegant lighting', 'refined atmosphere'],
      medium: ['bright neon', 'dynamic lighting', 'energetic mood'],
      hard: ['intense glow', 'flashing lights', 'explosive energy', 'urgent atmosphere']
    }
  },

  {
    name: 'luxury_gold',
    description: 'Premium luxury style with gold accents',
    colors: ['#FFD700', '#C9B037', '#B8860B', '#000000', '#FFFFFF'],
    composition_rules: [
      'Symmetrical layout with gold highlights',
      'Clean minimalist background',
      'Premium material textures'
    ],
    typography: 'Elegant serif fonts with gold metallic effect',
    visual_elements: ['gold coins', 'crown', 'diamond', 'luxury car', 'champagne'],
    aggression_modifiers: {
      easy: ['subtle elegance', 'refined luxury', 'sophisticated appeal'],
      medium: ['obvious wealth', 'premium lifestyle', 'exclusive atmosphere'],
      hard: ['overwhelming luxury', 'extreme wealth display', 'urgent exclusivity']
    }
  },

  {
    name: 'sport_energy',
    description: 'Dynamic sports betting style with motion effects',
    colors: ['#FF6B35', '#004E98', '#00A8CC', '#FFFFFF', '#1A1A1A'],
    composition_rules: [
      'Dynamic diagonal composition',
      'Motion blur effects',
      'Action-focused layout'
    ],
    typography: 'Modern sans-serif with dynamic effects',
    visual_elements: ['football', 'basketball', 'soccer ball', 'stadium', 'crowd'],
    aggression_modifiers: {
      easy: ['smooth motion', 'team spirit', 'friendly competition'],
      medium: ['high energy', 'winning momentum', 'competitive drive'],
      hard: ['explosive action', 'victory rush', 'championship urgency']
    }
  },

  {
    name: 'digital_tech',
    description: 'Modern tech style with digital elements',
    colors: ['#00FF41', '#0080FF', '#FF0080', '#FFFFFF', '#000000'],
    composition_rules: [
      'Grid-based layout',
      'Glitch effects',
      'Holographic elements'
    ],
    typography: 'Futuristic fonts with digital distortion',
    visual_elements: ['circuit boards', 'holograms', 'digital currency', 'screens', 'data streams'],
    aggression_modifiers: {
      easy: ['clean interface', 'smooth animations', 'user-friendly'],
      medium: ['dynamic effects', 'engaging interface', 'tech innovation'],
      hard: ['glitch effects', 'system overload', 'digital chaos', 'urgent notifications']
    }
  },

  {
    name: 'retro_classic',
    description: 'Vintage casino style with retro elements',
    colors: ['#8B0000', '#DAA520', '#F5DEB3', '#654321', '#000000'],
    composition_rules: [
      'Classic centered composition',
      'Vintage frame elements',
      'Old-school proportions'
    ],
    typography: 'Classic serif fonts with vintage styling',
    visual_elements: ['vintage slot machines', 'old coins', 'classic cards', 'leather', 'wood'],
    aggression_modifiers: {
      easy: ['nostalgic charm', 'classic appeal', 'timeless elegance'],
      medium: ['vintage excitement', 'classic thrill', 'retro energy'],
      hard: ['old-school intensity', 'classic pressure', 'vintage urgency']
    }
  },

  {
    name: 'minimal_modern',
    description: 'Clean minimal style with focus on simplicity',
    colors: ['#FF4757', '#2F3542', '#A4B0BE', '#FFFFFF', '#000000'],
    composition_rules: [
      'Lots of white space',
      'Single focal point',
      'Clean geometric shapes'
    ],
    typography: 'Clean sans-serif fonts with excellent readability',
    visual_elements: ['simple icons', 'geometric shapes', 'minimal graphics', 'clean lines'],
    aggression_modifiers: {
      easy: ['soft minimalism', 'gentle appeal', 'calm confidence'],
      medium: ['bold simplicity', 'clear message', 'direct approach'],
      hard: ['stark contrast', 'urgent simplicity', 'demanding attention']
    }
  }
];

export class StyleSelector {
  static selectStyles(count: number, avoid_duplicates: boolean = true): StyleTemplate[] {
    const available = [...STYLE_TEMPLATES];
    const selected: StyleTemplate[] = [];

    for (let i = 0; i < count && available.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      const style = available[randomIndex];
      selected.push(style);

      if (avoid_duplicates) {
        available.splice(randomIndex, 1);
      }
    }

    return selected;
  }

  static getStyleByName(name: string): StyleTemplate | null {
    return STYLE_TEMPLATES.find(s => s.name === name) || null;
  }

  static getStylesForSlot(slot_category: string, count: number): StyleTemplate[] {
    // Map slot categories to preferred styles
    const styleMap: Record<string, string[]> = {
      'casino': ['neon_casino', 'luxury_gold', 'retro_classic'],
      'sports': ['sport_energy', 'digital_tech', 'minimal_modern'],
      'slots': ['neon_casino', 'retro_classic', 'digital_tech'],
      'poker': ['luxury_gold', 'retro_classic', 'minimal_modern']
    };

    const preferred = styleMap[slot_category.toLowerCase()] || [];
    const preferredStyles = STYLE_TEMPLATES.filter(s => preferred.includes(s.name));
    
    if (preferredStyles.length >= count) {
      return this.selectFromArray(preferredStyles, count);
    }

    // Mix preferred with random if not enough preferred styles
    const remaining = count - preferredStyles.length;
    const otherStyles = STYLE_TEMPLATES.filter(s => !preferred.includes(s.name));
    const additionalStyles = this.selectFromArray(otherStyles, remaining);
    
    return [...preferredStyles, ...additionalStyles];
  }

  private static selectFromArray<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}