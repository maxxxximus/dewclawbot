/**
 * Utility functions for the Prompter system
 */

/**
 * Generate unique ID for prompts
 */
export function generateId(): string {
  return `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Convert aggression level to numeric value for calculations
 */
export function aggressionToNumeric(level: 'easy' | 'medium' | 'hard'): number {
  const mapping = { easy: 1, medium: 2, hard: 3 };
  return mapping[level];
}

/**
 * Shuffle array in place
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Clean and normalize text input
 */
export function normalizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-.,!?]/g, '');
}

/**
 * Validate geo data
 */
export function validateGeo(geo: any): boolean {
  return !!(
    geo &&
    geo.id &&
    geo.country &&
    geo.language &&
    geo.currency
  );
}

/**
 * Validate slot data
 */
export function validateSlot(slot: any): boolean {
  return !!(
    slot &&
    slot.id &&
    slot.name &&
    slot.category
  );
}

/**
 * Get supported languages list
 */
export function getSupportedLanguages(): string[] {
  return ['en', 'uk', 'ru', 'de', 'es', 'fr', 'pt', 'it'];
}

/**
 * Format timestamp for metadata
 */
export function formatTimestamp(date?: Date): string {
  return (date || new Date()).toISOString();
}

/**
 * Calculate similarity between two strings (simple)
 */
export function stringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  static start(label: string): void {
    this.timers.set(label, Date.now());
  }

  static end(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      throw new Error(`No timer found for label: ${label}`);
    }
    
    const duration = Date.now() - startTime;
    this.timers.delete(label);
    return duration;
  }

  static measure<T>(label: string, fn: () => T): { result: T; duration: number } {
    this.start(label);
    const result = fn();
    const duration = this.end(label);
    return { result, duration };
  }
}

/**
 * Error handling utilities
 */
export class PrompterError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PrompterError';
  }
}

export function createError(code: string, message: string, details?: any): PrompterError {
  return new PrompterError(message, code, details);
}

/**
 * Logging utilities
 */
export class Logger {
  private static enabled = process.env.NODE_ENV !== 'production';

  static log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    console.log(JSON.stringify(logEntry));
  }

  static info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  static warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  static error(message: string, data?: any): void {
    this.log('error', message, data);
  }
}