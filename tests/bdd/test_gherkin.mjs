// rtmx:req REQ-SITE-007
// rtmx:req REQ-SITE-043
// rtmx:req REQ-SITE-044
// rtmx:req REQ-XW-050
// rtmx:req REQ-XW-051
// rtmx:req REQ-XW-052
// rtmx:req REQ-XW-053
// rtmx:req REQ-XW-054
// rtmx:req REQ-XW-055
// rtmx:req REQ-BDD-001
// rtmx:req REQ-BDD-002
// rtmx:req REQ-BDD-003
// rtmx:req REQ-BDD-004
// rtmx:req REQ-BDD-005
// rtmx:req REQ-BDD-006
// rtmx:req REQ-BDD-007
// rtmx:req REQ-BDD-008
// rtmx:req REQ-BDD-009
// rtmx:req REQ-BDD-010
// rtmx:req REQ-BDD-011
// rtmx:req REQ-BDD-012
// rtmx:req REQ-BDD-013
// rtmx:req REQ-BDD-014
// rtmx:req REQ-BDD-015
// rtmx:req REQ-BDD-016
// rtmx:req REQ-BDD-017
// rtmx:req REQ-BDD-018
// rtmx:req REQ-BDD-019
// rtmx:req REQ-BDD-020
// rtmx:req REQ-BDD-021
// rtmx:req REQ-BDD-022

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const specsDir = join(root, "specs");

const ORIGINAL = [
  { file: "cot-lifecycle.feature", req: "REQ-XW-050", minScenarios: 3 },
  { file: "team-management.feature", req: "REQ-XW-051", minScenarios: 3 },
  { file: "geochat.feature", req: "REQ-XW-052", minScenarios: 3 },
  { file: "route-planning.feature", req: "REQ-XW-053", minScenarios: 3 },
  { file: "nine-line.feature", req: "REQ-XW-054", minScenarios: 3 },
  { file: "connections.feature", req: "REQ-XW-055", minScenarios: 3 },
];

const ADDITIONS = [
  { file: "self-marker.feature", req: "REQ-BDD-001", minScenarios: 4 },
  { file: "icon-palettes.feature", req: "REQ-BDD-002", minScenarios: 4 },
  { file: "mission-packages.feature", req: "REQ-BDD-003", minScenarios: 4 },
  { file: "map-layers.feature", req: "REQ-BDD-004", minScenarios: 4 },
  { file: "geofence.feature", req: "REQ-BDD-005", minScenarios: 4 },
  { file: "map-orientation.feature", req: "REQ-BDD-006", minScenarios: 4 },
  { file: "overlay-hierarchy.feature", req: "REQ-BDD-007", minScenarios: 4 },
  { file: "range-bearing.feature", req: "REQ-BDD-008", minScenarios: 4 },
  { file: "bloodhound.feature", req: "REQ-BDD-009", minScenarios: 4 },
  { file: "drawing-tools.feature", req: "REQ-BDD-010", minScenarios: 4 },
  { file: "attachments.feature", req: "REQ-BDD-011", minScenarios: 4 },
  { file: "import-export.feature", req: "REQ-BDD-012", minScenarios: 4 },
  { file: "emergency-alert.feature", req: "REQ-BDD-013", minScenarios: 4 },
  { file: "viewshed.feature", req: "REQ-BDD-014", minScenarios: 4 },
  { file: "radial-menu.feature", req: "REQ-BDD-015", minScenarios: 4 },
  { file: "gps-location.feature", req: "REQ-BDD-016", minScenarios: 4 },
  { file: "pairing-line.feature", req: "REQ-BDD-017", minScenarios: 4 },
  { file: "tracks.feature", req: "REQ-BDD-018", minScenarios: 4 },
  { file: "coordinate-goto.feature", req: "REQ-BDD-019", minScenarios: 4 },
  { file: "video-stream.feature", req: "REQ-BDD-020", minScenarios: 4 },
  { file: "fires.feature", req: "REQ-BDD-021", minScenarios: 4 },
  { file: "contacts.feature", req: "REQ-BDD-022", minScenarios: 4 },
];

const CATALOG = [...ORIGINAL, ...ADDITIONS];

