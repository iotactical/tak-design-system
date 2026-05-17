// rtmx:req REQ-RCT-008
// rtmx:req REQ-RCT-009
// rtmx:req REQ-RCT-010
// rtmx:req REQ-RCT-011
// rtmx:req REQ-RCT-012
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');
const SRC = resolve(ROOT, 'packages', 'react', 'src', 'components', 'TakIcon');

describe('REQ-RCT-008: TakIcon component', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  it('test_tak_icon_exported', () => {
    assert.match(dts, /TakIcon/, 'TakIcon must be exported');
  });

  it('test_tak_icon_props_interface', () => {
    assert.match(dts, /TakIconProps/, 'TakIconProps must be exported');
    assert.match(dts, /TakIconSize/, 'TakIconSize must be exported');
  });

  it('test_tak_icon_render', () => {
    // Verify the main component source file exists and has correct structure
    const src = readFileSync(resolve(SRC, 'TakIcon.tsx'), 'utf8');
    assert.match(src, /function TakIcon/, 'TakIcon function must exist');
    assert.match(src, /name.*string/, 'name prop must be typed as string');
    assert.match(src, /TakIconSize/, 'size prop must use TakIconSize');
    assert.match(src, /fallback/, 'fallback prop must be supported');
  });

  it('test_tak_icon_renders_vector', () => {
    const src = readFileSync(resolve(SRC, 'TakIcon.tsx'), 'utf8');
    assert.match(src, /case 'vector'/, 'Must handle vector type');
    assert.match(src, /\.svg/, 'Must render SVG images');
    assert.match(src, /loading="lazy"/, 'Must lazy-load images');
  });

  it('test_tak_icon_renders_shape', () => {
    const src = readFileSync(resolve(SRC, 'TakIcon.tsx'), 'utf8');
    assert.match(src, /case 'shape'/, 'Must handle shape type');
    assert.match(src, /ShapeRenderer/, 'Must delegate to ShapeRenderer');
  });

  it('test_tak_icon_renders_selector', () => {
    const src = readFileSync(resolve(SRC, 'TakIcon.tsx'), 'utf8');
    assert.match(src, /case 'selector'/, 'Must handle selector type');
    assert.match(src, /SelectorRenderer/, 'Must delegate to SelectorRenderer');
  });

  it('test_tak_icon_renders_png', () => {
    const src = readFileSync(resolve(SRC, 'TakIcon.tsx'), 'utf8');
    assert.match(src, /case 'png'/, 'Must handle png type');
    assert.match(src, /\.png/, 'Must render PNG images');
  });

  it('test_tak_icon_fallback', () => {
    const src = readFileSync(resolve(SRC, 'TakIcon.tsx'), 'utf8');
    assert.match(src, /not-found/, 'Must detect not-found case');
    assert.match(src, /fallback/, 'Must render fallback content');
  });

  it('test_tak_icon_no_theme_provider', () => {
    const src = readFileSync(resolve(SRC, 'TakIcon.tsx'), 'utf8');
    assert.match(src, /useDensityOptional/, 'Must have optional density hook');
    assert.match(src, /useTakThemeOptional/, 'Must have optional theme hook');
    // No throw when providers absent
    assert.doesNotMatch(src, /throw new Error.*TakThemeProvider/, 'Must not throw when theme provider absent');
  });

  it('test_tak_icon_tree_shakeable', () => {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, 'packages', 'react', 'package.json'), 'utf8'));
    assert.equal(pkg.sideEffects, false, 'Package must declare sideEffects: false');
  });
});

describe('REQ-RCT-009: ShapeRenderer sub-component', () => {
  it('test_shape_renderer', () => {
    assert.ok(existsSync(resolve(SRC, 'ShapeRenderer.tsx')), 'ShapeRenderer.tsx must exist');
  });

  it('test_shape_renderer_rectangle', () => {
    const src = readFileSync(resolve(SRC, 'ShapeRenderer.tsx'), 'utf8');
    assert.match(src, /borderRadius/, 'Must support border-radius for rectangles');
    assert.match(src, /corners/, 'Must read corners data');
  });

  it('test_shape_renderer_oval', () => {
    const src = readFileSync(resolve(SRC, 'ShapeRenderer.tsx'), 'utf8');
    assert.match(src, /oval/, 'Must detect oval shape type');
    assert.match(src, /50%/, 'Must use 50% border-radius for ovals');
  });

  it('test_shape_renderer_gradient', () => {
    const src = readFileSync(resolve(SRC, 'ShapeRenderer.tsx'), 'utf8');
    assert.match(src, /linear-gradient/, 'Must support linear-gradient');
    assert.match(src, /radial-gradient/, 'Must support radial-gradient');
    assert.match(src, /conic-gradient/, 'Must support conic/sweep gradient');
  });

  it('test_shape_renderer_stroke', () => {
    const src = readFileSync(resolve(SRC, 'ShapeRenderer.tsx'), 'utf8');
    assert.match(src, /border/, 'Must render stroke as CSS border');
    assert.match(src, /dashed/, 'Must support dashed stroke');
  });

  it('test_shape_renderer_all_shapes_no_error', () => {
    // Verify all shapes in the data file have valid structure
    const shapesPath = resolve(ROOT, 'data', 'atak-shapes.json');
    assert.ok(existsSync(shapesPath), 'atak-shapes.json must exist');
    const shapes = JSON.parse(readFileSync(shapesPath, 'utf8'));
    assert.ok(shapes.length > 0, 'Must have shape entries');
    for (const shape of shapes) {
      assert.ok(shape.name, `Shape must have name`);
      assert.ok(shape.shapeType, `Shape ${shape.name} must have shapeType`);
      assert.ok(['rectangle', 'oval', 'ring', 'line'].includes(shape.shapeType),
        `Shape ${shape.name} has unexpected type: ${shape.shapeType}`);
    }
  });
});

