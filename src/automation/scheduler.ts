// QuantumClaw Automation Engine

export interface AutomationTrigger {
  type: 'cron' | 'event' | 'webhook' | 'manual';
  schedule?: string;
  event?: string;
  webhookUrl?: string;
}

export interface AutomationAction {
  type: 'message' | 'notification' | 'exec' | 'http';
  config: Record<string, any>;
}

export interface Automation {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  action: AutomationAction;
  lastRun?: Date;
  runCount: number;
}

export class AutomationScheduler {
  private automations: Map<string, Automation> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  register(automation: Automation): void {
    this.automations.set(automation.id, automation);
    if (automation.enabled && automation.trigger.type === 'cron') {
      this.startCron(automation);
    }
  }

  private startCron(automation: Automation): void {
    const interval = setInterval(() => {
      this.execute(automation.id);
    }, 60000);
    
    this.intervals.set(automation.id, interval);
  }

  async execute(automationId: string): Promise<void> {
    const automation = this.automations.get(automationId);
    if (!automation || !automation.enabled) return;

    console.log(`⚡ Executing automation: ${automation.name}`);
    
    switch (automation.action.type) {
      case 'message':
        await this.sendMessage(automation.action.config);
        break;
      case 'notification':
        await this.sendNotification(automation.action.config);
        break;
      case 'exec':
        await this.runCommand(automation.action.config);
        break;
      case 'http':
        await this.callHttp(automation.action.config);
        break;
    }

    automation.lastRun = new Date();
    automation.runCount++;
  }

  private async sendMessage(config: Record<string, any>): Promise<void> {
    console.log(`📱 Sending message to ${config.to}: ${config.message}`);
  }

  private async sendNotification(config: Record<string, any>): Promise<void> {
    console.log(`🔔 Sending notification: ${config.title}`);
  }

  private async runCommand(config: Record<string, any>): Promise<void> {
    console.log(`⚙️ Running command: ${config.command}`);
  }

  private async callHttp(config: Record<string, any>): Promise<void> {
    console.log(`🌐 Calling HTTP: ${config.url}`);
  }

  list(): Automation[] {
    return Array.from(this.automations.values());
  }

  stop(automationId: string): void {
    const interval = this.intervals.get(automationId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(automationId);
    }
  }
}

export const scheduler = new AutomationScheduler();