import { Command } from 'commander';
import chalk from 'chalk';
import { Logger } from '../utils/logger';
import { ConfigManager } from '../utils/config';

export function listCommand(program: Command): void {
  program
    .command('list')
    .description('List locally installed skills')
    .action(async () => {
      try {
        const configManager = new ConfigManager();
        const config = await configManager.load();

        Logger.header('Installed Skills');

        if (config.installedSkills.length === 0) {
          Logger.warn('No skills installed yet');
          console.log('');
          Logger.log('Install a skill with:');
          Logger.code('skills add https://github.com/Axxr/skills-hub --skill <id>');
          console.log('');
          return;
        }

        for (const skill of config.installedSkills) {
          console.log(
            chalk.green('  ●'),
            chalk.bold(skill.id),
            chalk.gray(`v${skill.version}`)
          );
          console.log('   ', chalk.gray(`platform : ${skill.platform}`));
          console.log('   ', chalk.gray(`source   : ${skill.source}`));
          console.log('   ', chalk.gray(`installed: ${new Date(skill.installedAt).toLocaleDateString()}`));
          console.log('');
        }

        Logger.info(`Total: ${config.installedSkills.length} skill(s)`);
        console.log('');
        Logger.log('Remove a skill with:');
        Logger.code('skills remove <skill-id>');
        console.log('');
      } catch (error) {
        Logger.error((error as Error).message);
        process.exit(1);
      }
    });
}
