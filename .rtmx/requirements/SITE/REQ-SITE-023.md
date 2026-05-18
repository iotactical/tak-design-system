# REQ-SITE-023: GeoJSON style normalization in multipoint worker

## Description
WebRenderer outputs stroke/fill colors in `feature.style` but MapLibre reads
only `feature.properties`. The multipoint worker normalizes GeoJSON before
returning it: copies style properties into feature.properties, replaces
#000000 with the correct affiliation color, and filters empty polygon features.

## Acceptance Criteria
- [x] Worker normalizeGeoJson copies feature.style.stroke/fill/stroke-width to properties
- [x] Black (#000000) replaced with affiliation color (blue/red/green/yellow)
- [x] Empty polygon features filtered out
- [x] MultipointMap layer expressions no longer need black-replacement case
- [x] All render pipeline tests pass (REQ-XW-292)

## Validation
- **Test**: tests/site/test_multipoint_render_pipeline.mjs
- **Method**: Unit Test
