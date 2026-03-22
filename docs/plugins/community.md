---
summary: "Community-maintained QuantumClaw plugins: browse, install, and submit your own"
read_when:
  - You want to find third-party QuantumClaw plugins
  - You want to publish or list your own plugin
title: "Community Plugins"
---

# Community Plugins

Community plugins are third-party packages that extend QuantumClaw with new
channels, tools, providers, or other capabilities. They are built and maintained
by the community, published on [ClawHub](/tools/clawhub) or npm, and
installable with a single command.

```bash
quantumclaw plugins install <package-name>
```

QuantumClaw checks ClawHub first and falls back to npm automatically.

## Listed plugins

### Codex App Server Bridge

Independent QuantumClaw bridge for Codex App Server conversations. Bind a chat to
a Codex thread, talk to it with plain text, and control it with chat-native
commands for resume, planning, review, model selection, compaction, and more.

- **npm:** `quantumclaw-codex-app-server`
- **repo:** [github.com/pwrdrvr/quantumclaw-codex-app-server](https://github.com/pwrdrvr/quantumclaw-codex-app-server)

```bash
quantumclaw plugins install quantumclaw-codex-app-server
```

### DingTalk

Enterprise robot integration using Stream mode. Supports text, images, and
file messages via any DingTalk client.

- **npm:** `@largezhou/ddingtalk`
- **repo:** [github.com/largezhou/quantumclaw-dingtalk](https://github.com/largezhou/quantumclaw-dingtalk)

```bash
quantumclaw plugins install @largezhou/ddingtalk
```

### Lossless Claw (LCM)

Lossless Context Management plugin for QuantumClaw. DAG-based conversation
summarization with incremental compaction — preserves full context fidelity
while reducing token usage.

- **npm:** `@martian-engineering/lossless-claw`
- **repo:** [github.com/Martian-Engineering/lossless-claw](https://github.com/Martian-Engineering/lossless-claw)

```bash
quantumclaw plugins install @martian-engineering/lossless-claw
```

### Opik

Official plugin that exports agent traces to Opik. Monitor agent behavior,
cost, tokens, errors, and more.

- **npm:** `@opik/opik-quantumclaw`
- **repo:** [github.com/comet-ml/opik-quantumclaw](https://github.com/comet-ml/opik-quantumclaw)

```bash
quantumclaw plugins install @opik/opik-quantumclaw
```

### QQbot

Connect QuantumClaw to QQ via the QQ Bot API. Supports private chats, group
mentions, channel messages, and rich media including voice, images, videos,
and files.

- **npm:** `@sliverp/qqbot`
- **repo:** [github.com/sliverp/qqbot](https://github.com/sliverp/qqbot)

```bash
quantumclaw plugins install @sliverp/qqbot
```

### wecom

QuantumClaw Enterprise WeCom Channel Plugin.
A bot plugin powered by WeCom AI Bot WebSocket persistent connections,
supports direct messages & group chats, streaming replies, and proactive messaging.

- **npm:** `@wecom/wecom-quantumclaw-plugin`
- **repo:** [github.com/WecomTeam/wecom-quantumclaw-plugin](https://github.com/WecomTeam/wecom-quantumclaw-plugin)

```bash
quantumclaw plugins install @wecom/wecom-quantumclaw-plugin
```

## Submit your plugin

We welcome community plugins that are useful, documented, and safe to operate.

<Steps>
  <Step title="Publish to ClawHub or npm">
    Your plugin must be installable via `quantumclaw plugins install \<package-name\>`.
    Publish to [ClawHub](/tools/clawhub) (preferred) or npm.
    See [Building Plugins](/plugins/building-plugins) for the full guide.

  </Step>

  <Step title="Host on GitHub">
    Source code must be in a public repository with setup docs and an issue
    tracker.

  </Step>

  <Step title="Open a PR">
    Add your plugin to this page with:

    - Plugin name
    - npm package name
    - GitHub repository URL
    - One-line description
    - Install command

  </Step>
</Steps>

## Quality bar

| Requirement                 | Why                                           |
| --------------------------- | --------------------------------------------- |
| Published on ClawHub or npm | Users need `quantumclaw plugins install` to work |
| Public GitHub repo          | Source review, issue tracking, transparency   |
| Setup and usage docs        | Users need to know how to configure it        |
| Active maintenance          | Recent updates or responsive issue handling   |

Low-effort wrappers, unclear ownership, or unmaintained packages may be declined.

## Related

- [Install and Configure Plugins](/tools/plugin) — how to install any plugin
- [Building Plugins](/plugins/building-plugins) — create your own
- [Plugin Manifest](/plugins/manifest) — manifest schema
