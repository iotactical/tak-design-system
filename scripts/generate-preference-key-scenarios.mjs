#!/usr/bin/env node
/**
 * Build specs/preference-keys.feature: one Scenario per data/atak-preferences.json key.
 * Generated file; edit the catalog or this script, then regenerate.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const GENERATED_FEATURE = "specs/preference-keys.feature";

const DEFAULT_SUM =
  "Changes and imports made here can always be updated later.";

const SCREEN_SUM = [
  [/bloodhound/i, "Colors and thresholds can be modified in Settings > Tool Preferences > Specific Tool Preferences > Bloodhound Preferences."],
  [/bread/i, "Track History and Bread Crumb options can be configured in the Settings > Tool Preferences > Specific Tool Preferences > Track History Preferences."],
  [/elevation/i, "Settings for Elevation Tools can be changed by navigating to Settings > Tool Preferences > Specific Tool Preferences > Elevation Overlay Preferences."],
  [/route/i, "The default distance for images to appear during navigation can be changed in Settings > Tool Preferences > Specific Tool Preferences > Route Preferences."],
  [/missionpackage|datapackage/i, "The threshold size may be changed in Settings > Tool Preferences > Specific Tool Preferences > Data Package Control Preferences."],
  [/unit_display|coord/i, "Range & Bearing Tool settings can be customized in Settings > Display Preferences > Basic Display Settings > Unit Display Format Preferences."],
  [/encrypt|network_connection/i, "To configure encryption, navigate to Settings > Network Preferences > Network Connection Preferences > Configure AES-256 Mesh Encryption."],
  [/video/i, "Digital Pointer Tools settings can be customized in Settings > Tool Preferences > Specific Tool Preferences > Digital Pointer Toolbar Preferences."],
  [/chat/i, "The Chat tool logs, organizes and displays the most recent chat message that was sent from each chatroom associated with the local device."],
  [/call.?sign|device_pref/i, "The user can supply their own passphrase by using Settings > Callsign and Device Preferences > Encryption Password > Change Encryption Passphrase."],
  [/display/i, "The appearance of the Self-Marker can be customized by navigating to Additional Tools and Plugins > Settings > Display Preferences > My Location Color/Size."],
  [/support|about|docs/i, "To access the User Feedback Tool, navigate to Additional Tools and Settings > Settings > Support > User Feedback."],
  [/preference_management/i, "Changes and imports made here can always be updated later."],
];

function sumQuote(item) {
  const hay = `${item.key} ${item.label} ${(item.screens || []).join(" ")}`;
  for (const [pattern, quote] of SCREEN_SUM) {
    if (pattern.test(hay)) return quote;
  }
  return DEFAULT_SUM;
}

function gherkinQuote(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function scenarioFor(item) {
  const key = gherkinQuote(item.key);
  const quote = gherkinQuote(sumQuote(item));
  const screen = (item.screens && item.screens[0]) || "Settings";
  const hideStep = item.hide_key
    ? `\n    And preference hide key ${item.hide_key} should omit the row when true`
    : "";

  if (item.kind === "screen") {
    return `
  Scenario: screen ${item.key}
    # SUM: "${quote}"
    Given Settings is open on ${screen}
    When the operator selects preference "${key}"
    Then ListView should open that Settings screen
    And intent "com.atakmap.app.COMPONENTS_CREATED" should have registered it
    And a CoT type "a-f-G-U-C" self SA event should continue${hideStep}
`.trimEnd();
  }

  if (item.kind === "category") {
    return `
  Scenario: category ${item.key}
    # SUM: "${quote}"
    Given Settings is open on ${screen}
    When ListView renders preference "${key}"
    Then the grouped settings should appear under that category
    And intent "com.atakmap.app.COMPONENTS_CREATED" should have registered the screen
    And a CoT type "a-f-G-U-C" self SA event should continue${hideStep}
`.trimEnd();
  }

  if (item.kind === "xml-alias") {
    return `
  Scenario: xml-alias ${item.key}
    # SUM: "${quote}"
    Given ${screen} is loaded
    When preference "${key}" is resolved
    Then ListView should treat it as a catalogued key
    And intent "com.atakmap.app.COMPONENTS_CREATED" should have registered the screen
    And a CoT type "a-f-G-U-C" self SA event should continue${hideStep}
`.trimEnd();
  }

  return `
  Scenario: setting ${item.key}
    # SUM: "${quote}"
    Given Settings is open on ${screen}
    When the operator changes preference "${key}"
    Then ListView should persist preference "${key}"
    And DialogPanel should not invent a different SharedPreferences name
    And intent "com.atakmap.app.COMPONENTS_CREATED" should have registered the screen
    And a CoT type "a-f-G-U-C" self SA event should continue${hideStep}
`.trimEnd();
}

export function renderPreferenceKeysFeature(prefs) {
  const scenarios = prefs.items.map((item) => scenarioFor(item)).join("\n\n");
  return `Feature: Every catalogued ATAK preference key
  Generated by scripts/generate-preference-key-scenarios.mjs from data/atak-preferences.json
  Source: ATAK Civilian Software User Manual · Settings

  As a TAK operator
  I need one Scenario per SharedPreferences key
  So that hideable, XML, and screen-navigation prefs cannot be dropped from Gherkin

  Background:
    Given the TAK application is running

${scenarios}
`;
}

export function expectedPreferenceKeysFeature(root) {
  const prefs = JSON.parse(readFileSync(join(root, "data", "atak-preferences.json"), "utf-8"));
  return renderPreferenceKeysFeature(prefs);
}

const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (invokedDirectly) {
  const root = join(__dirname, "..");
  const feature = expectedPreferenceKeysFeature(root);
  writeFileSync(join(root, GENERATED_FEATURE), feature);
  const count = (feature.match(/^\s*Scenario:/gm) || []).length;
  console.log(`Wrote ${GENERATED_FEATURE} (${count} Scenario blocks)`);
}
