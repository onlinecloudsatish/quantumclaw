import { randomBytes } from "crypto";
// QuantumClaw Audit Logging System
// Comprehensive action tracking and security monitoring

export type AuditAction =
  | "user.login"
  | "user.logout"
  | "user.register"
  | "user.password_change"
  | "user.mfa_enable"
  | "user.mfa_disable"
  | "secret.create"
  | "secret.read"
  | "secret.update"
  | "secret.delete"
  | "secret.export"
  | "secret.import"
  | "config.read"
  | "config.update"
  | "config.delete"
  | "channel.connect"
  | "channel.disconnect"
  | "message.send"
  | "message.receive"
  | "message.delete"
  | "agent.create"
  | "agent.execute"
  | "agent.stop"
  | "workflow.execute"
  | "automation.trigger"
  | "webhook.receive"
  | "webhook.invoke"
  | "file.upload"
  | "file.download"
  | "file.delete"
  | "security.violation"
  | "rate_limit.exceeded"
  | "permission.denied"
  | "session.create"
  | "session.end"
  | "system.start"
  | "system.stop"
  | "system.backup"
  | "system.restore";

export type AuditSeverity = "debug" | "info" | "warning" | "error" | "critical";

export interface AuditEvent {
  id: string;
  action: AuditAction;
  severity: AuditSeverity;
  actor: {
    type: "user" | "system" | "agent" | "webhook" | "api";
    id: string;
    name?: string;
    ip?: string;
    userAgent?: string;
  };
  target: {
    type: string;
    id: string;
    name?: string;
  };
  details: Record<string, any>;
  result: "success" | "failure" | "partial";
  error?: string;
  timestamp: Date;
  sessionId?: string;
  correlationId?: string;
  riskScore: number;
}

export interface AuditFilter {
  actions?: AuditAction[];
  severity?: AuditSeverity[];
  actorType?: string[];
  startDate?: Date;
  endDate?: Date;
  result?: string[];
  riskScoreMin?: number;
  riskScoreMax?: number;
  search?: string;
}

export interface AuditStats {
  totalEvents: number;
  byAction: Record<string, number>;
  bySeverity: Record<string, number>;
  byResult: Record<string, number>;
  byActorType: Record<string, number>;
  avgRiskScore: number;
  highRiskEvents: number;
  criticalEvents: number;
}

export class AuditLogger {
  private events: AuditEvent[] = [];
  private maxEvents = 100000;
  private alerts: Map<string, NodeJS.Timeout> = new Map();
  private alertRules: Map<string, {
    condition: (event: AuditEvent) => boolean;
    action: (event: AuditEvent) => void;
    cooldown: number;
  }> = new Map();

  /**
   * Log an audit event
   */
  log(event: Omit<AuditEvent, "id" | "timestamp" | "riskScore">): AuditEvent {
    const fullEvent: AuditEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date(),
      riskScore: this.calculateRiskScore(event),
    };

    this.events.push(fullEvent);

    // Check alert rules
    this.checkAlerts(fullEvent);

    // Cleanup old events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log critical events to console
    if (fullEvent.severity === "critical" || fullEvent.severity === "error") {
      console.error(`🔴 [AUDIT] ${fullEvent.action}: ${fullEvent.result}`, {
        actor: fullEvent.actor,
        target: fullEvent.target,
        error: fullEvent.error,
      });
    }

