
// This script builds the project and links it globally.
// Primarily used for development purposes.

import { spawn } from 'child_process';
import { chmodSync } from 'fs';

/**
 * Runs a command with the provided arguments.
 * @param {string} command - The command to run.
 * @param {Array<string>} args - The command arguments.
 * @returns {Promise<void>}
 */
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit', shell: true });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} failed with code ${code}`));
      }
    });
  });
}

async function main() {
  try {
    console.log('Setting executable permissions for scripts...');
    chmodSync('scripts/link.js', '755');

    console.log('Running "npm run build"...');
    await runCommand('npm', ['run', 'build']);
    console.log('"npm run build" completed successfully.');

    console.log('Running "npm link"...');
    await runCommand('npm', ['link']);
    console.log('"npm link" completed successfully.');
  } catch (error) {
    console.error('Error during build and link process:', error.message);
    process.exit(1);
  }
}

main();
