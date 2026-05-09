# REQ-SITE-009: Interactive 3D Vehicle Model Viewer

## Description
In-browser 3D viewer for the 94 ATAK vehicle models (COLLADA .DAE format)
on the Palettes > Vehicle Models tab. Uses Three.js with ColladaLoader to
render models directly without format conversion. Each model card shows an
interactive 3D viewport with orbit/zoom controls.

## ATAK Source
- 94 COLLADA (.DAE) models in assets/vehicle_models/{aircraft,automobiles,maritime,other}/
- Each ZIP contains one .DAE file + .dds.png texture files
- Model sizes: 46KB (F-117) to 3.7MB (MQ-9 Reaper)
- Categories: aircraft (69), automobiles (18), maritime (5), other (1)

## Approach
- Extract all model ZIPs to site/public/models/{category}/{name}/
- Add three.js + ColladaLoader + OrbitControls as site dependencies
- Build a ModelViewer React component wrapping a Three.js canvas
- Default: static camera angle showing the model. On interaction: orbit/zoom
- Lazy-load models on viewport visibility (IntersectionObserver)
- Viewport size: card preview area (~200x150px), expandable on click

## Acceptance Criteria
- [ ] All 94 model ZIPs extracted to site/public/models/
- [ ] ModelViewer React component renders .DAE files with textures
- [ ] Orbit controls: drag to rotate, scroll to zoom
- [ ] Models load lazily (only when scrolled into view)
- [ ] Vehicle Models palette tab shows 3D preview per model card
- [ ] Fallback text label if WebGL unavailable or model fails to load
- [ ] three.js added as site dependency (not design system dependency)

## Validation
- **Test**: tests/site/test_model_viewer.mjs::test_model_viewer
- **Method**: Integration Test
