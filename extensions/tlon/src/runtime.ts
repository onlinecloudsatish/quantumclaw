import type { PluginRuntime } from "quantumclaw/plugin-sdk/plugin-runtime";
import { createPluginRuntimeStore } from "quantumclaw/plugin-sdk/runtime-store";

const { setRuntime: setTlonRuntime, getRuntime: getTlonRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Tlon runtime not initialized");
export { getTlonRuntime, setTlonRuntime };
