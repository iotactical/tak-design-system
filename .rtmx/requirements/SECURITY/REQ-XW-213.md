# REQ-XW-213: npm audit in CI Workflows

## Description

Add an `npm audit` step to CI workflows to surface known vulnerabilities in production dependencies. The step should run after `npm ci` and log audit results. Initially, the step should not block builds (`|| true`) to avoid breaking CI on pre-existing advisories, but the output provides visibility into the security posture of the dependency tree.

## Acceptance Criteria

1. The file `.github/workflows/build-and-release.yml` contains a step that runs `npm audit --audit-level=high --omit=dev` (or equivalent).
2. The file `.github/workflows/deploy-site.yml` contains a step that runs `npm audit --audit-level=high --omit=dev` (or equivalent).
3. Both audit steps include `|| true` to prevent build failure from audit findings (non-blocking).
4. The audit step runs after `npm ci` (dependency installation) and before the build step.
5. The audit step has a descriptive name (e.g., "Audit production dependencies").
6. Audit output is visible in the GitHub Actions logs for each workflow run.

## Test Approach

- **Static analysis**: Verify both workflow YAML files contain a step with `npm audit --audit-level=high --omit=dev || true` (or equivalent command).
- **Static analysis**: Verify the audit step appears after the `npm ci` step and before the build step in both workflows.
- **CI verification**: Trigger a workflow run and confirm the audit step executes and produces output in the Actions log.
- **Negative test**: Introduce a known-vulnerable dev dependency and confirm it is NOT flagged (because `--omit=dev` excludes dev dependencies).

## Implementation Notes

- The `--audit-level=high` flag means only high and critical severity advisories are reported, reducing noise from low/moderate findings.
- The `--omit=dev` flag excludes devDependencies from the audit, focusing on packages that ship in the production bundle.
- The `|| true` suffix ensures the step always succeeds. In a future hardening pass, remove `|| true` to make the audit gate blocking once all existing advisories are resolved or allowlisted.
- Consider adding `npm audit --json` output redirected to a file and uploaded as a build artifact for structured analysis.
- If the project uses workspaces, the audit runs against the root lock file and covers all workspaces.

## Effort Estimate

0.25 weeks
