#!/usr/bin/env bash
# Rootless QuantumClaw in Podman: run after one-time setup.
#
# One-time setup (from repo root): ./scripts/podman/setup.sh
# Then:
#   ./scripts/run-quantumclaw-podman.sh launch           # Start gateway
#   ./scripts/run-quantumclaw-podman.sh launch setup      # Onboarding wizard
#
# As the quantumclaw user (no repo needed):
#   sudo -u quantumclaw /home/quantumclaw/run-quantumclaw-podman.sh
#   sudo -u quantumclaw /home/quantumclaw/run-quantumclaw-podman.sh setup
#
# Legacy: "setup-host" delegates to the Podman setup script

set -euo pipefail

QUANTUMCLAW_USER="${QUANTUMCLAW_PODMAN_USER:-quantumclaw}"

resolve_user_home() {
  local user="$1"
  local home=""
  if command -v getent >/dev/null 2>&1; then
    home="$(getent passwd "$user" 2>/dev/null | cut -d: -f6 || true)"
  fi
  if [[ -z "$home" && -f /etc/passwd ]]; then
    home="$(awk -F: -v u="$user" '$1==u {print $6}' /etc/passwd 2>/dev/null || true)"
  fi
  if [[ -z "$home" ]]; then
    home="/home/$user"
  fi
  printf '%s' "$home"
}

QUANTUMCLAW_HOME="$(resolve_user_home "$QUANTUMCLAW_USER")"
QUANTUMCLAW_UID="$(id -u "$QUANTUMCLAW_USER" 2>/dev/null || true)"
LAUNCH_SCRIPT="$QUANTUMCLAW_HOME/run-quantumclaw-podman.sh"

# Legacy: setup-host → run the Podman setup script
if [[ "${1:-}" == "setup-host" ]]; then
  shift
  REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  SETUP_PODMAN="$REPO_ROOT/scripts/podman/setup.sh"
  if [[ -f "$SETUP_PODMAN" ]]; then
    exec "$SETUP_PODMAN" "$@"
  fi
  SETUP_PODMAN="$REPO_ROOT/setup-podman.sh"
  if [[ -f "$SETUP_PODMAN" ]]; then
    exec "$SETUP_PODMAN" "$@"
  fi
  echo "Podman setup script not found. Run from repo root: ./scripts/podman/setup.sh" >&2
  exit 1
fi

# --- Step 2: launch (from repo: re-exec as quantumclaw in safe cwd; from quantumclaw home: run container) ---
if [[ "${1:-}" == "launch" ]]; then
  shift
  if [[ -n "${QUANTUMCLAW_UID:-}" && "$(id -u)" -ne "$QUANTUMCLAW_UID" ]]; then
    # Exec as quantumclaw with cwd=/tmp so a nologin user never inherits an invalid cwd.
    exec sudo -u "$QUANTUMCLAW_USER" env HOME="$QUANTUMCLAW_HOME" PATH="$PATH" TERM="${TERM:-}" \
      bash -c 'cd /tmp && exec '"$LAUNCH_SCRIPT"' "$@"' _ "$@"
  fi
  # Already quantumclaw; fall through to container run (with remaining args, e.g. "setup")
fi

# --- Container run (script in quantumclaw home, run as quantumclaw) ---
EFFECTIVE_HOME="${HOME:-}"
if [[ -n "${QUANTUMCLAW_UID:-}" && "$(id -u)" -eq "$QUANTUMCLAW_UID" ]]; then
  EFFECTIVE_HOME="$QUANTUMCLAW_HOME"
  export HOME="$QUANTUMCLAW_HOME"
fi
if [[ -z "${EFFECTIVE_HOME:-}" ]]; then
  EFFECTIVE_HOME="${QUANTUMCLAW_HOME:-/tmp}"
