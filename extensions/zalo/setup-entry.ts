import { defineSetupPluginEntry } from "quantumclaw/plugin-sdk/core";
import { zaloPlugin } from "./src/channel.js";

export default defineSetupPluginEntry(zaloPlugin);
