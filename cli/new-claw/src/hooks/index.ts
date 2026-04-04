/**
 * Hooks - Lifecycle event system
 */

export type HookEvent = "preprocess" | "postprocess" | "pretool" | "posttool" | "onerror";

export interface Hook {
  name: string;
  event: HookEvent;
  handler: (data: unknown) => Promise<void>;
}

export class Hooks {
  private hooks: Map<HookEvent, Hook[]> = new Map();
  private hookPaths: string[];

  constructor(hookPaths: string[] = []) {
    this.hookPaths = hookPaths;
  }

  async initialize(): Promise<void> {
    for (const path of this.hookPaths) {
      try {
        const module = await import(path);
        const hooks = module.default || module;
        for (const hook of hooks) {
          this.register(hook);
        }
      } catch (e) {
        console.warn(`Failed to load hooks from ${path}:`, e);
      }
    }
  }

  register(hook: Hook): void {
    const eventHooks = this.hooks.get(hook.event) || [];
    eventHooks.push(hook);
    this.hooks.set(hook.event, eventHooks);
  }

  async run(event: HookEvent, data: unknown): Promise<void> {
    const eventHooks = this.hooks.get(event) || [];
    for (const hook of eventHooks) {
      await hook.handler(data);
    }
  }

  count(): number {
    return Array.from(this.hooks.values()).reduce((sum, h) => sum + h.length, 0);
  }
}
