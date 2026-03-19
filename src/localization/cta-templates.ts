import { CTATemplate, AggressionLevel } from '../types';

// CTA templates for different aggression levels and languages
export const CTA_TEMPLATES: CTATemplate[] = [
  // Easy level - soft approach
  {
    key: 'register_easy',
    aggression_level: 'easy',
    templates: {
      'en': 'Try Now',
      'en-GB': 'Try Now',
      'uk': 'Спробувати',
      'ru': 'Попробовать',
      'de': 'Jetzt Testen',
      'de-DE': 'Jetzt Testen',
      'de-AT': 'Jetzt Testen',
      'es': 'Prueba Ahora',
      'es-ES': 'Prueba Ahora',
      'fr': 'Essayer Maintenant',
      'fr-FR': 'Essayer Maintenant',
      'pt': 'Experimente Agora',
      'pt-PT': 'Experimente Agora',
      'it': 'Prova Ora',
      'it-IT': 'Prova Ora',
      'nl-NL': 'Probeer Nu',
      'nl-BE': 'Probeer Nu',
      'pl-PL': 'Spróbuj Teraz',
      'cs-CZ': 'Zkuste Nyní',
      'hu-HU': 'Próbáld Ki Most',
      'sl-SI': 'Poskusite Zdaj',
      'sk-SK': 'Vyskúšajte Teraz',
      'tr-TR': 'Şimdi Deneyin',
      'kk-KZ': 'Қазір Сынаңыз',
      'ky-KG': 'Азыр Сынаңыз'
    }
  },
  {
    key: 'play_easy',
    aggression_level: 'easy',
    templates: {
      'en': 'Start Playing',
      'en-GB': 'Start Playing',
      'uk': 'Почати Гру',
      'ru': 'Начать Игру',
      'de': 'Jetzt Spielen',
      'de-DE': 'Jetzt Spielen',
      'de-AT': 'Jetzt Spielen',
      'es': 'Empezar a Jugar',
      'es-ES': 'Empezar a Jugar',
      'fr': 'Commencer à Jouer',
      'fr-FR': 'Commencer à Jouer',
      'pt': 'Começar a Jogar',
      'pt-PT': 'Começar a Jogar',
      'it': 'Inizia a Giocare',
      'it-IT': 'Inizia a Giocare',
      'nl-NL': 'Begin met Spelen',
      'nl-BE': 'Begin met Spelen',
      'pl-PL': 'Zacznij Grać',
      'cs-CZ': 'Začněte Hrát',
      'hu-HU': 'Kezdj el Játszani',
      'sl-SI': 'Začni Igrati',
      'sk-SK': 'Začnite Hrať',
      'tr-TR': 'Oynamaya Başlayın',
      'kk-KZ': 'Ойнауды Бастаңыз',
      'ky-KG': 'Ойноону Баштаңыз'
    }
  },
  
  // Medium level - more compelling
  {
    key: 'win_medium',
    aggression_level: 'medium',
    templates: {
      'en': 'Win Big Today!',
      'en-GB': 'Win Big Today!',
      'uk': 'Виграй Великі Гроші!',
      'ru': 'Выиграй Крупно!',
      'de': 'Gewinnen Sie Groß!',
      'de-DE': 'Gewinnen Sie Groß!',
      'de-AT': 'Gewinnen Sie Groß!',
      'es': '¡Gana en Grande!',
      'es-ES': '¡Gana en Grande!',
      'fr': 'Gagnez Gros!',
      'fr-FR': 'Gagnez Gros!',
      'pt': 'Ganhe Grande!',
      'pt-PT': 'Ganhe Grande!',
      'it': 'Vinci alla Grande!',
      'it-IT': 'Vinci alla Grande!',
      'nl-NL': 'Win Groot Vandaag!',
      'nl-BE': 'Win Groot Vandaag!',
      'pl-PL': 'Wygraj Wielkie Pieniądze!',
      'cs-CZ': 'Vyhrajte Velké Dnes!',
      'hu-HU': 'Nyerj Nagyot Ma!',
      'sl-SI': 'Osvojite Veliko Danes!',
      'sk-SK': 'Vyhrajte Veľké Dnes!',
      'tr-TR': 'Bugün Büyük Kazan!',
      'kk-KZ': 'Бүгін Үлкен Жеңіп Алыңыз!',
      'ky-KG': 'Бүгүн Чоң Утуп Алыңыз!'
    }
  },
  {
    key: 'bonus_medium',
    aggression_level: 'medium',
    templates: {
      'en': 'Claim Your Bonus',
      'en-GB': 'Claim Your Bonus',
      'uk': 'Отримати Бонус',
      'ru': 'Получить Бонус',
      'de': 'Bonus Beanspruchen',
      'de-DE': 'Bonus Beanspruchen',
      'de-AT': 'Bonus Beanspruchen',
      'es': 'Reclama tu Bono',
      'es-ES': 'Reclama tu Bono',
      'fr': 'Réclamez Votre Bonus',
      'fr-FR': 'Réclamez Votre Bonus',
      'pt': 'Reivindique Seu Bônus',
      'pt-PT': 'Reivindique Seu Bónus',
      'it': 'Rivendica il Tuo Bonus',
      'it-IT': 'Rivendica il Tuo Bonus',
      'nl-NL': 'Claim Je Bonus',
      'nl-BE': 'Claim Je Bonus',
      'pl-PL': 'Odbierz Bonus',
      'cs-CZ': 'Získejte Bonus',
      'hu-HU': 'Szerezd meg a Bónuszod',
      'sl-SI': 'Prevzemite Bonus',
      'sk-SK': 'Získajte Bonus',
      'tr-TR': 'Bonusunu Al',
      'kk-KZ': 'Бонусыңызды Алыңыз',
      'ky-KG': 'Бонусуңузду Алыңыз'
    }
  },

  // Hard level - aggressive/urgent
  {
    key: 'jackpot_hard',
    aggression_level: 'hard',
    templates: {
      'en': 'JACKPOT AWAITS!',
      'en-GB': 'JACKPOT AWAITS!',
      'uk': 'ДЖЕКПОТ ЧЕКАЄ!',
      'ru': 'ДЖЕКПОТ ЖДЁТ!',
      'de': 'JACKPOT WARTET!',
      'de-DE': 'JACKPOT WARTET!',
      'de-AT': 'JACKPOT WARTET!',
      'es': '¡JACKPOT TE ESPERA!',
      'es-ES': '¡JACKPOT TE ESPERA!',
      'fr': 'JACKPOT VOUS ATTEND!',
      'fr-FR': 'JACKPOT VOUS ATTEND!',
      'pt': 'JACKPOT TE AGUARDA!',
      'pt-PT': 'JACKPOT TE AGUARDA!',
      'it': 'JACKPOT TI ASPETTA!',
      'it-IT': 'JACKPOT TI ASPETTA!',
      'nl-NL': 'JACKPOT WACHT!',
      'nl-BE': 'JACKPOT WACHT!',
      'pl-PL': 'JACKPOT CZEKA!',
      'cs-CZ': 'JACKPOT ČEKÁ!',
      'hu-HU': 'JACKPOT VÁVÁ VÁR!',
      'sl-SI': 'JACKPOT ČAKA!',
      'sk-SK': 'JACKPOT ČAKÁ!',
      'tr-TR': 'JACKPOT BEKLİYOR!',
      'kk-KZ': 'ДЖЕКПОТ КҮТЕДІ!',
      'ky-KG': 'ДЖЕКПОТ КҮТӨТ!'
    }
  },
  {
    key: 'urgent_hard',
    aggression_level: 'hard',
    templates: {
      'en': 'LAST CHANCE!',
      'en-GB': 'LAST CHANCE!',
      'uk': 'ОСТАННІЙ ШАНС!',
      'ru': 'ПОСЛЕДНИЙ ШАНС!',
      'de': 'LETZTE CHANCE!',
      'de-DE': 'LETZTE CHANCE!',
      'de-AT': 'LETZTE CHANCE!',
      'es': '¡ÚLTIMA OPORTUNIDAD!',
      'es-ES': '¡ÚLTIMA OPORTUNIDAD!',
      'fr': 'DERNIÈRE CHANCE!',
      'fr-FR': 'DERNIÈRE CHANCE!',
      'pt': 'ÚLTIMA CHANCE!',
      'pt-PT': 'ÚLTIMA OPORTUNIDADE!',
      'it': 'ULTIMA POSSIBILITÀ!',
      'it-IT': 'ULTIMA POSSIBILITÀ!',
      'nl-NL': 'LAATSTE KANS!',
      'nl-BE': 'LAATSTE KANS!',
      'pl-PL': 'OSTATNIA SZANSA!',
      'cs-CZ': 'POSLEDNÍ ŠANCE!',
      'hu-HU': 'UTOLSÓ ESÉLY!',
      'sl-SI': 'ZADNJA PRILOŽNOST!',
      'sk-SK': 'POSLEDNÁ ŠANCA!',
      'tr-TR': 'SON ŞANS!',
      'kk-KZ': 'СОҢҒЫ МҮМКІНДІК!',
      'ky-KG': 'АКЫРКЫ МҮМКҮНЧҮЛҮК!'
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
      'en-GB': 'Play Now',
      'uk': 'Грати Зараз',
      'ru': 'Играть Сейчас',
      'de': 'Jetzt Spielen',
      'de-DE': 'Jetzt Spielen',
      'de-AT': 'Jetzt Spielen',
      'es': 'Jugar Ahora',
      'es-ES': 'Jugar Ahora',
      'fr': 'Jouer Maintenant',
      'fr-FR': 'Jouer Maintenant',
      'pt': 'Jogar Agora',
      'pt-PT': 'Jogar Agora',
      'it': 'Gioca Ora',
      'it-IT': 'Gioca Ora',
      'nl-NL': 'Speel Nu',
      'nl-BE': 'Speel Nu',
      'pl-PL': 'Graj Teraz',
      'cs-CZ': 'Hrajte Nyní',
      'hu-HU': 'Játssz Most',
      'sl-SI': 'Igrajte Zdaj',
      'sk-SK': 'Hrajte Teraz',
      'tr-TR': 'Şimdi Oyna',
      'kk-KZ': 'Қазір Ойнаңыз',
      'ky-KG': 'Азыр Ойноңуз'
    };

    return fallbacks[language] || fallbacks['en'];
  }
}