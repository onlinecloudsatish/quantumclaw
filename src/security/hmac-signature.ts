import { createHmac } from "crypto";

const ALGORITHM = "sha256";
const SIGNATURE_HEADER = "X-Signature";

export function generateHmacSignature(payload: string, secret: string): string {
  return createHmac(ALGORITHM, secret).update(payload).digest("hex");
}

export function verifyHmacSignature(payload: string, secret: string, signature: string): boolean {
  const expected = generateHmacSignature(payload, secret);
  return expected === signature;
}

export function createSecureToken(payload: object, secret: string, expiresInMs: number = 3600000): string {
  const data = {
    ...payload,
    exp: Date.now() + expiresInMs,
  };
  const encoded = Buffer.from(JSON.stringify(data)).toString("base64");
  const signature = generateHmacSignature(encoded, secret);
  return `${encoded}.${signature}`;
}

export function verifySecureToken(token: string, secret: string): object | null {
  try {
    const [encoded, signature] = token.split(".");
    if (!verifyHmacSignature(encoded, secret, signature)) return null;
    const data = JSON.parse(Buffer.from(encoded, "base64").toString());
    if (data.exp && Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}
