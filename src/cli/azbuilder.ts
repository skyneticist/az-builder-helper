#!/usr/bin/env node

/**
 * CLI entry point for Azure Builder Helper.
 * This file parses command-line arguments and delegates commands.
 */

import { Command } from 'commander';
import { createProject } from '../commands/createProject.js';

const program = new Command();

program
    .name('azbuilder')
    .description('CLI tool for creating Pulumi projects using Azure Builder')
    .version('1.0.0');

program
    .command('new <projectName>')
    .description('Creates a new Pulumi project with the specified project name')
    .action((projectName: string) => {
        createProject(projectName);
    });

program.parse(process.argv);
