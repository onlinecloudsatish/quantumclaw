// QuantumClaw Smart Token Optimizer
// Routes tasks to optimal model - saves tokens & money!

export interface ModelConfig {
  name: string;
  provider: string;
  costPer1MInput: number;
  costPer1MOutput: number;
  latency: string; // fast, medium, slow
  contextWindow: number;
  bestFor: string[]; // simple tasks this model excels at
}

export interface TaskContext {
  complexity: 'simple' | 'medium' | 'complex';
  type: 'chat' | 'code' | 'search' | 'analyze' | 'create';
  hasContext: boolean;
  estimatedTokens: number;
}

/**
 * Smart Model Router - Production Token Optimizer
 * 
 * Strategy:
 * - Simple tasks → Use cheap/fast models (save ~90%)
 * - Complex tasks → Use powerful models (best quality)
 * - Routing is transparent to user
 */
export class SmartRouter {
  // Model cost hierarchy (cheapest first)
  private models: ModelConfig[] = [
    // FREE / VERY CHEAP
    { name: 'kilo-auto/free', provider: 'kilocode', costPer1MInput: 0, costPer1MOutput: 0, 
      latency: 'fast', contextWindow: 200000, bestFor: ['chat', 'simple'] },
    { name: 'groq/llama-3.1-8b-instant', provider: 'groq', costPer1MInput: 0.04, costPer1MOutput: 0.04, 
      latency: 'fast', contextWindow: 128000, bestFor: ['chat', 'search'] },
    { name: 'openrouter/Nous-Hermes-2-Mistral', provider: 'openrouter', costPer1MInput: 0.1, costPer1MOutput: 0.1, 
      latency: 'fast', contextWindow: 32000, bestFor: ['chat', 'simple'] },
    
    // MEDIUM COST
    { name: 'openrouter/anthropic/claude-3-haiku', provider: 'openrouter', costPer1MInput: 0.25, costPer1MOutput: 1.25, 
      latency: 'medium', contextWindow: 200000, bestFor: ['code', 'chat'] },
    { name: 'groq/llama-3.1-70b-versatile', provider: 'groq', costPer1MInput: 0.35, costPer1MOutput: 0.4, 
      latency: 'medium', contextWindow: 128000, bestFor: ['analyze', 'code'] },
    
    // PREMIUM
    { name: 'openrouter/anthropic/claude-3.5-sonnet', provider: 'openrouter', costPer1MInput: 3, costPer1MOutput: 15, 
      latency: 'medium', contextWindow: 200000, bestFor: ['complex', 'create'] },
    { name: 'anthropic/claude-3-opus', provider: 'anthropic', costPer1MInput: 15, costPer1MOutput: 75, 
      latency: 'slow', contextWindow: 200000, bestFor: ['complex', 'analyze'] },
  ];

  /**
   * Analyze task and determine optimal model
   */
  selectModel(context: TaskContext): ModelConfig {
    const complexity = context.complexity;
    const type = context.type;
    
    // If complex task, use premium model
    if (complexity === 'complex') {
      const premium = this.models.find(m => m.bestFor.includes('complex'));
      if (premium) return premium;
    }

    // If code generation, use medium tier
    if (type === 'code' && complexity !== 'simple') {
      const codeModel = this.models.find(m => m.bestFor.includes('code'));
      if (codeModel) return codeModel;
    }

    // Simple chat/search → use free/fast models
    if (complexity === 'simple' || type === 'search') {
      const fast = this.models.find(m => m.latency === 'fast');
      if (fast) return fast;
    }

    // Default to cheap model
    const defaultModel = this.models.find(m => m.name.includes('free') || m.name.includes('instant'));
    return defaultModel || this.models[0];
  }

  /**
   * Quick decision for simple messages
   */
  isSimpleMessage(message: string): boolean {
    const simpleIndicators = [
      'hello', 'hi', 'hey', 'thanks', 'thank you',
      'what is', 'how do', 'tell me',
      'weather', 'time', 'date',
      '?', '.'
    ];
    
    const complexIndicators = [
      'analyze', 'review', 'debug', 'fix', 'build',
      'create', 'implement', 'design', 'architect',
      'explain', 'compare', 'optimize'
    ];

    const msg = message.toLowerCase();
    const isComplex = complexIndicators.some(w => msg.includes(w));
    const isVerySimple = simpleIndicators.some(w => msg.includes(w)) && message.length < 50;

    if (isComplex) return false;
    return true;
  }

  /**
   * Estimate cost for a request
   */
  estimateCost(model: ModelConfig, inputTokens: number, outputTokens: number): number {
    return (inputTokens / 1_000_000 * model.costPer1MInput) +
           (outputTokens / 1_000_000 * model.costPer1MOutput);
  }

  /**
   * Calculate savings vs using premium
   */
  calculateSavings(inputTokens: number, outputTokens: number): { withRouter: number; withPremium: number; savings: number } {
    // Use free model
    const free = this.models[0];
    const routerCost = this.estimateCost(free, inputTokens, outputTokens);
    
    // Use premium
    const premium = this.models[this.models.length - 1];
    const premiumCost = this.estimateCost(premium, inputTokens, outputTokens);
    
    return {
      withRouter: Math.round(routerCost * 1000) / 1000,
      withPremium: Math.round(premiumCost * 1000) / 1000,
      savings: Math.round((premiumCost - routerCost) / premiumCost * 100)
    };
  }

  /**
   * Get all available models
   */
  getModels(): ModelConfig[] {
    return this.models;
  }
}

export const smartRouter = new SmartRouter();

// Quick usage example:
// const model = smartRouter.selectModel({ complexity: 'simple', type: 'chat', hasContext: false, estimatedTokens: 100 });
// console.log(`Using ${model.name} - saves ~${smartRouter.calculateSavings(1000, 500).savings}%`);
