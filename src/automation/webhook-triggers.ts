// QuantumClaw Real-time Webhook Triggers
// External event-driven automation

import { z } from "zod";

export const WebhookEventSchema = z.object({
  id: z.string(),
  source: z.string(),
  type: z.string(),
  payload: z.record(z.any()),
  timestamp: z.date(),
});

export const WebhookTriggerSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string().optional(),
  enabled: z.boolean(),
  filters: z.record(z.any()).optional(),
  actions: z.array(z.string()),
});

export type WebhookEvent = z.infer<typeof WebhookEventSchema>;
export type WebhookTrigger = z.infer<typeof WebhookTriggerSchema>;

export interface WebhookLog {
  triggerId: string;
  event: WebhookEvent;
  status: "received" | "processed" | "failed";
  response?: string;
  error?: string;
  timestamp: Date;
  processingTime: number;
}

export interface WebhookSource {
  id: string;
  name: string;
  icon: string;
  events: string[];
  config: Record<string, any>;
}

export class WebhookTriggerEngine {
  private triggers: Map<string, WebhookTrigger> = new Map();
  private logs: WebhookLog[] = [];
  private eventHandlers: Map<string, Array<(event: WebhookEvent) => Promise<void>>> = new Map();
  private httpServer: any = null;
  private port = 0;

  // Built-in sources
  private sources: Map<string, WebhookSource> = new Map([
    ["github", {
      id: "github",
      name: "GitHub",
      icon: "🐙",
      events: ["push", "pull_request", "issues", "release", "workflow_run"],
      config: { webhookSecret: "" },
    }],
    ["gitlab", {
      id: "gitlab",
      name: "GitLab",
      icon: "🦊",
      events: ["push", "merge_request", "issue", "tag", "pipeline"],
      config: { webhookSecret: "" },
    }],
    ["slack", {
      id: "slack",
      name: "Slack",
      icon: "💬",
      events: ["message", "reaction_added", "app_mention", "slash_command"],
      config: { signingSecret: "" },
    }],
    ["calendar", {
      id: "calendar",
      name: "Google Calendar",
      icon: "📅",
      events: ["event_started", "event_ending", "event_created", "event_updated"],
      config: { calendarId: "" },
    }],
    ["email", {
      id: "email",
      name: "Email",
      icon: "📧",
      events: ["email_received", "email_starred", "email_labeled"],
      config: { imapHost: "" },
    }],
    ["custom", {
      id: "custom",
      name: "Custom HTTP",
      icon: "🔗",
      events: ["*"],
      config: {},
    }],
  ]);

  /**
   * Register a webhook trigger
   */
  register(trigger: WebhookTrigger): void {
    this.triggers.set(trigger.id, trigger);
    console.log(`🪝 Registered webhook trigger: ${trigger.name} (${trigger.url})`);
  }

  /**
   * Create a new trigger
   */
  create(options: {
    name: string;
    url: string;
    events: string[];
    secret?: string;
    filters?: Record<string, any>;
    actions: string[];
  }): WebhookTrigger {
    const trigger: WebhookTrigger = {
      id: this.generateId(),
      ...options,
      enabled: true,
    };
    this.register(trigger);
    return trigger;
  }

  /**
   * Start the webhook server
   */
  async start(port: number = 18790): Promise<number> {
    if (this.httpServer) {
      console.log("🪝 Webhook server already running");
      return this.port;
    }

    this.port = port;
    
    // In production, this would start an actual HTTP server
    // For now, we'll simulate it
    console.log(`🪝 Webhook server starting on port ${port}...`);
    console.log(`   POST /webhook/:source - Receive webhooks`);
    console.log(`   GET  /webhook/status     - Server status`);
    
    // Simulate server start
    this.httpServer = { running: true, port };
    return port;
  }

  /**
   * Stop the webhook server
   */
  async stop(): Promise<void> {
    if (this.httpServer) {
      this.httpServer = null;
      this.port = 0;
      console.log("🪝 Webhook server stopped");
    }
  }

