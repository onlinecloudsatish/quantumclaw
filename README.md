# 🦞 QuantumClaw — Personal AI Assistant

<p align="center">
  <img src="https://raw.githubusercontent.com/onlinecloudsatish/quantumclaw/main/docs/assets/quantumclaw-logo-text.svg" alt="QuantumClaw" width="400">
</p>

<p align="center">
  <strong>EXFOLIATE! EXFOLIATE!</strong>
</p>

<p align="center">
  <a href="https://github.com/onlinecloudsatish/quantumclaw/releases"><img src="https://img.shields.io/github/v/release/onlinecloudsatish/quantumclaw?style=for-the-badge" alt="GitHub release"></a>
  <a href="https://www.npmjs.com/package/quantumclaw"><img src="https://img.shields.io/npm/v/quantumclaw?style=for-the-badge" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

---

## What is QuantumClaw?

**QuantumClaw** is your personal AI assistant that runs on your own devices. It connects to your messaging platforms and helps you automate tasks, manage information, and interact with AI through natural conversation.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI-Powered Assistant** | Smart conversations with context awareness and autonomous task execution |
| 📱 **Multi-Platform** | WhatsApp, Telegram, Slack, Discord, Signal, iMessage & more |
| ⚡ **Automation** | Workflows, scheduled tasks (cron), webhook triggers |
| 🧠 **Memory** | Persistent memory for context-aware conversations |
| 🔒 **Enterprise Security** | Sandboxing, input validation, encrypted secrets, audit logging |
| 💻 **Code Interpreter** | Run JavaScript/TypeScript in secure isolated sandbox |
| 🎨 **Beautiful UI** | Modern dashboard + Control Center with dark mode |
| 🎯 **MiniMax Skills** | 10+ AI-powered development skills |

## 🚀 Quick Install

```bash
# Install globally
npm install -g quantumclaw@latest

# Launch setup wizard
quantumclaw setup

# Run the gateway
quantumclaw gateway
```

## 📖 Getting Started

### Basic Commands

```bash
# Check status
quantumclaw status

# List skills
quantumclaw skills list

# Add cron job
quantumclaw cron add --name "daily-reminder" --every "9am" --message "Good morning!"

# Start browser automation
quantumclaw browser start
```

### Accessing the UI

| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard** | http://localhost:19999/ | Main QuantumClaw UI |
| **Control Center** | http://localhost:19999/cc | Observability & monitoring |

---

## 🔒 Enterprise Security

QuantumClaw includes comprehensive security features to protect your data and system.

### 🛡️ Security Guard

| Feature | Description |
|---------|-------------|
| **Input Validation** | Sanitizes all inputs, blocks malicious payloads |
| **SQL Injection Protection** | Detects and blocks SQL injection attempts |
| **XSS Protection** | Prevents cross-site scripting attacks |
| **Command Injection Protection** | Blocks shell command injection |
| **Path Traversal Protection** | Prevents directory traversal attacks |
| **SSRF Protection** | Blocks server-side request forgery |
| **Rate Limiting** | Configurable limits to prevent abuse |
| **Threat Detection** | Pattern-based detection for malicious code |

### 🔐 Secret Manager

| Feature | Description |
|---------|-------------|
| **AES-256 Encryption** | All secrets encrypted at rest |
| **Master Password** | Key derivation using scrypt |
| **Auto-Rotation** | Configurable automatic secret rotation |
| **Metadata Tracking** | Labels, tags, expiration dates |
| **Hardware Security** | Supports hardware token integration |

```bash
# Set a secret
quantumclaw secrets set API_KEY "your-key-here"

# List secrets
quantumclaw secrets list

# Rotate a secret
quantumclaw secrets rotate API_KEY
```

### 📋 Audit Logging

| Feature | Description |
|---------|-------------|
| **Comprehensive Logs** | Every action recorded with timestamps |
| **Multiple Channels** | File, Discord, Telegram, Slack, custom webhooks |
| **Search & Analysis** | Queryable audit trail |
| **Compliance Ready** | Export formats for audits |
| **Real-time Alerts** | Get notified of suspicious activity |

```bash
# Enable audit logging
quantumclaw config set audit.enabled true

# View recent audits
quantumclaw audit list --limit 50
```

### 🏝️ Sandbox Isolation

QuantumClaw runs code in isolated sandboxes to protect your system:

| Feature | Description |
|---------|-------------|
| **Docker-based Isolation** | Containers provide strong isolation |
| **gVisor Support** | Lightweight kernel-level isolation |
| **Network Isolation** | Block network access for untrusted code |
| **Filesystem Limits** | Restrict filesystem access |
| **Resource Limits** | CPU, memory, and time limits |
| **No Root Access** | Runs as non-root user |
| **Ephemeral Storage** | All data discarded after execution |

```json
// sandbox.config.json
{
  "enabled": true,
  "type": "docker",
  "image": "ghcr.io/quantumclaw/sandbox:default",
  "network": "none",
  "resources": {
    "cpuLimit": "1",
    "memoryLimit": "512m",
    "timeout": 30000
  },
  "mounts": {
    "workspace": "/workspace",
    "temp": "/tmp"
  }
}
```

### 🌐 Network Security

| Feature | Description |
|---------|-------------|
| **Local-only Mode** | Gateway binds to localhost only |
| **Token Authentication** | All API requests require auth token |
| **TLS Support** | Optional HTTPS for external access |
| **IP Allowlist** | Restrict access by IP |
| **Connection Limits** | Prevent connection exhaustion |

### 🔒 Data Protection

| Feature | Description |
|---------|-------------|
| **Local Execution** | All data stays on your machine |
| **No Telemetry** | No usage data sent anywhere |
| **Encrypted Config** | Credentials stored encrypted |
| **Secure Storage** | OS keychain integration |
| **Memory Protection** | Sensitive data cleared from memory |

