/**
 * Handles the creation of a new Pulumi project using Azure Builder.
 * This includes setting up the directory structure, rendering templates,
 * copying example files, and initializing Git and npm dependencies.
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { renderTemplate } from '../utils/templateUtils.js';
import { copyDirectory } from '../utils/fileUtils.js';

// Resolve __filename and __dirname for ES module compatibility.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.join(__dirname, '../templates/pulumi');
const templateFiles = fs.readdirSync(templatesDir).filter(file => file.endsWith('.tpl'));

/**
 * Creates a new Pulumi project.
 * 
 * @param projectName - Name of the project and its directory.
 * Terminates the process if the directory already exists.
 */
export function createProject(projectName: string): void {
    const projectDir = path.join(process.cwd(), projectName);

    if (fs.existsSync(projectDir)) {
        console.error(chalk.red(`Error: Project directory "${projectName}" already exists.`));
        process.exit(1);
    }

    createProjectDirectory(projectDir);
    initializeGitRepository(projectDir);
    renderProjectTemplates(templateFiles, templatesDir, projectDir, projectName);
    copyExamplesDirectory(projectDir);
    createGitIgnore(templatesDir, projectDir, projectName);
    createDefaultPackageJson(projectDir, projectName);
    installNpmDependencies(projectDir, projectName);
}

/**
 * Creates the project directory if it doesn't already exist.
 * 
 * @param projectDir - Absolute path to the project directory.
 */
function createProjectDirectory(projectDir: string) {
    fs.mkdirSync(projectDir, { recursive: true });
    console.log(chalk.green(`\nCreated project directory: ${chalk.magenta(projectDir)}`));
}

/**
 * Runs `npm install` in the project directory to install dependencies.
 * Logs next steps for the user upon success.
 * 
 * @param projectDir - Absolute path to the project directory.
 * @param projectName - Name of the project (used in next steps).
 */
function installNpmDependencies(projectDir: string, projectName: string) {
    console.log(chalk.cyan('Installing npm dependencies...'));
    const npmInstall = spawn('npm', ['install'], { cwd: projectDir, stdio: 'inherit' });

    npmInstall.on('close', (code) => {
        if (code === 0) {
            console.log(chalk.green('\nProject setup complete!'));
            console.log(chalk.bold.cyan('\nNext steps:\n'));
            console.log(chalk.blue(`1. cd ${projectName}`));
            console.log(chalk.blue('2. Initialize Pulumi stacks (e.g., pulumi stack init <stack-name>).'));
            console.log(chalk.blue('3. Explore the "examples" folder for resource usage ideas.'));
            console.log(chalk.blue('4. Start building your Pulumi project!\n'));
        } else {
            console.error(chalk.red(`npm install failed with exit code ${code}.`));
        }
    });
}

/**
 * Initializes a Git repository in the project directory.
 * 
 * @param projectDir - Absolute path to the project directory.
 */
function initializeGitRepository(projectDir: string) {
    const gitInit = spawn('git', ['init'], { cwd: projectDir, stdio: 'ignore' });
    gitInit.on('close', (gitCode) => {
        if (gitCode !== 0) {
            console.error(chalk.red(`git init failed with exit code ${gitCode}.`));
        }
    });
}

/**
 * Creates a default `package.json` file if it doesn't already exist.
 * Includes basic metadata and a dependency on lodash.
 * 
 * @param projectDir - Absolute path to the project directory.
 * @param projectName - Name of the project (used in `package.json`).
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
                "lodash": "^4.17.21"
            }
        };

        fs.writeFileSync(packageJsonPath, JSON.stringify(defaultPackageJson, null, 2), 'utf8');
    }
}

/**
 * Renders template files into the project directory.
 * 
 * @param templateFiles - List of template file names.
 * @param templatesDir - Path to the templates directory.
 * @param projectDir - Path to the project directory.
 * @param projectName - Name of the project (used in template rendering).
 */
function renderProjectTemplates(templateFiles: string[], templatesDir: string, projectDir: string, projectName: string) {
    templateFiles.forEach((templateFile) => {
        const templatePath = path.join(templatesDir, templateFile);
        const outputFileName = templateFile.replace('.tpl', '');
        const outputPath = path.join(projectDir, outputFileName);

        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const renderedContent = renderTemplate(templateContent, { projectName });

        fs.writeFileSync(outputPath, renderedContent);
    });
}

/**
 * Copies example files into the project directory.
 * 
 * @param projectDir - Path to the project directory.
 */
function copyExamplesDirectory(projectDir: string) {
    const examplesSrc = path.join(__dirname, '../examples');
    const examplesDest = path.join(projectDir, 'examples');
    if (fs.existsSync(examplesSrc)) {
        copyDirectory(examplesSrc, examplesDest);
        console.log(chalk.yellow('\nCopied resource examples to project.\n'));
    } else {
        console.warn(chalk.yellow('\nNo examples directory found to copy.\n'));
    }
}

/**
 * Creates a `.gitignore` file in the project directory.
 * Uses a template if available, otherwise creates a default `.gitignore`.
 * 
 * @param templatesDir - Path to the templates directory.
 * @param projectDir - Path to the project directory.
 * @param projectName - Name of the project (used in template rendering).
 */
function createGitIgnore(templatesDir: string, projectDir: string, projectName: string) {
    const gitignoreTemplatePath = path.join(templatesDir, '.gitignore.tpl');
    const gitignoreDestPath = path.join(projectDir, '.gitignore');
    if (fs.existsSync(gitignoreTemplatePath)) {
        const gitignoreContent = fs.readFileSync(gitignoreTemplatePath, 'utf8');
        fs.writeFileSync(gitignoreDestPath, renderTemplate(gitignoreContent, { projectName }));
    } else {
        const defaultGitignore = "node_modules/\ndist/\n";
        fs.writeFileSync(gitignoreDestPath, defaultGitignore);
    }
}
