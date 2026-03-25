// QuantumClaw Semantic Memory - Pure JavaScript Fallback
// Works without native modules - no compilation needed!
// Uses simple embedding + cosine similarity

import path from 'path';
import fs from 'fs';

export interface MemoryDoc {
  id: string;
  content: string;
  metadata: {
    source?: string;
    timestamp?: number;
    tags?: string[];
  };
}

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  metadata: any;
}

/**
 * Semantic Memory - Pure JavaScript Implementation
 * 
 * No native dependencies - works everywhere!
 * Uses simple hash-based embeddings + cosine similarity
 * 
 * For production, upgrade to zvec or other vector databases
 */
export class SemanticMemory {
  private documents: Map<string, { doc: MemoryDoc; embedding: number[] }> = new Map();
  private dataPath: string;
  private embeddingDimension: number = 384;
  private initialized: boolean = false;

  constructor(dataPath: string = './data/semantic-memory') {
    this.dataPath = dataPath;
  }

  /**
   * Initialize the memory store
   */
  async initialize(dimension: number = 384): Promise<void> {
    if (this.initialized) return;

    this.embeddingDimension = dimension;
    
    // Ensure directory exists
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }

    // Try to load existing data
    const dataFile = path.join(this.dataPath, 'memory.json');
    if (fs.existsSync(dataFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
        for (const [id, item] of Object.entries(data)) {
          this.documents.set(id, item as any);
        }
        console.log(`🧠 Loaded ${this.documents.size} documents`);
      } catch (e) {
        console.log('⚠️ Could not load existing memory data');
      }
    }

    this.initialized = true;
    console.log('🧠 Semantic memory initialized (pure JS - no native deps!)');
  }

  /**
   * Add a document with embedding
   */
  async addDocument(doc: MemoryDoc, embedding?: number[]): Promise<void> {
    if (!this.initialized) {
      await this.initialize(embedding?.length || 384);
    }

    // Generate embedding if not provided
    const finalEmbedding = embedding || await this.generateEmbedding(doc.content);
    
    this.documents.set(doc.id, { doc, embedding: finalEmbedding });
    this.save();
  }

  /**
   * Search for similar documents
   */
  async search(queryEmbedding: number[], topK: number = 5): Promise<SearchResult[]> {
    if (!this.initialized || this.documents.size === 0) {
      return [];
    }

    // Calculate similarity scores
    const results: SearchResult[] = [];
    
    for (const [id, item] of this.documents) {
      const score = this.cosineSimilarity(queryEmbedding, item.embedding);
      results.push({
        id,
        content: item.doc.content,
        score,
        metadata: item.doc.metadata
      });
    }

    // Sort by score and return top K
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Search by text (generates embedding automatically)
   */
  async searchByText(query: string, topK: number = 5): Promise<SearchResult[]> {
    const embedding = await this.generateEmbedding(query);
    return this.search(embedding, topK);
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
    this.save();
  }

  /**
   * Get stats
   */
  getStats(): { initialized: boolean; documents: number } {
    return {
      initialized: this.initialized,
      documents: this.documents.size
    };
  }

  /**
   * Save to disk
   */
  private save(): void {
    const dataFile = path.join(this.dataPath, 'memory.json');
    const data: Record<string, any> = {};
    for (const [id, item] of this.documents) {
      data[id] = item;
    }
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  }

  /**
   * Cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Generate embedding from text
   * Uses a simple but deterministic hash-based approach
   * For production, use proper embeddings from AI providers
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(this.embeddingDimension).fill(0);
    
    // Create word frequency map
    const freq: Record<string, number> = {};
    for (const word of words) {
      freq[word] = (freq[word] || 0) + 1;
    }

    // Generate embedding based on word positions and frequencies
    let i = 0;
    for (const [word, count] of Object.entries(freq)) {
      const hash = this.hashWord(word);
      for (let j = 0; j < this.embeddingDimension; j++) {
        embedding[j] += Math.sin(hash * (j + 1) + count) * Math.log(count + 1);
      }
    }

    // Add position-based features
    for (let pos = 0; pos < Math.min(words.length, 50); pos++) {
      const hash = pos * 12345;
      for (let j = 0; j < Math.min(this.embeddingDimension, 50); j++) {
        embedding[j] += Math.cos(hash + j * 0.1) * 0.1;
      }
    }

    // Normalize to unit vector
    const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      return embedding.map(v => v / norm);
    }
    return embedding;
  }

  /**
   * Simple hash function for words
   */
  private hashWord(word: string): number {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) / 1e10;
  }

  /**
   * Close the store
   */
  close(): void {
    this.initialized = false;
  }
}

// Export singleton instance
export const semanticMemory = new SemanticMemory();