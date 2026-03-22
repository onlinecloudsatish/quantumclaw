#!/usr/bin/env bash
set -euo pipefail

cd /repo

export QUANTUMCLAW_STATE_DIR="/tmp/quantumclaw-test"
export QUANTUMCLAW_CONFIG_PATH="${QUANTUMCLAW_STATE_DIR}/quantumclaw.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${QUANTUMCLAW_STATE_DIR}/credentials"
mkdir -p "${QUANTUMCLAW_STATE_DIR}/agents/main/sessions"
echo '{}' >"${QUANTUMCLAW_CONFIG_PATH}"
echo 'creds' >"${QUANTUMCLAW_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${QUANTUMCLAW_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm quantumclaw reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${QUANTUMCLAW_CONFIG_PATH}"
test ! -d "${QUANTUMCLAW_STATE_DIR}/credentials"
test ! -d "${QUANTUMCLAW_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${QUANTUMCLAW_STATE_DIR}/credentials"
echo '{}' >"${QUANTUMCLAW_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm quantumclaw uninstall --state --yes --non-interactive

test ! -d "${QUANTUMCLAW_STATE_DIR}"

echo "OK"
