export interface RequestLimits {
  maxBodySize: number;        // bytes
  maxHeaderSize: number;      // bytes  
  maxUrlLength: number;       // chars
  maxJsonDepth: number;       // nesting levels
}

export const DEFAULT_LIMITS: RequestLimits = {
  maxBodySize: 1024 * 1024,      // 1MB
  maxHeaderSize: 8 * 1024,       // 8KB
  maxUrlLength: 2048,             // 2KB
  maxJsonDepth: 10,               // 10 levels
};

export function validateRequestSize(
  body: unknown, 
  headers: Record<string, string>,
  url: string,
  limits: RequestLimits = DEFAULT_LIMITS
): { valid: boolean; error?: string } {
  // Check URL length
  if (url.length > limits.maxUrlLength) {
    return { valid: false, error: "URL too long" };
  }
  
  // Check header size
  const headerSize = JSON.stringify(headers).length;
  if (headerSize > limits.maxHeaderSize) {
    return { valid: false, error: "Headers too large" };
  }
  
  // Check JSON depth
  function getDepth(obj: unknown, depth: number = 0): number {
    if (depth > limits.maxJsonDepth) return depth;
    if (typeof obj !== "object" || obj === null) return depth;
    return Math.max(...Object.values(obj).map(v => getDepth(v, depth + 1)));
  }
  
  if (getDepth(body) > limits.maxJsonDepth) {
    return { valid: false, error: "JSON too deeply nested" };
  }
  
  return { valid: true };
}
