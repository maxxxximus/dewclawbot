import { GeminiClient } from '../image-generator';
import { GeminiAdapter } from '../../apis/adapters';
import { GeneratedPrompt, StyleTemplate, AggressionLevel, Format } from '../../types';

// Mock fetch
global.fetch = jest.fn();

describe('GeminiClient', () => {
  let client: GeminiClient;
  let mockPrompt: GeneratedPrompt;

  beforeEach(() => {
    client = new GeminiClient(
      'test-api-key',
      'https://test-proxy.com/gemini',
      'test-secret',
      true
    );

    mockPrompt = {
      id: 'test-gemini-1',
      prompt_text: 'Create a luxury casino advertisement with gold and black colors',
      style: 'luxury_casino',
      composition: 'centered, elegant',
      colors: ['#FFD700', '#000000'],
      cta_text: 'Play Now',
      api_specific_params: {
        responseMimeType: "application/json",
        responseModalities: ["TEXT", "IMAGE"],
        temperature: 0.7,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      },
      metadata: {
        slot_id: 'casino_luxury',
        geo_id: 'us',
        aggression_level: 'hard',
        format: '1080x1080',
        generated_at: '2024-03-19T15:00:00.000Z'
      }
    };

    jest.clearAllMocks();
  });

  describe('Proxy Generation', () => {
    it('should successfully generate image via proxy', async () => {
      const mockImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const mockApiResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Generated a luxury casino image'
                },
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: mockImageData
                  }
                }
              ]
            }
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      });

      const result = await client.generateImage(mockPrompt);

      expect(fetch).toHaveBeenCalledWith('https://test-proxy.com/gemini', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-secret',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: mockPrompt.prompt_text,
          generationConfig: mockPrompt.api_specific_params.generationConfig,
          safetySettings: undefined
        })
      });

      expect(result.imageData).toEqual(Buffer.from(mockImageData, 'base64'));
      expect(result.metadata.source).toBe('proxy');
      expect(result.metadata.mime_type).toBe('image/png');
    });

    it('should fallback to direct API when proxy fails', async () => {
      // Mock proxy failure
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Proxy unavailable'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      inlineData: {
                        mimeType: 'image/png',
                        data: 'test-image-data'
                      }
                    }
                  ]
                }
              }
            ]
          })
        });

      const result = await client.generateImage(mockPrompt);
      expect(result.metadata.source).toBe('direct');
    });
  });

  describe('Direct API Generation', () => {
    it('should generate image via direct API when proxy disabled', async () => {
      const directClient = new GeminiClient('test-api-key', undefined, undefined, false);
      
      const mockApiResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: 'direct-api-image'
                  }
                }
              ]
            }
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      });

      const result = await directClient.generateImage(mockPrompt);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      expect(result.metadata.source).toBe('direct');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing candidates in response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [] })
      });

      await expect(client.generateImage(mockPrompt))
        .rejects.toThrow('No candidates in Gemini API response');
    });

    it('should handle missing image data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [
            {
              content: {
                parts: [
                  { text: 'Only text response' }
                ]
              }
            }
          ]
        })
      });

      await expect(client.generateImage(mockPrompt))
        .rejects.toThrow('No image data found in Gemini response');
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve('Rate limit exceeded')
      });

      await expect(client.generateImage(mockPrompt))
        .rejects.toThrow('Gemini Proxy error: 429');
    });
  });
});

describe('GeminiAdapter', () => {
  let adapter: GeminiAdapter;
  let mockStyle: StyleTemplate;

  beforeEach(() => {
    adapter = new GeminiAdapter();
    
    mockStyle = {
      name: 'luxury_casino',
      description: 'elegant luxury casino aesthetic',
      colors: ['#FFD700', '#8B0000', '#000000'],
      composition_rules: ['centered composition', 'balanced elements'],
      typography: 'elegant serif fonts',
      visual_elements: ['gold accents', 'playing cards', 'casino chips', 'velvet texture'],
      aggression_modifiers: {
        easy: ['inviting', 'welcoming'],
        medium: ['exciting', 'engaging'],
        hard: ['urgent', 'high-stakes', 'exclusive']
      }
    };

    jest.clearAllMocks();
  });

  describe('Prompt Formatting', () => {
    it('should format prompt correctly for square format', () => {
      const prompt = adapter.formatPrompt(
        mockStyle,
        'hard',
        '1080x1080',
        ['#FFD700', '#8B0000'],
        'luxury hotel casino interior'
      );

      expect(prompt).toContain('square aspect ratio (1:1)');
      expect(prompt).toContain('elegant luxury casino aesthetic');
      expect(prompt).toContain('luxury_casino aesthetic');
      expect(prompt).toContain('urgent, high-stakes, exclusive');
      expect(prompt).toContain('golden yellow, dark crimson red');
      expect(prompt).toContain('luxury hotel casino interior');
      expect(prompt).toContain('photorealistic');
    });

    it('should format prompt correctly for vertical format', () => {
      const prompt = adapter.formatPrompt(
        mockStyle,
        'medium',
        '9:16',
        ['#FFD700']
      );

      expect(prompt).toContain('vertical aspect ratio (9:16)');
      expect(prompt).toContain('exciting, engaging');
      expect(prompt).toContain('vertical hierarchy');
    });

    it('should handle unknown hex colors gracefully', () => {
      const prompt = adapter.formatPrompt(
        mockStyle,
        'easy',
        '1080x1080',
        ['#UNKNOWN']
      );

      expect(prompt).toContain('#UNKNOWN');
    });
  });

  describe('API Parameters', () => {
    it('should return correct API parameters for square format', () => {
      const params = adapter.getApiParams('1080x1080');

      expect(params).toEqual({
        responseMimeType: "application/json",
        responseModalities: ["TEXT", "IMAGE"],
        temperature: 0.7,
        maxOutputTokens: 2048,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      });
    });

    it('should return same parameters for vertical format', () => {
      const params = adapter.getApiParams('9:16');
      expect(params.responseMimeType).toBe("application/json");
      expect(params.responseModalities).toContain("IMAGE");
    });
  });

  describe('CTA Formatting', () => {
    it('should format CTA based on style', () => {
      const luxuryCTA = adapter.formatCTA('Play Now', {
        ...mockStyle,
        name: 'luxury_elegant'
      });
      expect(luxuryCTA).toContain('elegant and sophisticated');

      const neonCTA = adapter.formatCTA('Bet Now', {
        ...mockStyle,
        name: 'neon_bright'
      });
      expect(neonCTA).toContain('bright and energetic');

      const minimalCTA = adapter.formatCTA('Join', {
        ...mockStyle,
        name: 'minimal_clean'
      });
      expect(minimalCTA).toContain('clean and simple');
    });
  });

  describe('Color Conversion', () => {
    it('should convert common hex colors to descriptions', () => {
      const prompt = adapter.formatPrompt(
        mockStyle,
        'medium',
        '1080x1080',
        ['#FF0080', '#00FFFF', '#FFD700']
      );

      expect(prompt).toContain('bright magenta pink');
      expect(prompt).toContain('electric cyan blue');
      expect(prompt).toContain('golden yellow');
    });
  });
});