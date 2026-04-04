/**
 * Runtime - Agent execution orchestration
 */

import { QueryEngine, type QueryRequest } from "./query-engine.js";
import { ToolPool } from "./tool-pool.js";

export interface ExecutionContext {
  sessionId: string;
  history: Array<{ role: string; content: string }>;
  variables: Map<string, unknown>;
}

export class Runtime {
  private queryEngine: QueryEngine;
  private toolPool: ToolPool;

  constructor(queryEngine: QueryEngine, toolPool: ToolPool) {
    this.queryEngine = queryEngine;
    this.toolPool = toolPool;
  }

  async execute(message: string, context?: Record<string, unknown>): Promise<string> {
    const messages = [
      { role: "user", content: message }
    ];

    // Get available tools
    const tools = this.toolPool.list().map(name => ({
      name,
      description: `Tool: ${name}`,
      inputSchema: { type: "object" }
    }));

    // Execute query
    const request: QueryRequest = {
      model: "claude-3-5-sonnet",
      messages,
      tools: tools.length > 0 ? tools : undefined
    };

    const response = await this.queryEngine.query(request);
    return response.content;
  }

  async executeWithTools(message: string, toolResults: Record<string, unknown>): Promise<string> {
    const messages = [
      { role: "user", content: message },
      ...Object.entries(toolResults).map(([tool, result]) => ({
        role: "user",
        content: `Tool ${tool} result: ${JSON.stringify(result)}`
      }))
    ];

    const response = await this.queryEngine.query({
      model: "claude-3-5-sonnet",
      messages
    });

    return response.content;
  }
}
