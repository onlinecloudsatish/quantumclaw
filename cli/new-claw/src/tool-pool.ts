/**
 * Tool Pool - Tool registration & management
 */

export interface Tool {
  name: string;
  description: string;
  execute: (input: unknown) => Promise<unknown>;
}

export class ToolPool {
  private tools: Map<string, Tool> = new Map();
  private toolPaths: string[];

  constructor(toolPaths: string[] = []) {
    this.toolPaths = toolPaths;
  }

  async load(): Promise<void> {
    // Load tools from paths
    for (const path of this.toolPaths) {
      try {
        const module = await import(path);
        const tool = module.default || module;
        this.register(tool);
      } catch (e) {
        console.warn(`Failed to load tool from ${path}:`, e);
      }
    }
  }

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  async execute(name: string, input: unknown): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool ${name} not found`);
    return tool.execute(input);
  }

  list(): string[] {
    return Array.from(this.tools.keys());
  }

  count(): number {
    return this.tools.size;
  }
}
