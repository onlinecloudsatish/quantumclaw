// Narrow plugin-sdk surface for the bundled thread-ownership plugin.
// Keep this list additive and scoped to symbols used under extensions/thread-ownership.

export { definePluginEntry } from "./plugin-entry.js";
export type { QuantumClawConfig } from "../config/config.js";
export type { QuantumClawPluginApi } from "../plugins/types.js";
