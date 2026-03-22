import type { PluginRuntime } from "quantumclaw/plugin-sdk/core";
import { createPluginRuntimeStore } from "quantumclaw/plugin-sdk/runtime-store";

const { setRuntime: setDiscordRuntime, getRuntime: getDiscordRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Discord runtime not initialized");
export { getDiscordRuntime, setDiscordRuntime };
