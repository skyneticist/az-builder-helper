/**
 * Utility functions for file system operations.
 */

import chalk from 'chalk';
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

/**
 * Checks if a path already exists. If it does, logs an error message and exits the process.
 * 
 * @param path - The path to check for existence.
 */
export function confirmPathIsFree(path: string) {
    if (fs.existsSync(path)) {
        console.error(chalk.red(`Error: Project directory "${path}" already exists.`));
        process.exit(1);
    }
}

/**
 * Ensures that a directory exists. If it does not, logs an error message and exits the process.
 * 
 * @param directoryPath - The path to the directory to check.
 */
export function assertDirectoryExists(directoryPath: string) {
    if (!fs.existsSync(directoryPath)) {
        console.error(chalk.red(`Error: Templates directory does not exist at ${directoryPath}`));
        process.exit(1);
    }
}
