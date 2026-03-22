import type { PluginRuntime } from "quantumclaw/plugin-sdk/core";
import { createPluginRuntimeStore } from "quantumclaw/plugin-sdk/runtime-store";

const { setRuntime: setSlackRuntime, getRuntime: getSlackRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Slack runtime not initialized");
export { getSlackRuntime, setSlackRuntime };
