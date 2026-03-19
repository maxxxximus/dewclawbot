import { ImageGenerator, NanoBananaProClient, RecraftClient } from '../image-generator';
import { GeneratedPrompt } from '../../types';
import { promises as fs } from 'fs';
import { join } from 'path';

// Mock fs for testing
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn()
  }
}));

// Mock fetch
global.fetch = jest.fn();

describe('ImageGenerator', () => {
  let generator: ImageGenerator;
  let mockPrompt: GeneratedPrompt;

  beforeEach(() => {
    generator = new ImageGenerator({
      outputDir: 'test-output',
      maxRetries: 2,
      batchSize: 2,
      timeout: 5000
    });

    mockPrompt = {
      id: 'test-prompt-1',
      prompt_text: 'Test gambling creative with neon colors',
      style: 'neon_casino',
      composition: 'centered, bold',
      colors: ['#FF0080', '#00FFFF'],
      cta_text: 'Play Now',
      api_specific_params: {
        width: 1080,
        height: 1080,
        steps: 30
      },
      metadata: {
        slot_id: 'casino_classic',
        geo_id: 'ua',
        aggression_level: 'hard',
        format: '1080x1080',
        generated_at: '2024-03-19T15:00:00.000Z'
      }
    };

    // Clear mocks
    jest.clearAllMocks();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with default config', () => {
      const defaultGenerator = new ImageGenerator();
      expect(defaultGenerator).toBeDefined();
    });

    it('should merge custom config with defaults', () => {
      const customGenerator = new ImageGenerator({
        maxRetries: 5,
        batchSize: 10
      });
      expect(customGenerator).toBeDefined();
    });
  });

  describe('API Key Validation', () => {
    beforeEach(() => {
      // Clear environment variables
      delete process.env.NANO_BANANA_API_KEY;
      delete process.env.RECRAFT_API_KEY;
    });

    it('should detect available API keys', () => {
      process.env.NANO_BANANA_API_KEY = 'test-nano-key';
      process.env.RECRAFT_API_KEY = 'test-recraft-key';
      
      const generator = new ImageGenerator();
      const validation = generator.validateApiKeys();
      
      expect(validation.nano_banana_pro).toBe(true);
      expect(validation.recraft).toBe(true);
    });

    it('should detect missing API keys', () => {
      const validation = generator.validateApiKeys();
      expect(validation.nano_banana_pro).toBe(false);
      expect(validation.recraft).toBe(false);
    });
  });

  describe('Filename Generation', () => {
    it('should generate correct filename format', () => {
      const filename = (generator as any).generateFilename(mockPrompt, 1);
      expect(filename).toBe('casino_classic_ua_neon_casino_1.png');
    });

    it('should handle special characters in style names', () => {
      mockPrompt.style = 'Luxury & Elegant Style!';
      const filename = (generator as any).generateFilename(mockPrompt, 2);
      expect(filename).toBe('casino_classic_ua_luxury___elegant_style__2.png');
    });
  });

  describe('Output Directory', () => {
    it('should create output directory if it does not exist', async () => {
      (fs.access as jest.Mock).mockRejectedValue(new Error('Directory not found'));
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

      await (generator as any).ensureOutputDirectory();

      expect(fs.mkdir).toHaveBeenCalledWith('test-output', { recursive: true });
    });

    it('should not create directory if it exists', async () => {
      (fs.access as jest.Mock).mockResolvedValue(undefined);

      await (generator as any).ensureOutputDirectory();

      expect(fs.mkdir).not.toHaveBeenCalled();
    });
  });
});