fi
CONFIG_DIR="${QUANTUMCLAW_CONFIG_DIR:-$EFFECTIVE_HOME/.quantumclaw}"
ENV_FILE="${QUANTUMCLAW_PODMAN_ENV:-$CONFIG_DIR/.env}"
WORKSPACE_DIR="${QUANTUMCLAW_WORKSPACE_DIR:-$CONFIG_DIR/workspace}"
CONTAINER_NAME="${QUANTUMCLAW_PODMAN_CONTAINER:-quantumclaw}"
QUANTUMCLAW_IMAGE="${QUANTUMCLAW_PODMAN_IMAGE:-quantumclaw:local}"
PODMAN_PULL="${QUANTUMCLAW_PODMAN_PULL:-never}"
HOST_GATEWAY_PORT="${QUANTUMCLAW_PODMAN_GATEWAY_HOST_PORT:-${QUANTUMCLAW_GATEWAY_PORT:-18789}}"
HOST_BRIDGE_PORT="${QUANTUMCLAW_PODMAN_BRIDGE_HOST_PORT:-${QUANTUMCLAW_BRIDGE_PORT:-18790}}"

# Safe cwd for podman (quantumclaw is nologin; avoid inherited cwd from sudo)
cd "$EFFECTIVE_HOME" 2>/dev/null || cd /tmp 2>/dev/null || true

RUN_SETUP=false
if [[ "${1:-}" == "setup" || "${1:-}" == "onboard" ]]; then
  RUN_SETUP=true
  shift
fi

mkdir -p "$CONFIG_DIR" "$WORKSPACE_DIR"
# Subdirs the app may create at runtime (canvas, cron); create here so ownership is correct
mkdir -p "$CONFIG_DIR/canvas" "$CONFIG_DIR/cron"
chmod 700 "$CONFIG_DIR" "$WORKSPACE_DIR" 2>/dev/null || true

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE" 2>/dev/null || true
  set +a
fi

# Keep Podman default local-only unless explicitly overridden.
# Non-loopback binds require gateway.controlUi.allowedOrigins (security hardening).
# NOTE: must be evaluated after sourcing ENV_FILE so QUANTUMCLAW_GATEWAY_BIND set in .env takes effect.
GATEWAY_BIND="${QUANTUMCLAW_GATEWAY_BIND:-loopback}"

upsert_env_var() {
  local file="$1"
  local key="$2"
  local value="$3"
  local tmp
  tmp="$(mktemp)"
  if [[ -f "$file" ]]; then
    awk -v k="$key" -v v="$value" '
      BEGIN { found = 0 }
      $0 ~ ("^" k "=") { print k "=" v; found = 1; next }
      { print }
      END { if (!found) print k "=" v }
    ' "$file" >"$tmp"
  else
    printf '%s=%s\n' "$key" "$value" >"$tmp"
  fi
  mv "$tmp" "$file"
  chmod 600 "$file" 2>/dev/null || true
}

generate_token_hex_32() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
    return 0
  fi
  if command -v python3 >/dev/null 2>&1; then
    python3 - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
    return 0
  fi
  if command -v od >/dev/null 2>&1; then
    od -An -N32 -tx1 /dev/urandom | tr -d " \n"
    return 0
  fi
  echo "Missing dependency: need openssl or python3 (or od) to generate QUANTUMCLAW_GATEWAY_TOKEN." >&2
  exit 1
}

if [[ -z "${QUANTUMCLAW_GATEWAY_TOKEN:-}" ]]; then
  export QUANTUMCLAW_GATEWAY_TOKEN="$(generate_token_hex_32)"
  mkdir -p "$(dirname "$ENV_FILE")"
  upsert_env_var "$ENV_FILE" "QUANTUMCLAW_GATEWAY_TOKEN" "$QUANTUMCLAW_GATEWAY_TOKEN"
  echo "Generated QUANTUMCLAW_GATEWAY_TOKEN and wrote it to $ENV_FILE." >&2
fi

# The gateway refuses to start unless gateway.mode=local is set in config.
# Keep this minimal; users can run the wizard later to configure channels/providers.
CONFIG_JSON="$CONFIG_DIR/quantumclaw.json"
if [[ ! -f "$CONFIG_JSON" ]]; then
  echo '{ gateway: { mode: "local" } }' >"$CONFIG_JSON"
  chmod 600 "$CONFIG_JSON" 2>/dev/null || true
  echo "Created $CONFIG_JSON (minimal gateway.mode=local)." >&2
fi

PODMAN_USERNS="${QUANTUMCLAW_PODMAN_USERNS:-keep-id}"
USERNS_ARGS=()
RUN_USER_ARGS=()
case "$PODMAN_USERNS" in
  ""|auto) ;;
  keep-id) USERNS_ARGS=(--userns=keep-id) ;;
  host) USERNS_ARGS=(--userns=host) ;;
  *)
    echo "Unsupported QUANTUMCLAW_PODMAN_USERNS=$PODMAN_USERNS (expected: keep-id, auto, host)." >&2
    exit 2
    ;;
