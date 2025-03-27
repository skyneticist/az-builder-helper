/**
 * This module contains the logic to scaffold a new Pulumi project using Azure Builder.
 * It creates the project directory, processes template files (including .gitignore),
 * copies over resource examples (if needed), and executes `npm install` in the new directory.
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { renderTemplate } from '../utils/templateUtils.js';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Recreate __filename and __dirname in ES module scope.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.join(__dirname, '../templates/pulumi');
const templateFiles = fs.readdirSync(templatesDir).filter(file => file.endsWith('.tpl'));

/**
 * Creates a new project with the specified name by setting up the necessary directory structure,
 * rendering templates, and initializing essential project files and configurations.
 *
 * The function performs the following steps:
 * 1. Verifies if a project directory with the given name already exists. If it does, an error is logged, and the process exits.
 * 2. Creates the project directory.
 * 3. Reads and processes template files from the predefined templates directory.
 * 4. Renders the project templates into the newly created project directory.
 * 5. Copies example files into the project directory.
 * 6. Generates a `.gitignore` file based on the templates.
 * 7. Creates a default `package.json` file for the project.
 * 8. Initializes a Git repository in the project directory.
 * 9. Installs the required npm dependencies for the project.
 *
 * @param projectName - The name of the project to be created. This will also be used as the name of the project directory.
 * @throws Will terminate the process if the project directory already exists.
 */
export function createProject(projectName: string): void {
    const projectDir = path.join(process.cwd(), projectName);

    // Check if the project directory already exists.
    if (fs.existsSync(projectDir)) {
        console.error(chalk.red(`Error: Project directory "${projectName}" already exists.`));
        process.exit(1);
    }

    createProjectDirectory(projectDir);
    renderProjectTemplates(templateFiles, templatesDir, projectDir, projectName);
    copyExamplesDirectory(projectDir);
    createGitIgnore(templatesDir, projectDir, projectName);
    createDefaultPackageJson(projectDir, projectName);
    initializeGitRepository(projectDir);
    installNpmDependencies(projectDir, projectName);
}

/**
 * Creates the project directory at the specified path.
 * If the directory already exists, it will not throw an error due to the `recursive` option.
 * Logs a success message upon creation.
 *
 * @param projectDir - The absolute path to the project directory to be created.
 */
function createProjectDirectory(projectDir: string) {
    fs.mkdirSync(projectDir, { recursive: true });
    console.log(chalk.green(`\nCreated project directory: ${chalk.magenta(projectDir)}`));
}

/**
 * Installs npm dependencies for a given project directory and provides
 * helpful next steps upon successful installation.
 *
 * @param projectDir - The absolute path to the project directory where npm dependencies should be installed.
 * @param projectName - The name of the project, used to display next steps after installation.
 *
 * This function spawns a child process to run `npm install` in the specified
 * project directory. If the installation is successful, it logs a series of
 * next steps for the user to follow, including navigating to the project
 * directory, initializing Pulumi stacks, and exploring example resources.
 * If the installation fails, it logs an error message with the exit code.
 */
function installNpmDependencies(projectDir: string, projectName: string) {
    console.log(chalk.cyan('Installing npm dependencies...'));
    const npmInstall = spawn('npm', ['install'], { cwd: projectDir, stdio: 'inherit' });

    npmInstall.on('close', (code) => {
        if (code === 0) {
            console.log(chalk.green('\nProject setup complete!'));
            console.log(chalk.bold.cyan('\nNext steps:\n'));
            console.log(chalk.blue(`1. cd ${projectName}`));
            console.log(chalk.blue('2. Create any new necessary Pulumi stacks using the pulumi CLI (e.g., pulumi stack init <stack-name>).'));
            console.log(chalk.blue('3. Check out the "examples" folder in your new project for resource usage ideas!'));
            console.log(chalk.blue('4. Enjoy building your Pulumi project!\n'));
        } else {
            console.error(chalk.red(`npm install failed with exit code ${code}.`));
        }
    });
}

