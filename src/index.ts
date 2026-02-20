#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { addCommand } from './commands/add';
import { listCommand } from './commands/list';
import { removeCommand } from './commands/remove';

const program = new Command();

const banner = `
 _____ _    _ _ _
/  ___| |  (_) | |
\\ \`--.| | ___| | |___
 \`--. \\ |/ / | | / __|
/\\__/ /   <| | | \\__ \\
\\____/|_|\\_\\_|_|_|___/
`;

program
  .name('skills')
  .description('Install AI development skills from GitHub into your editor')
  .version('1.0.0')
  .addHelpText('before', chalk.green(banner));

addCommand(program);
listCommand(program);
removeCommand(program);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
