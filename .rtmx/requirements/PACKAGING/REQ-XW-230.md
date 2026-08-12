# REQ-XW-230: npm Publish in Release Workflow

## Description

The release workflow in `.github/workflows/build-and-release.yml` currently builds the token and React packages but does not publish them to the npm registry. Add npm publish steps to the release job so that `@iotactical/tak-tokens` and `@iotactical/tak-react` (or their actual package names) are published to the public npm registry on each release. Authentication uses a `NODE_AUTH_TOKEN` GitHub secret containing an npm access token.

## Acceptance Criteria

1. The release job in `build-and-release.yml` creates or configures an `.npmrc` file with `//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}`.
2. The workflow runs `npm publish --access public` from the `packages/tokens` directory.
3. The workflow runs `npm publish --access public` from the `packages/react` directory.
4. The `NODE_AUTH_TOKEN` is sourced from GitHub Secrets (referenced as `${{ secrets.NODE_AUTH_TOKEN }}`), not hardcoded.
5. The publish steps run only in the release job, not in build-only or PR jobs.
6. If either publish step fails (e.g., version already exists), the workflow fails with a clear error message.
7. The publish steps execute after the build/package steps, ensuring the dist artifacts are present.

## Test Approach

- **Static analysis**: Parse `build-and-release.yml` and verify it contains `npm publish --access public` commands for both `packages/tokens` and `packages/react`.
- **Static analysis**: Verify the `.npmrc` setup step references `NODE_AUTH_TOKEN` from secrets.
- **Dry run**: Execute the workflow with `--dry-run` flag added to `npm publish` to verify the publish commands resolve correctly without actually publishing.
- **Integration test**: Trigger a release on a test/staging npm scope and verify the packages appear on the registry with correct contents.
- **Verification**: Confirm `npm view @iotactical/tak-tokens` and `npm view @iotactical/tak-react` return valid package metadata after a successful release.

## Implementation Notes

- The standard GitHub Actions approach is to use `actions/setup-node` with `registry-url: https://registry.npmjs.org` which automatically configures `.npmrc`. However, explicit `.npmrc` creation also works.
- The `NODE_AUTH_TOKEN` secret must be created in the repository settings before this workflow will succeed.
- Consider adding a version check step that skips publish if the version in `package.json` already exists on the registry, to make the workflow idempotent.
- The `--access public` flag is required for scoped packages (`@org/pkg`) that should be publicly accessible.
- Publish steps should be ordered: tokens first, then react (in case react depends on tokens).

## As Implemented

- `actions/setup-node` with `registry-url: https://registry.npmjs.org` writes the
  `.npmrc`; no explicit `.npmrc` step is needed
- The secret is named `NPM_TOKEN` and is exposed to npm as `NODE_AUTH_TOKEN`
- `scripts/publish-npm.sh` publishes `packages/tokens` then `packages/react`, adding
  `--provenance` when an OIDC token is present
- Versions already on the registry are skipped, per the idempotency note above, so
  a push to `main` without a version bump is a no-op instead of a failure. Every
  other npm error fails the job: the script runs under `set -euo pipefail` and no
  publish is followed by a `||` fallback
- When `NPM_TOKEN` is absent the step is skipped and the job annotates a warning,
  rather than reporting a successful release that published nothing

## Effort Estimate

0.5 weeks
