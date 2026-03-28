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

export interface CostAnalysis {
  totalCost: number;
  byProvider: Record<string, number>;
  byModel: Record<string, number>;
  projections: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface PerformanceAnalysis {
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
  successRate: number;
  errorRate: number;
}

export class AdvancedAnalytics {
  private records: UsageRecord[] = [];
  private startTime: number = Date.now();

  recordUsage(
    provider: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    latencyMs: number
  ): void {
    const cost = this.calculateCost(provider, inputTokens, outputTokens);
    this.records.push({
      timestamp: Date.now(),
      provider,
      model,
      inputTokens,
      outputTokens,
      latencyMs,
      cost
    });
  }

  getCostAnalysis(): CostAnalysis {
    const totalCost = this.records.reduce((sum, r) => sum + r.cost, 0);
    const byProvider: Record<string, number> = {};
    const byModel: Record<string, number> = {};

    for (const r of this.records) {
      byProvider[r.provider] = (byProvider[r.provider] || 0) + r.cost;
      byModel[r.model] = (byModel[r.model] || 0) + r.cost;
    }

    const hoursRunning = (Date.now() - this.startTime) / (1000 * 60 * 60);
    const hourlyRate = hoursRunning > 0 ? totalCost / hoursRunning : 0;

    return {
      totalCost,
      byProvider,
      byModel,
      projections: {
        daily: hourlyRate * 24,
        weekly: hourlyRate * 24 * 7,
        monthly: hourlyRate * 24 * 30
      }
    };
  }

  getPerformance(): PerformanceAnalysis {
    if (this.records.length === 0) {
      return {
        avgLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        successRate: 100,
        errorRate: 0
      };
    }

    const latencies = this.records.map(r => r.latencyMs).sort((a, b) => a - b);
    const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    const p95Index = Math.floor(latencies.length * 0.95);
    const p99Index = Math.floor(latencies.length * 0.99);

    return {
      avgLatency,
      p95Latency: latencies[p95Index] || 0,
      p99Latency: latencies[p99Index] || 0,
      successRate: 100,
      errorRate: 0
    };
  }

  private calculateCost(provider: string, inputTokens: number, outputTokens: number): number {
    const costs: Record<string, { input: number; output: number }> = {
      anthropic: { input: 15, output: 75 },
      openai: { input: 10, output: 30 },
      openrouter: { input: 1, output: 1 },
      kilocode: { input: 0, output: 0 },
      groq: { input: 0, output: 0 }
    };
    const rate = costs[provider] || { input: 1, output: 1 };
    return ((inputTokens / 1000000) * rate.input) + ((outputTokens / 1000000) * rate.output);
  }
}

export const analytics = new AdvancedAnalytics();
