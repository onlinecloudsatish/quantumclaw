---
summary: "CLI reference for `quantumclaw reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `quantumclaw reset`

Reset local config/state (keeps the CLI installed).

```bash
quantumclaw backup create
quantumclaw reset
quantumclaw reset --dry-run
quantumclaw reset --scope config+creds+sessions --yes --non-interactive
```

Run `quantumclaw backup create` first if you want a restorable snapshot before removing local state.
