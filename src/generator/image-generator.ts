import { promises as fs } from 'fs';
import { join } from 'path';
import { 
  GeneratedPrompt, 
  ApiType, 
  Format 
} from '../types';
import { generateId } from '../utils/helpers';

export interface ImageGenerationConfig {
  outputDir: string;
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  timeout: number; // API timeout in ms
}

export interface GeneratedImage {
  id: string;
  filename: string;
  filepath: string;
  prompt: GeneratedPrompt;
  api_response: any;
  generated_at: string;
  generation_time_ms: number;
  api_type: ApiType;
}

export interface ImageGenerationResult {
  images: GeneratedImage[];
  successful: number;
  failed: number;
  total_time_ms: number;
  errors: Array<{
    prompt_id: string;
    error: string;
    retry_count: number;
  }>;
}

export interface ApiClient {
  generateImage(prompt: GeneratedPrompt): Promise<{
    imageData: Buffer;
    metadata: any;
  }>;
}

// Nano Banana Pro API Client
export class NanoBananaProClient implements ApiClient {
  constructor(private apiKey: string, private baseUrl: string = 'https://api.nano-banana.pro/v1') {}

  async generateImage(prompt: GeneratedPrompt): Promise<{
    imageData: Buffer;
    metadata: any;
  }> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt.prompt_text,
        ...prompt.api_specific_params,
        cta_text: prompt.cta_text
      })
    });

    if (!response.ok) {
      throw new Error(`Nano Banana Pro API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // API повертає URL зображення
    if (!result.image_url) {
      throw new Error('No image URL in API response');
    }

    // Завантажуємо зображення
    const imageResponse = await fetch(result.image_url);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }

    const imageData = Buffer.from(await imageResponse.arrayBuffer());

    return {
      imageData,
      metadata: {
        api_response: result,
        generation_id: result.id,
        seed: prompt.api_specific_params.seed
      }
    };
  }
}

// Recraft API Client
export class RecraftClient implements ApiClient {
  constructor(private apiKey: string, private baseUrl: string = 'https://api.recraft.ai/v1') {}

  async generateImage(prompt: GeneratedPrompt): Promise<{
    imageData: Buffer;
    metadata: any;
  }> {
    const response = await fetch(`${this.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt.prompt_text,
        ...prompt.api_specific_params,
        response_format: 'b64_json'
      })
    });

    if (!response.ok) {
      throw new Error(`Recraft API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.data || result.data.length === 0) {
      throw new Error('No image data in Recraft API response');
    }

    // Recraft повертає base64
    const imageData = Buffer.from(result.data[0].b64_json, 'base64');

    return {
      imageData,
      metadata: {
        api_response: result,
        generation_id: result.created,
        revised_prompt: result.data[0].revised_prompt
      }
    };
  }
}

// Gemini API Client (with Cloud Function proxy support)
export class GeminiClient implements ApiClient {
  constructor(
    private apiKey: string,
    private proxyUrl?: string,
    private proxySecret?: string,
    private proxyEnabled: boolean = true
  ) {}

  async generateImage(prompt: GeneratedPrompt): Promise<{
    imageData: Buffer;
    metadata: any;
  }> {
    // Try proxy first if enabled, fallback to direct API
    if (this.proxyEnabled && this.proxyUrl && this.proxySecret) {
      try {
        return await this.generateViaProxy(prompt);
      } catch (error) {
        console.warn(`Proxy failed: ${error.message}, trying direct API...`);
      }
    }
    
    // Direct API fallback
    return await this.generateViaDirectAPI(prompt);
  }

  private async generateViaProxy(prompt: GeneratedPrompt): Promise<{
    imageData: Buffer;
    metadata: any;
  }> {
    const response = await fetch(this.proxyUrl!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.proxySecret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt.prompt_text,
        generationConfig: prompt.api_specific_params.generationConfig,
        safetySettings: prompt.api_specific_params.safetySettings
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini Proxy error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return this.processGeminiResponse(result, 'proxy');
  }

  private async generateViaDirectAPI(prompt: GeneratedPrompt): Promise<{
    imageData: Buffer;
    metadata: any;
  }> {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`;
    
    const geminiRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt.prompt_text
            }
          ]
        }
      ],
      generationConfig: prompt.api_specific_params
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini Direct API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return this.processGeminiResponse(result, 'direct');
  }

  private processGeminiResponse(result: any, source: 'proxy' | 'direct'): {
    imageData: Buffer;
    metadata: any;
  } {
    if (!result.candidates || result.candidates.length === 0) {
      throw new Error('No candidates in Gemini API response');
    }

    const candidate = result.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      throw new Error('No content parts in Gemini response');
    }

    // Шукаємо частину з зображенням (inlineData)
    const imagePart = candidate.content.parts.find((part: any) => part.inlineData);
    if (!imagePart || !imagePart.inlineData || !imagePart.inlineData.data) {
      throw new Error('No image data found in Gemini response');
    }

    // Gemini повертає base64 encoded зображення
    const imageData = Buffer.from(imagePart.inlineData.data, 'base64');

    return {
      imageData,
      metadata: {
        api_response: result,
        source,
        generation_id: Date.now().toString(),
        mime_type: imagePart.inlineData.mimeType || 'image/png',
        text_parts: candidate.content.parts.filter((part: any) => part.text).map((part: any) => part.text)
      }
    };
  }
}

