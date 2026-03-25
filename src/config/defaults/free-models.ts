// QuantumClaw Default Configuration - FREE Models First!
// Users get Kilo (free) by default - no API key required!

export const defaultModelConfig = {
  // Default to FREE Kilo model - no API key needed!
  agents: {
    defaults: {
      model: "kilo-auto/free",  // 100% FREE!
      modelProvider: "kilocode"
    }
  },
  
  // Free model providers (no setup needed)
  models: {
    providers: {
      kilocode: {
        enabled: true,
        priority: 1  // Highest - use first
      },
      groq: {
        enabled: true,
        priority: 2,
        apiKey: {
          source: "env",
          variable: "GROQ_API_KEY"
        }
      },
      openrouter: {
        enabled: true,
        priority: 3,
        apiKey: {
          source: "env",
          variable: "OPENROUTER_API_KEY"
        }
      },
      anthropic: {
        enabled: false,  // Disabled by default - use free first!
        priority: 99,
        apiKey: {
          source: "env",
          variable: "ANTHROPIC_API_KEY"
        }
      },
      openai: {
        enabled: false,  // Disabled by default - use free first!
        priority: 100,
        apiKey: {
          source: "env",
          variable: "OPENAI_API_KEY"
        }
      }
    }
  }
};

export const freeModelMessage = `
🎉 QuantumClaw comes with FREE Kilo model built-in!
- No API key needed for basic use
- Works out of the box
- 100% free for most tasks

To upgrade to premium models:
  export ANTHROPIC_API_KEY=sk-...
  export OPENAI_API_KEY=sk-...
`;
