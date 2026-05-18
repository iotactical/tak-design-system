# REQ-SITE-020: Lazy-load search index on first interaction

## Description
GlobalSearch eagerly imports searchIndex (8 JSON files totaling ~100-200 KB)
in the main bundle, adding to the critical path for all page loads even when
search is never used. Defer the import to the first Cmd+K press or search
input focus.

## Acceptance Criteria
- [ ] searchIndex import is dynamic (`import()`) not static
- [ ] Fuse.js index is built on first search activation, not on mount
- [ ] Main bundle (index-*.js) decreases in size by at least 50 KB
- [ ] Search still returns correct results after lazy initialization

## Validation
- **Test**: Measure main bundle size before/after; functional search test
- **Method**: Build Validation + Unit Test
