---
summary: "CLI reference for `quantumclaw logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
title: "logs"
---

# `quantumclaw logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:

- Logging overview: [Logging](/logging)

## Examples

```bash
quantumclaw logs
quantumclaw logs --follow
quantumclaw logs --json
quantumclaw logs --limit 500
quantumclaw logs --local-time
quantumclaw logs --follow --local-time
```

Use `--local-time` to render timestamps in your local timezone.
