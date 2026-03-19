import { CreativeLocalizer, LocalizationInput } from '../localizer';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Geo } from '../../types';

// Mock fs promises
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('CreativeLocalizer', () => {
  let localizer: CreativeLocalizer;
  let mockGeoData: any;

  beforeEach(() => {
    localizer = new CreativeLocalizer();
    
    // Mock GEO data
    mockGeoData = {
      geos: [
        {
          id: '1',
          country_code: 'BR',
          name: 'Brazil',
          language: 'pt-BR',
          currency: 'BRL',
          top_banks: ['Itaú Unibanco', 'Banco do Brasil'],
          payment_methods: ['PIX', 'Boleto'],
          gambling_preference: 'sports_betting'
        },
        {
          id: '2',
          country_code: 'IN',
          name: 'India',
          language: 'hi-IN',
          currency: 'INR',
          top_banks: ['State Bank of India', 'HDFC Bank'],
          payment_methods: ['UPI', 'Paytm'],
          gambling_preference: 'rummy_poker'
        }
      ]
    };

    // Mock file system operations
    mockFs.readFile.mockResolvedValue(JSON.stringify(mockGeoData));
    mockFs.access.mockResolvedValue(undefined);
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.copyFile.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should load GEO data successfully', async () => {
      await localizer.initialize();
      const geos = localizer.getAvailableGeos();
      
      expect(geos).toHaveLength(2);
      expect(geos[0].country).toBe('Brazil');
      expect(geos[0].language).toBe('pt-BR');
      expect(geos[0].currency).toBe('BRL');
    });

    it('should handle missing GEO file gracefully', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));
      
      await expect(localizer.initialize()).rejects.toThrow('File not found');
    });
  });

  describe('localizeCreative', () => {
    const mockInput: LocalizationInput = {
      creativeImagePath: '/path/to/creative.png',
      slot: 'test_slot',
      outputDir: '/path/to/output',
      ctaText: 'WIN BIG!',
      llmApiKey: 'test-key',
      llmProvider: 'anthropic'
    };

    it('should generate variants for all GEOs', async () => {
      const result = await localizer.localizeCreative(mockInput);
      
      expect(result.variants).toHaveLength(2);
      expect(result.totalGenerated).toBe(2);
      expect(result.sourceCreative).toBe(mockInput.creativeImagePath);
      expect(result.processingTimeMs).toBeGreaterThan(0);
    });

    it('should generate correct filenames', async () => {
      const result = await localizer.localizeCreative(mockInput);
      
      const brazilVariant = result.variants.find(v => v.geoCode === 'BR');
      const indiaVariant = result.variants.find(v => v.geoCode === 'IN');
      
      expect(brazilVariant?.outputFilename).toMatch(/test_slot_brazil_pt_\d+\.png/);
      expect(indiaVariant?.outputFilename).toMatch(/test_slot_india_hi_\d+\.png/);
    });

    it('should select appropriate banks and payment methods', async () => {
      const result = await localizer.localizeCreative(mockInput);
      
      const brazilVariant = result.variants.find(v => v.geoCode === 'BR');
      const indiaVariant = result.variants.find(v => v.geoCode === 'IN');
      
      expect(brazilVariant?.suggestedBank).toBe('Itaú Unibanco');
      expect(brazilVariant?.suggestedPaymentMethod).toBe('PIX');
      
      expect(indiaVariant?.suggestedBank).toBe('State Bank of India');
      expect(indiaVariant?.suggestedPaymentMethod).toBe('UPI');
    });

    it('should create output directory if it does not exist', async () => {
      mockFs.access.mockRejectedValueOnce(new Error('Directory not found'));
      
      await localizer.localizeCreative(mockInput);
      
      expect(mockFs.mkdir).toHaveBeenCalledWith(mockInput.outputDir, { recursive: true });
    });

    it('should continue processing even if one GEO fails', async () => {
      // Mock copy file to fail for first call (Brazil) but succeed for second (India)
      mockFs.copyFile
        .mockRejectedValueOnce(new Error('Copy failed'))
        .mockResolvedValueOnce(undefined);

      const result = await localizer.localizeCreative(mockInput);
      
      // Should still have India variant
      expect(result.variants).toHaveLength(1);
      expect(result.variants[0].geoCode).toBe('IN');
    });
  });

  describe('localizeForSpecificGeos', () => {
    const mockInput: LocalizationInput = {
      creativeImagePath: '/path/to/creative.png',
      slot: 'specific_slot',
      outputDir: '/path/to/output',
      ctaText: 'PLAY NOW!'
    };

    it('should generate variants for specified GEOs only', async () => {
      const result = await localizer.localizeForSpecificGeos(mockInput, ['1']);
      
      expect(result.variants).toHaveLength(1);
      expect(result.variants[0].geoCode).toBe('BR');
    });

    it('should throw error for invalid GEO IDs', async () => {
      await expect(
        localizer.localizeForSpecificGeos(mockInput, ['999'])
      ).rejects.toThrow('No valid GEOs found');
    });

    it('should handle multiple specific GEOs', async () => {
      const result = await localizer.localizeForSpecificGeos(mockInput, ['1', '2']);
      
      expect(result.variants).toHaveLength(2);
      expect(result.variants.map(v => v.geoCode).sort()).toEqual(['BR', 'IN']);
    });
  });

  describe('getAvailableGeos', () => {
    it('should return empty array before initialization', () => {
      const freshLocalizer = new CreativeLocalizer();
      const geos = freshLocalizer.getAvailableGeos();
      
      expect(geos).toHaveLength(0);
    });

    it('should return GEOs after initialization', async () => {
      await localizer.initialize();
      const geos = localizer.getAvailableGeos();
      
      expect(geos).toHaveLength(2);
      expect(geos[0]).toHaveProperty('id', '1');
      expect(geos[0]).toHaveProperty('country', 'Brazil');
    });
  });

  describe('CTA Translation', () => {
    it('should use default CTA when no LLM key provided', async () => {
      const input: LocalizationInput = {
        creativeImagePath: '/path/to/creative.png',
        slot: 'test_slot',
        outputDir: '/path/to/output',
        ctaText: 'WIN BIG!'
        // No llmApiKey
      };

      const result = await localizer.localizeCreative(input);
      
      const brazilVariant = result.variants.find(v => v.geoCode === 'BR');
      const indiaVariant = result.variants.find(v => v.geoCode === 'IN');
      
      expect(brazilVariant?.localizedCtaText).toBe('JOGAR AGORA');
      expect(indiaVariant?.localizedCtaText).toBe('अभी खेलें');
    });

    it('should handle empty CTA text gracefully', async () => {
      const input: LocalizationInput = {
        creativeImagePath: '/path/to/creative.png',
        slot: 'test_slot',
        outputDir: '/path/to/output'
        // No ctaText
      };

      const result = await localizer.localizeCreative(input);
      
      expect(result.variants).toHaveLength(2);
      // Should still generate variants with empty CTA
      result.variants.forEach(variant => {
        expect(variant.localizedCtaText).toBe('');
      });
    });
  });

  describe('File Processing', () => {
    it('should create metadata file alongside image', async () => {
      const mockInput: LocalizationInput = {
        creativeImagePath: '/path/to/creative.png',
        slot: 'test_slot',
        outputDir: '/path/to/output',
        ctaText: 'WIN BIG!'
      };

      await localizer.localizeCreative(mockInput);
      
      // Check that writeFile was called for metadata
      const writeFileCalls = mockFs.writeFile.mock.calls;
      const metadataCall = writeFileCalls.find(call => 
        typeof call[0] === 'string' && call[0].endsWith('.json')
      );
      
      expect(metadataCall).toBeDefined();
      if (metadataCall) {
        const metadataContent = JSON.parse(metadataCall[1] as string);
        expect(metadataContent).toHaveProperty('sourceImage');
        expect(metadataContent).toHaveProperty('localization');
        expect(metadataContent).toHaveProperty('generatedAt');
        expect(metadataContent).toHaveProperty('version', '1.0');
      }
    });
  });
});