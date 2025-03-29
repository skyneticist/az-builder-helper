/**
 * Handles the creation of a new Pulumi project using Azure Builder.
 * This includes setting up the directory structure, rendering templates,
 * copying example files, and initializing Git and npm dependencies.
 */

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { renderTemplate } from '../utils/templateUtils.js';
import { copyDirectory } from '../utils/fileUtils.js';

// Resolve __filename and __dirname for ES module compatibility.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.join(__dirname, '../templates');

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
    renderProjectTemplates(templatesDir, projectDir, projectName);
    copyExamplesDirectory(projectDir);
    createGitIgnore(templatesDir, projectDir);
    createNpmRcFile(projectDir);
    generateAzurePipelineYaml(projectDir); // Probably need to pass projectName
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
 * Renders template files into the project directory.
 * 
 * @param pulumiTemplates - List of template file names.
 * @param templatesDir - Path to the templates directory.
 * @param projectDir - Path to the project directory.
 * @param projectName - Name of the project (used in template rendering).
 */
function renderProjectTemplates(templatesDir: string, projectDir: string, projectName: string) {
    const pulumiTemplatesPath = path.join(templatesDir, 'pulumi');

    const pulumiTemplateFiles = fs.readdirSync(pulumiTemplatesPath, { withFileTypes: true })
        .filter(dirent => dirent.isFile() && dirent.name.endsWith('.tpl'))
        .map(dirent => dirent.name);

    if (pulumiTemplateFiles.length === 0) {
        console.error(chalk.red(`\nError: No template files found in ${chalk.magenta(templatesDir)}.\n`));
        console.error(chalk.red('Please ensure the templates directory contains .tpl files.'));
        process.exit(1);
    }

    pulumiTemplateFiles.forEach((templateFile) => {
        const templatePath = path.join(pulumiTemplatesPath, templateFile);
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
function createGitIgnore(templatesDir: string, projectDir: string) {
    const gitignoreTemplatePath = path.join(templatesDir, '.gitignore.tpl');
    const gitignoreDestPath = path.join(projectDir, '.gitignore');
    if (fs.existsSync(gitignoreTemplatePath)) {
        const gitignoreContent = fs.readFileSync(gitignoreTemplatePath, 'utf8');
        fs.writeFileSync(gitignoreDestPath, gitignoreContent);
    } else {
        const defaultGitignore = "node_modules/\ndist/\n";
        fs.writeFileSync(gitignoreDestPath, defaultGitignore);
    }
}

/**
 * Creates a `.npmrc` file in the specified project directory using a template file.
 *
 * The `.npmrc` template file should be located in the templates directory.
 * If the template file is not found, logs an error message.
 *
 * @param projectDir - The absolute path to the project directory where the `.npmrc` file will be created.
 */
function createNpmRcFile(projectDir: string) {
    const npmRcTemplatePath = path.join(templatesDir, 'pipelines/.npmrc.tpl');
    const npmRcPath = path.join(projectDir, '.npmrc');

    if (fs.existsSync(npmRcTemplatePath)) {
        const npmRcContent = fs.readFileSync(npmRcTemplatePath, 'utf8');
        fs.writeFileSync(npmRcPath, npmRcContent, 'utf8');
    } else {
        console.error(chalk.red(`\nError: .npmrc template not found at ${chalk.magenta(npmRcTemplatePath)}`));
    }
}

/**
 * Generates an Azure Pipeline YAML file in the project directory.
 * 
 * @param projectDir - Absolute path to the project directory.
 */
function generateAzurePipelineYaml(projectDir: string) {
    const azurePipelineTemplatePath = path.join(templatesDir, 'pipelines/azure-pipelines.yml.tpl');
    const azurePipelineYamlPath = path.join(projectDir, 'azure-pipelines.yml');

    if (fs.existsSync(azurePipelineTemplatePath)) {
        const azurePipelineContent = fs.readFileSync(azurePipelineTemplatePath, 'utf8');
        fs.writeFileSync(azurePipelineYamlPath, azurePipelineContent);
    } else {
        console.error(chalk.red(`\nError: Azure Pipeline template not found at ${chalk.magenta(azurePipelineTemplatePath)}`));
    }
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
            console.log(chalk.green('\nProject setup complete!\n'));
            console.log(chalk.bold('Summary:'));
            console.log(chalk.yellow(`• A new Pulumi project named "${projectName}" has been created.`));
            console.log(chalk.yellow('• The "examples" folder contains sample resource code to help you get started.'));
            console.log(chalk.yellow('• A default package.json, .gitignore, .npmrc, and azure-pipelines.yaml were generated for your convenience.\n'));

            console.log(chalk.bold.cyan('Next steps:'));
            console.log(chalk.blue(`1. cd ${projectName}`));
            console.log(chalk.blue('2. Initialize a Pulumi stack (e.g., pulumi stack init dev)'));
            console.log(chalk.blue('3. Explore the "examples" folder for resource usage ideas'));
            console.log(chalk.blue('4. Run pulumi up to preview and deploy your stack'));
            console.log(chalk.blue('5. Start building your Pulumi project!\n'));

            console.log(chalk.green('Happy building!\n'));
        } else {
            console.error(chalk.red(`\nnpm install failed with exit code ${code}.\n`));
        }
    });
}
