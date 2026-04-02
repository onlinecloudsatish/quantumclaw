// QuantumClaw Secret Management
// Encrypted storage for API keys, tokens, and sensitive data

import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from "crypto";

export interface SecretMetadata {
  key: string;
  type: "api_key" | "token" | "password" | "certificate" | "custom";
  label?: string;
  createdAt: Date;
  lastUsed?: Date;
  expiresAt?: Date;
  rotationPeriod?: number; // days
  tags: string[];
}

export interface EncryptedSecret {
  key: string;
  encrypted: string;
  iv: string;
  authTag: string;
  salt: string;
  metadata: SecretMetadata;
}

export interface SecretRotationResult {
  success: boolean;
  previousKey?: string;
  newKey?: string;
  error?: string;
}

export class SecretManager {
  private secrets: Map<string, EncryptedSecret> = new Map();
  private masterKey: Buffer | null = null;
  private keyDerivationSalt: string = "";
  private autoRotate: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Initialize with master password
   */
  initialize(masterPassword: string): void {
    this.keyDerivationSalt = randomBytes(32).toString("hex");
    this.masterKey = this.deriveKey(masterPassword, this.keyDerivationSalt);
    console.log("🔐 Secret manager initialized");
  }

  /**
   * Store a secret
   */
  async store(
    key: string,
    value: string,
    metadata: Partial<SecretMetadata> = {}
  ): Promise<void> {
    if (!this.masterKey) {
      throw new Error("Secret manager not initialized. Call initialize() first.");
    }

    // Generate random IV
    const iv = randomBytes(16);
    const salt = randomBytes(32);

    // Encrypt the value
    const cipher = createCipheriv("aes-256-gcm", this.deriveKey(value, salt.toString("hex")), iv);
    
    let encrypted = cipher.update(value, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    // Store encrypted secret
    const secret: EncryptedSecret = {
      key,
      encrypted,
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
      salt: salt.toString("hex"),
      metadata: {
        key,
        type: metadata.type || "custom",
        label: metadata.label,
        createdAt: new Date(),
        expiresAt: metadata.expiresAt,
        rotationPeriod: metadata.rotationPeriod,
        tags: metadata.tags || [],
      },
    };

    this.secrets.set(key, secret);

    // Schedule auto-rotation if needed
    if (metadata.rotationPeriod) {
      this.scheduleRotation(key, metadata.rotationPeriod);
    }

    // Secret stored successfully
  }

  /**
   * Retrieve a secret
   */
  async retrieve(key: string, password?: string): Promise<string | null> {
    const secret = this.secrets.get(key);
    if (!secret) {
      return null;
    }

    // Use provided password or master key
    const keyBuffer = password 
      ? this.deriveKey(password, secret.salt)
      : this.masterKey!;

    if (!keyBuffer) {
      throw new Error("No key available to decrypt secret");
    }

    try {
      const iv = Buffer.from(secret.iv, "hex");
      const authTag = Buffer.from(secret.authTag, "hex");
      const decipher = createDecipheriv("aes-256-gcm", keyBuffer, iv);
      
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(secret.encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      // Update last used
      secret.metadata.lastUsed = new Date();

      return decrypted;
    } catch (error) {
      console.error(`❌ Failed to decrypt secret ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a secret
   */
  delete(key: string): boolean {
    const deleted = this.secrets.delete(key);
    if (deleted) {
      // Cancel auto-rotation
      const rotationTimeout = this.autoRotate.get(key);
      if (rotationTimeout) {
        clearTimeout(rotationTimeout);
        this.autoRotate.delete(key);
      }
      // Secret deleted successfully
    }
    return deleted;
  }

  /**
   * List all secrets (metadata only, not values)
   */
  list(): SecretMetadata[] {
    return Array.from(this.secrets.values()).map(s => s.metadata);
  }

  /**
   * Check if secret exists
   */
  has(key: string): boolean {
    return this.secrets.has(key);
  }

  /**
   * Rotate a secret
   */
  async rotate(key: string, newValue: string): Promise<SecretRotationResult> {
    const existing = this.secrets.get(key);
    if (!existing) {
      return { success: false, error: "Secret not found" };
    }

    const previousKey = key;
    const newKey = `${key}_rotated_${Date.now()}`;

    try {
      // Store new version
      await this.store(newKey, newValue, {
        type: existing.metadata.type,
        label: existing.metadata.label,
        rotationPeriod: existing.metadata.rotationPeriod,
        tags: existing.metadata.tags,
      });

      // Delete old
      this.delete(previousKey);

      // Rename new to old
      const rotated = this.secrets.get(newKey)!;
      rotated.metadata.key = previousKey;
      rotated.key = previousKey;
      this.secrets.set(previousKey, rotated);
      this.secrets.delete(newKey);

      return {
        success: true,
        previousKey,
        newKey: previousKey,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get secret metadata
   */
  getMetadata(key: string): SecretMetadata | null {
    return this.secrets.get(key)?.metadata || null;
  }

  /**
   * Update secret metadata
   */
  updateMetadata(key: string, updates: Partial<SecretMetadata>): boolean {
    const secret = this.secrets.get(key);
    if (!secret) return false;

    secret.metadata = { ...secret.metadata, ...updates };
    return true;
  }

  /**
   * Get expiring secrets
   */
  getExpiringSecrets(days = 7): SecretMetadata[] {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);

    return Array.from(this.secrets.values())
      .filter(s => s.metadata.expiresAt && s.metadata.expiresAt <= threshold)
      .map(s => s.metadata);
  }

  /**
   * Get secrets by tag
   */
  getByTag(tag: string): SecretMetadata[] {
    return Array.from(this.secrets.values())
      .filter(s => s.metadata.tags.includes(tag))
      .map(s => s.metadata);
  }

  /**
   * Export secrets (encrypted)
   */
  export(): string {
    const data = Array.from(this.secrets.values()).map(s => ({
      ...s,
      metadata: { ...s.metadata },
    }));
    return JSON.stringify({
      version: 1,
      salt: this.keyDerivationSalt,
      secrets: data,
    });
  }

  /**
   * Import secrets (encrypted)
   */
  async import(data: string, password: string): Promise<number> {
    const parsed = JSON.parse(data);
    
    if (parsed.version !== 1) {
      throw new Error("Unsupported export version");
    }

    this.keyDerivationSalt = parsed.salt;
    this.masterKey = this.deriveKey(password, parsed.salt);

    let imported = 0;
    for (const secret of parsed.secrets) {
      this.secrets.set(secret.key, secret);
      imported++;
    }

    return imported;
  }

  /**
   * Get security stats
   */
  getStats() {
    const now = new Date();
    const expiring = this.getExpiringSecrets(7).length;
    const expired = Array.from(this.secrets.values())
      .filter(s => s.metadata.expiresAt && s.metadata.expiresAt < now).length;

    return {
      total: this.secrets.size,
      expiringIn7Days: expiring,
      expired,
      byType: Array.from(this.secrets.values()).reduce((acc, s) => {
        acc[s.metadata.type] = (acc[s.metadata.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // Private methods
  private deriveKey(password: string, salt: string): Buffer {
    return scryptSync(password, salt, 32);
  }

  private scheduleRotation(key: string, periodDays: number): void {
    const periodMs = periodDays * 24 * 60 * 60 * 1000;
    
    const timeout = setTimeout(() => {
      // Auto-rotating secret
      // In production, this would generate new value and call rotate()
    }, periodMs);

    this.autoRotate.set(key, timeout);
  }
}

export const secretManager = new SecretManager();