/**
 * NEW CLAW CLI
 * Based on Claude Code source map patterns + Claw Code architecture
 * Built for QuantumClaw ecosystem
 */

import { parseArgs } from "util";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { QueryEngine } from "./src/query-engine.js";
import { ToolPool } from "./src/tool-pool.js";
import { Runtime } from "./src/runtime.js";
import { Hooks } from "./src/hooks/index.js";
import { MCPBridge } from "./src/bridge/mcp-bridge.js";
import { PermissionSystem } from "./src/permissions.js";
import { SessionStore } from "./src/session-store.js";

export interface ClawConfig {
  model: string;
  apiKey?: string;
  tools?: string[];
  hooks?: string[];
  mcpServers?: Record<string, string>;
  maxTokens?: number;
  temperature?: number;
}

export class NewClawCLI {
  private config: ClawConfig;
  private queryEngine: QueryEngine;
  private toolPool: ToolPool;
  private runtime: Runtime;
  private hooks: Hooks;
  private mcpBridge: MCPBridge;
  private permissions: PermissionSystem;
  private sessionStore: SessionStore;

  constructor(config: ClawConfig) {
    this.config = config;
    this.queryEngine = new QueryEngine(config.model, config.apiKey);
    this.toolPool = new ToolPool(config.tools || []);
    this.runtime = new Runtime(this.queryEngine, this.toolPool);
    this.hooks = new Hooks(config.hooks || []);
    this.mcpBridge = new MCPBridge(config.mcpServers || {});
    this.permissions = new PermissionSystem();
    this.sessionStore = new SessionStore();
  }

  async initialize(): Promise<void> {
    await this.toolPool.load();
    await this.hooks.initialize();
    await this.mcpBridge.connect();
    console.log("🦞 NewClaw CLI initialized");
  }

  async chat(message: string, context?: Record<string, unknown>): Promise<string> {
    const session = this.sessionStore.create();
    
    // Run pre-processing hooks
    await this.hooks.run("preprocess", { message, context });
    
    // Execute query through runtime
    const response = await this.runtime.execute(message, context);
    
    // Run post-processing hooks
    await this.hooks.run("postprocess", { response });
    
    return response;
  }

  async run(command: string, args?: Record<string, unknown>): Promise<void> {
    switch (command) {
      case "chat":
        await this.chat(args?.message as string);
        break;
      case "tools":
        console.log("Available tools:", this.toolPool.list());
        break;
      case "status":
        console.log("Status:", {
          tools: this.toolPool.count(),
          hooks: this.hooks.count(),
          mcp: this.mcpBridge.serverCount(),
        });
        break;
      default:
        console.log(`Unknown command: ${command}`);
    }
  }
}

// CLI Entry Point
async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      model: { type: "string", default: "claude-3-5-sonnet" },
      apiKey: { type: "string" },
      tools: { type: "string", multiple: true },
      config: { type: "string" },
    },
  });

  let config: ClawConfig = {
    model: values.model || "claude-3-5-sonnet",
    apiKey: values.apiKey || process.env.ANTHROPIC_API_KEY,
  };

  // Load config file if specified
  if (values.config) {
    const configFile = await readFile(values.config, "utf-8");
    config = { ...config, ...JSON.parse(configFile) };
  }

  const cli = new NewClawCLI(config);
  await cli.initialize();

  // Run command
  const [cmd, ...rest] = rest;
  await cli.run(cmd || "chat", { message: rest.join(" ") });
}

main().catch(console.error);
