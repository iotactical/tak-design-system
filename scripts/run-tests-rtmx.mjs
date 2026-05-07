#!/usr/bin/env node
/**
 * Run node:test suite and produce RTMX-compatible results JSON.
 * Output: .rtmx/results.json
 */

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const RESULTS_PATH = resolve(ROOT, '.rtmx', 'results.json');

// Run tests with TAP output and capture
let output;
let exitCode = 0;
try {
  output = execSync('node --test tests/**/*.mjs', {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
} catch (e) {
  output = e.stdout || '';
  exitCode = e.status || 1;
}

// Parse TAP output to extract suite-level pass/fail with req markers
const results = [];
const lines = output.split('\n');

// Track current suite and its req marker
let currentSuite = null;
let currentReqId = null;
let suiteFile = null;
let allSubtestsPassed = true;

// Map files to their req IDs by scanning the test source
import { readFileSync, readdirSync } from 'node:fs';

function scanTestFiles() {
  const map = {};
  const dirs = ['tests/tokens', 'tests/build', 'tests/assets'];
  for (const dir of dirs) {
    let files;
    try {
      files = readdirSync(resolve(ROOT, dir));
    } catch { continue; }
    for (const file of files) {
      if (!file.endsWith('.mjs')) continue;
      const content = readFileSync(resolve(ROOT, dir, file), 'utf8');
      const markers = content.match(/\/\/ rtmx:req (REQ-[A-Z0-9-]+)/g) || [];
      for (const m of markers) {
        const reqId = m.replace('// rtmx:req ', '');
        map[reqId] = { file: `${dir}/${file}` };
      }
    }
  }
  return map;
}

const reqMap = scanTestFiles();

// Parse TAP: look for suite results (ok/not ok at top level = suite)
for (const line of lines) {
  // Top-level suite result: "ok N - SUITE_NAME" or "not ok N - SUITE_NAME"
  const suiteMatch = line.match(/^(ok|not ok) \d+ - (.+)$/);
  if (suiteMatch) {
    const passed = suiteMatch[1] === 'ok';
    const suiteName = suiteMatch[2];
    // Extract REQ-ID from suite name
    const reqMatch = suiteName.match(/(REQ-[A-Z]+-\d+)/);
    if (reqMatch) {
      const reqId = reqMatch[1];
      const fileInfo = reqMap[reqId];
      results.push({
        req_id: reqId,
        test_name: suiteName,
        test_file: fileInfo?.file || 'unknown',
        passed: passed
      });
    }
  }
}

// Also check for inline REQ markers (REQ-BLD-006 is tested inside REQ-BLD-004's suite)
// If REQ-BLD-006 marker exists but no separate suite result, derive from parent
for (const [reqId, info] of Object.entries(reqMap)) {
  if (!results.find(r => r.req_id === reqId)) {
    // Check if the test that covers this req passed in its parent suite
    const parentResult = results.find(r => r.test_file === info.file);
    if (parentResult) {
      results.push({
        req_id: reqId,
        test_name: `${reqId} (inline in ${parentResult.req_id})`,
        test_file: info.file,
        passed: parentResult.passed
      });
    }
  }
}

writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
console.log(`Wrote ${results.length} results to ${RESULTS_PATH}`);
console.log(`Tests ${exitCode === 0 ? 'PASSED' : 'FAILED'} (exit ${exitCode})`);
process.exit(exitCode);
