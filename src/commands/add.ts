import { Command } from 'commander';
import ora from 'ora';
import { Logger } from '../utils/logger';
import { SkillInstaller } from '../services';

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
        spinner.start('Installing skill...');

        const result = await new SkillInstaller().install({
          repoUrl,
          skillId: options.skill,
          platform: options.platform,
          outputDir: options.output,
        });

        spinner.succeed(`Installed ${result.skillName} v${result.version}`);

        console.log('');
        Logger.success(`Installed ${result.skillName} v${result.version}`);
        Logger.info(`Platform : ${result.platform}`);
        Logger.info(`File     : ${result.outputFile}`);
        Logger.info(`Config   : ${result.configPath}`);
        Logger.info(`Hash     : ${result.contentHash.slice(0, 16)}...`);
        console.log('');
      } catch (error) {
        spinner.fail('Failed');
        Logger.error((error as Error).message);
        process.exit(1);
      }
    });
}
