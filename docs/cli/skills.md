---
summary: "CLI reference for `quantumclaw skills` (search/install/update/list/info/check)"
read_when:
  - You want to see which skills are available and ready to run
  - You want to search, install, or update skills from ClawHub
  - You want to debug missing binaries/env/config for skills
title: "skills"
---

# `quantumclaw skills`

Inspect local skills and install/update skills from ClawHub.

Related:

- Skills system: [Skills](/tools/skills)
- Skills config: [Skills config](/tools/skills-config)
- ClawHub installs: [ClawHub](/tools/clawhub)

## Commands

```bash
quantumclaw skills search "calendar"
quantumclaw skills install <slug>
quantumclaw skills install <slug> --version <version>
quantumclaw skills update <slug>
quantumclaw skills update --all
quantumclaw skills list
quantumclaw skills list --eligible
quantumclaw skills info <name>
quantumclaw skills check
```

`search`/`install`/`update` use ClawHub directly and install into the active
workspace `skills/` directory. `list`/`info`/`check` still inspect the local
skills visible to the current workspace and config.