export class ImageGenerator {
  private config: ImageGenerationConfig;
  private clients: Map<ApiType, ApiClient> = new Map();

  constructor(config: Partial<ImageGenerationConfig> = {}) {
    this.config = {
      outputDir: 'output/pending_review',
      maxRetries: 3,
      retryDelay: 2000,
      batchSize: 5,
      timeout: 30000,
      ...config
    };

    this.initializeClients();
  }

  private initializeClients() {
    // Ініціалізуємо клієнтів з environment variables
    const nanoBananaApiKey = process.env.NANO_BANANA_API_KEY;
    const recraftApiKey = process.env.RECRAFT_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiProxyUrl = process.env.GEMINI_PROXY_URL;
    const geminiProxySecret = process.env.GEMINI_PROXY_SECRET;
    const geminiProxyEnabled = process.env.GEMINI_PROXY_ENABLED !== 'false';

    if (nanoBananaApiKey) {
      this.clients.set('nano_banana_pro', new NanoBananaProClient(nanoBananaApiKey));
    }

    if (recraftApiKey) {
      this.clients.set('recraft', new RecraftClient(recraftApiKey));
    }

    if (geminiApiKey) {
      this.clients.set('gemini', new GeminiClient(
        geminiApiKey,
        geminiProxyUrl,
        geminiProxySecret,
        geminiProxyEnabled
      ));
    }
  }

  /**
   * Batch generation of images from prompts
   */
  async generateImages(prompts: GeneratedPrompt[]): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    const results: GeneratedImage[] = [];
    const errors: Array<{ prompt_id: string; error: string; retry_count: number }> = [];

    // Ensure output directory exists
    await this.ensureOutputDirectory();

