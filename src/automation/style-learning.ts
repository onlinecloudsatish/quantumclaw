import { randomBytes } from "crypto";
// QuantumClaw Personal Style Learning
// AI that learns and adapts to your communication style

export interface StyleProfile {
  userId: string;
  tone: "formal" | "casual" | "professional" | "friendly" | "humorous";
  vocabulary: string[];
  phrases: string[];
  emojiUsage: "none" | "minimal" | "moderate" | "frequent";
  responseLength: "short" | "medium" | "long" | "variable";
  greetingStyle: string;
  farewellStyle: string;
  punctuationStyle: "formal" | "casual" | "minimal";
  learnedAt: Date;
  sampleCount: number;
}

export interface StyleAdaptation {
  originalText: string;
  adaptedText: string;
  confidence: number;
  adaptations: string[];
}

export class PersonalStyleLearning {
  private profiles: Map<string, StyleProfile> = new Map();
  private interactions: Map<string, string[]> = new Map(); // userId -> messages

  /**
   * Learn from user interactions
   */
  async learn(userId: string, messages: string[]): Promise<void> {
    if (!this.profiles.has(userId)) {
      this.profiles.set(userId, this.createInitialProfile(userId));
    }

    const profile = this.profiles.get(userId)!;
    const existing = this.interactions.get(userId) || [];
    this.interactions.set(userId, [...existing, ...messages]);

    // Analyze messages and update profile
    this.analyzeTone(userId, messages);
    this.extractPhrases(userId, messages);
    this.analyzeEmojiUsage(userId, messages);
    this.analyzeResponseLength(userId, messages);
    this.analyzePunctuation(userId, messages);

    profile.sampleCount += messages.length;
    profile.learnedAt = new Date();

    console.log(`📚 Learned from ${messages.length} messages. Samples: ${profile.sampleCount}`);
  }

  /**
   * Adapt text to match user's style
   */
  async adaptToStyle(userId: string, text: string): Promise<StyleAdaptation> {
    const profile = this.profiles.get(userId);
    if (!profile) {
      return {
        originalText: text,
        adaptedText: text,
        confidence: 0,
        adaptations: ["No profile - returning original"],
      };
    }

    const adaptations: string[] = [];
    let adapted = text;

    // Adapt tone
    if (profile.tone === "casual" || profile.tone === "friendly") {
      const casualPhrases: Record<string, string> = {
        "good morning": "morning!",
        "good afternoon": "afternoon!",
        "good evening": "hey!",
        "thank you": "thanks!",
        "please": "",
        "however": "but",
        "therefore": "so",
        "additionally": "also",
      };
      for (const [formal, casual] of Object.entries(casualPhrases)) {
        if (adapted.toLowerCase().includes(formal)) {
          adapted = adapted.replace(new RegExp(formal, "gi"), casual);
          adaptations.push(`Tone: "${formal}" → "${casual}"`);
        }
      }
    }

    // Add phrases
    if (profile.phrases.length > 0 && crypto.randomBytes(2).readUInt16BE(0) / 65536 > 0.7) {
      const phrase = profile.phrases[Math.floor(crypto.randomBytes(2).readUInt16BE(0) / 65536 * profile.phrases.length)];
      adapted += ` ${phrase}`;
      adaptations.push(`Added phrase: "${phrase}"`);
    }

    // Adapt emoji usage
    if (profile.emojiUsage === "frequent" && !/[😀-🙏🌀-🗿]/.test(adapted)) {
      const emoji = this.suggestEmoji(adapted);
      if (emoji) {
        adapted += ` ${emoji}`;
        adaptations.push(`Added emoji: ${emoji}`);
      }
    }

    // Adapt greeting
    if (profile.greetingStyle && this.isGreeting(adapted)) {
      adapted = `${profile.greetingStyle} ${adapted}`;
      adaptations.push(`Added greeting: "${profile.greetingStyle}"`);
    }

    // Adapt farewell
    if (profile.farewellStyle && this.isFarewell(adapted)) {
      adapted += ` ${profile.farewellStyle}`;
      adaptations.push(`Added farewell: "${profile.farewellStyle}"`);
    }

    // Adapt punctuation
    if (profile.punctuationStyle === "minimal") {
      adapted = adapted.replace(/!/g, ".").replace(/\?{2,}/g, "?");
      adaptations.push("Punctuation: simplified");
    }

    const confidence = Math.min(1, profile.sampleCount / 50);

    return {
      originalText: text,
      adaptedText: adapted,
      confidence,
      adaptations,
    };
  }

  /**
   * Predict user's next message
   */
  async predict(userId: string, context: string): Promise<string[]> {
    const profile = this.profiles.get(userId);
    if (!profile) return [];

    const predictions: string[] = [];

    // Predict based on learned patterns
    if (profile.greetingStyle && this.isGreeting(context.toLowerCase())) {
      predictions.push(`User might greet with: "${profile.greetingStyle}"`);
    }

    // Common patterns
    if (profile.tone === "casual") {
      predictions.push("User might use casual language");
    }
    if (profile.emojiUsage === "frequent") {
      predictions.push("User might add emojis");
    }
    if (profile.responseLength === "short") {
      predictions.push("User might give short responses");
    }

    return predictions;
  }

  /**
   * Get style profile
   */
  getProfile(userId: string): StyleProfile | undefined {
    return this.profiles.get(userId);
  }

  /**
   * Get style stats
   */
  getStats() {
    return {
      totalProfiles: this.profiles.size,
      totalInteractions: Array.from(this.interactions.values()).reduce((a, b) => a + b.length, 0),
    };
  }

