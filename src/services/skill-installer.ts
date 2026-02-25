import path from 'path';
import fs from 'fs-extra';
import { PlatformDetector } from '../detectors/platform-detector';
import { GitHubClient } from '../providers/github-client';
import { AdapterFactory } from '../adapters';
import { ConfigManager } from '../utils/config';
import {
    Platform,
    Skill,
    PlatformConfig,
    InstallOptions,
    InstallResult,
} from '../types';

// ---------------------------------------------------------------------------
// Lógica de instalación de un skill (extraída de commands/add.ts)
// ---------------------------------------------------------------------------

export class SkillInstaller {
    /**
     * Orquesta la instalación completa de un skill:
     * 1. Detecta / valida la plataforma
     * 2. Descarga el skill desde GitHub
     * 3. Transforma el skill con el adapter correspondiente
     * 4. Escribe el archivo de salida (con protección de path traversal)
     * 5. Persiste el registro en .skillsrc.json
     *
     * @returns `InstallResult` con los datos del skill instalado
     * @throws `Error` con mensaje descriptivo ante cualquier fallo
     */
    async install(options: InstallOptions): Promise<InstallResult> {
        const { repoUrl, skillId, outputDir = '.' } = options;

        const platform = options.platform
            ? this.validatePlatform(options.platform)
            : this.detectPlatform(repoUrl, skillId);

        const { metadata, readme, rulesContent, contentHash } =
            await new GitHubClient(repoUrl).downloadSkill(skillId);

        const skill: Skill = {
            ...metadata,
            platforms: normalizePlatforms(metadata.platforms),
            readme,
            rulesContent,
            path: `skills/${skillId}`,
        };

        const adapter = AdapterFactory.getAdapter(platform);
        const transformed = adapter.transform(skill);
        const outputFile = safeOutputPath(outputDir, adapter.filename);

        await fs.ensureDir(path.dirname(outputFile));
        await fs.writeFile(outputFile, transformed, 'utf-8');

        const configManager = new ConfigManager();
        await configManager.addInstalledSkill({
            id: metadata.id,
            version: metadata.version,
            source: repoUrl,
            installedAt: new Date().toISOString(),
            platform,
            contentHash,
            contentHashAlgorithm: 'sha-256',
        });

        return {
            skillName: metadata.name,
            version: metadata.version,
            platform,
            outputFile,
            configPath: configManager.getPath(),
            contentHash,
        };
    }

    // ----- private -----

    private validatePlatform(raw: string): Platform {
        if (!AdapterFactory.isSupported(raw)) {
            throw new Error(
                `Plataforma no soportada: "${raw}"\nSoportadas: cursor, claude, openai, windsurf`
            );
        }
        return raw as Platform;
    }

    private detectPlatform(repoUrl: string, skillId: string): Platform {
        const result = new PlatformDetector().detect();
        if (!result.platform) {
            throw new Error(
                `No se pudo detectar la plataforma.\n` +
                `Especifícala con: skills add ${repoUrl} --skill ${skillId} --platform cursor`
            );
        }
        return result.platform;
    }
}

// ---------------------------------------------------------------------------
// Helpers privados del módulo
// ---------------------------------------------------------------------------

/** [SEC-1] Asegura que el archivo de destino no salga del outputDir */
function safeOutputPath(outputDir: string, filename: string): string {
    const normalized = path.normalize(filename);
    if (normalized.includes('..')) {
        throw new Error(
            `[Seguridad] Nombre de archivo inválido: "${filename}" contiene rutas relativas inseguras`
        );
    }
    const resolvedDir = path.resolve(outputDir);
    const resolvedFile = path.resolve(resolvedDir, normalized);
    if (!resolvedFile.startsWith(resolvedDir + path.sep) && resolvedFile !== resolvedDir) {
        throw new Error(
            `[Seguridad] Ruta fuera del directorio permitido:\n  Permitido: ${resolvedDir}\n  Recibido:  ${resolvedFile}`
        );
    }
    return resolvedFile;
}

/** Normaliza el campo `platforms` del manifest al formato interno `PlatformConfig` */
function normalizePlatforms(
    platforms: string[] | { [key: string]: { enabled: boolean } } | undefined
): PlatformConfig {
    if (!platforms) return {};
    if (Array.isArray(platforms)) {
        return Object.fromEntries(platforms.map(p => [p, { enabled: true }]));
    }
    return Object.fromEntries(
        Object.entries(platforms).map(([k, v]) => [k, { enabled: v.enabled }])
    );
}
