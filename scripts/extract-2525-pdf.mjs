#!/usr/bin/env node
/**
 * scripts/extract-2525-pdf.mjs
 * REQ-XW-151: Extract entity tables from MIL-STD-2525 version PDFs.
 *
 * For each PDF in the source directory, extracts text using pdftotext (or
 * `strings` as fallback) and saves raw output to data/mil-std-2525/raw/.
 * Then scans for SIDC patterns (15-char alphanumeric codes).
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const PDF_DIR = resolve(process.env.PDF_DIR || join(process.env.HOME, 'Downloads', 'MIL-STD-2525'));
const RAW_DIR = resolve('data/mil-std-2525/raw');

mkdirSync(RAW_DIR, { recursive: true });

// Detect pdftotext availability
let hasPdftotext = false;
try {
  execSync('which pdftotext', { stdio: 'pipe' });
  hasPdftotext = true;
} catch {
  console.warn('[WARN] pdftotext not found; falling back to `strings` command');
}

function extractText(pdfPath) {
  if (hasPdftotext) {
    try {
      return execSync(`pdftotext -layout "${pdfPath}" -`, {
        maxBuffer: 50 * 1024 * 1024,
        encoding: 'utf8',
      });
    } catch (e) {
      console.warn(`[WARN] pdftotext failed for ${pdfPath}, using strings fallback`);
    }
  }
  // Fallback: strings command
  return execSync(`strings "${pdfPath}"`, {
    maxBuffer: 50 * 1024 * 1024,
    encoding: 'utf8',
  });
}

// SIDC pattern: 15-character codes using uppercase letters, digits, dashes, asterisks
const SIDC_PATTERN = /\b[A-Z0-9\-*]{15}\b/g;

function extractSidcs(text) {
  const matches = text.match(SIDC_PATTERN) || [];
  // Deduplicate
  return [...new Set(matches)];
}

// Main
if (!existsSync(PDF_DIR)) {
  console.error(`PDF directory not found: ${PDF_DIR}`);
  console.error('Set PDF_DIR environment variable or place PDFs in ~/Downloads/MIL-STD-2525/');
  process.exit(1);
}

const pdfs = readdirSync(PDF_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
if (pdfs.length === 0) {
  console.error(`No PDF files found in ${PDF_DIR}`);
  process.exit(1);
}

console.log(`Found ${pdfs.length} PDF(s) in ${PDF_DIR}`);

const results = [];

for (const pdf of pdfs) {
  const pdfPath = join(PDF_DIR, pdf);
  const txtName = basename(pdf, '.pdf') + '.txt';
  const txtPath = join(RAW_DIR, txtName);

  console.log(`Extracting: ${pdf}`);
  const text = extractText(pdfPath);
  writeFileSync(txtPath, text, 'utf8');

  const sidcs = extractSidcs(text);
  console.log(`  -> ${text.length} chars, ${sidcs.length} SIDC patterns found`);

  results.push({
    file: pdf,
    textLength: text.length,
    sidcCount: sidcs.length,
    sampleSidcs: sidcs.slice(0, 5),
  });
}

// Write extraction summary
const summaryPath = join(RAW_DIR, '_extraction-summary.json');
writeFileSync(summaryPath, JSON.stringify(results, null, 2), 'utf8');
console.log(`\nExtraction summary written to ${summaryPath}`);