---

## 🎯 MiniMax AI Skills

QuantumClaw includes 10+ development skills powered by MiniMax AI:

| Skill | Description |
|-------|-------------|
| 📦 frontend-dev | React, Next.js, Tailwind, Framer Motion, GSAP |
| 📦 fullstack-dev | REST APIs, Auth, WebSocket, Database |
| 📦 android-native-dev | Kotlin, Jetpack Compose, Material Design |
| 📦 ios-application-dev | SwiftUI, UIKit, Apple HIG |
| 📦 shader-dev | GLSL, ray marching, visual effects |
| 📦 gif-sticker-maker | AI-generated animated stickers |
| 📦 minimax-pdf | Professional PDF generation |
| 📦 pptx-generator | PowerPoint presentations |
| 📦 minimax-xlsx | Excel spreadsheet handling |
| 📦 minimax-docx | Word document creation |

---

## 🏢 Control Center

Built-in observability dashboard for monitoring QuantumClaw:

- **Overview** — Health, state, key metrics
- **Usage** — Spend tracking, context pressure
- **Staff** — Active agents, busy/idle status
- **Tasks** — Work queue, approvals, execution chains
- **Memory** — Memory file management
- **Documents** — Document editor
- **Settings** — Connection health, security status

Access: `http://localhost:19999/cc`

---

## 🤖 AI Providers

QuantumClaw supports multiple AI providers:

| Provider | Environment Variable | Free Tier |
|----------|----------------------|-----------|
| **KiloCode** | `KILOCODE_API_KEY` | ✅ Free models |
| **OpenRouter** | `OPENROUTER_API_KEY` | ✅ $1 credit |
| **Groq** | `GROQ_API_KEY` | ✅ Free tier |
| **Nvidia** | `NVIDIA_API_KEY` | ✅ Free tier |
| **Anthropic** | `ANTHROPIC_API_KEY` | ❌ Paid |

---

## 📱 Supported Platforms

- ✅ Telegram
- ✅ WhatsApp
- ✅ Discord
- ✅ Slack
- ✅ Signal
- ✅ iMessage
- ✅ Google Chat
- ✅ IRC

---

## 🔧 Configuration

### Environment Variables

```bash
# Required for AI
export KILOCODE_API_KEY="your-key-here"

# Optional providers
export OPENROUTER_API_KEY="your-key-here"
export GROQ_API_KEY="your-key-here"

# Security
export QUANTUMCLAW_ENCRYPTION_KEY="your-master-key"
export QUANTUMCLAW_AUDIT_ENABLED=true
export QUANTUMCLAW_SANDBOX_ENABLED=true
```

### Config File

Located at `~/.quantumclaw/quantumclaw.json`:

```json
{
  "gateway": {
    "port": 19999,
    "bind": "127.0.0.1",
    "auth": {
      "mode": "token"
    }
  },
  "security": {
    "sandbox": {
      "enabled": true,
      "type": "docker",
      "network": "none"
    },
    "audit": {
      "enabled": true
    },
    "rateLimit": {
      "windowMs": 60000,
      "maxRequests": 100
    }
  },
  "agents": {
    "defaults": {
      "model": "kilo-auto/free"
    }
  }
}
```

---

## 📦 Package Contents

```
quantumclaw/
├── dist/
│   ├── control-ui/           # Dashboard UI
│   ├── control-center/       # Control Center
│   ├── bundled/             # Bundled plugins
│   └── plugin-sdk/         # Plugin system
├── src/
│   ├── security/             # Security modules
│   │   ├── secret-manager.ts      # Encrypted secrets
│   │   ├── input-validation.ts   # Input sanitization
│   │   ├── audit-logger.ts        # Audit logging
│   │   ├── security-guard.ts      # Threat detection
│   │   └── sandbox/               # Sandboxing
│   ├── automation/           # Workflow engine
│   │   ├── code-interpreter.ts   # Code execution
│   │   ├── agentic-workflow.ts   # AI workflows
│   │   └── scheduler.ts         # Task scheduling
│   └── ...
└── skills/                 # Built-in skills
```

---

## 🧪 Testing

```bash
# Run health check
quantumclaw health

# Test browser
quantumclaw browser status

# List sessions
quantumclaw sessions list

# Test skills
quantumclaw skills search weather
```

---

## 📡 API Reference

### Gateway API

```bash
# Health check
curl http://localhost:19999/health

# Send message
curl -X POST http://localhost:19999/message \
  -H "Authorization: Bearer <token>" \
  -d '{"to": "+1234567890", "message": "Hello"}'
```

### WebSocket API

```bash
# Connect to gateway
ws://localhost:19999/ws
```

---

## 🛡️ Data Privacy

QuantumClaw is designed with privacy first:

1. **Local Only** — All processing happens on your machine
2. **No Telemetry** — No usage data sent to external servers
3. **Your Keys** — API keys stay in your config
4. **Encrypted** — Secrets encrypted with AES-256
5. **Audit Trail** — Full visibility into what's happening
6. **Sandbox Isolation** — Code runs in isolated containers
7. **Network Isolation** — Optional air-gapped mode

### Security Best Practices

```bash
# 1. Use local-only mode (default)
quantumclaw config set gateway.bind "127.0.0.1"

# 2. Enable sandbox for code execution
quantumclaw config set security.sandbox.enabled true

# 3. Enable audit logging
quantumclaw config set security.audit.enabled true

# 4. Use strong tokens
quantumclaw config set gateway.auth.mode "token"

# 5. Rate limit requests
quantumclaw config set security.rateLimit.maxRequests 100
```

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

<p align="center">
  Built by <strong>@onlinecloudsatish</strong> 🦞
</p>
