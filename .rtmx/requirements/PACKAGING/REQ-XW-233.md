# REQ-XW-233: VS Code Extension Publish in Release Workflow

## Description

Add steps to the release workflow in `.github/workflows/build-and-release.yml` to build and publish the VS Code extension to the Visual Studio Marketplace. The extension is located in the `vscode-extension/` directory. Publishing uses the `@vscode/vsce` CLI tool authenticated with a `VSCE_PAT` (Personal Access Token) GitHub secret.

## Acceptance Criteria

1. The release workflow installs `@vscode/vsce` globally (e.g., `npm install -g @vscode/vsce`).
2. The workflow runs `vsce package` from the `vscode-extension/` directory to produce a `.vsix` file.
3. The workflow runs `vsce publish` from the `vscode-extension/` directory to publish the extension to the VS Marketplace.
4. The `VSCE_PAT` is sourced from GitHub Secrets (referenced as `${{ secrets.VSCE_PAT }}`), not hardcoded.
5. The publish step runs only in the release job, not in build-only or PR jobs.
6. If the publish step fails, the workflow fails with a clear error.
7. The VS Code extension publish step runs after the npm publish steps (ordering: tokens, react, then VS Code extension).

## Test Approach

- **Static analysis**: Parse `build-and-release.yml` and verify it contains `vsce package` and `vsce publish` steps.
- **Static analysis**: Verify the steps reference `VSCE_PAT` from secrets.
- **Dry run**: Add `--dry-run` to `vsce publish` in a test branch to verify the command resolves correctly without actually publishing.
- **Integration test**: After a release, verify the extension version on the VS Marketplace matches the released version.

## Implementation Notes

- The `VSCE_PAT` must be a Personal Access Token from Azure DevOps with the "Marketplace (Manage)" scope. This must be created and stored in GitHub Secrets before the workflow will succeed.
- `vsce` requires the extension's `package.json` to have a valid `publisher` field and `version` field.
- If the `vscode-extension/` directory has its own `node_modules`, run `npm install` (or `npm ci`) in that directory before packaging.
- Consider uploading the `.vsix` file as a GitHub Release artifact in addition to publishing to the Marketplace, for users who install extensions manually.
- The `vsce package` step can be run in CI even without publishing (e.g., on PRs) to catch packaging errors early.

## As Implemented

- `npx @vscode/vsce` is used instead of a global install
- The extension lives in `vscode-extension/`; the earlier workflow gated on
  `platforms/vscode/package.json`, a path that holds only generated theme JSON and
  never a manifest, so the publish step silently skipped every release
- The generated `platforms/vscode/generated/tak-dark-theme.json` is copied over the
  committed theme before packaging so the published extension cannot drift from the
  tokens
- `vsce package` writes a `.vsix`, `vsce publish --packagePath` publishes that exact
  file, and it is attached to the GitHub release for manual installation
- A version already on the marketplace is skipped with an explanation; any other
  failure fails the job
- When `VSCE_PAT` is absent the step is skipped and the job annotates a warning

## Effort Estimate

0.25 weeks
