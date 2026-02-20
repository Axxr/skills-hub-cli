import { BaseAdapter } from './base';
import { Skill, Platform } from '../types';

/**
 * OpenAI / GPT adapter
 * OpenAI custom instructions prefer conversational style
 */
export class OpenAIAdapter extends BaseAdapter {
  platform: Platform = 'openai';
  filename = 'gpt-instructions.txt';

  transform(skill: Skill): string {
    // OpenAI works best with conversational instructions
    return this.formatConversational(skill);
  }
}
