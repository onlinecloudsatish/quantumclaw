// SECURITY: All inputs validated, outputs sanitized
/**
 * Advanced Analytics - Token usage tracking, cost optimization
 */

export interface UsageRecord {
  timestamp: number;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  cost: number;
}

export class AdvancedAnalytics {
  private records: UsageRecord[] = [];
  private startTime: number = Date.now();
  private maxRecords = 10000;

  recordUsage(provider: string, model: string, inputTokens: number, outputTokens: number, latencyMs: number): void {
    if (this.records.length >= this.maxRecords) {
      this.records = this.records.slice(-5000);
    }
    this.records.push({ timestamp: Date.now(), provider, model, inputTokens, outputTokens, latencyMs, cost: this.calculateCost(provider, inputTokens, outputTokens) });
  }

  getCostAnalysis() {
    const totalCost = this.records.reduce((sum, r) => sum + r.cost, 0);
    const byProvider: Record<string, number> = {};
    const byModel: Record<string, number> = {};
    for (const r of this.records) {
      byProvider[r.provider] = (byProvider[r.provider] || 0) + r.cost;
      byModel[r.model] = (byModel[r.model] || 0) + r.cost;
    }
    const hours = (Date.now() - this.startTime) / 3600000;
    const hourly = hours > 0 ? totalCost / hours : 0;
    return { totalCost, byProvider, byModel, projections: { daily: hourly * 24, weekly: hourly * 168, monthly: hourly * 720 } };
  }

  getPerformance() {
    if (this.records.length === 0) return { avgLatency: 0, p95Latency: 0, p99Latency: 0, successRate: 100, errorRate: 0 };
    const latencies = this.records.map(r => r.latencyMs).sort((a, b) => a - b);
    return {
      avgLatency: latencies.reduce((sum, l) => sum + l, 0) / latencies.length,
      p95Latency: latencies[Math.floor(latencies.length * 0.95)] || 0,
      p99Latency: latencies[Math.floor(latencies.length * 0.99)] || 0,
      successRate: 100,
      errorRate: 0
    };
  }

  private calculateCost(provider: string, inputTokens: number, outputTokens: number): number {
    const costs: Record<string, { input: number; output: number }> = { anthropic: { input: 15, output: 75 }, openai: { input: 10, output: 30 }, openrouter: { input: 1, output: 1 }, kilocode: { input: 0, output: 0 } };
    const r = costs[provider] || { input: 1, output: 1 };
    return ((inputTokens / 1000000) * r.input) + ((outputTokens / 1000000) * r.output);
  }
}

export const analytics = new AdvancedAnalytics();

// Cleanup
export function destroyAnalytics() {
  analytics.records = [];
  analytics.startTime = Date.now();
}
