# REQ-PKG-006: Component API Reference Documentation

## Description
Every exported component in @iotactical/tak-react must have API reference
documentation including a prop table, usage example, and description. This
documentation lives in the package README.md and is the primary reference
for npm consumers who do not visit the design system site.

## Approach
- Expand packages/react/README.md with per-component sections
- Each section includes:
  - One-sentence description
  - Prop table (name, type, default, description) extracted from TypeScript interfaces
  - Minimal usage example (JSX snippet)
  - Notes on variants, enums, or composition patterns where applicable
- Group components by category: Layout, Input, Display, Map, Military
- Document theme setup (TakThemeProvider) with full prop reference
- Document token system (takTokens, density tokens) with usage patterns
- Document CSS import requirement (`@iotactical/tak-react/styles`)
- Keep README under 2000 lines to remain scannable

## Acceptance Criteria
- [ ] All 26 components have prop tables in README
- [ ] All 26 components have at least one usage example
- [ ] TakThemeProvider and DensityProvider documented with props
- [ ] takTokens object documented with available token categories
- [ ] mobileDensity and desktopDensity documented
- [ ] CSS import documented with explanation of when it's needed
- [ ] README renders correctly on npmjs.com

## Validation
- **Test**: Manual review of npm README rendering
- **Method**: Manual Review
