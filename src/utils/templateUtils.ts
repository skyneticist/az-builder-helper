/**
 * Utility function for processing template files.
 * This module exports a function that replaces placeholders in a template
 * string with values provided in a variables object.
 *
 * Placeholders in the template should be in the format: {{key}}
 */

/**
 * Renders a template by replacing placeholders with corresponding variable values.
 *
 * @param template - The string containing placeholders (e.g., "Hello, {{projectName}}!")
 * @param variables - An object where keys correspond to placeholder names and values are the replacement text.
 * @returns The rendered string with all placeholders replaced.
 */
export function renderTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        if (variables[key] === undefined) {
            console.warn(`Warning: No value provided for placeholder ${key}`);
            return '';
        }
        return variables[key];
    });
}
