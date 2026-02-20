import { BaseAdapter } from './base';
import { Skill, Platform } from '../types';

/**
 * Windsurf IDE adapter
 * Similar to Cursor
 */
export class WindsurfAdapter extends BaseAdapter {
  platform: Platform = 'windsurf';
  filename = '.windsurfrules';

  transform(skill: Skill): string {
    // Windsurf uses similar format to Cursor
    return this.extractRulesOnly(skill);
  }
}
