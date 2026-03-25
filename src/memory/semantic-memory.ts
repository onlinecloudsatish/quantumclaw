// QuantumClaw Semantic Memory using Zvec
// Local vector database for semantic search - 100% local, no external calls

import zvec from '@zvec/zvec';
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
 * Semantic Memory - Local Vector Search
 * 
 * Uses zvec for fast, local semantic similarity search
 * All data stays on your machine - no cloud, no external API
 */
export class SemanticMemory {
  private collection: any = null;
  private initialized: boolean = false;
  private dataPath: string;
  private embeddingDimension: number = 384;

  constructor(dataPath: string = './data/semantic-memory') {
    this.dataPath = dataPath;
  }

  /**
   * Initialize the vector store
   */
  async initialize(dimension: number = 384): Promise<void> {
    if (this.initialized) return;

    this.embeddingDimension = dimension;
    
    // Ensure directory exists
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }

    const schema = {
      name: "quantumclaw-memory",
      vectors: {
        embedding: {
          type: zvec.DataType.VECTOR_FP32,
          dimension: dimension
        }
      }
    };

    const fullPath = path.join(this.dataPath, "memory");
    this.collection = zvec.create_and_open(fullPath, schema);
    this.initialized = true;
    console.log('🧠 Semantic memory initialized with zvec (local)');
  }

  /**
   * Add a document with embedding
   */
  async addDocument(doc: MemoryDoc, embedding: number[]): Promise<void> {
    if (!this.initialized) {
      await this.initialize(embedding.length);
    }

    this.collection.insert([{
      id: doc.id,
      vectors: { "embedding": embedding },
      metadata: doc
    }]);
  }

  /**
   * Search for similar documents by semantic meaning
   */
  async search(queryEmbedding: number[], topK: number = 5): Promise<SearchResult[]> {
    if (!this.initialized || !this.collection) {
      return [];
    }

    const results = this.collection.query({
      vector: queryEmbedding,
      topk: topK
    });

    return results.map((r: any) => ({
      id: r.id,
      content: r.metadata?.content || '',
      score: r.score,
      metadata: r.metadata || {}
    }));
  }

  /**
   * Get stats
   */
  getStats(): { initialized: boolean; documents: number } {
    return {
      initialized: this.initialized,
      documents: this.collection?.estimate?.() || 0
    };
  }

  /**
   * Close the store
   */
  close(): void {
    if (this.collection) {
      this.collection.close();
      this.initialized = false;
    }
  }
}

/**
 * Generate a simple embedding from text
 * Note: In production, use a proper embedding model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const hash = simpleHash(text);
  const embedding = new Array(this.embeddingDimension || 384);
  
  for (let i = 0; i < embedding.length; i++) {
    embedding[i] = Math.sin(hash * (i + 1)) * Math.cos(hash * (i + 2));
  }
  
  // Normalize
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / norm);
}

function simpleHash(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}