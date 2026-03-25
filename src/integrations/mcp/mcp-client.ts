// QuantumClaw MCP Integration - Model Context Protocol
// Connect to 100+ tools (GitHub, Slack, etc.)

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export interface MCPServer {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

/**
 * MCP Client - Connect to Model Context Protocol servers
 * 
 * MCP lets AI agents connect to external tools and services
 * Example servers: GitHub, Slack, Filesystem, etc.
 */
export class MCPClient {
  private clients: Map<string, Client> = new Map();
  private servers: MCPServer[] = [];

  constructor() {
    // Default MCP servers to support
    this.servers = [
      { name: 'filesystem', command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '/'] },
      { name: 'github', command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'] },
    ];
  }

  /**
   * Initialize an MCP server connection
   */
  async connect(serverName: string, config?: MCPServer): Promise<boolean> {
    const server = config || this.servers.find(s => s.name === serverName);
    if (!server) {
      console.log(`⚠️ Unknown MCP server: ${serverName}`);
      return false;
    }

    try {
      const transport = new StdioClientTransport({
        command: server.command,
        args: server.args || [],
        env: { ...process.env, ...server.env }
      });

      const client = new Client({
        name: `quantumclaw-${serverName}`,
        version: '1.0.0'
      }, {
        capabilities: {}
      });

      await client.connect(transport);
      this.clients.set(serverName, client);
      console.log(`🔗 MCP connected: ${serverName}`);
      return true;
    } catch (e) {
      console.log(`⚠️ MCP connect failed: ${serverName}`);
      return false;
    }
  }

  /**
   * List available tools from all connected servers
   */
  async listTools(): Promise<MCPTool[]> {
    const tools: MCPTool[] = [];

    for (const [name, client] of this.clients) {
      try {
        const response = await client.request(
          { method: 'tools/list' },
          { params: {} }
        );
        if (response.tools) {
          for (const tool of response.tools) {
            tools.push({
              name: `${name}:${tool.name}`,
              description: tool.description || '',
              inputSchema: tool.inputSchema || {}
            });
          }
        }
      } catch (e) {
        // Continue
      }
    }

    return tools;
  }

  /**
   * Call an MCP tool
   */
  async callTool(serverName: string, toolName: string, args: any): Promise<any> {
    const client = this.clients.get(serverName);
    if (!client) {
      throw new Error(`MCP server not connected: ${serverName}`);
    }

    const response = await client.request(
      { method: 'tools/call' },
      { params: { name: toolName, arguments: args } }
    );

    return response;
  }

  /**
   * Disconnect from all servers
   */
  async disconnect(): Promise<void> {
    for (const client of this.clients.values()) {
      await client.close();
    }
    this.clients.clear();
  }

  /**
   * Get connected servers
   */
  getConnectedServers(): string[] {
    return Array.from(this.clients.keys());
  }
}

export const mcpClient = new MCPClient();
