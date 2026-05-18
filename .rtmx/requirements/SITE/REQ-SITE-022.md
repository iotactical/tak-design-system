# REQ-SITE-022: IndexedDB thumbnail cache

## Description
Cache rendered thumbnail PNG data URLs in IndexedDB so revisiting the gallery
or switching back to a previously viewed affiliation skips the MapLibre render
pipeline. Cache key is `${symbolCode}:${affiliation}:${modifiersHash}`.
Invalidate when mil-sym-ts version changes.

## Acceptance Criteria
- [ ] Thumbnails stored in IndexedDB after first render
- [ ] Cache hit returns data URL without invoking MapLibre
- [ ] Affiliation switch correctly misses cache for new affiliation
- [ ] Cache invalidated when package version changes
- [ ] Storage stays under 50 MB for full gallery (all affiliations)

## Validation
- **Test**: Unit test for cache write/read/miss/invalidation
- **Method**: Unit Test
