/**
 * Permission System - Security & access control
 */

export type PermissionLevel = "allow" | "deny" | "prompt";

export interface PermissionRule {
  path: string;
  pattern: string;
  level: PermissionLevel;
}

export interface PermissionContext {
  tool: string;
  args: Record<string, unknown>;
  userId?: string;
}

export class PermissionSystem {
  private rules: PermissionRule[] = [];

  addRule(rule: PermissionRule): void {
    this.rules.push(rule);
  }

  async check(context: PermissionContext): Promise<{ allowed: boolean; reason?: string }> {
    for (const rule of this.rules) {
      if (this.matchesPattern(context.tool, rule.pattern)) {
        return { allowed: rule.level !== "deny", reason: rule.level === "prompt" ? "needs prompt" : undefined };
      }
    }
    return { allowed: true }; // Default allow
  }

  private matchesPattern(tool: string, pattern: string): boolean {
    if (pattern === "*") return true;
    if (pattern.endsWith("*")) {
      return tool.startsWith(pattern.slice(0, -1));
    }
    return tool === pattern;
  }

  async prompt(tool: string, args: Record<string, unknown>): Promise<boolean> {
    // Would show a prompt to user
    return true;
  }
}
