// QuantumClaw Smart Router - FREE FIRST Strategy
// PRIORITY: Kilo (free) → Groq (cheap) → OpenRouter → Premium (last resort)

export interface ModelConfig {
  name: string;
  provider: string;
  costPer1MInput: number;
  costPer1MOutput: number;
  priority: number; // Lower = higher priority (use first)
  latency: string;
  contextWindow: number;
  bestFor: string[];
}

export interface TaskContext {
  complexity: 'simple' | 'medium' | 'complex';
  type: 'chat' | 'code' | 'search' | 'analyze' | 'create';
  hasContext: boolean;
  estimatedTokens?: number;
  forcePremium?: boolean; // Override for complex tasks
}

/**
 * Smart Router - FREE FIRST Strategy
 * 
 * Priority Order:
 * 1. Kilo (free) - 99% of tasks
 * 2. Groq (~$0.04/1M) - if Kilo fails
 * 3. OpenRouter (~$0.10/1M) - backup
 * 4. Premium Claude/GPT - ONLY for complex
 */
export class SmartRouter {
  // Model priority (lower = use first)
  private models: ModelConfig[] = [
    // FREE TIER - USE FIRST!
    { 
      name: 'kilo-auto/free', 
      provider: 'kilocode', 
      costPer1MInput: 0, 
      costPer1MOutput: 0,
      priority: 1, // HIGHEST
      latency: 'fast', 
      contextWindow: 200000, 
      bestFor: ['chat', 'search', 'simple', 'code', 'analyze', 'create'] 
    },
    { 
      name: 'kilo-auto/balanced', 
      provider: 'kilocode', 
      costPer1MInput: 0, 
      costPer1MOutput: 0,
      priority: 2,
      latency: 'medium', 
      contextWindow: 200000, 
      bestFor: ['code', 'complex'] 
    },
    
    // CHEAP TIER - Use if Kilo fails
    { 
      name: 'groq/llama-3.1-8b-instant', 
      provider: 'groq', 
      costPer1MInput: 0.04, 
      costPer1MOutput: 0.04,
      priority: 10,
      latency: 'fast', 
      contextWindow: 128000, 
      bestFor: ['chat', 'search', 'simple'] 
    },
    { 
      name: 'groq/llama-3.1-70b-versatile', 
      provider: 'groq', 
      costPer1MInput: 0.35, 
      costPer1MOutput: 0.4,
      priority: 11,
      latency: 'medium', 
      contextWindow: 128000, 
      bestFor: ['code', 'analyze'] 
    },
    
    // BACKUP TIER
    { 
      name: 'openrouter/anthropic/claude-3-haiku', 
      provider: 'openrouter', 
      costPer1MInput: 0.25, 
      costPer1MOutput: 1.25,
      priority: 20,
      latency: 'medium', 
      contextWindow: 200000, 
      bestFor: ['code', 'complex'] 
    },
    
    // PREMIUM TIER - LAST RESORT ONLY
    { 
      name: 'openrouter/anthropic/claude-3.5-sonnet', 
      provider: 'openrouter', 
      costPer1MInput: 3, 
      costPer1MOutput: 15,
      priority: 99, // Lowest priority
      latency: 'medium', 
      contextWindow: 200000, 
      bestFor: ['complex'] 
    },
    { 
      name: 'anthropic/claude-3-opus', 
      provider: 'anthropic', 
      costPer1MInput: 15, 
      costPer1MOutput: 75,
      priority: 100, // LOWEST - only for most complex
      latency: 'slow', 
      contextWindow: 200000, 
      bestFor: ['complex', 'research'] 
    },
  ];

  /**
   * Select optimal model - FREE FIRST!
   */
  selectModel(context: TaskContext): ModelConfig {
    const { complexity, type, forcePremium } = context;

    // If explicitly forced to premium, use best available
    if (forcePremium) {
      const premium = this.models.find(m => m.priority >= 99);
      return premium || this.models[this.models.length - 1];
    }

    // Most tasks: use FREE (Kilo)
    if (complexity === 'simple') {
      const freeModel = this.models.find(m => m.priority <= 2);
      if (freeModel) return freeModel;
    }

    // Medium tasks: still try free first
    if (complexity === 'medium') {
      const freeModel = this.models.find(m => m.priority <= 2);
      if (freeModel) return freeModel;
    }

    // Complex tasks: try free first, fallback to cheap
    if (complexity === 'complex') {
      // Try Kilo first (it handles most things!)
      const kilo = this.models.find(m => m.provider === 'kilocode');
      if (kilo) return kilo;
      
      // If Kilo fails, use Groq
      const groq = this.models.find(m => m.provider === 'groq');
      if (groq) return groq;
    }

    // Default: Use FREE
    const defaultModel = this.models.find(m => m.priority === 1);
    return defaultModel || this.models[0];
  }

  /**
   * Simple check - should we use free model?
   */
  shouldUseFreeModel(message: string): boolean {
    // Kilo handles most messages fine
    // Only force premium for explicitly complex tasks
    const complexKeywords = [
      'debug this entire codebase',
      'architect a new system',
      'review thousands of lines',
      'migrate entire database',
      'write a complete book'
    ];
    
    const msgLower = message.toLowerCase();
    return !complexKeywords.some(k => msgLower.includes(k));
  }

  /**
   * Cost estimation
   */
  getEstimatedCost(model: ModelConfig, inputTokens: number, outputTokens: number): number {
    return (inputTokens / 1_000_000 * model.costPer1MInput) +
           (outputTokens / 1_000_000 * model.costPer1MOutput);
  }

  /**
   * Show savings vs premium
   */
  getSavings(inputTokens: number = 1000, outputTokens: number = 500): { 
    usingFree: number; 
    usingPremium: number; 
    percentSaved: number 
  } {
    const free = this.models.find(m => m.priority === 1)!;
    const premium = this.models.find(m => m.priority === 100)!;

    const freeCost = this.getEstimatedCost(free, inputTokens, outputTokens);
    const premiumCost = this.getEstimatedCost(premium, inputTokens, outputTokens);

    return {
      usingFree: freeCost,
      usingPremium: premiumCost,
      percentSaved: premiumCost > 0 ? Math.round((1 - freeCost / premiumCost) * 100) : 100
    };
  }

  /**
   * Get all models by priority
   */
  getModelsByPriority(): ModelConfig[] {
    return [...this.models].sort((a, b) => a.priority - b.priority);
  }
}

export const smartRouter = new SmartRouter();

// Example: 
// const savings = smartRouter.getSavings();
// console.log(`Using FREE saves ${savings.percentSaved}%`);
