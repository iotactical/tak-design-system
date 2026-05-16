# REQ-SITE-017: Interactive Component API Reference Page

## Description
Add a /components page to the design system site that renders each
@iotactical/tak-react component with interactive controls, prop tables,
and copy-ready code snippets. This is the visual companion to the README
prop tables -- it shows what each component looks like with different
prop combinations.

## Approach
- New route /components in the site SPA
- Sidebar navigation listing all 26 components grouped by category
- Each component section includes:
  - Live rendered component with default props
  - Interactive prop controls (toggles, dropdowns, text inputs) to modify props
  - Auto-generated prop table from TypeScript interface
  - Copy-ready JSX snippet that updates as props change
- Components rendered inside TakThemeProvider with theme/density toggles
- Lazy-load component demos to avoid loading all 26 on initial page load

## Acceptance Criteria
- [ ] /components route accessible from site navigation
- [ ] All 26 components rendered with default props
- [ ] At least 10 components have interactive prop controls
- [ ] Prop tables show name, type, default, description
- [ ] Code snippets update as interactive controls change
- [ ] Page works on desktop (mobile shows read-only view)

## Validation
- **Test**: Manual visual review, site build succeeds
- **Method**: Manual Review + Build Validation
