import { randomBytes } from "crypto";
// QuantumClaw Context Memory System
// Remembers conversations and learns user preferences

export interface MemoryEntry {
  id: string;
  type: "conversation" | "preference" | "fact" | "task";
  content: string;
  importance: number;
  timestamp: Date;
  context?: Record<string, any>;
  embedding?: number[];
}

export interface UserPreference {
  key: string;
  value: any;
  category: "communication" | "behavior" | "privacy" | "custom";
  updatedAt: Date;
}

export interface ContextSession {
  sessionId: string;
  entries: MemoryEntry[];
  summary?: string;
  createdAt: Date;
  lastActive: Date;
}

export class ContextMemory {
  private entries: Map<string, MemoryEntry> = new Map();
  private preferences: Map<string, UserPreference> = new Map();
  private sessions: Map<string, ContextSession> = new Map();
  private maxActiveEntries = 1000;
  private longTermThreshold = 7;

  async add(entry: Omit<MemoryEntry, "id" | "timestamp">): Promise<MemoryEntry> {
    const newEntry: MemoryEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    };
    
    this.entries.set(newEntry.id, newEntry);
    
    if (newEntry.importance >= this.longTermThreshold) {
      await this.persistToLongTerm(newEntry);
    }
    
    if (this.entries.size > this.maxActiveEntries) {
      await this.cleanup();
    }
    
    return newEntry;
  }

  async search(query: string, limit = 10): Promise<MemoryEntry[]> {
    const results: Array<{ entry: MemoryEntry; score: number }> = [];
    
    for (const entry of this.entries.values()) {
      const score = this.calculateRelevance(query, entry);
      if (score > 0.3) {
        results.push({ entry, score });
      }
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.entry);
  }

  async getContext(sessionId?: string): Promise<string[]> {
    const contextLines: string[] = [];
    
    const recentEntries = Array.from(this.entries.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
    
    for (const entry of recentEntries) {
      contextLines.push(`[${entry.type}] ${entry.content}`);
    }
    
    for (const pref of this.preferences.values()) {
      contextLines.push(`[pref:${pref.category}] ${pref.key} = ${JSON.stringify(pref.value)}`);
    }
    
    return contextLines;
  }

  setPreference(key: string, value: any, category: UserPreference["category"] = "custom"): void {
    this.preferences.set(key, {
      key,
      value,
      category,
      updatedAt: new Date(),
    });
  }

  async learn(sessionId: string, messages: Array<{ role: string; content: string }>): Promise<void> {
    for (const msg of messages) {
      if (msg.role === "user") {
        const facts = this.extractFacts(msg.content);
        for (const fact of facts) {
          await this.add({
            type: "fact",
            content: fact,
            importance: 5,
          });
        }
      }
    }
    
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        sessionId,
        entries: [],
        createdAt: new Date(),
        lastActive: new Date(),
      });
    }
    
    const session = this.sessions.get(sessionId)!;
    session.lastActive = new Date();
  }

  async generateSummary(): Promise<string> {
    const entries = Array.from(this.entries.values());
    const facts = entries.filter(e => e.type === "fact");
    const prefs = Array.from(this.preferences.values());
    
    let summary = "User Profile Summary:\n";
    
    if (prefs.length > 0) {
      summary += `\nPreferences (${prefs.length}):\n`;
      for (const pref of prefs.slice(0, 5)) {
        summary += `- ${pref.key}: ${JSON.stringify(pref.value)}\n`;
      }
    }
    
    if (facts.length > 0) {
      summary += `\nKnown Facts (${facts.length}):\n`;
      for (const fact of facts.slice(0, 5)) {
        summary += `- ${fact.content}\n`;
      }
    }
    
    return summary;
  }

  private generateId(): string {
    return `mem_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  }

  private calculateRelevance(query: string, entry: MemoryEntry): number {
    const queryLower = query.toLowerCase();
    const contentLower = entry.content.toLowerCase();
    
    const queryWords = queryLower.split(/\s+/);
    let matches = 0;
    
    for (const word of queryWords) {
      if (contentLower.includes(word)) {
        matches++;
      }
    }
    
    const score = matches / queryWords.length;
    
    const hoursAgo = (Date.now() - entry.timestamp.getTime()) / (1000 * 60 * 60);
    const recencyBoost = Math.max(0, 1 - hoursAgo / 24) * 0.2;
    const importanceBoost = entry.importance / 10 * 0.3;
    
    return Math.min(1, score + recencyBoost + importanceBoost);
  }

  private extractFacts(text: string): string[] {
    const facts: string[] = [];
    
    const patterns = [
      /I (live in|am from) (.+)/i,
      /My (name|email|phone) (.+)/i,
      /I prefer (.+)/i,
      /I like (.+)/i,
      /I don't like (.+)/i,
      /Call me (.+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        facts.push(match[0]);
      }
    }
    
    return facts;
  }

  private async persistToLongTerm(entry: MemoryEntry): Promise<void> {
    console.log(`📚 Persisting important memory: ${entry.id}`);
  }

  private async cleanup(): Promise<void> {
    const sorted = Array.from(this.entries.values())
      .sort((a, b) => {
        const aScore = a.importance - (Date.now() - a.timestamp.getTime()) / 1000000000;
        const bScore = b.importance - (Date.now() - b.timestamp.getTime()) / 1000000000;
        return aScore - bScore;
      });
    
    const toRemove = sorted.slice(0, Math.floor(this.maxActiveEntries * 0.1));
    for (const entry of toRemove) {
      this.entries.delete(entry.id);
    }
  }

  getStats() {
    return {
      totalEntries: this.entries.size,
      preferences: this.preferences.size,
      sessions: this.sessions.size,
    };
  }
}

export const contextMemory = new ContextMemory();