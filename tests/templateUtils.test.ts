/**
 * Unit tests for the template rendering utility.
 * This file uses Jest to test that placeholders in template strings are correctly replaced.
 */

import { renderTemplate } from '../src/utils/templateUtils';

describe('renderTemplate', () => {
    it('should replace a single placeholder correctly', () => {
        const template = 'Hello, {{projectName}}!';
        const result = renderTemplate(template, { projectName: 'TestProject' });
        expect(result).toBe('Hello, TestProject!');
    });

    it('should replace multiple placeholders correctly', () => {
        const template = 'Project: {{projectName}}, Env: {{environment}}';
        const result = renderTemplate(template, { projectName: 'TestProject', environment: 'dev' });
        expect(result).toBe('Project: TestProject, Env: dev');
    });

    it('should warn and replace missing placeholder with an empty string', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
        const template = 'Welcome, {{name}}!';
        const result = renderTemplate(template, {});
        expect(result).toBe('Welcome, !');
        expect(warnSpy).toHaveBeenCalledWith('Warning: No value provided for placeholder name');
        warnSpy.mockRestore();
    });
});
