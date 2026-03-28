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
  embedding?: number[];
}

export interface RAGConfig {
  chunkSize: number;
  overlap: number;
  maxResults: number;
  minScore: number;
}

export class SmartRAG {
  private documents: Map<string, Document> = new Map();
  private config: RAGConfig;
  private dataPath: string;

  constructor(dataPath: string, config?: Partial<RAGConfig>) {
    this.dataPath = dataPath;
    this.config = {
      chunkSize: config?.chunkSize || 512,
      overlap: config?.overlap || 50,
      maxResults: config?.maxResults || 5,
      minScore: config?.minScore || 0.3
    };
  }

  async addDocument(content: string, source: string, tags: string[] = []): Promise<string> {
    const id = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const doc: Document = {
      id,
      content,
      metadata: {
        source,
        timestamp: Date.now(),
        tags
      }
    };
    this.documents.set(id, doc);
    return id;
  }

  async search(query: string, maxResults?: number): Promise<Document[]> {
    const results: Document[] = [];
    const queryLower = query.toLowerCase();

    for (const [id, doc] of this.documents) {
      const contentLower = doc.content.toLowerCase();
      const score = this.calculateSimilarity(queryLower, contentLower);

      if (score >= this.config.minScore) {
        results.push(doc);
      }
    }

    results.sort((a, b) => {
      const scoreA = this.calculateSimilarity(queryLower, a.content.toLowerCase());
      const scoreB = this.calculateSimilarity(queryLower, b.content.toLowerCase());
      return scoreB - scoreA;
    });

    return results.slice(0, maxResults || this.config.maxResults);
  }

  private calculateSimilarity(query: string, content: string): number {
    const queryWords = new Set(query.split(/\s+/));
    const contentWords = new Set(content.split(/\s+/));
    let matches = 0;

    for (const word of queryWords) {
      if (contentWords.has(word) || content.includes(word)) {
        matches++;
      }
    }

    return queryWords.size > 0 ? matches / queryWords.size : 0;
  }

  getStats(): { documents: number; totalChars: number } {
    let totalChars = 0;
    for (const doc of this.documents.values()) {
      totalChars += doc.content.length;
    }
    return { documents: this.documents.size, totalChars };
  }
}
