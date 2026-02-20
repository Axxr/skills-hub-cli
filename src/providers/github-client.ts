export interface ManifestSkill {
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
  platforms: string[] | { [key: string]: { enabled: boolean } };
  rules?: string[];
  rulesCount?: number;
}

export interface Manifest {
  version: string;
  generated: string;
  repository: string;
  count: number;
  skills: ManifestSkill[];
}

export interface SkillDownload {
  metadata: ManifestSkill;
  readme: string;
  rulesContent: Record<string, string>;
}

function parseOwnerRepo(githubUrl: string): { owner: string; repo: string } {
  const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error(`Invalid GitHub URL: ${githubUrl}`);
  }
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

export class GitHubClient {
  private rawBase: string;
  private _repoUrl: string;

  constructor(repoUrl: string, branch = 'main') {
    const { owner, repo } = parseOwnerRepo(repoUrl);
    this.rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
    this._repoUrl = `https://github.com/${owner}/${repo}`;
  }

  get repoUrl(): string {
    return this._repoUrl;
  }

  async fetchManifest(): Promise<Manifest> {
    const url = `${this.rawBase}/manifest.json`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch manifest (${res.status}): ${url}`);
    }
    return res.json() as Promise<Manifest>;
  }

  async downloadSkill(skillId: string): Promise<SkillDownload> {
    const manifest = await this.fetchManifest();
    const metadata = manifest.skills.find(s => s.id === skillId);

    if (!metadata) {
      const available = manifest.skills.map(s => s.id).join(', ');
      throw new Error(
        `Skill "${skillId}" not found in manifest.\nAvailable: ${available}`
      );
    }

    // Fetch README (optional)
    let readme = '';
    try {
      const res = await fetch(`${this.rawBase}/skills/${skillId}/README.md`);
      if (res.ok) readme = await res.text();
    } catch {
      // README is optional
    }

    // Fetch skill.yaml to get rules list (manifest may not have it)
    const rules = await this.resolveRules(skillId, metadata);

    // Fetch all rules in parallel
    const rulesContent: Record<string, string> = {};
    await Promise.all(
      rules.map(async rulePath => {
        const url = `${this.rawBase}/skills/${skillId}/${rulePath}`;
        const res = await fetch(url);
        if (res.ok) {
          rulesContent[rulePath] = await res.text();
        }
      })
    );

    return { metadata, readme, rulesContent };
  }

  private async resolveRules(
    skillId: string,
    metadata: ManifestSkill
  ): Promise<string[]> {
    // If manifest already includes rules list, use it
    if (metadata.rules && metadata.rules.length > 0) {
      return metadata.rules;
    }

    // Otherwise fetch skill.yaml to get rules
    try {
      const res = await fetch(
        `${this.rawBase}/skills/${skillId}/skill.yaml`
      );
      if (res.ok) {
        const yaml = await res.text();
        return parseRulesFromYaml(yaml);
      }
    } catch {
      // Fall through
    }

    return [];
  }
}

/** Minimal YAML rules parser — extracts the `rules:` list */
function parseRulesFromYaml(content: string): string[] {
  const rules: string[] = [];
  const lines = content.split('\n');
  let inRules = false;

  for (const line of lines) {
    if (/^rules:/.test(line)) {
      inRules = true;
      continue;
    }
    if (inRules) {
      const match = line.match(/^\s+-\s+(.+)/);
      if (match) {
        rules.push(match[1].trim().replace(/^["']|["']$/g, ''));
      } else if (line.trim() && !/^\s/.test(line)) {
        break; // Exited rules block
      }
    }
  }

  return rules;
}
