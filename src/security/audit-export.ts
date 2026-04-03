import { writeFileSync } from "fs";

export interface AuditEntry {
  timestamp: number;
  event: string;
  userId?: string;
  ip?: string;
  success: boolean;
  metadata?: Record<string, unknown>;
}

export function exportAuditLog(entries: AuditEntry[], format: "json" | "csv" = "json"): string {
  if (format === "csv") {
    const headers = "timestamp,event,userId,ip,success";
    const rows = entries.map(e => 
      `${e.timestamp},${e.event},${e.userId || ""},${e.ip || ""},${e.success}`
    );
    return [headers, ...rows].join("\n");
  }
  return JSON.stringify(entries, null, 2);
}

export function saveAuditLog(entries: AuditEntry[], filepath: string, format: "json" | "csv" = "json"): void {
  const content = exportAuditLog(entries, format);
  writeFileSync(filepath, content);
}
