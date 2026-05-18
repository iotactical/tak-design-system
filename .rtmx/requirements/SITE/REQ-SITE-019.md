# REQ-SITE-019: Preconnect to tile server origins

## Description
Map pages load tiles from Carto and Esri CDNs with no early connection hints.
Add `<link rel="preconnect">` tags in index.html for `basemaps.cartocdn.com`,
`server.arcgisonline.com`, and `demotiles.maplibre.org` to allow the browser
to establish TLS connections before the map requests them.

## Acceptance Criteria
- [ ] index.html has `<link rel="preconnect" href="https://a.basemaps.cartocdn.com" crossorigin />`
- [ ] index.html has `<link rel="preconnect" href="https://server.arcgisonline.com" crossorigin />`
- [ ] index.html has `<link rel="preconnect" href="https://demotiles.maplibre.org" crossorigin />`
- [ ] No new CSP violations

## Validation
- **Test**: Parse built index.html for preconnect link elements
- **Method**: Unit Test
