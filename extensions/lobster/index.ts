import { definePluginEntry } from "quantumclaw/plugin-sdk/plugin-entry";
import type { AnyAgentTool, QuantumClawPluginApi, QuantumClawPluginToolFactory } from "./runtime-api.js";
import { createLobsterTool } from "./src/lobster-tool.js";

export default definePluginEntry({
  id: "lobster",
  name: "Lobster",
  description: "Optional local shell helper tools",
  register(api: QuantumClawPluginApi) {
    api.registerTool(
      ((ctx) => {
        if (ctx.sandboxed) {
          return null;
        }
        return createLobsterTool(api) as AnyAgentTool;
      }) as QuantumClawPluginToolFactory,
      { optional: true },
    );
  },
});
