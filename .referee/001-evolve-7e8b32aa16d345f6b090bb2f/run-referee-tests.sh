#!/usr/bin/env bash
set -euo pipefail
# Run the referee acceptance test from the repository root so module resolution
# that relies on relative paths (../../src/...) works consistently.
repo_root="$(cd "$(dirname "$0")/../../" && pwd)"
node --test "$repo_root/.referee/001-evolve-7e8b32aa16d345f6b090bb2f/followUpDate.test.cjs"
