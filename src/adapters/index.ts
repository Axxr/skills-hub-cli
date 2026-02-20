import { Platform, SkillAdapter } from '../types';
import { CursorAdapter } from './cursor';
import { ClaudeAdapter } from './claude';
import { OpenAIAdapter } from './openai';
import { WindsurfAdapter } from './windsurf';

/**
 * Factory to get the appropriate adapter for a platform
 */
export class AdapterFactory {
  private static adapters: Map<Platform, SkillAdapter> = new Map([
    ['cursor', new CursorAdapter()],
    ['claude', new ClaudeAdapter()],
    ['openai', new OpenAIAdapter()],
    ['windsurf', new WindsurfAdapter()],
  ]);

  /**
   * Get adapter for a platform
   */
  static getAdapter(platform: Platform): SkillAdapter {
    const adapter = this.adapters.get(platform);
    
    if (!adapter) {
      throw new Error(`No adapter found for platform: ${platform}`);
    }

    return adapter;
  }

  /**
   * Get all available adapters
   */
  static getAllAdapters(): SkillAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Check if platform is supported
   */
  static isSupported(platform: string): platform is Platform {
    return this.adapters.has(platform as Platform);
  }
}
