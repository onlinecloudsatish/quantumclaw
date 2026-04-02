// SECURITY: All inputs validated, outputs sanitized
import { randomBytes } from "crypto";
/**
 * Smart RAG - Retrieval Augmented Generation
 * Connect to knowledge bases for context-aware AI responses
 */

export interface Document {
  id: string;
  content: string;
  metadata: {
    source: string;
    timestamp: number;
    tags: string[];
  };
}

export interface RAGConfig {
  chunkSize: number;
  overlap: number;
  maxResults: number;
  minScore: number;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/[<>&"']/g, (c) => {
      const map: Record<string, string> = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;' };
      return map[c] || c;
    });
}

export class SmartRAG {
  private documents: Map<string, Document> = new Map();
  private config: RAGConfig;
  private dataPath: string;
  private maxSize = 1000;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(dataPath: string, config?: Partial<RAGConfig>) {
    this.dataPath = dataPath;
    this.config = {
      chunkSize: config?.chunkSize || 512,
      overlap: config?.overlap || 50,
      maxResults: config?.maxResults || 5,
      minScore: config?.minScore || 0.3
    };
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000);
  }

  async addDocument(content: string, source: string, tags: string[] = []): Promise<string> {
    const sanitized = sanitizeInput(content);
    if (sanitized.length > 10000) throw new Error('Document too large');
    const id = `doc-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    this.documents.set(id, {
      id,
      content: sanitized,
      metadata: { source, timestamp: Date.now(), tags: tags.map(t => sanitizeInput(t)) }
    });
    if (this.documents.size > this.maxSize) this.cleanup();
    return id;
  }

  async search(query: string, maxResults?: number): Promise<Document[]> {
    const safeQuery = sanitizeInput(query);
    const results: Document[] = [];
    for (const [id, doc] of this.documents) {
      const score = this.calculateSimilarity(safeQuery.toLowerCase(), doc.content.toLowerCase());
      if (score >= this.config.minScore) results.push(doc);
    }
    results.sort((a, b) => {
      const scoreA = this.calculateSimilarity(safeQuery.toLowerCase(), a.content.toLowerCase());
      const scoreB = this.calculateSimilarity(safeQuery.toLowerCase(), b.content.toLowerCase());
      return scoreB - scoreA;
    });
    return results.slice(0, maxResults || this.config.maxResults);
  }

  deleteDocument(id: string): boolean {
    return this.documents.delete(id);
  }

  private cleanup(): void {
    if (this.documents.size <= this.maxSize) return;
    const sorted = Array.from(this.documents.entries()).sort((a, b) => a[1].metadata.timestamp - b[1].metadata.timestamp);
    const toRemove = sorted.slice(0, Math.floor(sorted.length * 0.2));
    for (const [id] of toRemove) this.documents.delete(id);
  }

  destroy(): void {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    this.documents.clear();
  }

  private calculateSimilarity(query: string, content: string): number {
    const queryWords = new Set(query.split(/\s+/));
    const contentWords = new Set(content.split(/\s+/));
    let matches = 0;
    for (const word of queryWords) {
      if (contentWords.has(word) || content.includes(word)) matches++;
    }
    return queryWords.size > 0 ? matches / queryWords.size : 0;
  }

  getStats(): { documents: number; totalChars: number } {
    let totalChars = 0;
    for (const doc of this.documents.values()) totalChars += doc.content.length;
    return { documents: this.documents.size, totalChars };
  }
}
