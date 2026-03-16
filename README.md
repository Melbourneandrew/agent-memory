# Agent Memory Monorepo

This repository contains Agent Memory packages and tooling managed with NPM workspaces.

## Development

```bash
npm install
npm run build
npm run test
npm run lint
```

## CI/CD Workflows

The repository uses three GitHub Actions workflows:

- `.github/workflows/pr-validation.yml` for pull request lint/build/test/format checks.
- `.github/workflows/publish-npm.yml` for publishing `@agent-memory/core` to NPM after successful build and tests.
- `.github/workflows/deploy-docs.yml` for deploying MkDocs documentation to GitHub Pages.

## Required Repository Configuration

1. Create an NPM automation token with publish permissions and store it as repository secret `NPM_TOKEN`.
2. In GitHub Pages settings, set the source to `GitHub Actions`.
3. Ensure workflow permissions satisfy each workflow's declared needs; `Deploy Docs` requires `pages: write` and `id-token: write`, while CI and NPM publish only require read access to repository contents.
4. Optionally configure branch protection on `main` to require `PR Validation` before merge.
