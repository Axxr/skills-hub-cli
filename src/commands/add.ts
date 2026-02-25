import { Command } from 'commander';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { Logger } from '../utils/logger';
import { ConfigManager } from '../utils/config';
import { PlatformDetector } from '../detectors/platform-detector';
import { GitHubClient } from '../providers/github-client';
import { AdapterFactory } from '../adapters';
import { Platform, Skill, PlatformConfig } from '../types';

/**
 * [SEC-1] Verifica que el archivo de destino esté dentro del directorio permitido.
 * Previene ataques de Path Traversal mediante rutas relativas como "../../etc".
 */
function safeOutputPath(outputDir: string, filename: string): string {
  // Rechazar si el filename contiene segmentos '..' (doble punto)
  const normalizedFilename = path.normalize(filename);
  if (normalizedFilename.includes('..')) {
    throw new Error(
      `[Seguridad] Nombre de archivo no válido: "${filename}" contiene rutas relativas inseguras`
    );
  }
  const resolvedDir = path.resolve(outputDir);
  const resolvedFile = path.resolve(resolvedDir, normalizedFilename);
  if (!resolvedFile.startsWith(resolvedDir + path.sep) && resolvedFile !== resolvedDir) {
    throw new Error(
      `[Seguridad] Ruta de destino fuera del directorio permitido:\n  Permitido: ${resolvedDir}\n  Recibido:  ${resolvedFile}`
    );
  }
  return resolvedFile;
}

export function addCommand(program: Command): void {
  program
    .command('add <repo-url>')
    .description('Install a skill from a GitHub repository')
    .requiredOption('--skill <id>', 'Skill ID to install')
    .option('-p, --platform <platform>', 'Target platform (cursor, claude, openai, windsurf)')
    .option('-o, --output <path>', 'Output directory (default: current directory)')
    .action(async (repoUrl: string, options) => {
      const spinner = ora();

      try {
        // Determine platform
        let platform: Platform;

        if (options.platform) {
          if (!AdapterFactory.isSupported(options.platform)) {
            Logger.error(`Unsupported platform: ${options.platform}`);
            Logger.info('Supported: cursor, claude, openai, windsurf');
            process.exit(1);
          }
          platform = options.platform as Platform;
        } else {
          spinner.start('Detecting platform...');
          const detector = new PlatformDetector();
          const detection = detector.detect();

          if (!detection.platform) {
            spinner.fail('Could not detect platform');
            Logger.error('Specify platform with --platform flag');
            Logger.info(`Example: skills add ${repoUrl} --skill ${options.skill} --platform cursor`);
            process.exit(1);
          }

          platform = detection.platform;
          spinner.succeed(`Detected platform: ${platform}`);
        }

        // Download skill from GitHub
        spinner.start(`Fetching "${options.skill}" from ${repoUrl}...`);
        const client = new GitHubClient(repoUrl);
        const { metadata, readme, rulesContent, contentHash } = await client.downloadSkill(options.skill);
        spinner.succeed(`Downloaded: ${metadata.name} v${metadata.version}`);
        spinner.succeed(`Integridad verificada: ${contentHash.slice(0, 16)}...`);

        // Normalize platforms field to PlatformConfig format
        const platforms = normalizePlatforms(metadata.platforms);

        // Build Skill object for adapter
        const skill: Skill = {
          ...metadata,
          platforms,
          readme,
          rulesContent,
          path: `skills/${options.skill}`,
        };

        // Transform with platform adapter
        spinner.start(`Transforming for ${platform}...`);
        const adapter = AdapterFactory.getAdapter(platform);
        const transformed = adapter.transform(skill);
        spinner.succeed('Transformed');

        // Write output file — [SEC-1] ruta validada contra path traversal
        const outputDir = options.output || '.';
        const outputFile = safeOutputPath(outputDir, adapter.filename);
        await fs.ensureDir(path.dirname(outputFile));
        await fs.writeFile(outputFile, transformed, 'utf-8');

        // Save to local config — [SEC-6] se guarda el hash de integridad
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

        console.log('');
        Logger.success(`Installed ${metadata.name} v${metadata.version}`);
        Logger.info(`Platform : ${platform}`);
        Logger.info(`File     : ${outputFile}`);
        Logger.info(`Config   : ${configManager.getPath()}`);
        console.log('');
      } catch (error) {
        spinner.fail('Failed');
        Logger.error((error as Error).message);
        process.exit(1);
      }
    });
}

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
