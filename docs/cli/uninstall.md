---
summary: "CLI reference for `quantumclaw uninstall` (remove gateway service + local data)"
read_when:
  - You want to remove the gateway service and/or local state
  - You want a dry-run first
title: "uninstall"
---

# `quantumclaw uninstall`

Uninstall the gateway service + local data (CLI remains).

```bash
quantumclaw backup create
quantumclaw uninstall
quantumclaw uninstall --all --yes
quantumclaw uninstall --dry-run
```

Run `quantumclaw backup create` first if you want a restorable snapshot before removing state or workspaces.
