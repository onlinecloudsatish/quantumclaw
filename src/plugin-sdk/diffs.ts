// Narrow plugin-sdk surface for the bundled diffs plugin.
// Keep this list additive and scoped to symbols used under extensions/diffs.

export { definePluginEntry } from "./plugin-entry.js";
export type { QuantumClawConfig } from "../config/config.js";
export { resolvePreferredQuantumClawTmpDir } from "../infra/tmp-quantumclaw-dir.js";
export type {
  AnyAgentTool,
  QuantumClawPluginApi,
  QuantumClawPluginConfigSchema,
  QuantumClawPluginToolContext,
  PluginLogger,
} from "../plugins/types.js";
