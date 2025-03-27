#!/usr/bin/env node
/**
 * Script to copy template assets from src/templates to dist/src/templates.
 * This ensures that non-TypeScript files (templates, etc.) are available in the build output.
 */

import fs from 'fs';
import path from 'path';

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Define source and destination directories for templates.
const srcTemplates = path.join(process.cwd(), 'src', 'templates');
const destTemplates = path.join(process.cwd(), 'dist', 'src', 'templates');

copyDirectory(srcTemplates, destTemplates);
console.log('Template assets copied to dist.');