    // Process in batches
    for (let i = 0; i < prompts.length; i += this.config.batchSize) {
      const batch = prompts.slice(i, i + this.config.batchSize);
      
      console.log(`Processing batch ${Math.floor(i / this.config.batchSize) + 1}/${Math.ceil(prompts.length / this.config.batchSize)}`);

      // Process batch in parallel
      const batchPromises = batch.map((prompt, index) => 
        this.generateSingleImage(prompt, 0, results.length + index + 1)
      );
      const batchResults = await Promise.allSettled(batchPromises);

      // Collect results and errors
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          errors.push({
            prompt_id: batch[index].id,
            error: result.reason.message,
            retry_count: 0
          });
        }
      });

      // Delay between batches to avoid rate limiting
      if (i + this.config.batchSize < prompts.length) {
        await this.delay(1000);
      }
    }

    // Save metadata
    await this.saveGenerationMetadata(results, errors);

    const totalTime = Date.now() - startTime;

    return {
      images: results,
      successful: results.length,
      failed: errors.length,
      total_time_ms: totalTime,
      errors
    };
  }

  /**
   * Generate a single image with retry logic
   */
  private async generateSingleImage(
    prompt: GeneratedPrompt,
    retryCount: number = 0,
    imageIndex: number = 1
  ): Promise<GeneratedImage> {
    const startTime = Date.now();

    try {
      // Determine API type from prompt metadata or fallback
      let apiType: ApiType = 'nano_banana_pro'; // default fallback
      
      // Try to get api_type from prompt object if available
      if ((prompt as any).api_type) {
        apiType = (prompt as any).api_type;
      } else if (prompt.metadata.slot_id.includes('nano')) {
        apiType = 'nano_banana_pro';
      } else if (prompt.metadata.slot_id.includes('recraft')) {
        apiType = 'recraft';
      }

      const client = this.clients.get(apiType);
      if (!client) {
        throw new Error(`No API client available for type: ${apiType}`);
      }

      // Generate image with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API timeout')), this.config.timeout);
      });

      const generationPromise = client.generateImage(prompt);
      const { imageData, metadata } = await Promise.race([generationPromise, timeoutPromise]) as any;

      // Generate filename
      const filename = this.generateFilename(prompt, imageIndex);
      const filepath = join(this.config.outputDir, filename);

      // Save image
      await fs.writeFile(filepath, imageData);

      const generationTime = Date.now() - startTime;

      return {
        id: generateId(),
        filename,
        filepath,
        prompt,
        api_response: metadata.api_response,
        generated_at: new Date().toISOString(),
        generation_time_ms: generationTime,
        api_type: apiType
      };

    } catch (error) {
      if (retryCount < this.config.maxRetries) {
        console.log(`Retry ${retryCount + 1}/${this.config.maxRetries} for prompt ${prompt.id}`);
        await this.delay(this.config.retryDelay * (retryCount + 1)); // exponential backoff
        return this.generateSingleImage(prompt, retryCount + 1, imageIndex);
      }

      throw error;
    }
  }

  /**
   * Generate filename based on requirements: {slot}_{geo}_{style}_{n}.png
   */
  private generateFilename(prompt: GeneratedPrompt, index: number): string {
    const slot = prompt.metadata.slot_id;
    const geo = prompt.metadata.geo_id;
    const style = prompt.style.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    return `${slot}_${geo}_${style}_${index}.png`;
  }

  /**
   * Save generation metadata to JSON file
   */
  private async saveGenerationMetadata(
    images: GeneratedImage[], 
    errors: Array<{ prompt_id: string; error: string; retry_count: number }>
  ): Promise<void> {
    const metadata = {
      generation_session: generateId(),
      timestamp: new Date().toISOString(),
      total_images: images.length,
      total_errors: errors.length,
      images: images.map(img => ({
        filename: img.filename,
        prompt_id: img.prompt.id,
        style: img.prompt.style,
        slot_id: img.prompt.metadata.slot_id,
        geo_id: img.prompt.metadata.geo_id,
        generation_time_ms: img.generation_time_ms,
        api_type: img.api_type
      })),
      errors
    };

    const metadataFile = join(
      this.config.outputDir, 
      `generation_metadata_${Date.now()}.json`
    );

    await fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2));
  }

  private async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.access(this.config.outputDir);
    } catch {
      await fs.mkdir(this.config.outputDir, { recursive: true });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate API keys are available
   */
  public validateApiKeys(): { [key in ApiType]?: boolean } {
    return {
      nano_banana_pro: this.clients.has('nano_banana_pro'),
      recraft: this.clients.has('recraft'),
      gemini: this.clients.has('gemini')
    };
  }
}

// Export singleton instance
export const imageGenerator = new ImageGenerator();