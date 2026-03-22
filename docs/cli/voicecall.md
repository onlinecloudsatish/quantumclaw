---
summary: "CLI reference for `quantumclaw voicecall` (voice-call plugin command surface)"
read_when:
  - You use the voice-call plugin and want the CLI entry points
  - You want quick examples for `voicecall call|continue|status|tail|expose`
title: "voicecall"
---

# `quantumclaw voicecall`

`voicecall` is a plugin-provided command. It only appears if the voice-call plugin is installed and enabled.

Primary doc:

- Voice-call plugin: [Voice Call](/plugins/voice-call)

## Common commands

```bash
quantumclaw voicecall status --call-id <id>
quantumclaw voicecall call --to "+15555550123" --message "Hello" --mode notify
quantumclaw voicecall continue --call-id <id> --message "Any questions?"
quantumclaw voicecall end --call-id <id>
```

## Exposing webhooks (Tailscale)

```bash
quantumclaw voicecall expose --mode serve
quantumclaw voicecall expose --mode funnel
quantumclaw voicecall expose --mode off
```

Security note: only expose the webhook endpoint to networks you trust. Prefer Tailscale Serve over Funnel when possible.
