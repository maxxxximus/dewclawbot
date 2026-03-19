import { Geo } from '../types';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface LocalizationInput {
  creativeImagePath: string; // Path to source creative
  slot: string; // Slot identifier for naming
  outputDir: string; // Where to save localized variants
  ctaText?: string; // Original CTA text to localize
  llmApiKey?: string; // API key for LLM translation
  llmProvider?: 'anthropic' | 'openai'; // LLM provider
}

export interface LocalizedVariant {
  geoId: string;
  geoCode: string;
  language: string;
  currency: string;
  localizedCtaText: string;
  suggestedBank: string;
  suggestedPaymentMethod: string;
  outputFilename: string;
  outputPath: string;
}

export interface LocalizationResult {
  sourceCreative: string;
  variants: LocalizedVariant[];
  totalGenerated: number;
  processingTimeMs: number;
}

export class CreativeLocalizer {
  private geos: Geo[] = [];
  private llmApiKey?: string;
  private llmProvider: 'anthropic' | 'openai' = 'anthropic';

  constructor(llmApiKey?: string, llmProvider: 'anthropic' | 'openai' = 'anthropic') {
    this.llmApiKey = llmApiKey;
    this.llmProvider = llmProvider;
  }

  async initialize(): Promise<void> {
    // Load GEOs from config
    const geosPath = path.join(__dirname, '../../config/geos.json');
    const geosData = await fs.readFile(geosPath, 'utf-8');
    const geosConfig = JSON.parse(geosData);
    
    this.geos = geosConfig.geos.map((geo: any) => ({
      id: geo.id,
      country: geo.name,
      language: geo.language,
      currency: geo.currency,
      cultural_elements: geo.gambling_preference ? [geo.gambling_preference] : [],
      forbidden_elements: [] // Could be expanded later
    }));
  }

  async localizeCreative(input: LocalizationInput): Promise<LocalizationResult> {
    const startTime = Date.now();
    
    if (this.geos.length === 0) {
      await this.initialize();
    }

    // Ensure output directory exists
    await this.ensureDir(input.outputDir);

    const variants: LocalizedVariant[] = [];

    // Process each GEO (all 10)
    for (const geo of this.geos) {
      try {
        const variant = await this.createLocalizedVariant(input, geo);
        variants.push(variant);
      } catch (error) {
        console.error(`Error localizing for GEO ${geo.country}:`, error);
        // Continue with other GEOs even if one fails
      }
    }

    const endTime = Date.now();

    return {
      sourceCreative: input.creativeImagePath,
      variants,
      totalGenerated: variants.length,
      processingTimeMs: endTime - startTime
    };
  }

  private async createLocalizedVariant(
    input: LocalizationInput, 
    geo: Geo
  ): Promise<LocalizedVariant> {
    // Get GEO-specific data
    const geoData = await this.getGeoData(geo.id);
    
    // Translate CTA text using LLM if provided
    let localizedCtaText = '';
    if (input.ctaText && this.llmApiKey) {
      localizedCtaText = await this.translateCTAWithLLM(input.ctaText, geo.language, geo.cultural_elements);
    } else if (input.ctaText) {
      // Fallback to basic translation
      localizedCtaText = await this.getDefaultCTA(geo.language);
    }

    // Select appropriate bank and payment method
    const suggestedBank = this.selectBank(geoData);
    const suggestedPaymentMethod = this.selectPaymentMethod(geoData);

    // Generate output filename: {slot}_{geo}_{lang}_{n}.png
    const languageCode = geo.language.split('-')[0]; // Extract just 'pt' from 'pt-BR'
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits as variant number
    const outputFilename = `${input.slot}_${geo.country.toLowerCase().replace(/\s+/g, '')}_${languageCode}_${timestamp}.png`;
    const outputPath = path.join(input.outputDir, outputFilename);

    // Copy and process the creative image
    await this.processCreativeImage(input.creativeImagePath, outputPath, {
      ctaText: localizedCtaText,
      currency: geo.currency,
      bank: suggestedBank,
      paymentMethod: suggestedPaymentMethod,
      language: geo.language
    });

    return {
      geoId: geo.id,
      geoCode: geoData.country_code,
      language: geo.language,
      currency: geo.currency,
      localizedCtaText,
      suggestedBank,
      suggestedPaymentMethod,
      outputFilename,
      outputPath
    };
  }

  private async getGeoData(geoId: string): Promise<any> {
    const geosPath = path.join(__dirname, '../../config/geos.json');
    const geosData = await fs.readFile(geosPath, 'utf-8');
    const geosConfig = JSON.parse(geosData);
    
    return geosConfig.geos.find((geo: any) => geo.id === geoId);
  }

