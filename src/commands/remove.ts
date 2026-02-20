import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { Logger } from '../utils/logger';
import { ConfigManager } from '../utils/config';
import { AdapterFactory } from '../adapters';

export function removeCommand(program: Command): void {
  program
    .command('remove <skill-id>')
    .description('Remove an installed skill')
    .option('-o, --output <path>', 'Directory where skill files are installed (default: .)')
    .action(async (skillId: string, options) => {
      try {
        const configManager = new ConfigManager();
        const config = await configManager.load();

        const installed = config.installedSkills.find(s => s.id === skillId);

        if (!installed) {
          Logger.error(`Skill "${skillId}" is not installed`);
          if (config.installedSkills.length > 0) {
            Logger.info('Installed skills:');
            config.installedSkills.forEach(s => Logger.log(`  - ${s.id}`));
          }
          process.exit(1);
        }

        // Remove generated file
        const outputDir = options.output || '.';
        const adapter = AdapterFactory.getAdapter(installed.platform);
        const outputFile = path.join(outputDir, adapter.filename);

        if (fs.existsSync(outputFile)) {
          await fs.remove(outputFile);
          Logger.success(`Removed file: ${outputFile}`);
        }

        // Remove from config
        await configManager.removeInstalledSkill(skillId);

        console.log('');
        Logger.success(`Removed skill: ${skillId}`);
        console.log('');
      } catch (error) {
        Logger.error((error as Error).message);
        process.exit(1);
      }
    });
}
