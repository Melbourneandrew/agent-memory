# Implementation Plan: WO-16

**Work Order:** WO-16 — Setup GitHub Actions CI/CD Workflows
**Created At (UTC):** 2026-03-16T05:19:55Z

## Summary

Create CI/CD automation for quality gates, package publication, and docs deployment using GitHub Actions. Workflows will use existing monorepo scripts (`npm run lint/build/test`) and add repository-level deployment/build configuration for MkDocs so docs deployment can execute immediately after merge.

## File and Package Structure

- `.github/workflows/pr-validation.yml` (new): PR checks for lint, build, tests, and formatting.
- `.github/workflows/publish-npm.yml` (new): build/test gate with conditional publish to NPM using `NPM_TOKEN`.
- `.github/workflows/deploy-docs.yml` (new): docs build and GitHub Pages deployment pipeline.
- `mkdocs.yml` (new): root MkDocs config required by docs deployment workflow.
- `docs/index.md` (new): minimal docs entry page for MkDocs build validity.
- `README.md` (new): repository setup instructions for secrets, permissions, and Pages source.
- `scratch/wo-execution/WO-16/*.md` (modified): execution evidence and verification logs.

## Signatures

No TypeScript API signatures are introduced in this work order.

## Control Flow

1. On pull request to `main`, `pr-validation.yml` runs checkout -> Node setup -> dependency install -> lint -> build -> test -> formatting check.
2. On push to `main` or version tags, `publish-npm.yml` runs checkout -> Node setup -> install -> build -> test -> checks if `@agent-memory/core@version` exists -> publishes only when version is new.
3. On docs-related pushes to `main`, `deploy-docs.yml` runs checkout -> Python setup -> MkDocs install -> `mkdocs build --strict` -> uploads artifact -> deploys to GitHub Pages.

## Steps

1. **Initialize WO execution context** — Read linked work order, blueprint, and requirement documents; initialize `scratch/wo-execution/WO-16/`.
2. **Create workflow definitions** — Add `.github/workflows/pr-validation.yml`, `.github/workflows/publish-npm.yml`, and `.github/workflows/deploy-docs.yml`.
3. **Add docs build prerequisites** — Add `mkdocs.yml` and `docs/index.md` so the docs deployment workflow has valid inputs.
4. **Document repository setup requirements** — Add root `README.md` section for `NPM_TOKEN`, GitHub Pages source, workflow permissions, and optional branch protection.
5. **Verify quality gates** — Run repository `build`, `test`, and `lint`; capture outcomes in checklist and review log.
