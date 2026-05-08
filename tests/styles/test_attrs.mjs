import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, '..', '..', 'tokens', 'w3c');
const atak = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'atak.json'), 'utf8'));

// rtmx:req REQ-STY-011
describe('REQ-STY-011: ATAK custom attribute definitions', () => {
  it('state lists cover interactive attribute patterns', () => {
    // ATAK attrs like state_entered, state_error map to state tokens
    const state = atak.atak.state;
    // Verify state token structure exists for interactive patterns
    assert.ok(state['button-foreground'], 'button-foreground covers pressed/selected states');
    assert.ok(state['icon-tint'], 'icon-tint covers buttonImageTint pattern');
    assert.ok(state.textview, 'textview covers enabled/disabled text states');
  });

  it('dimension tokens cover iconSize attribute', () => {
    const dim = atak.atak.dimension.component;
    assert.ok(dim['list-item-title-icon-size'], 'iconSize 24px');
    assert.ok(dim['list-item-large-title-icon-size'], 'iconSize large 48px');
    assert.ok(dim['nav-slider-icon-size'], 'slider icon 32px');
    assert.ok(dim['vehicle-icon-size'], 'vehicle icon 48px');
  });

  it('font tokens cover text sizing attributes', () => {
    const font = atak.atak.dimension.font;
    assert.ok(font['text-size'], 'base textSize');
    assert.ok(font.small, 'small font');
    assert.ok(font.medium, 'medium font');
    assert.ok(font.tiny, 'tiny/minTextSize');
    assert.ok(font['section-header'], 'maxTextSize / header');
  });
});