/**
 * Initializes a Git repository in the specified project directory.
 *
 * This function spawns a child process to run the `git init` command
 * in the given directory. If the initialization is successful, it will
 * proceed silently (or optionally log success if verbose logging is enabled).
 * If the initialization fails, an error message will be logged to the console.
 *
 * @param projectDir - The absolute path to the directory where the Git repository
 *                     should be initialized. This directory must exist prior to
 *                     calling this function.
 */
function initializeGitRepository(projectDir: string) {
    const gitInit = spawn('git', ['init'], { cwd: projectDir, stdio: 'inherit' });
    gitInit.on('close', (gitCode) => {
        if (gitCode === 0) {
            // if (verbose) console.log(chalk.green('Git repository initialized!'));
        } else {
            console.error(chalk.red(`git init failed with exit code ${gitCode}.`));
        }
    });
}

/**
 * Creates a default `package.json` file in the specified project directory if it does not already exist.
 * The generated `package.json` includes basic metadata, a start script, and a dependency on lodash.
 *
 * @param projectDir - The directory where the `package.json` file will be created.
 * @param projectName - The name of the project to be used as the `name` field in the `package.json`.
 */
function createDefaultPackageJson(projectDir: string, projectName: string) {
    const packageJsonPath = path.join(projectDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        const defaultPackageJson = {
            name: projectName,
            version: "1.0.0",
            description: `Pulumi project created with Azure Builder Helper`,
            main: "index.js",
            scripts: {
                start: "node index.js"
            },
            dependencies: {
                // Using lodash as a lightweight test dependency
                "lodash": "^4.17.21"
            }
        };

        fs.writeFileSync(packageJsonPath, JSON.stringify(defaultPackageJson, null, 2), 'utf8');
        // if (verbose) console.log(chalk.blue('Created default package.json with lodash dependency.\n'));
    }
}

function renderProjectTemplates(templateFiles: string[], templatesDir: string, projectDir: string, projectName: string) {
    templateFiles.forEach((templateFile) => {
        const templatePath = path.join(templatesDir, templateFile);
        const outputFileName = templateFile.replace('.tpl', '');
        const outputPath = path.join(projectDir, outputFileName);

        if (!fs.existsSync(templatePath)) {
            console.error(chalk.red(`Template file not found: ${templatePath}`));
            process.exit(1);
        }

        // Read and render the template.
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const renderedContent = renderTemplate(templateContent, { projectName });

        // Write the rendered content to the new project directory.
        fs.writeFileSync(outputPath, renderedContent);
    });
}

function copyExamplesDirectory(projectDir: string) {
    const examplesSrc = path.join(__dirname, '../../../examples');
    const examplesDest = path.join(projectDir, 'examples');
    if (fs.existsSync(examplesSrc)) {
        copyDirectoryRecursive(examplesSrc, examplesDest);
        console.log(chalk.yellow('\nCopied resource examples to project.\n'));
    } else {
        console.warn(chalk.yellow('\nNo examples directory found to copy.\n'));
    }
}

function createGitIgnore(templatesDir: string, projectDir: string, projectName: string) {
    const gitignoreTemplatePath = path.join(templatesDir, '.gitignore.tpl');
    const gitignoreDestPath = path.join(projectDir, '.gitignore');
    if (fs.existsSync(gitignoreTemplatePath)) {
        const gitignoreContent = fs.readFileSync(gitignoreTemplatePath, 'utf8');
        fs.writeFileSync(gitignoreDestPath, renderTemplate(gitignoreContent, { projectName }));
        // if (verbose) console.log(chalk.blue('Created .gitignore from template.'));
    } else {
        // Fallback: create a default .gitignore if no template exists.
        const defaultGitignore = "node_modules/ \n dist/ \n";
        fs.writeFileSync(gitignoreDestPath, defaultGitignore);
        // if (verbose) console.log(chalk.blue('Created default .gitignore.'));
    }
}

/**
 * Recursively copies files and directories from a source to a destination.
 * @param src - Source directory path.
 * @param dest - Destination directory path.
 */
function copyDirectoryRecursive(src: string, dest: string): void {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectoryRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

