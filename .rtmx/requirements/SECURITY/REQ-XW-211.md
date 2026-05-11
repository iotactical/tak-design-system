# REQ-XW-211: Pin mil-sym-ts to Exact Version

## Description

The `@armyc2.c5isr.renderer/mil-sym-ts` dependency currently uses a caret range (`^2.8.3`), which allows automatic minor and patch upgrades. For a security-sensitive rendering library that processes symbol identification codes, unexpected upgrades could introduce breaking changes or vulnerabilities. Pin the dependency to an exact version (`2.8.3`) in all `package.json` files that reference it.

## Acceptance Criteria

1. Every `package.json` file in the repository that lists `@armyc2.c5isr.renderer/mil-sym-ts` as a dependency specifies the exact version `2.8.3` (no `^`, `~`, `>=`, or other range operators).
2. `package-lock.json` is regenerated and reflects the pinned version.
3. The application builds and runs correctly with the pinned version.
4. No other dependencies are changed as part of this requirement.

## Test Approach

- **Static analysis**: Grep all `package.json` files for `mil-sym-ts` and verify the version string is exactly `"2.8.3"` with no range prefix.
- **Build verification**: Run `npm ci && npm run build` to confirm the pinned version resolves and the application builds.
- **Regression test**: Run the existing test suite to confirm no behavioral changes.

## Implementation Notes

- Search for `mil-sym-ts` across all `package.json` files in the monorepo: root, `site/`, and any workspace packages.
- After changing the version string, delete `node_modules` and `package-lock.json`, then run `npm install` to regenerate the lock file cleanly.
- Document the pinned version in a comment or the project README so future maintainers understand why the version is pinned and the process for upgrading (manual review + test before bumping).
- Consider applying the same pinning strategy to other security-sensitive dependencies in a future requirement.

## Effort Estimate

0.25 weeks
