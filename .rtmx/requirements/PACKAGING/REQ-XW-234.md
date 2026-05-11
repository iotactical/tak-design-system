# REQ-XW-234: JSDoc Comments for All Exported React Components

## Description

Add JSDoc documentation blocks to all 28 exported React components in `packages/react/src/components/`. Each component's main exported function should have a JSDoc comment with `@description`, `@param`, and `@example` tags. This enables IDE tooltips, auto-generated API documentation, and improves developer experience for consumers of the component library.

## Acceptance Criteria

1. Every `.tsx` file in `packages/react/src/components/` that exports a React component has a JSDoc comment block (`/** ... */`) immediately preceding the exported function declaration or the default export.
2. Each JSDoc block contains a `@description` tag with a one-to-three sentence summary of the component's purpose.
3. Each JSDoc block contains `@param` tags for the component's props (at minimum, a single `@param {object} props` with a description, or individual `@param` entries for each prop).
4. Each JSDoc block contains an `@example` tag with a valid JSX usage example.
5. All 28 components are documented (none are skipped).
6. The JSDoc comments do not cause TypeScript or ESLint errors.
7. The JSDoc comments are accurate and describe the actual behavior of each component.

## Test Approach

- **Static analysis**: For each `.tsx` file in `packages/react/src/components/`, parse the file and assert it contains at least one `/** ... */` block with `@description`, `@param`, and `@example`.
- **Count verification**: Assert the number of documented components equals 28.
- **TypeScript compilation**: Run `tsc --noEmit` to verify JSDoc comments do not introduce type errors.
- **Documentation generation**: Run a tool like `typedoc` or `react-docgen-typescript` and verify all 28 components produce documentation output.

## Implementation Notes

- JSDoc format example:
  ```typescript
  /**
   * @description Renders a military symbol using the provided SIDC.
   * @param {MilSymRendererProps} props - Component props.
   * @param {string} props.sidc - The Symbol Identification Code to render.
   * @param {number} [props.size=32] - The size in pixels.
   * @example
   * <MilSymRenderer sidc="10031000161211000000" size={48} />
   */
  ```
- The `@description` tag can be omitted if the description is the first line of the JSDoc block (implicit description), but using the explicit tag improves consistency.
- For components with complex prop types defined in a separate interface, reference the interface name in the `@param` tag.
- Consider running `react-docgen-typescript` as part of CI to ensure JSDoc stays in sync with actual props.
- Prioritize accuracy: each description should reflect what the component actually does, not a generic placeholder.

## Effort Estimate

0.5 weeks
