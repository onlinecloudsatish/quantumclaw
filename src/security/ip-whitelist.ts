import { isIP } from "net";

export interface IpWhitelistConfig {
  allow: string[];
  block: string[];
}

export function isIpAllowed(ip: string, config: IpWhitelistConfig): boolean {
  if (!ip || !isIP(ip)) return false;
  
  // Check block list first
  for (const blocked of config.block) {
    if (ip === blocked || ip.startsWith(blocked.replace("*", ""))) {
      return false;
    }
  }
  
  // Check allow list
  if (config.allow.length === 0) return true;
  
  for (const allowed of config.allow) {
    if (ip === allowed || ip.startsWith(allowed.replace("*", ""))) {
      return true;
    }
  }
  
  return false;
}

export function sanitizeIp(ip: string): string | null {
  if (!ip) return null;
  const cleaned = ip.split(",")[0].trim();
  return isIP(cleaned) ? cleaned : null;
}
