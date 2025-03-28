/**
 * Unit tests for the createProject function.
 * This test suite mocks filesystem operations and child process spawning to ensure
 * that createProject behaves as expected without performing actual IO operations.
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { createProject } from '../src/commands/createProject.js';
// Removed as 'mocked' is not used in the code.

// Create a helper function to simulate spawn behavior.
function mockSpawn(success: boolean = true) {
    return {
        on: (event: string, callback: (code: number) => void) => {
            if (event === 'close') {
                // Simulate process exit with code 0 for success or 1 for failure.
                callback(success ? 0 : 1);
            }
        },
    } as unknown as ReturnType<typeof spawn>;
}

// Jest will automatically hoist these mocks.
jest.mock('fs');
jest.mock('child_process');

describe('createProject', () => {
    const projectName = 'TestProject';
    const projectDir = path.join(process.cwd(), projectName);
    // Removed as 'templatesDir' is declared but never used.

    beforeEach(() => {
        // Clear all mocks before each test.
        jest.resetAllMocks();
    });

    test('should error if project directory already exists', () => {
        // Mock fs.existsSync to simulate that the project directory exists.
        (fs.existsSync as jest.Mock).mockImplementation((p: string) => {
            if (p === projectDir) return true;
            return false;
        });

        // Spy on console.error and process.exit.
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => { throw new Error(`Process exited with code ${code}`); });

        expect(() => createProject(projectName)).toThrow('Process exited with code 1');
        expect(consoleErrorSpy).toHaveBeenCalledWith(`Error: Project directory "${projectName}" already exists.`);

        // Cleanup spies.
        consoleErrorSpy.mockRestore();
        exitSpy.mockRestore();
    });

    test('should create project directory and process templates', () => {
        // Simulate that the project directory does not exist.
        (fs.existsSync as jest.Mock).mockReturnValue(false);
        // Stub for fs.mkdirSync to do nothing.
        (fs.mkdirSync as jest.Mock).mockImplementation(() => { });
        // Stub for fs.readFileSync to return a sample template.
        (fs.readFileSync as jest.Mock).mockReturnValue('Project: {{projectName}}');
        // Stub for fs.writeFileSync to do nothing.
        (fs.writeFileSync as jest.Mock).mockImplementation(() => { });

        // Simulate that examples directory does not exist to skip copy.
        (fs.existsSync as jest.Mock).mockImplementation((p: string) => {
            if (p === projectDir) return false;
            if (p.includes('examples')) return false;
            return false;
        });

        // Mock child_process.spawn to simulate npm install.
        (spawn as jest.Mock).mockReturnValue(mockSpawn(true));

        // Invoke the createProject function.
        createProject(projectName);

        // Validate that fs.mkdirSync was called to create the project directory.
        expect(fs.mkdirSync).toHaveBeenCalledWith(projectDir, { recursive: true });

        // Validate that template files were read and written.
        // Note: There are two template files: 'index.ts.tpl' and 'Pulumi.yaml.tpl'.
        expect(fs.readFileSync).toHaveBeenCalledTimes(2);
        expect(fs.writeFileSync).toHaveBeenCalledTimes(2);

        // Validate that spawn was called for npm install.
        expect(spawn).toHaveBeenCalledWith('npm', ['install'], { cwd: projectDir, stdio: 'inherit' });
    });
});
