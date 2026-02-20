import { BaseAdapter } from './base';
import { Skill, Platform } from '../types';

/**
 * Cursor IDE adapter
 * Cursor uses .cursorrules file with plain text rules
 */
export class CursorAdapter extends BaseAdapter {
  platform: Platform = 'cursor';
  filename = '.cursorrules';

  transform(skill: Skill): string {
    // Cursor prefers concise, direct rules
    return this.extractRulesOnly(skill);
  }
}
