import { createHash } from 'crypto';
import { safeFetch, FETCH_LIMITS } from './safe-fetch';
import { validateManifest } from './manifest-validator';

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

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
  /** SHA-256 del contenido combinado de reglas (SEC-6) */
  contentHash: string;
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/** Extrae owner/repo validando que la URL pertenezca a github.com (SEC-3) */
function parseGitHubUrl(githubUrl: string): { owner: string; repo: string } {
  let parsed: URL;
  try {
    parsed = new URL(githubUrl);
  } catch {
    throw new Error(`URL de GitHub no válida: ${githubUrl}`);
  }

  if (parsed.hostname !== 'github.com') {
    throw new Error(`[Seguridad] Solo se aceptan URLs de github.com. Recibido: ${parsed.hostname}`);
  }

  const [owner, repoRaw] = parsed.pathname.replace(/^\//, '').split('/');
  if (!owner || !repoRaw) {
    throw new Error(`URL de GitHub con formato incorrecto: ${githubUrl}`);
  }

  return { owner, repo: repoRaw.replace(/\.git$/, '') };
}

/** SHA-256 del texto dado en formato hexadecimal (SEC-6) */
function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/** Descarga el texto de una URL; devuelve vacío si la respuesta no es OK */
async function fetchText(url: string): Promise<string> {
  const res = await safeFetch(url);
  return res.ok ? res.text() : '';
}

/** Extrae la lista `rules:` de un skill.yaml */
function parseRulesFromYaml(content: string): string[] {
  const rules: string[] = [];
  let inRulesBlock = false;

  for (const line of content.split('\n')) {
    if (/^rules:/.test(line)) { inRulesBlock = true; continue; }

    if (!inRulesBlock) continue;

    const match = line.match(/^\s+-\s+(.+)/);
    if (match) {
      rules.push(match[1].trim().replace(/^["']|["']$/g, ''));
    } else if (line.trim() && !/^\s/.test(line)) {
      break; // salimos del bloque rules:
    }
  }

  return rules;
}

// ---------------------------------------------------------------------------
// GitHubClient
// ---------------------------------------------------------------------------

export class GitHubClient {
  private readonly rawBase: string;
  private readonly _repoUrl: string;

  constructor(repoUrl: string, branch = 'main') {
    const { owner, repo } = parseGitHubUrl(repoUrl);
    this.rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
    this._repoUrl = `https://github.com/${owner}/${repo}`;
  }

  get repoUrl(): string {
    return this._repoUrl;
  }

  async fetchManifest(): Promise<Manifest> {
    const url = `${this.rawBase}/manifest.json`;
    const res = await safeFetch(url);
    if (!res.ok) throw new Error(`Error al obtener manifest (${res.status}): ${url}`);
    return validateManifest(await res.json());
  }

  async downloadSkill(skillId: string): Promise<SkillDownload> {
    const manifest = await this.fetchManifest();
    const metadata = this.findSkill(manifest, skillId);
    const readme = await this.fetchReadme(skillId);
    const rules = await this.resolveRules(skillId, metadata);
    const rulesContent = await this.fetchRules(skillId, rules);
    const contentHash = sha256(Object.values(rulesContent).join('\n'));

    return { metadata, readme, rulesContent, contentHash };
  }

  // ----- private helpers -----

  private findSkill(manifest: Manifest, skillId: string): ManifestSkill {
    const found = manifest.skills.find(s => s.id === skillId);
    if (!found) {
      const available = manifest.skills.map(s => s.id).join(', ');
      throw new Error(`Skill "${skillId}" no encontrado en el manifest.\nDisponibles: ${available}`);
    }
    return found;
  }

  private async fetchReadme(skillId: string): Promise<string> {
    try {
      return await fetchText(`${this.rawBase}/skills/${skillId}/README.md`);
    } catch {
      return ''; // README es opcional
    }
  }

  private async resolveRules(skillId: string, metadata: ManifestSkill): Promise<string[]> {
    if (metadata.rules?.length) return metadata.rules;

    try {
      const yaml = await fetchText(`${this.rawBase}/skills/${skillId}/skill.yaml`);
      return parseRulesFromYaml(yaml);
    } catch {
      return [];
    }
  }

  private async fetchRules(skillId: string, rules: string[]): Promise<Record<string, string>> {
    const limited = rules.slice(0, FETCH_LIMITS.maxRules);
    if (rules.length > FETCH_LIMITS.maxRules) {
      console.warn(`[Seguridad] Skill "${skillId}": limitado a ${FETCH_LIMITS.maxRules} reglas`);
    }

    const content: Record<string, string> = {};
    await Promise.all(
      limited.map(async rulePath => {
        try {
          content[rulePath] = await fetchText(`${this.rawBase}/skills/${skillId}/${rulePath}`);
        } catch { /* regla individual fallida, continuamos */ }
      })
    );
    return content;
  }
}