  /**
   * Receive a webhook event
   */
  async receiveWebhook(source: string, payload: any, headers: Record<string, string> = {}): Promise<WebhookLog> {
    const startTime = Date.now();
    const event: WebhookEvent = {
      id: this.generateId(),
      source,
      type: payload.event || payload.action || "unknown",
      payload,
      timestamp: new Date(),
    };

    console.log(`🪝 Received webhook from ${source}: ${event.type}`);

    const log: WebhookLog = {
      triggerId: "",
      event,
      status: "received",
      timestamp: new Date(),
      processingTime: 0,
    };

    try {
      // Find matching triggers
      const matchingTriggers = Array.from(this.triggers.values()).filter(
        t => t.enabled && (t.events.includes(event.type) || t.events.includes("*"))
      );

      for (const trigger of matchingTriggers) {
        // Check filters
        if (trigger.filters && !this.matchFilters(event, trigger.filters)) {
          console.log(`   ⏭️  Skipping trigger (filters not matched): ${trigger.name}`);
          continue;
        }

        // Verify secret if provided
        if (trigger.secret) {
          const signature = headers["x-hub-signature-256"] || headers["x-gitlab-token"] || "";
          if (!this.verifySecret(signature, trigger.secret, payload)) {
            console.log(`   ❌ Secret verification failed for: ${trigger.name}`);
            log.status = "failed";
            log.error = "Secret verification failed";
            continue;
          }
        }

        console.log(`   ⚡ Executing trigger: ${trigger.name}`);
        await this.executeActions(trigger.actions, event);
        
        log.triggerId = trigger.id;
        log.status = "processed";
      }

      // Emit event to handlers
      await this.emitEvent(event);

    } catch (error) {
      log.status = "failed";
      log.error = error instanceof Error ? error.message : String(error);
      console.error(`❌ Webhook processing failed: ${log.error}`);
    }

    log.processingTime = Date.now() - startTime;
    this.logs.push(log);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    return log;
  }

  /**
   * Register event handler
   */
  onEvent(eventType: string, handler: (event: WebhookEvent) => Promise<void>): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }

  /**
   * Get available sources
   */
  getSources(): WebhookSource[] {
    return Array.from(this.sources.values());
  }

  /**
   * Configure a source
   */
  configureSource(sourceId: string, config: Record<string, any>): void {
    const source = this.sources.get(sourceId);
    if (source) {
      source.config = { ...source.config, ...config };
      console.log(`🪝 Configured source: ${source.name}`);
    }
  }

  /**
   * Get trigger by ID
   */
  getTrigger(id: string): WebhookTrigger | undefined {
    return this.triggers.get(id);
  }

  /**
   * List all triggers
   */
  listTriggers(): WebhookTrigger[] {
    return Array.from(this.triggers.values());
  }

  /**
   * Enable/disable trigger
   */
  setTriggerEnabled(id: string, enabled: boolean): void {
    const trigger = this.triggers.get(id);
    if (trigger) {
      trigger.enabled = enabled;
      console.log(`🪝 Trigger ${enabled ? "enabled" : "disabled"}: ${trigger.name}`);
    }
  }

  /**
   * Get logs
   */
  getLogs(limit = 100): WebhookLog[] {
    return this.logs.slice(-limit);
  }

  /**
   * Get stats
   */
  getStats() {
    const total = this.logs.length;
    const processed = this.logs.filter(l => l.status === "processed").length;
    const failed = this.logs.filter(l => l.status === "failed").length;
    const avgTime = this.logs.reduce((a, b) => a + b.processingTime, 0) / total || 0;

    return {
      triggers: this.triggers.size,
      totalEvents: total,
      processed,
      failed,
      avgProcessingTime: Math.round(avgTime),
    };
  }

  // Private methods
  private async emitEvent(event: WebhookEvent): Promise<void> {
    const handlers = this.eventHandlers.get(event.type) || [];
    const wildcardHandlers = this.eventHandlers.get("*") || [];
    const allHandlers = [...handlers, ...wildcardHandlers];

    for (const handler of allHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`❌ Event handler error: ${error}`);
      }
    }
  }

  private async executeActions(actions: string[], event: WebhookEvent): Promise<void> {
    for (const action of actions) {
      const [category, operation] = action.split(":");

      switch (category) {
        case "notify":
          await this.actionNotify(operation, event);
          break;
        case "send":
          await this.actionSend(operation, event);
          break;
        case "store":
          await this.actionStore(operation, event);
          break;
        case "exec":
          await this.actionExec(operation, event);
          break;
        case "transform":
          await this.actionTransform(operation, event);
          break;
        default:
          console.log(`   ⚠️ Unknown action: ${action}`);
      }
    }
  }

  private async actionNotify(operation: string, event: WebhookEvent): Promise<void> {
    console.log(`   📱 Notifying: ${operation}`);
  }

  private async actionSend(operation: string, event: WebhookEvent): Promise<void> {
    console.log(`   📤 Sending: ${operation}`);
  }

  private async actionStore(operation: string, event: WebhookEvent): Promise<void> {
    console.log(`   💾 Storing: ${operation}`);
  }

  private async actionExec(operation: string, event: WebhookEvent): Promise<void> {
    console.log(`   ⚙️  Executing: ${operation}`);
  }

  private async actionTransform(operation: string, event: WebhookEvent): Promise<void> {
    console.log(`   🔄 Transforming: ${operation}`);
  }

  private matchFilters(event: WebhookEvent, filters: Record<string, any>): boolean {
    for (const [key, expected] of Object.entries(filters)) {
      const actual = this.getNestedValue(event, key);
      if (actual !== expected) return false;
    }
    return true;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  }

  private verifySecret(signature: string, secret: string, payload: any): boolean {
    // Simple verification - in production use crypto
    return !secret || signature.length > 0;
  }

  private generateId(): string {
    return `wh_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

export const webhookEngine = new WebhookTriggerEngine();