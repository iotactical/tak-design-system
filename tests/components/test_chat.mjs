import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// rtmx:req REQ-CMP-006
describe('REQ-CMP-006: ChatPanel component', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-CMP-006
  it('ChatPanel component exported', () => {
    assert.match(dts, /export declare const ChatPanel/);
  });

  // rtmx:req REQ-CMP-006
  it('ChatPanelProps type exported', () => {
    assert.match(dts, /ChatPanelProps/);
  });

  // rtmx:req REQ-CMP-006
  it('ChatMessage type exported', () => {
    assert.match(dts, /ChatMessage/);
  });

  // rtmx:req REQ-CMP-006
  it('messages prop accepts ChatMessage array', () => {
    assert.match(dts, /messages:\s*ChatMessage\[\]/);
  });

  // rtmx:req REQ-CMP-006
  it('onSend callback prop exists', () => {
    assert.match(dts, /onSend\?.*\(text:\s*string\)\s*=>\s*void/);
  });

  // rtmx:req REQ-CMP-006
  it('channel prop exists', () => {
    assert.match(dts, /channel\?.*string/);
  });

  // rtmx:req REQ-CMP-006
  it('channels prop accepts string array', () => {
    assert.match(dts, /channels\?.*string\[\]/);
  });

  // rtmx:req REQ-CMP-006
  it('onChannelChange callback prop exists', () => {
    assert.match(dts, /onChannelChange\?.*\(channel:\s*string\)\s*=>\s*void/);
  });

  // rtmx:req REQ-CMP-006
  it('unreadCount prop exists', () => {
    assert.match(dts, /unreadCount\?.*number/);
  });

  // rtmx:req REQ-CMP-006
  it('ChatMessage has id, sender, text, timestamp fields', () => {
    assert.match(dts, /id:\s*string/);
    assert.match(dts, /sender:\s*string/);
    assert.match(dts, /text:\s*string/);
    assert.match(dts, /timestamp:\s*Date/);
  });

  // rtmx:req REQ-CMP-006
  it('ChatMessage has optional isSelf and coordinate', () => {
    assert.match(dts, /isSelf\?.*boolean/);
    assert.match(dts, /coordinate\?/);
    assert.match(dts, /lat:\s*number/);
    assert.match(dts, /lon:\s*number/);
  });
});
