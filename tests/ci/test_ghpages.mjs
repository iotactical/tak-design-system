// rtmx:req REQ-XW-135
import { readFileSync, existsSync } from 'fs';
import { strict as assert } from 'assert';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

const workflowPath = resolve(root, '.github/workflows/deploy-site.yml');

// Test: workflow file exists
assert.ok(existsSync(workflowPath), 'deploy-site.yml must exist');

const content = readFileSync(workflowPath, 'utf8');

// Test: contains github-pages environment
assert.ok(
  content.includes('github-pages'),
  'Workflow must reference github-pages environment'
);

// Test: contains site/dist upload path
assert.ok(
  content.includes('site/dist'),
  'Workflow must upload site/dist artifact path'
);

console.log('REQ-XW-135: GitHub Pages deployment workflow tests passed');