const REACT_COMPONENTS = readdirSync(join(root, "packages", "react", "src", "components"), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const INTENT_ACTIONS = new Set(
  JSON.parse(readFileSync(join(root, "data", "atak-intents.json"), "utf-8")).groups.flatMap(
    (group) => group.intents.map((intent) => intent.action)
  )
);

const PREFERENCE_KEYS = new Set(
  JSON.parse(readFileSync(join(root, "data", "atak-preference-keys.json"), "utf-8")).keys
);

function featureFilesOnDisk() {
  return readdirSync(specsDir)
    .filter((name) => name.endsWith(".feature"))
    .sort();
}

function quoted(content, pattern) {
  return [...content.matchAll(pattern)].map((match) => match[1]);
}

function assertGherkinShape(file, content, minScenarios) {
  assert.match(
    content.trimStart(),
    /^Feature:/,
    `${file} must start with "Feature:"`
  );

  const scenarioMatches = content.match(/^\s*Scenario:/gm);
  const found = scenarioMatches ? scenarioMatches.length : 0;
  assert.ok(
    found >= minScenarios,
    `${file} must contain at least ${minScenarios} Scenario blocks, found ${found}`
  );

  const scenarios = content.split(/^\s*Scenario:/m).slice(1);
  for (const scenario of scenarios) {
    const scenarioLabel = scenario.split("\n")[0].trim();
    assert.match(
      scenario,
      /^\s*(Given )/m,
      `Scenario "${scenarioLabel}" in ${file} must have a Given step`
    );
    assert.match(
      scenario,
      /^\s*(When )/m,
      `Scenario "${scenarioLabel}" in ${file} must have a When step`
    );
    assert.match(
      scenario,
      /^\s*(Then )/m,
      `Scenario "${scenarioLabel}" in ${file} must have a Then step`
    );
    assert.match(
      scenario,
      /^\s*# SUM: /m,
      `Scenario "${scenarioLabel}" in ${file} must quote a Software User Manual instruction with "# SUM:"`
    );
  }
}

function assertSumMapping(file, content) {
  assert.match(
    content,
    /Source:\s*ATAK Civilian Software User Manual/,
    `${file} must cite the ATAK Civilian Software User Manual`
  );

  const intents = quoted(content, /intent "([^"]+)"/g);
  assert.ok(intents.length > 0, `${file} must map at least one intent "…"`);
  for (const action of intents) {
    assert.ok(
      INTENT_ACTIONS.has(action),
      `${file} cites unknown intent "${action}"; must exist in data/atak-intents.json`
    );
  }

  const prefs = quoted(content, /preference "([^"]+)"/g);
  assert.ok(prefs.length > 0, `${file} must map at least one preference "…"`);
  for (const key of prefs) {
    assert.ok(
      PREFERENCE_KEYS.has(key),
      `${file} cites unknown preference "${key}"; must exist in data/atak-preference-keys.json`
    );
  }

  const cotTypes = quoted(content, /CoT type "([^"]+)"/g);
  assert.ok(cotTypes.length > 0, `${file} must map at least one CoT type "…"`);
  for (const cotType of cotTypes) {
    assert.match(
      cotType,
      /^[a-z](-[A-Za-z0-9]+)+$/,
      `${file} CoT type "${cotType}" is not a TAK type token`
    );
  }

  const namedComponents = REACT_COMPONENTS.filter((name) =>
    new RegExp(`\\b${name}\\b`).test(content)
  );
  assert.ok(
    namedComponents.length > 0,
    `${file} must name at least one @iotactical/tak-react component (${REACT_COMPONENTS.join(", ")})`
  );
}

describe("BDD Gherkin catalog", () => {
  // rtmx:req REQ-SITE-043
  it("test_bdd_catalog: lists more than the original six workflows", () => {
    assert.ok(
      CATALOG.length > 6,
      "ATAK core catalog must be larger than the original six SITE-007 files"
    );
    assert.equal(ADDITIONS.length, 22);
    assert.equal(ORIGINAL.length, 6);
  });

  // rtmx:req REQ-SITE-007
  // rtmx:req REQ-SITE-043
  it("test_gherkin_syntax: fails if any catalog file is missing", () => {
    const missing = CATALOG.filter(
      ({ file }) => !existsSync(join(specsDir, file))
    ).map(({ file }) => file);
    assert.deepEqual(
      missing,
      [],
      `Catalog files missing from specs/: ${missing.join(", ")}`
    );
  });

  // rtmx:req REQ-SITE-043
  it("does not treat a six-file directory as complete", () => {
    const onDisk = featureFilesOnDisk();
    assert.ok(
      onDisk.length > 6,
      `specs/ has ${onDisk.length} .feature files; ATAK core catalog is not complete at six`
    );
    assert.ok(
      onDisk.length >= CATALOG.length,
      `specs/ has ${onDisk.length} .feature files; catalog requires ${CATALOG.length}`
    );
  });

  // rtmx:req REQ-SITE-044
  it("test_sum_mapping: catalog files quote the Software User Manual and map platform surfaces", () => {
    for (const { file } of CATALOG) {
      const content = readFileSync(join(specsDir, file), "utf-8");
      assertSumMapping(file, content);
    }
  });

  for (const { file, req, minScenarios } of CATALOG) {
    const filePath = join(specsDir, file);

    describe(`${req}: ${file}`, () => {
      it(`test_${file.replace(".feature", "").replace(/-/g, "_")}_feature exists and is parseable`, () => {
        assert.ok(existsSync(filePath), `${file} must exist at ${filePath}`);
        const content = readFileSync(filePath, "utf-8");
        assertGherkinShape(file, content, minScenarios);
        assertSumMapping(file, content);
      });
    });
  }

  describe("additional specs on disk", () => {
    const extras = featureFilesOnDisk().filter(
      (file) => !CATALOG.some((row) => row.file === file)
    );

    for (const file of extras) {
      it(`${file} still parses as Gherkin`, () => {
        const content = readFileSync(join(specsDir, file), "utf-8");
        assertGherkinShape(file, content, 3);
        assertSumMapping(file, content);
      });
    }
  });
});
