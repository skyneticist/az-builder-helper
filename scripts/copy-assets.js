#!/usr/bin/env node

/**
 * Script to copy static assets (e.g., templates, examples) to the build output directory.
 */
import { execSync } from 'child_process';

try {
  console.log('Copying templates...');
  execSync('cp -R src/templates dist/templates', { stdio: 'inherit' });

  console.log('Copying examples...');
  execSync('cp -R src/examples dist/examples', { stdio: 'inherit' });

  console.log('Assets copied successfully.');
} catch (error) {
  console.error('Failed to copy assets:', error.message);
  process.exit(1);
}