  // Private methods
  private createInitialProfile(userId: string): StyleProfile {
    return {
      userId,
      tone: "friendly",
      vocabulary: [],
      phrases: [],
      emojiUsage: "moderate",
      responseLength: "medium",
      greetingStyle: "",
      farewellStyle: "",
      punctuationStyle: "casual",
      learnedAt: new Date(),
      sampleCount: 0,
    };
  }

  private analyzeTone(userId: string, messages: string[]): void {
    const allText = messages.join(" ").toLowerCase();
    const profile = this.profiles.get(userId)!;

    // Formal indicators
    const formalWords = ["please", "kindly", "regards", "sincerely", "therefore", "however"];
    // Casual indicators
    const casualWords = ["hey", "cool", "awesome", "yeah", "nah", "gonna", "wanna"];
    // Professional
    const professionalWords = ["meeting", "deadline", "project", "update", "review", "schedule"];
    // Humorous
    const humorousWords = ["lol", "haha", "😂", "joke", "funny", "lol"];

    const counts = {
      formal: formalWords.filter(w => allText.includes(w)).length,
      casual: casualWords.filter(w => allText.includes(w)).length,
      professional: professionalWords.filter(w => allText.includes(w)).length,
      humorous: humorousWords.filter(w => allText.includes(w)).length,
    };

    const max = Object.keys(counts).reduce((a, b) => counts[a as keyof typeof counts] > counts[b as keyof typeof counts] ? a : b);
    profile.tone = max as StyleProfile["tone"];
  }

  private extractPhrases(userId: string, messages: string[]): void {
    const profile = this.profiles.get(userId)!;
    
    // Common phrases
    const phrasePatterns = [
      /(?:yeah|yes|yep),?\s+(.+)/i,
      /(?:no|nah),?\s+(.+)/i,
      /(?:thanks|thank you),?\s+(.+)/i,
      /(?:hey|hi|hello),?\s+(.+)/i,
    ];

    for (const msg of messages) {
      for (const pattern of phrasePatterns) {
        const match = msg.match(pattern);
        if (match && match[1]) {
          const phrase = match[1].trim();
          if (phrase.length > 3 && phrase.length < 50) {
            if (!profile.phrases.includes(phrase)) {
              profile.phrases.push(phrase);
            }
          }
        }
      }
    }

    // Keep only top phrases
    if (profile.phrases.length > 20) {
      profile.phrases = profile.phrases.slice(0, 20);
    }
  }

  private analyzeEmojiUsage(userId: string, messages: string[]): void {
    const profile = this.profiles.get(userId)!;
    
    let emojiCount = 0;
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    
    for (const msg of messages) {
      const matches = msg.match(emojiRegex);
      if (matches) emojiCount += matches.length;
    }

    const emojiPerMessage = emojiCount / messages.length;

    if (emojiPerMessage === 0) profile.emojiUsage = "none";
    else if (emojiPerMessage < 0.5) profile.emojiUsage = "minimal";
    else if (emojiPerMessage < 1.5) profile.emojiUsage = "moderate";
    else profile.emojiUsage = "frequent";
  }

  private analyzeResponseLength(userId: string, messages: string[]): void {
    const profile = this.profiles.get(userId)!;
    
    const lengths = messages.map(m => m.split(/\s+/).length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((a, b) => a + Math.pow(b - avgLength, 2), 0) / lengths.length;

    if (avgLength < 10) profile.responseLength = "short";
    else if (avgLength < 30) profile.responseLength = "medium";
    else if (avgLength < 60) profile.responseLength = "long";
    else profile.responseLength = "variable";
  }

  private analyzePunctuation(userId: string, messages: string[]): void {
    const profile = this.profiles.get(userId)!;
    
    let exclamationCount = 0;
    let questionCount = 0;
    let periodCount = 0;

    for (const msg of messages) {
      exclamationCount += (msg.match(/!/g) || []).length;
      questionCount += (msg.match(/\?/g) || []).length;
      periodCount += (msg.match(/\./g) || []).length;
    }

    const total = exclamationCount + questionCount + periodCount;
    
    if (exclamationCount / total > 0.3) {
      profile.punctuationStyle = "casual";
    } else if (questionCount / total > 0.2) {
      profile.punctuationStyle = "formal";
    } else {
      profile.punctuationStyle = "minimal";
    }
  }

  private suggestEmoji(text: string): string | null {
    const textLower = text.toLowerCase();
    
    const emojiMap: Record<string, string> = {
      "happy": "😊",
      "sad": "😢",
      "love": "❤️",
      "laugh": "😂",
      "cool": "😎",
      "think": "🤔",
      "fire": "🔥",
      "star": "⭐",
      "check": "✅",
      "idea": "💡",
      "work": "💼",
      "money": "💰",
      "party": "🎉",
      "food": "🍕",
      "coffee": "☕",
      "sleep": "😴",
      "computer": "💻",
      "phone": "📱",
      "time": "⏰",
      "good": "👍",
      "bad": "👎",
      "wow": "😮",
      "ok": "👌",
    };

    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (textLower.includes(key)) return emoji;
    }

    return null;
  }

  private isGreeting(text: string): boolean {
    const greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "what's up"];
    return greetings.some(g => text.toLowerCase().startsWith(g));
  }

  private isFarewell(text: string): boolean {
    const farewells = ["bye", "goodbye", "see you", "talk later", "gotta go", "catch you"];
    return farewells.some(f => text.toLowerCase().includes(f));
  }
}

export const styleLearning = new PersonalStyleLearning();