    return fullEvent;
  }

  /**
   * Log user action (convenience method)
   */
  logUserAction(
    action: AuditAction,
    userId: string,
    target: { type: string; id: string; name?: string },
    details: Record<string, any> = {},
    result: "success" | "failure" | "partial" = "success",
    error?: string
  ): AuditEvent {
    return this.log({
      action,
      severity: result === "failure" ? "warning" : "info",
      actor: { type: "user", id: userId },
      target,
      details,
      result,
      error,
    });
  }

  /**
   * Log system action
   */
  logSystemAction(
    action: AuditAction,
    systemId: string,
    target: { type: string; id: string },
    details: Record<string, any> = {}
  ): AuditEvent {
    return this.log({
      action,
      severity: "info",
      actor: { type: "system", id: systemId },
      target,
      details,
      result: "success",
    });
  }

  /**
   * Log security event
   */
  logSecurityEvent(
    action: AuditAction,
    actor: AuditEvent["actor"],
    target: AuditEvent["target"],
    details: Record<string, any>,
    severity: AuditSeverity = "warning"
  ): AuditEvent {
    return this.log({
      action,
      severity,
      actor,
      target,
      details,
      result: "failure",
      riskScore: severity === "critical" ? 100 : severity === "error" ? 75 : 50,
    });
  }

  /**
   * Query audit events
   */
  query(filter: AuditFilter = {}, limit = 100, offset = 0): AuditEvent[] {
    let results = [...this.events];

    if (filter.actions?.length) {
      results = results.filter(e => filter.actions!.includes(e.action));
    }

    if (filter.severity?.length) {
      results = results.filter(e => filter.severity!.includes(e.severity));
    }

    if (filter.actorType?.length) {
      results = results.filter(e => filter.actorType!.includes(e.actor.type));
    }

    if (filter.startDate) {
      results = results.filter(e => e.timestamp >= filter.startDate!);
    }

    if (filter.endDate) {
      results = results.filter(e => e.timestamp <= filter.endDate!);
    }

    if (filter.result?.length) {
      results = results.filter(e => filter.result!.includes(e.result));
    }

    if (filter.riskScoreMin !== undefined) {
      results = results.filter(e => e.riskScore >= filter.riskScoreMin!);
    }

    if (filter.riskScoreMax !== undefined) {
      results = results.filter(e => e.riskScore <= filter.riskScoreMax!);
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      results = results.filter(e =>
        e.action.toLowerCase().includes(search) ||
        e.actor.id.toLowerCase().includes(search) ||
        e.target.id.toLowerCase().includes(search) ||
        JSON.stringify(e.details).toLowerCase().includes(search)
      );
    }

    return results.slice(offset, offset + limit);
  }

  /**
   * Get statistics
   */
  getStats(filter: AuditFilter = {}): AuditStats {
    const events = this.query({ ...filter, startDate: undefined, endDate: undefined });

    const byAction: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byResult: Record<string, number> = {};
    const byActorType: Record<string, number> = {};

    let totalRiskScore = 0;
    let highRiskCount = 0;
    let criticalCount = 0;

    for (const event of events) {
      byAction[event.action] = (byAction[event.action] || 0) + 1;
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
      byResult[event.result] = (byResult[event.result] || 0) + 1;
      byActorType[event.actor.type] = (byActorType[event.actor.type] || 0) + 1;

      totalRiskScore += event.riskScore;
      if (event.riskScore >= 75) highRiskCount++;
      if (event.severity === "critical") criticalCount++;
    }

    return {
      totalEvents: events.length,
      byAction,
      bySeverity,
      byResult,
      byActorType,
      avgRiskScore: events.length > 0 ? totalRiskScore / events.length : 0,
      highRiskEvents: highRiskCount,
      criticalEvents: criticalCount,
    };
  }

  /**
   * Add alert rule
   */
  addAlertRule(
    name: string,
    condition: (event: AuditEvent) => boolean,
    action: (event: AuditEvent) => void,
    cooldownMs = 60000
  ): void {
    this.alertRules.set(name, { condition, action, cooldown: cooldownMs });
  }

  /**
   * Get suspicious activity
   */
  getSuspiciousActivity(threshold = 50): AuditEvent[] {
    return this.events
      .filter(e => e.riskScore >= threshold)
      .sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Get user activity timeline
   */
  getUserTimeline(userId: string, limit = 50): AuditEvent[] {
    return this.events
      .filter(e => e.actor.id === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Export audit log
   */
  export(filter: AuditFilter = {}): string {
    const events = this.query(filter, this.maxEvents);
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      count: events.length,
      events,
    }, null, 2);
  }

  /**
   * Clear old events
   */
  cleanup(olderThanDays: number): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    const before = this.events.length;
    this.events = this.events.filter(e => e.timestamp >= cutoff);
    return before - this.events.length;
  }

  // Private methods
  private calculateRiskScore(event: Omit<AuditEvent, "riskScore">): number {
    let score = 0;

    // Base score by severity
    const severityScores: Record<AuditSeverity, number> = {
      debug: 0,
      info: 5,
      warning: 20,
      error: 50,
      critical: 100,
    };
    score += severityScores[event.severity];

    // High-risk actions
    const highRiskActions = [
      "secret.export",
      "secret.delete",
      "config.delete",
      "system.backup",
      "system.restore",
      "permission.denied",
    ];
    if (highRiskActions.includes(event.action)) {
      score += 30;
    }

    // Failed results
    if (event.result === "failure") {
      score += 25;
    }

    // Suspicious actors
    if (event.actor.type === "api" || event.actor.type === "webhook") {
      score += 15;
    }

    return Math.min(100, score);
  }

  private checkAlerts(event: AuditEvent): void {
    for (const [name, rule] of this.alertRules) {
      if (rule.condition(event)) {
        // Check cooldown
        const alertKey = `${name}-${event.id}`;
        if (!this.alerts.has(alertKey)) {
          rule.action(event);
          
          // Set cooldown
          this.alerts.set(alertKey, setTimeout(() => {
            this.alerts.delete(alertKey);
          }, rule.cooldown));
        }
      }
    }
  }

  private generateId(): string {
    return `audit_${Date.now()}_${crypto.randomBytes(2).readUInt16BE(0) / 65536.toString(36).slice(2, 9)}`;
  }
}

export const auditLogger = new AuditLogger();

// Setup default alert rules
auditLogger.addAlertRule(
  "failed_login",
  (e) => e.action === "user.login" && e.result === "failure",
  (e) => console.warn(`⚠️ Failed login attempt for user: ${e.target.id}`),
  30000 // 30 second cooldown
);

auditLogger.addAlertRule(
  "suspicious_action",
  (e) => e.riskScore >= 75,
  (e) => console.error(`🚨 High-risk action detected: ${e.action} by ${e.actor.id}`),
  60000 // 1 minute cooldown
);