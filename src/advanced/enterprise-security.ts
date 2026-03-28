/**
 * Enterprise Security - Audit logging, RBAC, encryption
 */

import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from 'crypto';

export interface AuditEvent {
  id: string;
  timestamp: number;
  userId: string;
  action: string;
  resource: string;
  details: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface Role {
  name: string;
  permissions: string[];
}

export class EnterpriseSecurity {
  private auditLog: AuditEvent[] = [];
  private roles: Map<string, Role> = new Map();
  private encryptionKey: Buffer | null = null;
  private maxAuditEvents = 10000;

  constructor(encryptionKey?: string) {
    if (encryptionKey) this.encryptionKey = scryptSync(encryptionKey, 'quantumclaw-salt', 32);
    this.roles.set('admin', { name: 'Admin', permissions: ['read','write','delete','manage','audit'] });
    this.roles.set('operator', { name: 'Operator', permissions: ['read','write','manage'] });
    this.roles.set('viewer', { name: 'Viewer', permissions: ['read'] });
  }

  audit(userId: string, action: string, resource: string, details: string, severity: AuditEvent['severity'] = 'info'): void {
    const event: AuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
      timestamp: Date.now(), userId, action, resource, details, severity
    };
    this.auditLog.unshift(event);
    if (this.auditLog.length > this.maxAuditEvents) this.auditLog = this.auditLog.slice(0, this.maxAuditEvents);
  }

  encrypt(data: string): string {
    if (!this.encryptionKey) return data;
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let enc = cipher.update(data, 'utf8', 'hex');
    enc += cipher.final('hex');
    return iv.toString('hex') + ':' + enc;
  }

  decrypt(data: string): string {
    if (!this.encryptionKey) return data;
    const [ivHex, encHex] = data.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const dec = createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let dec2 = dec.update(encHex, 'hex', 'utf8');
    dec2 += dec.final('utf8');
    return dec2;
  }

  hasPermission(role: string, permission: string): boolean {
    return this.roles.get(role)?.permissions.includes(permission) || false;
  }

  getAuditLog(limit = 100): AuditEvent[] {
    return this.auditLog.slice(0, limit);
  }
}

export const security = new EnterpriseSecurity();
