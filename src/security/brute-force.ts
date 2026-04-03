export interface AttemptRecord {
  ip: string;
  attempts: number;
  lastAttempt: number;
  lockedUntil?: number;
}

export class BruteForceProtection {
  private attempts = new Map<string, AttemptRecord>();
  private maxAttempts: number;
  private windowMs: number;
  private lockoutMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 300000, lockoutMs: number = 900000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.lockoutMs = lockoutMs;
  }

  recordAttempt(ip: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(ip) || { ip, attempts: 0, lastAttempt: 0 };
    
    // Reset if window expired
    if (now - record.lastAttempt > this.windowMs) {
      record.attempts = 0;
    }
    
    record.attempts++;
    record.lastAttempt = now;
    
    // Lock if max attempts reached
    if (record.attempts >= this.maxAttempts) {
      record.lockedUntil = now + this.lockoutMs;
    }
    
    this.attempts.set(ip, record);
    return this.isBlocked(ip);
  }

  isBlocked(ip: string): boolean {
    const record = this.attempts.get(ip);
    if (!record) return false;
    if (record.lockedUntil && Date.now() < record.lockedUntil) {
      return true;
    }
    return false;
  }

  reset(ip: string): void {
    this.attempts.delete(ip);
  }
}
