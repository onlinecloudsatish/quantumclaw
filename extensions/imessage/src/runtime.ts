import type { PluginRuntime } from "quantumclaw/plugin-sdk/core";
import { createPluginRuntimeStore } from "quantumclaw/plugin-sdk/runtime-store";

const { setRuntime: setIMessageRuntime, getRuntime: getIMessageRuntime } =
  createPluginRuntimeStore<PluginRuntime>("iMessage runtime not initialized");
export { getIMessageRuntime, setIMessageRuntime };
