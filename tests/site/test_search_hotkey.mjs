// rtmx:req REQ-XW-123
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GLOBAL_SEARCH_PATH = resolve(__dirname, '..', '..', 'site', 'src', 'components', 'GlobalSearch.tsx');
const globalSearchSrc = readFileSync(GLOBAL_SEARCH_PATH, 'utf8');

describe('REQ-XW-123: Cmd+K / Ctrl+K hotkey', () => {

  it('GlobalSearch registers a global keydown listener', () => {
    assert.ok(
      globalSearchSrc.includes("document.addEventListener('keydown'"),
      'GlobalSearch should add a global keydown event listener',
    );
  });

  it('keydown handler checks for metaKey (Cmd on macOS)', () => {
    assert.ok(
      globalSearchSrc.includes('e.metaKey'),
      'Handler should check e.metaKey for macOS Cmd key',
    );
  });

  it('keydown handler checks for ctrlKey (Ctrl on Windows/Linux)', () => {
    assert.ok(
      globalSearchSrc.includes('e.ctrlKey'),
      'Handler should check e.ctrlKey for Windows/Linux Ctrl key',
    );
  });

  it('keydown handler checks for the k key', () => {
    assert.ok(
      globalSearchSrc.includes("e.key === 'k'"),
      "Handler should check for e.key === 'k'",
    );
  });

  it('keydown handler prevents default browser behavior', () => {
    assert.ok(
      globalSearchSrc.includes('e.preventDefault()'),
      'Handler should call e.preventDefault() to suppress browser find bar',
    );
  });

  it('keydown handler focuses the search input', () => {
    assert.ok(
      globalSearchSrc.includes('inputRef.current?.focus()'),
      'Handler should focus inputRef on Cmd+K / Ctrl+K',
    );
  });

  it('keydown listener is cleaned up on unmount', () => {
    assert.ok(
      globalSearchSrc.includes("document.removeEventListener('keydown'"),
      'useEffect should return a cleanup function that removes the keydown listener',
    );
  });

  it('search input placeholder mentions Cmd+K shortcut', () => {
    assert.ok(
      globalSearchSrc.includes('Cmd+K'),
      'Search placeholder should hint at the Cmd+K shortcut',
    );
  });
});
