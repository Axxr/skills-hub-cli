import chalk from 'chalk';

export class Logger {
  /**
   * Success message
   */
  static success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  /**
   * Error message
   */
  static error(message: string): void {
    console.log(chalk.red('✗'), message);
  }

  /**
   * Warning message
   */
  static warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  /**
   * Info message
   */
  static info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  /**
   * Plain message
   */
  static log(message: string): void {
    console.log(message);
  }

  /**
   * Terminal-style header
   */
  static header(message: string): void {
    console.log('');
    console.log(chalk.green.bold(`> ${message}`));
    console.log('');
  }

  /**
   * Terminal-style section
   */
  static section(message: string): void {
    console.log('');
    console.log(chalk.cyan(`>> ${message}`));
  }

  /**
   * Code block
   */
  static code(message: string): void {
    console.log(chalk.gray('  ' + message));
  }

  /**
   * Skill info display
   */
  static skillInfo(name: string, version: string, description: string): void {
    console.log('');
    console.log(chalk.bold.green(name), chalk.gray(`v${version}`));
    console.log(chalk.gray(description));
    console.log('');
  }
}
