import fs from 'fs-extra';
import path from 'path';
import { SkillsConfig, InstalledSkill } from '../types';

const CONFIG_FILENAME = '.skillsrc.json';

export class ConfigManager {
  private configPath: string;

  constructor(cwd: string = process.cwd()) {
    this.configPath = path.join(cwd, CONFIG_FILENAME);
  }

  exists(): boolean {
    return fs.existsSync(this.configPath);
  }

  async load(): Promise<SkillsConfig> {
    if (!this.exists()) {
      return this.defaultConfig();
    }
    const content = await fs.readFile(this.configPath, 'utf-8');
    return JSON.parse(content) as SkillsConfig;
  }

  async save(config: SkillsConfig): Promise<void> {
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  async addInstalledSkill(skill: InstalledSkill): Promise<void> {
    const config = await this.load();
    config.installedSkills = config.installedSkills.filter(s => s.id !== skill.id);
    config.installedSkills.push(skill);
    await this.save(config);
  }

  async removeInstalledSkill(skillId: string): Promise<boolean> {
    const config = await this.load();
    const before = config.installedSkills.length;
    config.installedSkills = config.installedSkills.filter(s => s.id !== skillId);
    if (config.installedSkills.length === before) return false;
    await this.save(config);
    return true;
  }

  getPath(): string {
    return this.configPath;
  }

  private defaultConfig(): SkillsConfig {
    return {
      platform: 'auto',
      outputPath: '.',
      installedSkills: [],
    };
  }
}
