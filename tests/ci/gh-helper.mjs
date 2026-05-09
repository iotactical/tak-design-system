import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, '..', '..');

let _ghAvailable;

export function isGhAuthenticated() {
  if (_ghAvailable !== undefined) return _ghAvailable;
  try {
    execSync('gh auth status', { cwd: ROOT, stdio: 'pipe' });
    _ghAvailable = true;
  } catch {
    _ghAvailable = false;
  }
  return _ghAvailable;
}

export function gh(args) {
  return execSync(`gh ${args}`, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' }).trim();
}

export function ghApi(path) {
  return JSON.parse(execSync(`gh api ${path}`, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' }));
}