  private async translateCTAWithLLM(
    ctaText: string, 
    targetLanguage: string, 
    culturalElements: string[]
  ): Promise<string> {
    if (!this.llmApiKey) {
      return this.getDefaultCTA(targetLanguage);
    }

    const prompt = this.buildTranslationPrompt(ctaText, targetLanguage, culturalElements);
    
    try {
      if (this.llmProvider === 'anthropic') {
        return await this.translateWithAnthropic(prompt);
      } else {
        return await this.translateWithOpenAI(prompt);
      }
    } catch (error) {
      console.error('LLM translation failed, using fallback:', error);
      return this.getDefaultCTA(targetLanguage);
    }
  }

  private buildTranslationPrompt(
    ctaText: string, 
    targetLanguage: string, 
    culturalElements: string[]
  ): string {
    return `
Translate the following gambling/casino CTA text to ${targetLanguage}:
"${ctaText}"

Requirements:
- Keep it short and punchy (max 20 characters)
- Make it compelling for gambling audience
- Consider cultural preferences: ${culturalElements.join(', ')}
- Use native currency symbols if applicable
- Make it action-oriented and urgent

Return ONLY the translated text, no explanations.
    `.trim();
  }

  private async translateWithAnthropic(prompt: string): Promise<string> {
    // Placeholder for Anthropic API call
    // In real implementation, would use proper API client
    console.log('Translating with Anthropic:', prompt);
    
    // For now, return a placeholder
    return "JUGAR AHORA"; // Example Spanish translation
  }

  private async translateWithOpenAI(prompt: string): Promise<string> {
    // Placeholder for OpenAI API call
    console.log('Translating with OpenAI:', prompt);
    
    // For now, return a placeholder
    return "PLAY NOW";
  }

  private getDefaultCTA(language: string): string {
    const defaultCTAs: Record<string, string> = {
      'pt-BR': 'JOGAR AGORA',
      'hi-IN': 'अभी खेलें',
      'es-PE': 'JUGAR YA',
      'es-MX': 'JUGAR AHORA',
      'es-CL': 'JUGAR YA',
      'tr-TR': 'ŞİMDİ OYNA',
      'en-PH': 'PLAY NOW',
      'en-NG': 'PLAY NOW',
      'th-TH': 'เล่นเลย',
      'id-ID': 'MAIN SEKARANG'
    };

    return defaultCTAs[language] || 'PLAY NOW';
  }

  private selectBank(geoData: any): string {
    if (!geoData.top_banks || geoData.top_banks.length === 0) {
      return 'Local Bank';
    }
    
    // Select first (most popular) bank
    return geoData.top_banks[0];
  }

  private selectPaymentMethod(geoData: any): string {
    if (!geoData.payment_methods || geoData.payment_methods.length === 0) {
      return 'Card Payment';
    }
    
    // Select first (most popular) payment method
    return geoData.payment_methods[0];
  }

  private async processCreativeImage(
    sourcePath: string, 
    outputPath: string, 
    localizationData: {
      ctaText: string;
      currency: string;
      bank: string;
      paymentMethod: string;
      language: string;
    }
  ): Promise<void> {
    // For now, just copy the file
    // In a real implementation, this would use image processing
    // to overlay the localized text, replace bank names, etc.
    
    try {
      await fs.copyFile(sourcePath, outputPath);
      
      // Create a metadata file alongside the image
      const metadataPath = outputPath.replace('.png', '.json');
      const metadata = {
        sourceImage: sourcePath,
        localization: localizationData,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      
      console.log(`✓ Localized creative saved: ${outputPath}`);
    } catch (error) {
      console.error(`Error processing creative image: ${error}`);
      throw error;
    }
  }

  private async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  // Utility method to get all supported GEOs
  getAvailableGeos(): Geo[] {
    return [...this.geos];
  }

  // Method to localize for specific GEOs only
  async localizeForSpecificGeos(
    input: LocalizationInput, 
    geoIds: string[]
  ): Promise<LocalizationResult> {
    const startTime = Date.now();
    
    if (this.geos.length === 0) {
      await this.initialize();
    }

    const selectedGeos = this.geos.filter(geo => geoIds.includes(geo.id));
    if (selectedGeos.length === 0) {
      throw new Error('No valid GEOs found for the provided IDs');
    }

    await this.ensureDir(input.outputDir);

    const variants: LocalizedVariant[] = [];

    for (const geo of selectedGeos) {
      try {
        const variant = await this.createLocalizedVariant(input, geo);
        variants.push(variant);
      } catch (error) {
        console.error(`Error localizing for GEO ${geo.country}:`, error);
      }
    }

    const endTime = Date.now();

    return {
      sourceCreative: input.creativeImagePath,
      variants,
      totalGenerated: variants.length,
      processingTimeMs: endTime - startTime
    };
  }
}