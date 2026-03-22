import { existsSync } from "node:fs";
import path from "node:path";
import type { QuantumClawConfig } from "../../../config/config.js";

export function resolveConfiguredAcpBackendId(cfg: QuantumClawConfig): string {
  return cfg.acp?.backend?.trim() || "acpx";
}

export function resolveAcpInstallCommandHint(cfg: QuantumClawConfig): string {
  const configured = cfg.acp?.runtime?.installCommand?.trim();
  if (configured) {
    return configured;
  }
  const backendId = resolveConfiguredAcpBackendId(cfg).toLowerCase();
  if (backendId === "acpx") {
    const localPath = path.resolve(process.cwd(), "extensions/acpx");
    if (existsSync(localPath)) {
      return `quantumclaw plugins install ${localPath}`;
    }
    return "quantumclaw plugins install @quantumclaw/acpx-plugin";
  }
  return `Install and enable the plugin that provides ACP backend "${backendId}".`;
}
