// rtmx:req REQ-SITE-045
// rtmx:req REQ-SITE-047

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");

const FEATURES = JSON.parse(
  readFileSync(join(root, "data", "atak-sum-features.json"), "utf-8")
);
const PREFS = JSON.parse(
  readFileSync(join(root, "data", "atak-preferences.json"), "utf-8")
);
const SCREENS = JSON.parse(
  readFileSync(join(root, "data", "atak-preference-screens.json"), "utf-8")
);
const KEYS = JSON.parse(
  readFileSync(join(root, "data", "atak-preference-keys.json"), "utf-8")
);

describe("ATAK SUM and preference catalogs", () => {
  // rtmx:req REQ-SITE-045
  it("test_sum_catalog: defines every SUM chapter and preference", () => {
    assert.match(
      FEATURES.source,
      /TAK-Product-Center\/atak-civ/,
      "feature catalog must pin TAK Product Center atak-civ"
    );
    assert.match(FEATURES.source, /ATAK_SUM\.typ/);
    assert.equal(FEATURES.version, "5.5");
    assert.equal(FEATURES.chapter_count, 31);
    assert.ok(Array.isArray(FEATURES.features));
    assert.equal(FEATURES.count, FEATURES.features.length);
    assert.ok(
      FEATURES.count >= 100,
      `SUM+Settings feature catalog must include prose tools and Settings screens, found ${FEATURES.count}`
    );

    const chapters = new Set(
      FEATURES.features.filter((row) => row.chapter >= 1).map((row) => row.chapter)
    );
    assert.deepEqual(
      [...chapters].sort((a, b) => a - b),
      Array.from({ length: 31 }, (_, i) => i + 1),
      "catalog must include SUM chapters 1 through 31"
    );

    const requiredHeadings = [
      "Heatmap",
      "Terrain Slope",
      "Vehicle Models iconset",
      "WMS and smart cache",
      "Preference Management (load, save, clone)",
      "Brightness tool",
      "Laser Range Finder",
    ];
    const headings = new Set(FEATURES.features.map((row) => row.heading));
    for (const heading of requiredHeadings) {
      assert.ok(headings.has(heading), `feature catalog missing "${heading}"`);
    }

    const ids = new Set();
    for (const row of FEATURES.features) {
      assert.ok(row.id && row.heading && row.spec && row.req, JSON.stringify(row));
      assert.ok(row.spec.endsWith(".feature"), `${row.id} spec must be a .feature file`);
      assert.match(row.req, /^REQ-(BDD|XW)-\d+$/);
      assert.ok(!ids.has(row.id), `duplicate feature id ${row.id}`);
      ids.add(row.id);
      assert.ok(
        existsSync(join(root, "specs", row.spec)),
        `catalogued spec missing: specs/${row.spec} (${row.heading})`
      );
    }

    assert.match(
      PREFS.source,
      /TAK-Product-Center\/atak-civ/,
      "preference catalog must pin TAK Product Center atak-civ"
    );
    assert.match(PREFS.source, /SupportedPreferenceDisable\.txt/);
    assert.match(PREFS.xml_source, /res\/xml/);
    assert.ok(Array.isArray(PREFS.items));
    assert.equal(PREFS.count, PREFS.items.length);
    assert.ok(
      PREFS.items.length >= 500,
      `union of hide-list and preference XML must include at least 500 keys, found ${PREFS.items.length}`
    );
    assert.ok(
      PREFS.xml_key_count >= 470,
      `preference XML must contribute at least 470 keys, found ${PREFS.xml_key_count}`
    );
    assert.ok(
      PREFS.hideable_count >= 240,
      `SupportedPreferenceDisable inventory must include at least 240 hideable prefs, found ${PREFS.hideable_count}`
    );

    const hideKeys = new Set();
    const prefKeys = new Set();
    for (const item of PREFS.items) {
      assert.ok(item.key, "preference item needs a SharedPreferences key");
      assert.ok(item.label, `${item.key} needs a label`);
      assert.ok(
        ["setting", "category", "screen", "xml-alias"].includes(item.kind),
        `${item.key} has unknown kind ${item.kind}`
      );
      if (item.hide_key) {
        assert.match(
          item.hide_key,
          /^hidePreferenceItem_/,
          `${item.key} hide_key must use the SupportedPreferenceDisable prefix`
        );
        assert.equal(
          item.key,
          item.hide_key.replace(/^hidePreferenceItem_/, ""),
          `${item.hide_key} key must match the hidePreferenceItem_ suffix`
        );
        assert.ok(!hideKeys.has(item.hide_key), `duplicate hide_key ${item.hide_key}`);
        hideKeys.add(item.hide_key);
      }
      assert.ok(!prefKeys.has(item.key), `duplicate preference key ${item.key}`);
      prefKeys.add(item.key);
    }

    assert.ok(prefKeys.has("encryptionPassphrase"), "catalog must include Encryption Passphrase");
    assert.ok(prefKeys.has("locationCallsign"), "catalog must include My Callsign");
    assert.ok(prefKeys.has("savePrefs"), "catalog must include Preference Management save");
    assert.ok(prefKeys.has("loadPrefs"), "catalog must include Preference Management load");
    assert.ok(prefKeys.has("night_vision_widget"), "catalog must include Night Vision widget");
    assert.ok(
      prefKeys.has("nonBluetoothLaserRangeFinder"),
      "catalog must include LRF preference"
    );
    assert.ok(
      KEYS.keys.length === prefKeys.size,
      "atak-preference-keys.json must list every unique catalog key"
    );
    for (const key of KEYS.keys) {
      assert.ok(prefKeys.has(key), `orphan preference key ${key}`);
    }

    assert.match(SCREENS.source, /res\/xml/);
    assert.equal(SCREENS.count, SCREENS.screens.length);
    assert.ok(
      SCREENS.screens.length >= 60,
      `preference screen catalog must list ATAK res/xml files, found ${SCREENS.screens.length}`
    );
    const xmlKeys = new Set();
    for (const screen of SCREENS.screens) {
      assert.ok(screen.file.endsWith(".xml"), JSON.stringify(screen));
      assert.equal(screen.key_count, screen.keys.length);
      for (const key of screen.keys) xmlKeys.add(key);
    }
    assert.equal(xmlKeys.size, PREFS.xml_key_count);
    for (const key of xmlKeys) {
      assert.ok(prefKeys.has(key), `XML key ${key} missing from preference catalog`);
    }
  });

  // rtmx:req REQ-SITE-047
  it("test_preference_key_scenarios: one Scenario per catalogued preference key", async () => {
    const { expectedPreferenceKeysFeature } = await import(
      join(root, "scripts", "generate-preference-key-scenarios.mjs")
    );
    const generated = expectedPreferenceKeysFeature(root);
    const onDisk = readFileSync(join(root, "specs", "preference-keys.feature"), "utf-8");
    assert.equal(
      onDisk,
      generated,
      "specs/preference-keys.feature is stale; run: node scripts/generate-preference-key-scenarios.mjs"
    );
    const scenarios = (generated.match(/^\s*Scenario:/gm) || []).length;
    assert.equal(scenarios, PREFS.items.length);
    for (const item of PREFS.items) {
      assert.ok(
        generated.includes(`preference "${item.key}"`),
        `preference-keys.feature missing preference "${item.key}"`
      );
    }
  });
});
