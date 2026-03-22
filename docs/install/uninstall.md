---
summary: "Uninstall QuantumClaw completely (CLI, service, state, workspace)"
read_when:
  - You want to remove QuantumClaw from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

# Uninstall

Two paths:

- **Easy path** if `quantumclaw` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
quantumclaw uninstall
```

Non-interactive (automation / npx):

```bash
quantumclaw uninstall --all --yes --non-interactive
npx -y quantumclaw uninstall --all --yes --non-interactive
```

Manual steps (same result):

1. Stop the gateway service:

```bash
quantumclaw gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
quantumclaw gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${QUANTUMCLAW_STATE_DIR:-$HOME/.quantumclaw}"
```

If you set `QUANTUMCLAW_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.quantumclaw/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g quantumclaw
pnpm remove -g quantumclaw
bun remove -g quantumclaw
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/QuantumClaw.app
```

Notes:

- If you used profiles (`--profile` / `QUANTUMCLAW_PROFILE`), repeat step 3 for each state dir (defaults are `~/.quantumclaw-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `quantumclaw` is missing.

### macOS (launchd)

Default label is `ai.quantumclaw.gateway` (or `ai.quantumclaw.<profile>`; legacy `com.quantumclaw.*` may still exist):

```bash
launchctl bootout gui/$UID/ai.quantumclaw.gateway
rm -f ~/Library/LaunchAgents/ai.quantumclaw.gateway.plist
```

If you used a profile, replace the label and plist name with `ai.quantumclaw.<profile>`. Remove any legacy `com.quantumclaw.*` plists if present.

### Linux (systemd user unit)

Default unit name is `quantumclaw-gateway.service` (or `quantumclaw-gateway-<profile>.service`):

```bash
systemctl --user disable --now quantumclaw-gateway.service
rm -f ~/.config/systemd/user/quantumclaw-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `QuantumClaw Gateway` (or `QuantumClaw Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "QuantumClaw Gateway"
Remove-Item -Force "$env:USERPROFILE\.quantumclaw\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.quantumclaw-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://www.npmjs.com/package/quantumclaw/install.sh` or `install.ps1`, the CLI was installed with `npm install -g quantumclaw@latest`.
Remove it with `npm rm -g quantumclaw` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `quantumclaw ...` / `bun run quantumclaw ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.
