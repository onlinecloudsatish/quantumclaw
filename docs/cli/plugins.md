---
summary: "CLI reference for `quantumclaw plugins` (list, install, marketplace, uninstall, enable/disable, doctor)"
read_when:
  - You want to install or manage Gateway plugins or compatible bundles
  - You want to debug plugin load failures
title: "plugins"
---

# `quantumclaw plugins`

Manage Gateway plugins/extensions, hook packs, and compatible bundles.

Related:

- Plugin system: [Plugins](/tools/plugin)
- Bundle compatibility: [Plugin bundles](/plugins/bundles)
- Plugin manifest + schema: [Plugin manifest](/plugins/manifest)
- Security hardening: [Security](/gateway/security)

## Commands

```bash
quantumclaw plugins list
quantumclaw plugins install <path-or-spec>
quantumclaw plugins inspect <id>
quantumclaw plugins enable <id>
quantumclaw plugins disable <id>
quantumclaw plugins uninstall <id>
quantumclaw plugins doctor
quantumclaw plugins update <id>
quantumclaw plugins update --all
quantumclaw plugins marketplace list <marketplace>
```

Bundled plugins ship with QuantumClaw but start disabled. Use `plugins enable` to
activate them.

Native QuantumClaw plugins must ship `quantumclaw.plugin.json` with an inline JSON
Schema (`configSchema`, even if empty). Compatible bundles use their own bundle
manifests instead.

`plugins list` shows `Format: quantumclaw` or `Format: bundle`. Verbose list/info
output also shows the bundle subtype (`codex`, `claude`, or `cursor`) plus detected bundle
capabilities.

### Install

```bash
quantumclaw plugins install <path-or-spec>
quantumclaw plugins install <npm-spec> --pin
quantumclaw plugins install clawhub:<package>
quantumclaw plugins install <plugin>@<marketplace>
quantumclaw plugins install <plugin> --marketplace <marketplace>
```

Security note: treat plugin installs like running code. Prefer pinned versions.

`plugins install` is also the install surface for hook packs that expose
`quantumclaw.hooks` in `package.json`. Use `quantumclaw hooks` for filtered hook
visibility and per-hook enablement, not package installation.

Npm specs are **registry-only** (package name + optional **exact version** or
**dist-tag**). Git/URL/file specs and semver ranges are rejected. Dependency
installs run with `--ignore-scripts` for safety.

Bare specs and `@latest` stay on the stable track. If npm resolves either of
those to a prerelease, QuantumClaw stops and asks you to opt in explicitly with a
prerelease tag such as `@beta`/`@rc` or an exact prerelease version such as
`@1.2.3-beta.4`.

If a bare install spec matches a bundled plugin id (for example `diffs`), QuantumClaw
installs the bundled plugin directly. To install an npm package with the same
name, use an explicit scoped spec (for example `@scope/diffs`).

Supported archives: `.zip`, `.tgz`, `.tar.gz`, `.tar`.

Claude marketplace installs are also supported.

ClawHub installs use an explicit `clawhub:<package>` locator:

```bash
quantumclaw plugins install clawhub:quantumclaw-codex-app-server
quantumclaw plugins install clawhub:quantumclaw-codex-app-server@1.2.3
```

QuantumClaw now also prefers ClawHub for bare npm-safe plugin specs. It only falls
back to npm if ClawHub does not have that package or version:

```bash
quantumclaw plugins install quantumclaw-codex-app-server
```

QuantumClaw downloads the package archive from ClawHub, checks the advertised
plugin API / minimum gateway compatibility, then installs it through the normal
archive path. Recorded installs keep their ClawHub source metadata for later
updates.

Use `plugin@marketplace` shorthand when the marketplace name exists in Claude's
local registry cache at `~/.claude/plugins/known_marketplaces.json`:

```bash
quantumclaw plugins marketplace list <marketplace-name>
quantumclaw plugins install <plugin-name>@<marketplace-name>
```

Use `--marketplace` when you want to pass the marketplace source explicitly:

