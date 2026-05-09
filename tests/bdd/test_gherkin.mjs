// rtmx:req REQ-XW-050
// rtmx:req REQ-XW-051
// rtmx:req REQ-XW-052
// rtmx:req REQ-XW-053
// rtmx:req REQ-XW-054
// rtmx:req REQ-XW-055

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const specsDir = join(__dirname, "..", "..", "specs");

const featureFiles = [
  { file: "cot-lifecycle.feature", req: "XW-050" },
  { file: "team-management.feature", req: "XW-051" },
  { file: "geochat.feature", req: "XW-052" },
  { file: "route-planning.feature", req: "XW-053" },
  { file: "nine-line.feature", req: "XW-054" },
  { file: "connections.feature", req: "XW-055" },
];

describe("BDD Gherkin feature files", () => {
  for (const { file, req } of featureFiles) {
    const filePath = join(specsDir, file);

    describe(`${req}: ${file}`, () => {
      // rtmx:req REQ-XW-050
      // rtmx:req REQ-XW-051
      // rtmx:req REQ-XW-052
      // rtmx:req REQ-XW-053
      // rtmx:req REQ-XW-054
      // rtmx:req REQ-XW-055

      it("should exist in specs/ directory", () => {
        assert.ok(
          existsSync(filePath),
          `Feature file ${file} must exist at ${filePath}`
        );
      });

      it('should start with "Feature:"', () => {
        const content = readFileSync(filePath, "utf-8");
        assert.match(
          content.trimStart(),
          /^Feature:/,
          `${file} must start with "Feature:"`
        );
      });

      it('should contain at least 3 "Scenario:" blocks', () => {
        const content = readFileSync(filePath, "utf-8");
        const scenarioMatches = content.match(/^\s*Scenario:/gm);
        assert.ok(
          scenarioMatches && scenarioMatches.length >= 3,
          `${file} must contain at least 3 Scenario blocks, found ${scenarioMatches ? scenarioMatches.length : 0}`
        );
      });

      it("should have Given/When/Then steps in each scenario", () => {
        const content = readFileSync(filePath, "utf-8");
        const scenarios = content.split(/^\s*Scenario:/m).slice(1);

        for (let i = 0; i < scenarios.length; i++) {
          const scenario = scenarios[i];
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
        }
      });
    });
  }
});
