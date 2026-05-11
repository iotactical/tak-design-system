# REQ-XW-231: sideEffects Field for Tree Shaking

## Description

Add `"sideEffects": false` to `packages/react/package.json` to inform bundlers (webpack, Rollup, esbuild) that all modules in the React component package are free of side effects and safe to tree-shake. Without this field, bundlers may include unused components in consumer application bundles, increasing bundle size unnecessarily.

## Acceptance Criteria

1. `packages/react/package.json` contains the field `"sideEffects": false` at the top level of the JSON object.
2. The field value is the boolean `false`, not the string `"false"`.
3. The `package.json` remains valid JSON after the change.
4. All existing fields in `package.json` are preserved.
5. Tree-shaking works correctly: importing a single component from the package does not bundle the entire package in a consumer project.

## Test Approach

- **Static analysis**: Parse `packages/react/package.json` as JSON and assert that `sideEffects` key exists and its value is `false`.
- **Bundle analysis**: Create a minimal consumer app that imports one component from the package, build it with webpack or Vite, and verify the output does not include code from unused components.
- **Regression**: Run the existing test suite to verify no components rely on module-level side effects that would be broken by this declaration.

## Implementation Notes

- This is a single-line addition to `package.json`. Place it near the `main`/`module`/`exports` fields for logical grouping.
- If any modules in the package do have side effects (e.g., global CSS imports, polyfills), they must be listed in the `sideEffects` array instead of using `false`. Verify no such modules exist before using `false`.
- This change only affects consumer bundlers; it has no impact on the package's own build process.

## Effort Estimate

0.25 weeks
