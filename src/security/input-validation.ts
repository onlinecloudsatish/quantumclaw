// QuantumClaw Advanced Security Guard
// Input sanitization, validation, and threat detection

export interface SecurityConfig {
  maxInputLength: number;
  blockedPatterns: string[];
  allowedPatterns: RegExp[];
  rateLimitWindow: number;
  rateLimitMax: number;
  enableSQLInjectionProtection: boolean;
  enableXSSProtection: boolean;
  enableCommandInjectionProtection: boolean;
}

export interface SecurityViolation {
  type: "injection" | "rate_limit" | "invalid_input" | "suspicious_pattern";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  payload: string;
  timestamp: Date;
  blocked: boolean;
}

export interface RateLimitInfo {
  key: string;
  count: number;
  firstRequest: Date;
  resetAt: Date;
}

export class SecurityGuard {
  private config: SecurityConfig;
  private rateLimits: Map<string, RateLimitInfo> = new Map();
  private violations: SecurityViolation[] = [];
  private whitelist: Set<string> = new Set();

  // Advanced threat patterns
  private injectionPatterns = {
    sql: [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION)\b/i,
      /('|(\\bOR\\b.*=.*)|(--|#|\/\*|\*\/))/,
      /(?:--|\/\*|\*\/|;|'|"|%27|%22|%3D)/,
      /(?:AND|OR)\s+\d+\s*=\s*\d+/i,
      /(?:UNION\s+ALL\s+SELECT)/i,
    ],
    command: [
      /[;&|`$]/,
      /\b(cat|ls|rm|mkdir|wget|curl|bash|sh|python|node|npm)\b/i,
      /(?:>\s*\/dev\/null|2>&1|&\&|\|\|)/,
      /(\||\`|\$|\;|\&|\%)/,
      /\$\([^)]+\)/,
      /\{[^}]+\}/,
      /<[^>]+>/,
    ],
    xss: [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /data:/gi,
    ],
    pathTraversal: [
      /(?:\.\.[\\/])+/,
      /(?:\.\.[\\/])+\.(?:etc|passwd|shadow|hosts)/i,
      /\/etc\/passwd/i,
      /\/etc\/shadow/i,
      /C:\\Windows\\/i,
    ],
    ssrf: [
      /localhost/i,
      /127\.0\.0\.1/,
      /0\.0\.0\.0/,
      /\[::1\]/,
      /metadata\.googleusercontent\.com/i,
      /169\.254\.169\.254/i,
    ],
    template: [
      /\{\{.*?\}\}/,
      /<%.*?%>/,
      /\$\{.*?\}/,
      /\#\{.*?\}/,
    ],
    cryptographic: [
      /(?:private[_-]?key|public[_-]?key)/i,
      /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/i,
      /-----BEGIN\s+CERTIFICATE-----/i,
      /api[_-]?key['":\s=]+[a-zA-Z0-9]{20,}/i,
      /secret[_-]?key['":\s=]+[a-zA-Z0-9]{20,}/i,
    ],
  };

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      maxInputLength: 10000,
      blockedPatterns: [],
      allowedPatterns: [/^[a-zA-Z0-9\s\-_.,!?@]+$/],
      rateLimitWindow: 60000, // 1 minute
      rateLimitMax: 100,
      enableSQLInjectionProtection: true,
      enableXSSProtection: true,
      enableCommandInjectionProtection: true,
      ...config,
    };
  }

  /**
   * Validate and sanitize input
   */
  validate(input: string, context?: string): { valid: boolean; sanitized: string; violations: SecurityViolation[] } {
    const violations: SecurityViolation[] = [];
    let sanitized = input;

    // Check input length
    if (input.length > this.config.maxInputLength) {
      violations.push(this.createViolation("invalid_input", "medium", "Input exceeds maximum length", input));
      sanitized = sanitized.slice(0, this.config.maxInputLength);
    }

    // SQL Injection check
    if (this.config.enableSQLInjectionProtection) {
      for (const pattern of this.injectionPatterns.sql) {
        if (pattern.test(input)) {
          violations.push(this.createViolation("injection", "critical", "SQL injection pattern detected", input));
        }
      }
    }

    // Command Injection check
    if (this.config.enableCommandInjectionProtection) {
      for (const pattern of this.injectionPatterns.command) {
        if (pattern.test(input)) {
          violations.push(this.createViolation("injection", "critical", "Command injection pattern detected", input));
        }
      }
    }

    // XSS check
    if (this.config.enableXSSProtection) {
      for (const pattern of this.injectionPatterns.xss) {
        if (pattern.test(input)) {
          violations.push(this.createViolation("injection", "high", "XSS pattern detected", input));
        }
      }
    }

    // Path Traversal check
    for (const pattern of this.injectionPatterns.pathTraversal) {
      if (pattern.test(input)) {
        violations.push(this.createViolation("injection", "high", "Path traversal attempt detected", input));
      }
    }

    // SSRF check
    for (const pattern of this.injectionPatterns.ssrf) {
      if (pattern.test(input)) {
        violations.push(this.createViolation("injection", "medium", "Potential SSRF attempt detected", input));
      }
    }

    // Template Injection check
    for (const pattern of this.injectionPatterns.template) {
      if (pattern.test(input)) {
        violations.push(this.createViolation("injection", "high", "Template injection detected", input));
      }
    }

    // Check against whitelist
    if (this.whitelist.has(input)) {
      return { valid: true, sanitized, violations: [] };
    }

    // Pattern validation
    if (this.config.allowedPatterns.length > 0) {
      const matchesAllowed = this.config.allowedPatterns.some(p => p.test(input));
      if (!matchesAllowed && input.length > 0) {
        violations.push(this.createViolation("invalid_input", "low", "Input doesn't match allowed patterns", input));
      }
    }

    // Sanitize input
    sanitized = this.sanitize(input);

    // Record violations
    this.violations.push(...violations);
    
    // Keep only last 1000 violations
    if (this.violations.length > 1000) {
      this.violations = this.violations.slice(-1000);
    }

    return {
      valid: violations.filter(v => v.severity === "critical" || v.severity === "high").length === 0,
      sanitized,
      violations,
    };
  }

  /**
   * Rate limiting check
   */
  checkRateLimit(identifier: string): { allowed: boolean; info: RateLimitInfo } {
    const now = new Date();
    const key = identifier;

    let info = this.rateLimits.get(key);

    if (!info || now > info.resetAt) {
      // New window
      info = {
        key,
        count: 0,
        firstRequest: now,
        resetAt: new Date(now.getTime() + this.config.rateLimitWindow),
      };
      this.rateLimits.set(key, info);
    }

    info.count++;

    // Cleanup old entries
    if (this.rateLimits.size > 10000) {
      this.cleanupRateLimits();
    }

    return {
      allowed: info.count <= this.config.rateLimitMax,
      info,
    };
  }

  /**
   * Add to whitelist
   */
  whitelistAdd(value: string): void {
    this.whitelist.add(value);
  }

  /**
   * Remove from whitelist
   */
  whitelistRemove(value: string): void {
    this.whitelist.delete(value);
  }

  /**
   * Get security stats
   */
  getStats() {
    const critical = this.violations.filter(v => v.severity === "critical").length;
    const high = this.violations.filter(v => v.severity === "high").length;
    const medium = this.violations.filter(v => v.severity === "medium").length;
    const low = this.violations.filter(v => v.severity === "low").length;

    return {
      total: this.violations.length,
      bySeverity: { critical, high, medium, low },
      rateLimited: this.rateLimits.size,
      whitelistSize: this.whitelist.size,
    };
  }

  /**
   * Get recent violations
   */
  getViolations(limit = 100): SecurityViolation[] {
    return this.violations.slice(-limit);
  }

  /**
   * Clear violations
   */
  clearViolations(): void {
    this.violations = [];
  }

  // Private methods
  private sanitize(input: string): string {
    let output = input;

    // Remove null bytes
    output = output.replace(/\0/g, "");

    // Normalize Unicode
    output = output.normalize("NFKC");

    // Encode HTML entities (basic)
    output = output
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");

    // Remove control characters
    output = output.replace(/[\x00-\x1F\x7F]/g, "");

    return output;
  }

  private createViolation(
    type: SecurityViolation["type"],
    severity: SecurityViolation["severity"],
    message: string,
    payload: string
  ): SecurityViolation {
    return {
      type,
      severity,
      message,
      payload: payload.slice(0, 500), // Truncate for logging
      timestamp: new Date(),
      blocked: severity === "critical" || severity === "high",
    };
  }

  private cleanupRateLimits(): void {
    const now = new Date();
    for (const [key, info] of this.rateLimits) {
      if (now > info.resetAt) {
        this.rateLimits.delete(key);
      }
    }
  }
}

export const securityGuard = new SecurityGuard();