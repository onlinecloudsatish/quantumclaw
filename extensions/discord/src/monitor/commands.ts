import type { DiscordSlashCommandConfig } from "quantumclaw/plugin-sdk/config-runtime";

export function resolveDiscordSlashCommandConfig(
  raw?: DiscordSlashCommandConfig,
): Required<DiscordSlashCommandConfig> {
  return {
    ephemeral: raw?.ephemeral !== false,
  };
}
