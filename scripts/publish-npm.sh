#!/usr/bin/env bash
#
# TAK Design System - npm publish
#
# Publishes every public workspace package whose current version is not yet on
# the registry. Already-published versions are skipped so that pushes to main
# without a version bump are a no-op rather than a failure, but any other npm
# error fails the job.
#
# Requires NODE_AUTH_TOKEN with publish rights to the @iotactical scope.

set -euo pipefail

PACKAGES=(
  "packages/tokens"
  "packages/react"
)

if [ -z "${NODE_AUTH_TOKEN:-}" ]; then
  echo "ERROR: NODE_AUTH_TOKEN is not set; cannot publish." >&2
  exit 1
fi

# Provenance attestation only works from a trusted CI runner with an OIDC token.
PROVENANCE_FLAG=""
if [ -n "${ACTIONS_ID_TOKEN_REQUEST_URL:-}" ]; then
  PROVENANCE_FLAG="--provenance"
fi

published=0
skipped=0

for dir in "${PACKAGES[@]}"; do
  name=$(jq -r .name "${dir}/package.json")
  version=$(jq -r .version "${dir}/package.json")

  if npm view "${name}@${version}" version >/dev/null 2>&1; then
    echo "SKIP  ${name}@${version} already published"
    skipped=$((skipped + 1))
    continue
  fi

  echo "PUBLISH ${name}@${version}"
  (cd "${dir}" && npm publish --access public ${PROVENANCE_FLAG})
  published=$((published + 1))
done

echo ""
echo "Published: ${published}, skipped: ${skipped}"
