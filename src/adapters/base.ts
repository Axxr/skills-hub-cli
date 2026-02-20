import { Skill, SkillAdapter, Platform } from '../types';

/**
 * Base adapter class that all platform adapters extend
 */
export abstract class BaseAdapter implements SkillAdapter {
  abstract platform: Platform;
  abstract filename: string;

  /**
   * Transform skill to platform-specific format
   */
  abstract transform(skill: Skill): string;

  /**
   * Combine all rules into a single string
   */
  protected combineRules(skill: Skill): string {
    const sections: string[] = [];

    // Add header
    sections.push(`# ${skill.name}`);
    sections.push(`Version: ${skill.version}`);
    sections.push(`Category: ${skill.category}`);
    sections.push('');
    sections.push(skill.description);
    sections.push('');

    // Add each rule section
    for (const [rulePath, content] of Object.entries(skill.rulesContent)) {
      sections.push('---');
      sections.push('');
      sections.push(content);
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Extract just the rules without metadata
   */
  protected extractRulesOnly(skill: Skill): string {
    const sections: string[] = [];

    for (const content of Object.values(skill.rulesContent)) {
      sections.push(content);
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Format as conversational instructions
   */
  protected formatConversational(skill: Skill): string {
    const sections: string[] = [];

    sections.push(`You are an expert in ${skill.category}.`);
    sections.push('');
    sections.push(skill.description);
    sections.push('');
    sections.push('Follow these guidelines:');
    sections.push('');

    for (const content of Object.values(skill.rulesContent)) {
      sections.push(content);
      sections.push('');
    }

    return sections.join('\n');
  }
}
