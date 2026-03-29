/**
 * MCP Server - Model Context Protocol integration
 * Based on deer-flow MCP integration
 */

export interface MCPServerConfig {
  name: string;
  url: string;
  tools: MCPTool[];
  connected: boolean;
}

export interface MCPTool {
  name: string;
  description: string;
  serverName: string;
}

export class MCPServer {
  private servers: Map<string, MCPServerConfig> = new Map();
  private tools: Map<string, MCPTool> = new Map();

  addServer(name: string, url: string): void {
    this.servers.set(name, {
      name,
      url,
      tools: [],
      connected: false
    });
  }

  async connect(name: string): Promise<boolean> {
    const server = this.servers.get(name);
    if (!server) return false;
    server.connected = true;
    return true;
  }

  registerTool(serverName: string, tool: Omit<MCPTool, 'serverName'>): void {
    const fullTool: MCPTool = { ...tool, serverName };
    this.tools.set(`${serverName}:${tool.name}`, fullTool);
  }

  listTools(serverName?: string): MCPTool[] {
    const all = Array.from(this.tools.values());
    return serverName ? all.filter(t => t.serverName === serverName) : all;
  }

  async callTool(serverName: string, toolName: string, args: any): Promise<any> {
    const tool = this.tools.get(`${serverName}:${toolName}`);
    if (!tool) throw new Error(`Tool ${toolName} not found`);
    return { success: true, tool: toolName, args };
  }

  getConnected(): string[] {
    return Array.from(this.servers.values())
      .filter(s => s.connected)
      .map(s => s.name);
  }

  destroy(): void {
    this.servers.clear();
    this.tools.clear();
  }
}

export const mcp = new MCPServer();