describe('NanoBananaProClient', () => {
  let client: NanoBananaProClient;
  let mockPrompt: GeneratedPrompt;

  beforeEach(() => {
    client = new NanoBananaProClient('test-api-key');
    mockPrompt = {
      id: 'test-1',
      prompt_text: 'Casino neon creative',
      style: 'neon',
      composition: 'centered',
      colors: ['#FF0080'],
      cta_text: 'Play Now',
      api_specific_params: { width: 1080, height: 1080, seed: 12345 },
      metadata: {
        slot_id: 'casino',
        geo_id: 'ua',
        aggression_level: 'hard',
        format: '1080x1080',
        generated_at: '2024-03-19T15:00:00.000Z'
      }
    };

    jest.clearAllMocks();
  });

  it('should make correct API request', async () => {
    const mockApiResponse = {
      id: 'gen-123',
      image_url: 'https://example.com/image.png'
    };

    const mockImageData = Buffer.from('fake-image-data');

    // Mock API response
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      })
      // Mock image download
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageData.buffer)
      });

    const result = await client.generateImage(mockPrompt);

    expect(fetch).toHaveBeenCalledWith('https://api.nano-banana.pro/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: mockPrompt.prompt_text,
        width: 1080,
        height: 1080,
        seed: 12345,
        cta_text: 'Play Now'
      })
    });

    expect(result.imageData).toEqual(mockImageData);
    expect(result.metadata.api_response).toEqual(mockApiResponse);
  });

  it('should handle API errors', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request'
    });

    await expect(client.generateImage(mockPrompt))
      .rejects.toThrow('Nano Banana Pro API error: 400 Bad Request');
  });

  it('should handle missing image URL', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'gen-123' }) // no image_url
    });

    await expect(client.generateImage(mockPrompt))
      .rejects.toThrow('No image URL in API response');
  });
});

describe('RecraftClient', () => {
  let client: RecraftClient;
  let mockPrompt: GeneratedPrompt;

  beforeEach(() => {
    client = new RecraftClient('test-recraft-key');
    mockPrompt = {
      id: 'test-1',
      prompt_text: 'Sports betting creative',
      style: 'dynamic',
      composition: 'action-packed',
      colors: ['#0080FF'],
      cta_text: 'Bet Now',
      api_specific_params: { width: 1080, height: 1920, iterations: 25 },
      metadata: {
        slot_id: 'sports',
        geo_id: 'de',
        aggression_level: 'medium',
        format: '9:16',
        generated_at: '2024-03-19T15:00:00.000Z'
      }
    };

    jest.clearAllMocks();
  });

  it('should make correct API request', async () => {
    const mockImageData = Buffer.from('fake-base64-image', 'base64');
    const mockApiResponse = {
      created: 1647901234,
      data: [{
        b64_json: mockImageData.toString('base64'),
        revised_prompt: 'Revised prompt text'
      }]
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse)
    });

    const result = await client.generateImage(mockPrompt);

    expect(fetch).toHaveBeenCalledWith('https://api.recraft.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-recraft-key',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: mockPrompt.prompt_text,
        width: 1080,
        height: 1920,
        iterations: 25,
        response_format: 'b64_json'
      })
    });

    expect(result.imageData).toEqual(mockImageData);
    expect(result.metadata.revised_prompt).toBe('Revised prompt text');
  });

  it('should handle empty response data', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] })
    });

    await expect(client.generateImage(mockPrompt))
      .rejects.toThrow('No image data in Recraft API response');
  });
});

describe('Integration Tests', () => {
  it('should handle complete generation workflow', async () => {
    // Set up environment
    process.env.NANO_BANANA_API_KEY = 'test-key';
    
    const generator = new ImageGenerator({
      outputDir: 'test-output',
      maxRetries: 1,
      batchSize: 1,
      timeout: 5000
    });

    const mockPrompts = [{
      id: 'test-1',
      prompt_text: 'Test prompt',
      style: 'test_style',
      composition: 'test',
      colors: ['#FF0000'],
      cta_text: 'Test CTA',
      api_specific_params: { width: 1080, height: 1080 },
      metadata: {
        slot_id: 'test_slot',
        geo_id: 'test_geo',
        aggression_level: 'medium' as const,
        format: '1080x1080' as const,
        generated_at: '2024-03-19T15:00:00.000Z'
      }
    }];

    // Mock successful API response
    const mockImageData = Buffer.from('test-image-data');
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'gen-1', image_url: 'https://test.com/image.png' })
      })
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageData.buffer)
      });

    // Mock file system
    (fs.access as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const result = await generator.generateImages(mockPrompts);

    expect(result.successful).toBe(1);
    expect(result.failed).toBe(0);
    expect(result.images).toHaveLength(1);
    expect(result.images[0].filename).toBe('test_slot_test_geo_test_style_1.png');
  });
});