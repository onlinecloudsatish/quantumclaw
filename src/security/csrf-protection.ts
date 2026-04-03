export interface CsrfTokenStore {
  generate(secret: string): string;
  verify(token: string, secret: string): boolean;
}

export function createCsrfToken(secret: string): string {
  const payload = `${secret}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return Buffer.from(payload).toString("base64url");
}

export function validateCsrfToken(token: string, secret: string, maxAgeMs: number = 3600000): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [, timestamp] = decoded.split(":");
    return Date.now() - parseInt(timestamp) < maxAgeMs;
  } catch {
    return false;
  }
}
