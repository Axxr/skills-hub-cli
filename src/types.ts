// Platform types
export type Platform =
  | 'claude'
  | 'cursor'
  | 'openai'
  | 'windsurf';

// Platform config stored in skill.yaml (object format)
export interface PlatformConfig {
  [platform: string]: {
    enabled: boolean;
    adapter?: string;
  };
}

// Full skill with content loaded — used by adapters
export interface Skill {
  id: string;
  name: string;
  version: string;
  author?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  description: string;
  difficulty?: string;
  license?: string;
  rules?: string[];
  platforms: PlatformConfig;
  readme: string;
  rulesContent: Record<string, string>;
  path: string;
}

// Adapter interface
export interface SkillAdapter {
  platform: Platform;
  filename: string;
  transform(skill: Skill): string;
}

// Local config stored in .skillsrc.json
export interface SkillsConfig {
  platform: Platform | 'auto';
  outputPath: string;
  installedSkills: InstalledSkill[];
}

export interface InstalledSkill {
  id: string;
  version: string;
  source: string;       // GitHub repo URL
  installedAt: string;
  platform: Platform;
}

// Platform detection
export interface PlatformDetectionResult {
  platform: Platform | null;
  confidence: 'high' | 'medium' | 'low';
  evidence: string[];
}
