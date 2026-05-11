// rtmx:req REQ-XW-170
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const B2D_PATH = resolve(ROOT, 'data', 'mil-std-2525', 'b2d.json');
const MANIFEST_PATH = resolve(ROOT, 'data', '2525-svg-manifest.json');
const SVG_DIR = resolve(ROOT, 'site', 'public', '2525');

const AFFILIATIONS = ['friendly', 'hostile', 'neutral', 'unknown'];

describe('REQ-XW-170: Lossy crosswalk entries render with sector modifiers', () => {
  const b2d = JSON.parse(readFileSync(B2D_PATH, 'utf8'));
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const lossyEntries = b2d.mappings.filter((m) => m.lossy === true);

  it('has exactly 438 lossy entries', () => {
    assert.equal(lossyEntries.length, 438, `expected 438 lossy entries, got ${lossyEntries.length}`);
  });

  it('every lossy entry has a B-key in the manifest for all 4 affiliations', () => {
    const missing = [];
    for (const entry of lossyEntries) {
      for (const aff of AFFILIATIONS) {
        if (!manifest[aff][entry.b_sidc]) {
          missing.push({ b_sidc: entry.b_sidc, affiliation: aff });
        }
      }
    }
    assert.equal(
      missing.length,
      0,
      `${missing.length} lossy entries missing from manifest:\n${missing.slice(0, 10).map((m) => `  ${m.b_sidc} [${m.affiliation}]`).join('\n')}`
    );
  });

  it('manifest filenames include modifier digits when d_s1/d_s2 are non-zero', () => {
    const wrongModifier = [];
    for (const entry of lossyEntries) {
      const hasS1 = entry.d_s1 !== '00';
      const hasS2 = entry.d_s2 !== '00';
      if (!hasS1 && !hasS2) continue;

      const filename = manifest.friendly[entry.b_sidc];
      if (!filename) continue;

      // The SIDC filename is 20 chars + .svg
      // Format: VV-AA-SS-HHHH-EEEEEE-S1-S2
      // positions: [0-1]=version(10), [2-3]=affiliation, [4-5]=ss,
      //   [6-9]=hq/tffd, [10-15]=entity code, [16-17]=s1, [18-19]=s2
      const base = filename.replace('.svg', '');
      if (base.length !== 20) continue;

      const fileS1 = base.substring(16, 18);
      const fileS2 = base.substring(18, 20);

      if (hasS1 && fileS1 === '00') {
        wrongModifier.push({ b_sidc: entry.b_sidc, expected_s1: entry.d_s1, got_s1: fileS1 });
      }
      if (hasS2 && fileS2 === '00') {
        wrongModifier.push({ b_sidc: entry.b_sidc, expected_s2: entry.d_s2, got_s2: fileS2 });
      }
    }
    assert.equal(
      wrongModifier.length,
      0,
      `${wrongModifier.length} entries have wrong modifier in filename:\n${wrongModifier.slice(0, 10).map((w) => `  ${w.b_sidc} expected s1=${w.expected_s1 || '-'} s2=${w.expected_s2 || '-'}`).join('\n')}`
    );
  });

  it('SVG files exist on disk for all lossy entries in all affiliations', () => {
    const missingFiles = [];
    for (const entry of lossyEntries) {
      for (const aff of AFFILIATIONS) {
        const filename = manifest[aff][entry.b_sidc];
        if (!filename) continue;
        const svgPath = resolve(SVG_DIR, aff, filename);
        if (!existsSync(svgPath)) {
          missingFiles.push({ b_sidc: entry.b_sidc, affiliation: aff, path: svgPath });
        }
      }
    }
    assert.equal(
      missingFiles.length,
      0,
      `${missingFiles.length} SVG files missing on disk:\n${missingFiles.slice(0, 10).map((m) => `  ${m.b_sidc} [${m.affiliation}] ${m.path}`).join('\n')}`
    );
  });

  it('reports summary statistics', () => {
    let verifiedWithModifier = 0;
    let missingFromManifest = 0;
    let wrongModifier = 0;

    for (const entry of lossyEntries) {
      const filename = manifest.friendly[entry.b_sidc];
      if (!filename) {
        missingFromManifest++;
        continue;
      }

      const hasS1 = entry.d_s1 !== '00';
      const hasS2 = entry.d_s2 !== '00';
      if (!hasS1 && !hasS2) {
        verifiedWithModifier++;
        continue;
      }

      const base = filename.replace('.svg', '');
      if (base.length !== 20) continue;

      const fileS1 = base.substring(16, 18);
      const fileS2 = base.substring(18, 20);

      const s1Ok = !hasS1 || fileS1 !== '00';
      const s2Ok = !hasS2 || fileS2 !== '00';

      if (s1Ok && s2Ok) {
        verifiedWithModifier++;
      } else {
        wrongModifier++;
      }
    }

    console.log(`  Lossy render summary:`);
    console.log(`    Total lossy: ${lossyEntries.length}`);
    console.log(`    Verified with modifier: ${verifiedWithModifier}`);
    console.log(`    Missing from manifest: ${missingFromManifest}`);
    console.log(`    Wrong modifier: ${wrongModifier}`);

    assert.equal(missingFromManifest, 0, 'no entries should be missing from manifest');
    assert.equal(wrongModifier, 0, 'no entries should have wrong modifier');
  });

  describe('ACP specific case (S*A*MHD---*****)', () => {
    const ACP_BSIDC = 'S*A*MHD---*****';
    const BASE_BSIDC = 'S*A*MH----*****';

    it('ACP maps to file with s1=11 in the SIDC', () => {
      const filename = manifest.friendly[ACP_BSIDC];
      assert.ok(filename, 'ACP should be in manifest');
      // filename: 10030100001102001100.svg - s1 portion should contain 11
      const base = filename.replace('.svg', '');
      // The s1 field in the 20-digit SIDC is at positions 16-17
      const fileS1 = base.substring(16, 18);
      assert.equal(fileS1, '11', `ACP s1 should be 11, got ${fileS1}`);
    });

    it('ACP file is different from base helicopter entity without s1', () => {
      const acpFile = manifest.friendly[ACP_BSIDC];
      const baseFile = manifest.friendly[BASE_BSIDC];
      assert.ok(acpFile, 'ACP should have a manifest entry');
      assert.ok(baseFile, 'Base helicopter should have a manifest entry');
      assert.notEqual(acpFile, baseFile, 'ACP file should differ from base helicopter file');
    });

    it('ACP SVG file exists on disk', () => {
      const filename = manifest.friendly[ACP_BSIDC];
      const svgPath = resolve(SVG_DIR, 'friendly', filename);
      assert.ok(existsSync(svgPath), `ACP SVG should exist at ${svgPath}`);
    });
  });
});