esac

RUN_UID="$(id -u)"
RUN_GID="$(id -g)"
if [[ "$PODMAN_USERNS" == "keep-id" ]]; then
  RUN_USER_ARGS=(--user "${RUN_UID}:${RUN_GID}")
  echo "Starting container as uid=${RUN_UID} gid=${RUN_GID} (must match owner of $CONFIG_DIR)" >&2
else
  echo "Starting container without --user (QUANTUMCLAW_PODMAN_USERNS=$PODMAN_USERNS), mounts may require ownership fixes." >&2
fi

ENV_FILE_ARGS=()
[[ -f "$ENV_FILE" ]] && ENV_FILE_ARGS+=(--env-file "$ENV_FILE")

# On Linux with SELinux enforcing/permissive, add ,Z so Podman relabels the
# bind-mounted directories and the container can access them.
SELINUX_MOUNT_OPTS=""
if [[ -z "${QUANTUMCLAW_BIND_MOUNT_OPTIONS:-}" ]]; then
  if [[ "$(uname -s 2>/dev/null)" == "Linux" ]] && command -v getenforce >/dev/null 2>&1; then
    _selinux_mode="$(getenforce 2>/dev/null || true)"
    if [[ "$_selinux_mode" == "Enforcing" || "$_selinux_mode" == "Permissive" ]]; then
      SELINUX_MOUNT_OPTS=",Z"
    fi
  fi
else
  # Honour explicit override (e.g. QUANTUMCLAW_BIND_MOUNT_OPTIONS=":Z" → strip leading colon for inline use).
  SELINUX_MOUNT_OPTS="${QUANTUMCLAW_BIND_MOUNT_OPTIONS#:}"
  [[ -n "$SELINUX_MOUNT_OPTS" ]] && SELINUX_MOUNT_OPTS=",$SELINUX_MOUNT_OPTS"
fi

if [[ "$RUN_SETUP" == true ]]; then
  exec podman run --pull="$PODMAN_PULL" --rm -it \
    --init \
    "${USERNS_ARGS[@]}" "${RUN_USER_ARGS[@]}" \
    -e HOME=/home/node -e TERM=xterm-256color -e BROWSER=echo \
    -e QUANTUMCLAW_GATEWAY_TOKEN="$QUANTUMCLAW_GATEWAY_TOKEN" \
    -v "$CONFIG_DIR:/home/node/.quantumclaw:rw${SELINUX_MOUNT_OPTS}" \
    -v "$WORKSPACE_DIR:/home/node/.quantumclaw/workspace:rw${SELINUX_MOUNT_OPTS}" \
    "${ENV_FILE_ARGS[@]}" \
    "$QUANTUMCLAW_IMAGE" \
    node dist/index.js onboard "$@"
fi

podman run --pull="$PODMAN_PULL" -d --replace \
  --name "$CONTAINER_NAME" \
  --init \
  "${USERNS_ARGS[@]}" "${RUN_USER_ARGS[@]}" \
  -e HOME=/home/node -e TERM=xterm-256color \
  -e QUANTUMCLAW_GATEWAY_TOKEN="$QUANTUMCLAW_GATEWAY_TOKEN" \
  "${ENV_FILE_ARGS[@]}" \
  -v "$CONFIG_DIR:/home/node/.quantumclaw:rw${SELINUX_MOUNT_OPTS}" \
  -v "$WORKSPACE_DIR:/home/node/.quantumclaw/workspace:rw${SELINUX_MOUNT_OPTS}" \
  -p "${HOST_GATEWAY_PORT}:18789" \
  -p "${HOST_BRIDGE_PORT}:18790" \
  "$QUANTUMCLAW_IMAGE" \
  node dist/index.js gateway --bind "$GATEWAY_BIND" --port 18789

echo "Container $CONTAINER_NAME started. Dashboard: http://127.0.0.1:${HOST_GATEWAY_PORT}/"
echo "Logs: podman logs -f $CONTAINER_NAME"
echo "For auto-start/restarts, use: ./scripts/podman/setup.sh --quadlet (Quadlet + systemd user service)."
