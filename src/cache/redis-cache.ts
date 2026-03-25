// QuantumClaw Redis Cache - Production Caching Layer
// Speeds up repeated queries, reduces API costs

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface CacheOptions {
  ttl?: number;
  enabled?: boolean;
}

export interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  expiresAt: number;
}

/**
 * Redis Cache - Production Ready
 * Falls back to file-based cache if Redis unavailable
 */
export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private redis: any = null;
  private useRedis = false;
  private dataPath: string;
  private defaultTTL: number = 3600;

  constructor(dataPath: string = './data/cache') {
    this.dataPath = dataPath;
  }

  async initialize(): Promise<void> {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }

    try {
      const Redis = require('ioredis');
      this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      this.useRedis = true;
      console.log('⚡ Using Redis for caching (production)');
    } catch (e) {
      console.log('💾 Using file-based cache fallback');
      this.loadFromDisk();
    }
  }

  async get(key: string): Promise<any | null> {
    if (this.useRedis && this.redis) {
      try {
        const value = await this.redis.get(`qc:${key}`);
        return value ? JSON.parse(value) : null;
      } catch (e) {
        // Fall back
      }
    }

    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.value;
    }

    const filePath = this.getCacheFilePath(key);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (data.expiresAt > Date.now()) {
          this.cache.set(key, data);
          return data.value;
        }
        fs.unlinkSync(filePath);
      } catch (e) {
        // Ignore
      }
    }
    return null;
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || this.defaultTTL;
    const entry: CacheEntry = {
      key,
      value,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttl * 1000)
    };

    if (this.useRedis && this.redis) {
      try {
        await this.redis.setex(`qc:${key}`, ttl, JSON.stringify(value));
      } catch (e) {
        // Continue
      }
    }

    this.cache.set(key, entry);
    const filePath = this.getCacheFilePath(key);
    fs.writeFileSync(filePath, JSON.stringify(entry));
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    if (this.useRedis && this.redis) {
      try {
        await this.redis.del(`qc:${key}`);
      } catch (e) {
        // Continue
      }
    }
    const filePath = this.getCacheFilePath(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    if (this.useRedis && this.redis) {
      try {
        const keys = await this.redis.keys('qc:*');
        if (keys.length) await this.redis.del(...keys);
      } catch (e) {
        // Continue
      }
    }
    const files = fs.readdirSync(this.dataPath);
    for (const file of files) {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(this.dataPath, file));
      }
    }
  }

  getStats(): { size: number; redis: boolean } {
    return { size: this.cache.size, redis: this.useRedis };
  }

  private getCacheFilePath(key: string): string {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return path.join(this.dataPath, `${hash}.json`);
  }

  private loadFromDisk(): void {
    if (!fs.existsSync(this.dataPath)) return;
    const files = fs.readdirSync(this.dataPath);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        const data = JSON.parse(fs.readFileSync(path.join(this.dataPath, file), 'utf-8'));
        if (data.expiresAt > Date.now()) {
          this.cache.set(data.key, data);
        }
      } catch (e) {
        // Ignore
      }
    }
    console.log(`💾 Loaded ${this.cache.size} cached items`);
  }
}

export const cacheManager = new CacheManager();