```bash
quantumclaw plugins install <plugin-name> --marketplace <marketplace-name>
quantumclaw plugins install <plugin-name> --marketplace <owner/repo>
quantumclaw plugins install <plugin-name> --marketplace ./my-marketplace
```

Marketplace sources can be:

- a Claude known-marketplace name from `~/.claude/plugins/known_marketplaces.json`
- a local marketplace root or `marketplace.json` path
- a GitHub repo shorthand such as `owner/repo`
- a git URL

For local paths and archives, QuantumClaw auto-detects:

- native QuantumClaw plugins (`quantumclaw.plugin.json`)
- Codex-compatible bundles (`.codex-plugin/plugin.json`)
- Claude-compatible bundles (`.claude-plugin/plugin.json` or the default Claude
  component layout)
- Cursor-compatible bundles (`.cursor-plugin/plugin.json`)

Compatible bundles install into the normal extensions root and participate in
the same list/info/enable/disable flow. Today, bundle skills, Claude
command-skills, Claude `settings.json` defaults, Cursor command-skills, and compatible Codex hook
directories are supported; other detected bundle capabilities are shown in
diagnostics/info but are not yet wired into runtime execution.

Use `--link` to avoid copying a local directory (adds to `plugins.load.paths`):

```bash
quantumclaw plugins install -l ./my-plugin
```

Use `--pin` on npm installs to save the resolved exact spec (`name@version`) in
`plugins.installs` while keeping the default behavior unpinned.

### Uninstall

```bash
quantumclaw plugins uninstall <id>
quantumclaw plugins uninstall <id> --dry-run
quantumclaw plugins uninstall <id> --keep-files
```

`uninstall` removes plugin records from `plugins.entries`, `plugins.installs`,
the plugin allowlist, and linked `plugins.load.paths` entries when applicable.
For active memory plugins, the memory slot resets to `memory-core`.

By default, uninstall also removes the plugin install directory under the active
state dir extensions root (`$QUANTUMCLAW_STATE_DIR/extensions/<id>`). Use
`--keep-files` to keep files on disk.

`--keep-config` is supported as a deprecated alias for `--keep-files`.

### Update

```bash
quantumclaw plugins update <id-or-npm-spec>
quantumclaw plugins update --all
quantumclaw plugins update <id-or-npm-spec> --dry-run
quantumclaw plugins update @quantumclaw/voice-call@beta
```

Updates apply to tracked installs in `plugins.installs` and tracked hook-pack
installs in `hooks.internal.installs`.

When you pass a plugin id, QuantumClaw reuses the recorded install spec for that
plugin. That means previously stored dist-tags such as `@beta` and exact pinned
versions continue to be used on later `update <id>` runs.

For npm installs, you can also pass an explicit npm package spec with a dist-tag
or exact version. QuantumClaw resolves that package name back to the tracked plugin
record, updates that installed plugin, and records the new npm spec for future
id-based updates.

When a stored integrity hash exists and the fetched artifact hash changes,
QuantumClaw prints a warning and asks for confirmation before proceeding. Use
global `--yes` to bypass prompts in CI/non-interactive runs.

### Inspect

```bash
quantumclaw plugins inspect <id>
quantumclaw plugins inspect <id> --json
```

Deep introspection for a single plugin. Shows identity, load status, source,
registered capabilities, hooks, tools, commands, services, gateway methods,
HTTP routes, policy flags, diagnostics, and install metadata.

Each plugin is classified by what it actually registers at runtime:

- **plain-capability** — one capability type (e.g. a provider-only plugin)
- **hybrid-capability** — multiple capability types (e.g. text + speech + images)
- **hook-only** — only hooks, no capabilities or surfaces
- **non-capability** — tools/commands/services but no capabilities

See [Plugin shapes](/plugins/architecture#plugin-shapes) for more on the capability model.

The `--json` flag outputs a machine-readable report suitable for scripting and
auditing.

`info` is an alias for `inspect`.
