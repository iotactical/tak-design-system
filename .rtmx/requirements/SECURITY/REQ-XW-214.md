# REQ-XW-214: Comprehensive .gitignore for Secrets and Credentials

## Description

Harden the `.gitignore` file to prevent accidental commit of secrets, credentials, private keys, and other sensitive files. Add standard patterns for environment files, cryptographic keys, cloud provider credential files, and SSH keys.

## Acceptance Criteria

1. The `.gitignore` file at the repository root contains all of the following patterns:
   - `.env`
   - `.env.local`
   - `.env.*.local`
   - `*.key`
   - `*.pem`
   - `*.p12`
   - `credentials.json`
   - `secrets.json`
   - `.aws/`
   - `.ssh/`
2. Each pattern is on its own line.
3. The patterns are grouped under a clearly labeled comment section (e.g., `# Secrets and credentials`).
4. Existing `.gitignore` entries are preserved; the new patterns are additive.
5. No tracked files are affected by the new patterns (i.e., no files currently in the repo match these patterns).

## Test Approach

- **Static analysis**: Read `.gitignore` and verify all ten patterns are present.
- **Verification**: Run `git status` after adding the patterns and confirm no tracked files are unexpectedly ignored or removed.
- **Negative test**: Create a temporary `.env` file and a `test.pem` file in the repo root, run `git status`, and confirm they appear as untracked/ignored (not listed for staging).
- **Grep test**: `grep -c '.env' .gitignore` returns at least 3 (for `.env`, `.env.local`, `.env.*.local`).

## Implementation Notes

- Place the new section near the top of `.gitignore` or in a clearly visible location, since these are the most critical patterns.
- The `.env.*.local` pattern uses a glob wildcard to match files like `.env.production.local` and `.env.development.local`.
- The `*.key`, `*.pem`, and `*.p12` patterns are broad and could theoretically match non-secret files. If this becomes an issue, narrow the patterns (e.g., restrict to specific directories). For now, the broad patterns are appropriate for a design system repo that should never contain cryptographic material.
- Consider running `git ls-files` to verify none of the new patterns match currently tracked files before committing. If any do, they must be explicitly removed from tracking with `git rm --cached`.

## Effort Estimate

0.25 weeks