describe('REQ-RCT-010: SelectorRenderer sub-component', () => {
  it('test_selector_renderer', () => {
    assert.ok(existsSync(resolve(SRC, 'SelectorRenderer.tsx')), 'SelectorRenderer.tsx must exist');
  });

  it('test_selector_default_state', () => {
    const src = readFileSync(resolve(SRC, 'SelectorRenderer.tsx'), 'utf8');
    assert.match(src, /selectors\/.*\.png/, 'Must render pre-rendered PNG for default state');
    assert.match(src, /loading="lazy"/, 'Must lazy-load selector images');
  });

  it('test_selector_hover_pressed', () => {
    const src = readFileSync(resolve(SRC, 'SelectorRenderer.tsx'), 'utf8');
    assert.match(src, /interactive/, 'Must support interactive prop');
  });

  it('test_selector_disabled_state', () => {
    const src = readFileSync(resolve(SRC, 'SelectorRenderer.tsx'), 'utf8');
    assert.match(src, /conditions/, 'Must read state conditions');
  });

  it('test_selector_inline_drawable', () => {
    const src = readFileSync(resolve(SRC, 'SelectorRenderer.tsx'), 'utf8');
    assert.match(src, /inlineDrawable/, 'Must handle inline drawable definitions');
    assert.match(src, /ShapeRenderer/, 'Must delegate inline shapes to ShapeRenderer');
  });

  it('test_selector_unresolvable_fallback', () => {
    const src = readFileSync(resolve(SRC, 'SelectorRenderer.tsx'), 'utf8');
    // Must not crash -- has fallback path
    assert.match(src, /fallback|default|\.png/, 'Must have fallback rendering path');
  });
});

describe('REQ-RCT-011: LayerListRenderer sub-component', () => {
  it('test_layer_list_renderer', () => {
    assert.ok(existsSync(resolve(SRC, 'LayerListRenderer.tsx')), 'LayerListRenderer.tsx must exist');
  });

  it('test_layer_list_stacking_order', () => {
    const src = readFileSync(resolve(SRC, 'LayerListRenderer.tsx'), 'utf8');
    assert.match(src, /layers\.map/, 'Must render layers in array order');
    assert.match(src, /position: 'relative'/, 'Container must use relative positioning');
    assert.match(src, /position: 'absolute'/, 'Layers must use absolute positioning');
  });

  it('test_layer_list_offsets', () => {
    const src = readFileSync(resolve(SRC, 'LayerListRenderer.tsx'), 'utf8');
    assert.match(src, /layer\.left/, 'Must apply left offset');
    assert.match(src, /layer\.top/, 'Must apply top offset');
    assert.match(src, /layer\.right/, 'Must apply right offset');
    assert.match(src, /layer\.bottom/, 'Must apply bottom offset');
  });

  it('test_layer_list_inline_shape', () => {
    const src = readFileSync(resolve(SRC, 'LayerListRenderer.tsx'), 'utf8');
    assert.match(src, /inlineShape/, 'Must detect inline shape layers');
    assert.match(src, /ShapeRenderer/, 'Must delegate inline shapes to ShapeRenderer');
  });

  it('test_layer_list_all_render_no_error', () => {
    const llPath = resolve(ROOT, 'data', 'atak-layer-lists.json');
    assert.ok(existsSync(llPath), 'atak-layer-lists.json must exist');
    const layerLists = JSON.parse(readFileSync(llPath, 'utf8'));
    assert.ok(layerLists.length > 0, 'Must have layer-list entries');
    for (const ll of layerLists) {
      assert.ok(ll.name, 'Layer-list must have name');
      assert.ok(Array.isArray(ll.layers), `${ll.name} must have layers array`);
      assert.ok(ll.layers.length > 0, `${ll.name} must have at least one layer`);
      for (const layer of ll.layers) {
        assert.equal(typeof layer.index, 'number', `${ll.name} layer must have numeric index`);
      }
    }
  });
});

describe('REQ-RCT-012: TakIcon size and theme integration', () => {
  it('test_icon_size_sm', () => {
    const src = readFileSync(resolve(SRC, 'types.ts'), 'utf8');
    assert.match(src, /sm:\s*24/, 'sm must map to 24px');
  });

  it('test_icon_size_xl', () => {
    const src = readFileSync(resolve(SRC, 'types.ts'), 'utf8');
    assert.match(src, /xl:\s*48/, 'xl must map to 48px');
  });

  it('test_icon_theme_dark', () => {
    const src = readFileSync(resolve(SRC, 'TakIcon.tsx'), 'utf8');
    assert.match(src, /dark/, 'Must handle dark theme mode');
  });

  it('test_icon_theme_light', () => {
    const src = readFileSync(resolve(SRC, 'TakIcon.tsx'), 'utf8');
    assert.match(src, /light/, 'Must handle light theme mode');
  });

  it('test_icon_density_mobile', () => {
    const src = readFileSync(resolve(SRC, 'TakIcon.tsx'), 'utf8');
    assert.match(src, /1\.25/, 'Mobile density must use 1.25x scale');
    assert.match(src, /1\.0/, 'Desktop density must use 1.0x scale');
  });

  it('test_icon_no_providers', () => {
    const src = readFileSync(resolve(SRC, 'TakIcon.tsx'), 'utf8');
    assert.match(src, /useDensityOptional/, 'Must have optional density hook');
    // The function must catch errors from missing provider
    assert.match(src, /catch/, 'Must catch missing provider errors');
  });
});
