import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const sourcePage = join(root, 'site', 'src', 'pages', 'Sources.tsx');

const page = readFileSync(sourcePage, 'utf-8');
const urls = [...page.matchAll(/url:\s*'([^']+)'/g)].map((m) => m[1]);

// The upstreams this design system actually derives from. Both were pointed at
// a personal account that returns 404, so a source page that claimed to be
// authoritative sent readers nowhere.
const AUTHORITATIVE = {
  'ATAK-CIV (GitHub)': 'https://github.com/TAK-Product-Center/atak-civ',
  'TAK Server (GitHub)': 'https://github.com/TAK-Product-Center/Server',
};

describe('Sources page links', () => {
  it('lists every source over https', () => {
    assert.ok(urls.length > 0, 'no source URLs found; did the page structure change?');
    for (const url of urls) {
      assert.match(url, /^https:\/\//, `${url} must use https`);
    }
  });

  it('has no duplicate URLs', () => {
    const duplicates = urls.filter((u, i) => urls.indexOf(u) !== i);
    assert.deepEqual(duplicates, [], `duplicate source URLs: ${duplicates.join(', ')}`);
  });

  it('points the GitHub entries at the TAK Product Center', () => {
    for (const [name, expected] of Object.entries(AUTHORITATIVE)) {
      const entry = page.match(new RegExp(`name: '${name.replace(/[()]/g, '\\$&')}',\\s*\\n\\s*url: '([^']+)'`));
      assert.ok(entry, `missing source entry: ${name}`);
      assert.equal(entry[1], expected, `${name} must link to the TAK Product Center repository`);
    }
  });

  it('gives every GitHub link an owner and repository', () => {
    for (const url of urls.filter((u) => u.startsWith('https://github.com/'))) {
      assert.match(url, /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/, `${url} is not a repository URL`);
    }
  });

  // A bare /community/file/<id> URL 404s on mobile browsers, which is how the
  // Figma entries became dead ends; the slug is what makes them resolve.
  it('gives every Figma community link a file slug', () => {
    const figma = urls.filter((u) => u.includes('figma.com'));
    assert.ok(figma.length > 0, 'expected Figma sources');
    for (const url of figma) {
      assert.match(
        url,
        /^https:\/\/www\.figma\.com\/community\/file\/\d+\/[\w-]+$/,
        `${url} must include the file slug or it will not resolve on mobile`,
      );
    }
  });

  it('marks the Figma entries as needing a desktop browser', () => {
    const figmaEntries = [...page.matchAll(/url:\s*'https:\/\/www\.figma\.com[^']+',\s*\n\s*description:[^\n]*\n\s*category:[^\n]*\n\s*note:\s*'([^']+)'/g)];
    assert.equal(figmaEntries.length, 2, 'both Figma sources must carry a note about desktop use');
  });
});
