/**
 * Utility functions for file system operations.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Recursively copies all files and directories from the source path to the destination path.
 * Ensures the destination directory exists before copying.
 * 
 * @param src - Absolute path to the source directory.
 * @param dest - Absolute path to the destination directory.
 */
export function copyDirectory(src: string, dest: string): void {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            // Recursively copy subdirectories.
            copyDirectory(srcPath, destPath);
        } else {
            // Copy individual files.
            fs.copyFileSync(srcPath, destPath);
        }
    }
}