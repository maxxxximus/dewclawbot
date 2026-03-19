import { CTATemplate, AggressionLevel } from '../types';

// CTA templates for different aggression levels and languages
export const CTA_TEMPLATES: CTATemplate[] = [
  // Easy level - soft approach
  {
    key: 'register_easy',
    aggression_level: 'easy',
    templates: {
      'en': 'Try Now',
      'uk': 'Спробувати',
      'ru': 'Попробовать',
      'de': 'Jetzt Testen',
      'es': 'Prueba Ahora',
      'fr': 'Essayer Maintenant',
      'pt': 'Experimente Agora',
      'it': 'Prova Ora',
      'nl': 'Nu Proberen',
      'pl': 'Spróbuj Teraz',
      'cs': 'Vyzkoušet Nyní',
      'hu': 'Próbáld Most',
      'sl': 'Preizkusi Zdaj',
      'sk': 'Skúsiť Teraz'
    }
  },
  {
    key: 'play_easy',
    aggression_level: 'easy',
    templates: {
      'en': 'Start Playing',
      'uk': 'Почати Гру',
      'ru': 'Начать Игру',
      'de': 'Jetzt Spielen',
      'es': 'Empezar a Jugar',
      'fr': 'Commencer à Jouer',
      'pt': 'Começar a Jogar',
      'it': 'Inizia a Giocare',
      'nl': 'Begin met Spelen',
      'pl': 'Zacznij Grać',
      'cs': 'Začít Hrát',
      'hu': 'Kezdd el Játszani',
      'sl': 'Začni Igrati',
      'sk': 'Začať Hrať'
    }
  },
  
  // Medium level - more compelling
  {
    key: 'win_medium',
    aggression_level: 'medium',
    templates: {
      'en': 'Win Big Today!',
      'uk': 'Виграй Великі Гроші!',
      'ru': 'Выиграй Крупно!',
      'de': 'Gewinnen Sie Groß!',
      'es': '¡Gana en Grande!',
      'fr': 'Gagnez Gros!',
      'pt': 'Ganhe Grande!',
      'it': 'Vinci alla Grande!',
      'nl': 'Win Groot Vandaag!',
      'pl': 'Wygraj Duże Dziś!',
      'cs': 'Vyhrál Velké Dnes!',
      'hu': 'Nyerj Nagyot Ma!',
      'sl': 'Zmaga Veliki Danes!',
      'sk': 'Vyhrať Veľké Dnes!'
    }
  },
  {
    key: 'bonus_medium',
    aggression_level: 'medium',
    templates: {
      'en': 'Claim Your Bonus',
      'uk': 'Отримати Бонус',
      'ru': 'Получить Бонус',
      'de': 'Bonus Beanspruchen',
      'es': 'Reclama tu Bono',
      'fr': 'Réclamez Votre Bonus',
      'pt': 'Reivindique Seu Bônus',
      'it': 'Rivendica il Tuo Bonus',
      'nl': 'Claim Je Bonus',
      'pl': 'Zgarnij Swój Bonus',
      'cs': 'Získej Svůj Bonus',
      'hu': 'Igényelj Bónuszt',
      'sl': 'Zahtevaj Svoj Bonus',
      'sk': 'Požaduj Svoj Bonus'
    }
  },

  // Hard level - aggressive/urgent
  {
    key: 'jackpot_hard',
    aggression_level: 'hard',
    templates: {
      'en': 'JACKPOT AWAITS!',
      'uk': 'ДЖЕКПОТ ЧЕКАЄ!',
      'ru': 'ДЖЕКПОТ ЖДЁТ!',
      'de': 'JACKPOT WARTET!',
      'es': '¡JACKPOT TE ESPERA!',
      'fr': 'JACKPOT VOUS ATTEND!',
      'pt': 'JACKPOT TE AGUARDA!',
      'it': 'JACKPOT TI ASPETTA!',
      'nl': 'JACKPOT WACHT!',
      'pl': 'JACKPOT CZEKA!',
      'cs': 'JACKPOT ČEKÁ!',
      'hu': 'JACKPOT VÁR!',
      'sl': 'JACKPOT ČAKA!',
      'sk': 'JACKPOT ČAKÁ!'
    }
  },
  {
    key: 'urgent_hard',
    aggression_level: 'hard',
    templates: {
      'en': 'LAST CHANCE!',
      'uk': 'ОСТАННІЙ ШАНС!',
      'ru': 'ПОСЛЕДНИЙ ШАНС!',
      'de': 'LETZTE CHANCE!',
      'es': '¡ÚLTIMA OPORTUNIDAD!',
      'fr': 'DERNIÈRE CHANCE!',
      'pt': 'ÚLTIMA CHANCE!',
      'it': 'ULTIMA POSSIBILITÀ!',
      'nl': 'LAATSTE KANS!',
      'pl': 'OSTATNIA SZANSA!',
      'cs': 'POSLEDNÍ ŠANCE!',
      'hu': 'UTOLSÓ LEHETŐSÉG!',
      'sl': 'ZADNJA PRILOŽNOST!',
      'sk': 'POSLEDNÁ ŠANCA!'
    }
  }
];

export class CTALocalizer {
  static getCTAText(
    aggression_level: AggressionLevel,
    language: string,
    slot_category?: string
  ): string {
    // Filter templates by aggression level
    const templates = CTA_TEMPLATES.filter(t => t.aggression_level === aggression_level);
    
    if (templates.length === 0) {
      return this.getFallbackCTA(language);
    }

    // Select template based on slot category or randomly
    let selectedTemplate: CTATemplate;
    if (slot_category) {
      // Logic for matching slot category to specific CTA types
      selectedTemplate = this.selectByCategory(templates, slot_category) || templates[0];
    } else {
      // Random selection
      selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    }

    // Get localized text, fallback to English
    return selectedTemplate.templates[language] || 
           selectedTemplate.templates['en'] || 
           this.getFallbackCTA(language);
  }

  private static selectByCategory(templates: CTATemplate[], category: string): CTATemplate | null {
    // Map slot categories to preferred CTA types
    const categoryMap: Record<string, string[]> = {
      'casino': ['jackpot', 'win', 'bonus'],
      'sports': ['win', 'bonus', 'play'],
      'poker': ['play', 'win', 'bonus'],
      'slots': ['jackpot', 'win', 'urgent']
    };

    const preferredKeys = categoryMap[category.toLowerCase()] || [];
    
    for (const key of preferredKeys) {
      const template = templates.find(t => t.key.includes(key));
      if (template) return template;
    }
    
    return null;
  }

  private static getFallbackCTA(language: string): string {
    const fallbacks: Record<string, string> = {
      'en': 'Play Now',
      'uk': 'Грати Зараз',
      'ru': 'Играть Сейчас',
      'de': 'Jetzt Spielen',
      'es': 'Jugar Ahora',
      'fr': 'Jouer Maintenant',
      'pt': 'Jogar Agora',
      'it': 'Gioca Ora',
      'nl': 'Speel Nu',
      'pl': 'Graj Teraz',
      'cs': 'Hrát Nyní',
      'hu': 'Játssz Most',
      'sl': 'Igraj Zdaj',
      'sk': 'Hrať Teraz'
    };

    return fallbacks[language] || fallbacks['en'];
  }
}