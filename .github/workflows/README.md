# GitHub Workflows for PAMP Project API

This directory contains GitHub Actions workflows for automating various tasks in the PAMP Project API codebase.

## Available Workflows

### 1. Tests (`test.yml`)

Runs the automated test suite on push to the `main` branch and on pull requests.

- Sets up MySQL service for testing
- Installs Node.js dependencies
- Creates a test environment configuration
- Executes the test suite with Jest

### 2. Format & Lint Check (`format.yml`)

Verifies code quality standards on push to the `main` branch and on pull requests.

- Checks code formatting with Prettier
- Verifies code quality with ESLint
- Posts comments on pull requests when issues are found
- Provides detailed instructions for fixing issues

### 3. Build Docker Image (`build.yml`)

Builds and publishes a Docker image to GitHub Container Registry (GHCR).

- Triggered on push to the `main` branch and on tags matching `v*.*.*`
- Uses Docker BuildX for efficient builds
- Publishes the image with appropriate tags
- Caches build layers for faster builds

### 4. Create Release (`release.yml`)

Creates a GitHub Release when a new tag is pushed.

- Triggered on tags matching `v*.*.*`
- Generates a changelog from git commits
- Creates a GitHub Release with the changelog
- Includes instructions for pulling the Docker image 