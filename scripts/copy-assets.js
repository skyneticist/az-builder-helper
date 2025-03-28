#!/usr/bin/env node
/**
 * Script to copy template assets from src/templates to dist/src/templates.
 * This ensures that non-TypeScript files (templates, etc.) are available in the build output.
 */

import path from 'path';
import { copyDirectory } from '../src/utils/fileUtils.ts';

// Define source and destination directories for templates.
const srcTemplates = path.join(process.cwd(), 'src', 'templates');
const destTemplates = path.join(process.cwd(), 'dist', 'src', 'templates');

copyDirectory(srcTemplates, destTemplates);
console.log('Template assets copied to dist.');
