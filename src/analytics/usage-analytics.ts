// QuantumClaw Usage Analytics - Track API costs, usage, performance

import fs from 'fs';
import path from 'path';

export interface UsageRecord {
  timestamp: number;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  cost: number;
}

export interface DailyStats {
  date: string;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  avgLatencyMs: number;
}

/**
 * Usage Analytics - Production Ready
 * Track costs, usage, performance metrics
 */
export class UsageAnalytics {
  private dataPath: string;
  private records: UsageRecord[] = [];
  private providerCosts: Record<string, number> = {};

  constructor(dataPath: string = './data/analytics') {
    this.dataPath = dataPath;
  }

  async initialize(): Promise<void> {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
    this.loadFromDisk();
    console.log('📊 Usage analytics initialized');
  }

  /**
   * Record an API call
   */
  async recordRequest(
    provider: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    latencyMs: number
  ): Promise<void> {
    const cost = this.calculateCost(provider, inputTokens, outputTokens);
    
    const record: UsageRecord = {
      timestamp: Date.now(),
      provider,
      model,
      inputTokens,
      outputTokens,
      latencyMs,
      cost
    };

    this.records.push(record);
    this.providerCosts[provider] = (this.providerCosts[provider] || 0) + cost;
    this.saveToDisk();
  }

  /**
   * Get today's stats
   */
  getTodayStats(): DailyStats {
    const today = new Date().toISOString().split('T')[0];
    return this.getStatsForDate(today);
  }

  /**
   * Get stats for a specific date
   */
  getStatsForDate(date: string): DailyStats {
    const dayRecords = this.records.filter(r => {
      const recordDate = new Date(r.timestamp).toISOString().split('T')[0];
      return recordDate === date;
    });

    if (dayRecords.length === 0) {
      return {
        date,
        totalRequests: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCost: 0,
        avgLatencyMs: 0
      };
    }

    const totalInputTokens = dayRecords.reduce((sum, r) => sum + r.inputTokens, 0);
    const totalOutputTokens = dayRecords.reduce((sum, r) => sum + r.outputTokens, 0);
    const totalCost = dayRecords.reduce((sum, r) => sum + r.cost, 0);
    const avgLatencyMs = dayRecords.reduce((sum, r) => sum + r.latencyMs, 0) / dayRecords.length;

    return {
      date,
      totalRequests: dayRecords.length,
      totalInputTokens,
      totalOutputTokens,
      totalCost: Math.round(totalCost * 1000) / 1000,
      avgLatencyMs: Math.round(avgLatencyMs)
    };
  }

  /**
   * Get cost breakdown by provider
   */
  getProviderCosts(): Record<string, number> {
    return { ...this.providerCosts };
  }

  /**
   * Get total cost all time
   */
  getTotalCost(): number {
    return this.records.reduce((sum, r) => sum + r.cost, 0);
  }

  private calculateCost(provider: string, inputTokens: number, outputTokens: number): number {
    // Cost per 1M tokens (approximate)
    const costs: Record<string, { input: number; output: number }> = {
      'anthropic': { input: 15, output: 75 },
      'openai': { input: 10, output: 30 },
      'google': { input: 5, output: 15 },
      'groq': { input: 0, output: 0 },
      'openrouter': { input: 1, output: 1 },
      'kilocode': { input: 0, output: 0 }
    };

    const providerCost = costs[provider.toLowerCase()] || { input: 1, output: 1 };
    return ((inputTokens / 1_000_000) * providerCost.input) +
           ((outputTokens / 1_000_000) * providerCost.output);
  }

  private saveToDisk(): void {
    const filePath = path.join(this.dataPath, 'usage.json');
    fs.writeFileSync(filePath, JSON.stringify({
      records: this.records,
      providerCosts: this.providerCosts
    }, null, 2));
  }

  private loadFromDisk(): void {
    const filePath = path.join(this.dataPath, 'usage.json');
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        this.records = data.records || [];
        this.providerCosts = data.providerCosts || {};
      } catch (e) {
        // Start fresh
      }
    }
  }
}

export const usageAnalytics = new UsageAnalytics();
