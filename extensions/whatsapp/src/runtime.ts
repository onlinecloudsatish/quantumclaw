import type { PluginRuntime } from "quantumclaw/plugin-sdk/core";
import { createPluginRuntimeStore } from "quantumclaw/plugin-sdk/runtime-store";

const { setRuntime: setWhatsAppRuntime, getRuntime: getWhatsAppRuntime } =
  createPluginRuntimeStore<PluginRuntime>("WhatsApp runtime not initialized");
export { getWhatsAppRuntime, setWhatsAppRuntime };
