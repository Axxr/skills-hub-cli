import { BaseAdapter } from './base';
import { Skill, Platform } from '../types';

/**
 * Claude Project adapter
 * Claude Projects support rich markdown with examples and structure
 */
export class ClaudeAdapter extends BaseAdapter {
  platform: Platform = 'claude';
  filename = '.claude/custom-instructions.md';

  transform(skill: Skill): string {
    // Claude benefits from full context with examples
    const sections: string[] = [];

    // Rich header
    sections.push(`# ${skill.name}`);
    sections.push('');
    sections.push(`**Version:** ${skill.version}`);
    sections.push(`**Category:** ${skill.category}`);
    sections.push(`**Author:** ${skill.author}`);
    sections.push('');
    sections.push('## Description');
    sections.push('');
    sections.push(skill.description);
    sections.push('');

    // Add tags
    if (skill.tags && skill.tags.length > 0) {
      sections.push('## Tags');
      sections.push('');
      sections.push(skill.tags.map(tag => `\`${tag}\``).join(', '));
      sections.push('');
    }

    // Add rules with full context
    sections.push('## Guidelines');
    sections.push('');
    
    for (const [rulePath, content] of Object.entries(skill.rulesContent)) {
      sections.push(content);
      sections.push('');
    }

    return sections.join('\n');
  }
}
