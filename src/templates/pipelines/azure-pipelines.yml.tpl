# Azure Pipelines YAML Template
# This template defines a pipeline with stages for dev, test, staging, and prod environments.
# Use the `environment` parameter to control which stages to run.

trigger:
  branches:
    include:
      - main
      - develop

parameters:
  # Parameter to select which environments to run. Default is "all".
  - name: environment
    displayName: "Environment to Run"
    type: string
    default: dev
    values:
      - all
      - dev
      - test
      - staging
      - prod

stages:
- stage: Dev
  displayName: "Development Environment"
  condition: or(eq(parameters.environment, 'all'), eq(parameters.environment, 'dev'))
  jobs:
  - job: Build
    displayName: "Build in Dev"
    steps:
    - script: echo "Building in Development Environment"
      displayName: "Run Build Script"

- stage: Test
  displayName: "Test Environment"
  condition: or(eq(parameters.environment, 'all'), eq(parameters.environment, 'test'))
  jobs:
  - job: Test
    displayName: "Run Tests"
    steps:
    - script: echo "Running Tests in Test Environment"
      displayName: "Run Test Script"

- stage: Staging
  displayName: "Staging Environment"
  condition: or(eq(parameters.environment, 'all'), eq(parameters.environment, 'staging'))
  jobs:
  - job: Deploy
    displayName: "Deploy to Staging"
    steps:
    - script: echo "Deploying to Staging Environment"
      displayName: "Run Deployment Script"

- stage: Prod
  displayName: "Production Environment"
  condition: or(eq(parameters.environment, 'all'), eq(parameters.environment, 'prod'))
  jobs:
  - job: ManualApproval
    displayName: "Manual Approval for Production"
    steps:
    - task: ManualValidation@0
      inputs:
        instructions: "Please approve the deployment to Production."
        onTimeout: "reject"
        timeout: "1h"
  - job: Deploy
    displayName: "Deploy to Production"
    dependsOn: ManualApproval
    steps:
    - script: echo "Deploying to Production Environment"
      displayName: "Run Deployment Script"
