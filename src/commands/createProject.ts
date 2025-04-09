/**
 * Handles the creation of a new Pulumi project using Azure Builder.
 * This includes setting up the directory structure, rendering templates,
 * copying example files, and initializing Git and npm dependencies.
 */

import { join } from 'path';
import * as projectUtils from '../utils/createProjectUtils.js';
import { confirmPathIsFree } from '../utils/fileUtils.js';

/**
 * Creates a new Pulumi project.
 * 
 * @param projectName - Name of the project and its directory.
 * Terminates the process if the directory already exists.
 */
export function createProject(projectName: string): void {
    const projectDirectoryPath = join(process.cwd(), projectName);
    confirmPathIsFree(projectDirectoryPath);

    projectUtils.createProjectDirectory(projectDirectoryPath);
    projectUtils.initializeGitRepository(projectDirectoryPath);
    projectUtils.renderProjectTemplates(projectDirectoryPath, projectName);
    projectUtils.copyExamplesDirectory(projectDirectoryPath);
    projectUtils.createGitIgnore(projectDirectoryPath);
    projectUtils.createNpmRcFile(projectDirectoryPath);
    projectUtils.createProjectReadme(projectDirectoryPath, projectName);
    projectUtils.generateAzurePipelineYaml(projectDirectoryPath, projectName);
    projectUtils.createDefaultPackageJson(projectDirectoryPath, projectName);
    projectUtils.installNpmDependencies(projectDirectoryPath, projectName);
    projectUtils.initStacks(['dev']);
}
