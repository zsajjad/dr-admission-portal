#!/usr/bin/env bash

set -e

# Check for jq dependency
if ! command -v jq &> /dev/null; then
  echo "❌ 'jq' is not installed. Please install it to proceed."
  echo "Install it via:"
  echo "- macOS: brew install jq"
  echo "- Debian/Ubuntu: sudo apt install jq"
  echo "- RHEL/Fedora: sudo dnf install jq"
  echo "- Arch: sudo pacman -S jq"
  exit 1
fi

echo "🔍 Checking for ^ or ~ in package.json..."

violations=$(jq -r '
  [
    (.dependencies // {}),
    (.devDependencies // {}),
    (.peerDependencies // {}),
    (.optionalDependencies // {})
  ]
  | map(to_entries[] | select(.value | test("^[\\^~]")) | "\(.key): \(.value)")
  | .[]' package.json)

if [ -n "$violations" ]; then
  echo "❌ Do not use ^ or ~ in package.json dependencies. Found the following:" >&2
  echo "$violations" >&2
  exit 1
fi

echo "✅ All good! No semver prefix (^ or ~) found."