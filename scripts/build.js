// This script compiles TypeScript files, 
// copies assets, and sets executable permissions for the CLI.

import { execSync } from 'child_process';
import { chmodSync } from 'fs';

try {
  console.log('Compiling TypeScript...');
  execSync('tsc', { stdio: 'inherit' });

  console.log('Copying assets:');
  execSync('node scripts/copy-assets.js', { stdio: 'inherit' });

  console.log('Setting executable permissions...');
  chmodSync('dist/cli/azbuilder.js', '755');

  console.log('Build completed successfully.');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
