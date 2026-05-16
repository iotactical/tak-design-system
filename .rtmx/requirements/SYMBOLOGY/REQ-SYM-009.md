# REQ-SYM-009: Embedding Text Generation Pipeline

## Description
Script to auto-generate embeddingText field from structured doctrine fields
(definitions, usage, safety) for deterministic vector embeddings. The
embeddingText field provides a pre-flattened plain text representation
suitable for embedding model input without runtime concatenation.

## Approach
- Node.js script (scripts/generate-embedding-text.mjs)
- Concatenates definition + purpose + doctrinal rules + safety constraints
- Deterministic output: same input always produces identical embeddingText
- Idempotent regeneration: running twice produces no diff
- Output overwrites embeddingText field in doctrine JSON files
- Handles null definitions gracefully (skips null version entries)

## Acceptance Criteria
- [ ] Script generates embeddingText for all doctrine entities
- [ ] Output is deterministic (same input produces same output)
- [ ] Minimum 50 characters per embeddingText entry
- [ ] Handles null definitions gracefully without errors
- [ ] --verify flag exits non-zero if embeddingText is stale

## Validation
- **Test**: scripts/generate-embedding-text.mjs --verify
- **Method**: Script Validation
