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
| 🔒 **Enterprise Security** | Input validation, encrypted secrets, audit logging, data protection |
| 💻 **Code Interpreter** | Run JavaScript/TypeScript in secure sandbox |
| 🎨 **Beautiful UI** | Modern dashboard + Control Center with dark mode |
| 🎯 **MiniMax Skills** | 10+ AI-powered development skills (frontend, fullstack, mobile, docs) |

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

### Configuration

```bash
# Set configuration
quantumclaw config set gateway.port 19999
quantumclaw config set agents.defaults.model "kilo-auto/free"

# View config
quantumclaw config get
```

## 🔒 Security Features

QuantumClaw includes enterprise-grade security built-in:

### Security Guard
- **Input Validation** — Sanitizes all inputs, blocks SQL injection, XSS, command injection
- **Rate Limiting** — Prevents abuse with configurable limits
- **Threat Detection** — Pattern-based detection for malicious payloads

### Secret Manager
- **AES-256 Encryption** — All secrets encrypted at rest
- **Master Password** — Key derivation with scrypt
- **Auto-Rotation** — Configurable secret rotation
- **Metadata Tracking** — Labels, tags, expiration dates

### Audit Logging
- **Comprehensive Logs** — Every action recorded
- **Multiple Channels** — File, Discord, Telegram, Slack
- **Search & Analysis** — Queryable audit trail
- **Compliance Ready** — Export for audits

### Data Protection
- **Local Execution** — All data stays on your machine
- **No External Leaks** — Network isolation options
- **Secure Storage** — Encrypted config and credentials
- **Privacy First** — Your data never leaves your device

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

## 🤖 AI Providers

QuantumClaw supports multiple AI providers:

| Provider | Environment Variable | Free Tier |
|----------|----------------------|-----------|
| **KiloCode** | `KILOCODE_API_KEY` | ✅ Free models |
| **OpenRouter** | `OPENROUTER_API_KEY` | ✅ $1 credit |
| **Groq** | `GROQ_API_KEY` | ✅ Free tier |
| **Nvidia** | `NVIDIA_API_KEY` | ✅ Free tier |
| **Anthropic** | `ANTHROPIC_API_KEY` | ❌ Paid |

## 📱 Supported Platforms

- ✅ Telegram
- ✅ WhatsApp
- ✅ Discord
- ✅ Slack
- ✅ Signal
- ✅ iMessage
- ✅ Google Chat
- ✅ IRC

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
```

### Config File

Located at `~/.quantumclaw/quantumclaw.json`:

```json
{
  "gateway": {
    "port": 19999,
    "auth": {
      "mode": "token"
    }
  },
  "agents": {
    "defaults": {
      "model": "kilo-auto/free"
    }
  }
}
```

## 📦 Package Contents

```
quantumclaw/
├── dist/
│   ├── control-ui/      # Dashboard UI
│   ├── control-center/  # Control Center
│   ├── bundled/         # Bundled plugins
│   └── plugin-sdk/     # Plugin system
├── src/
│   ├── security/        # Security modules
│   │   ├── secret-manager.ts
│   │   ├── input-validation.ts
│   │   ├── audit-logger.ts
│   │   └── ...
│   ├── automation/      # Workflow engine
│   │   ├── code-interpreter.ts
│   │   ├── agentic-workflow.ts
│   │   └── ...
│   └── ...
└── skills/            # Built-in skills
```

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

## 🛡️ Data Privacy

QuantumClaw is designed with privacy first:

1. **Local Only** — All processing happens on your machine
2. **No Telemetry** — No usage data sent to external servers
3. **Your Keys** — API keys stay in your config
4. **Encrypted** — Secrets encrypted with AES-256
5. **Audit Trail** — Full visibility into what's happening

## 📄 License

MIT — see [LICENSE](LICENSE)

---

<p align="center">
  Built by <strong>@onlinecloudsatish</strong> 🦞
</p>
